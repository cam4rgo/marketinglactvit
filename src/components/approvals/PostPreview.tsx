import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PostComments } from './PostComments';
import { InstagramPreview } from './InstagramPreview';
import { FacebookPreview } from './FacebookPreview';
import { getMediaUrl, useApprovalPosts } from '@/hooks/useApprovalPosts';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { capitalize } from '@/lib/utils';
import {
  CheckCircle,
  XCircle,
  MessageSquare,
  Clock,
  AlertCircle,
  Download,
  ExternalLink,
  Video,
  Image,
  Layers
} from 'lucide-react';
import { useReorderMedia, ApprovalMedia, ApprovalPost } from '@/hooks/useApprovalPosts';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface PostPreviewProps {
  postId: string;
  media?: ApprovalMedia[];
  onApprove?: (postId: string) => void;
  onReject?: (postId: string, rejectionReason?: string) => void; // Atualizado para aceitar motivo
  showActions?: boolean;
}

// Componente SortableMediaItem para substituir o Draggable
interface SortableMediaItemProps {
  mediaItem: ApprovalMedia;
  index: number;
  onDownload: (url: string, filename: string) => void;
}

// Função utilitária para extrair o nome do arquivo
const getFileName = (filePath: string): string => {
  if (!filePath) return 'Arquivo';
  
  // Remove a URL base se existir
  const cleanPath = filePath.split('/').pop() || filePath;
  
  // Remove extensões de timestamp ou IDs únicos se necessário
  // Exemplo: "image_123456789.jpg" -> "image.jpg"
  const fileName = cleanPath.split('?')[0]; // Remove query parameters
  
  return fileName;
};

// Atualizar o SortableMediaItem para usar nomes reais
const SortableMediaItem = ({ mediaItem, index, onDownload }: SortableMediaItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: mediaItem.id || index.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-2 bg-muted rounded-md gap-2 min-w-0 ${
        isDragging ? 'shadow-lg opacity-50' : ''
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <span className="text-sm flex-shrink-0">
          {mediaItem.file_type === 'video' ? '🎥' : '📸'}
        </span>
        <span className="text-sm truncate">
          {getFileName(mediaItem.file_path)}
        </span>
        {mediaItem.file_size && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            ({(mediaItem.file_size / 1024 / 1024).toFixed(1)} MB)
          </span>
        )}
      </div>
      <div className="flex gap-1 flex-shrink-0">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => window.open(getMediaUrl(mediaItem.file_path), '_blank')}
          className="p-1 h-auto"
        >
          <ExternalLink className="w-3 h-3" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDownload(getMediaUrl(mediaItem.file_path), getFileName(mediaItem.file_path))}
          className="p-1 h-auto"
        >
          <Download className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

// Function to get type badge
const renderTypeBadge = (type: string) => {
  switch (type) {
    case 'reel':
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-600 text-white shadow-md">
          <Video className="w-3 h-3 mr-1" />
          Reel
        </span>
      );
    case 'story':
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-600 text-white shadow-md">
          <Image className="w-3 h-3 mr-1" />
          Story
        </span>
      );
    case 'carousel':
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white shadow-md">
          <Layers className="w-3 h-3 mr-1" />
          Carrossel
        </span>
      );
    case 'post':
    default:
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-600 text-white shadow-md">
          <Image className="w-3 h-3 mr-1" />
          Post
        </span>
      );
  }
};

export const PostPreview = ({
  postId,
  media = [],
  onApprove,
  onReject,
  showActions = true,
}: PostPreviewProps) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [localMediaOrder, setLocalMediaOrder] = useState<ApprovalMedia[]>([]);
  const { profile } = useCompanyProfile();

  const { getApprovalPost } = useApprovalPosts();
  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['approval-posts-optimized', postId],
    queryFn: () => getApprovalPost(postId),
    enabled: !!postId,
  });

  // Configuração dos sensores para @dnd-kit - DEVE estar antes dos early returns
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Configuração dos status - DEVE estar antes dos early returns
  const statusConfig = useMemo(() => ({
    pending: {
      icon: Clock,
      label: 'Pendente',
      bg: 'bg-yellow-500',
      color: 'text-black'
    },
    approved: {
      icon: CheckCircle,
      label: 'Aprovado',
      bg: 'bg-green-600',
      color: 'text-white'
    },
    rejected: {
      icon: XCircle,
      label: 'Rejeitado',
      bg: 'bg-red-600',
      color: 'text-white'
    },
    revision_requested: {
      icon: MessageSquare,
      label: 'Em Revisão',
      bg: 'bg-blue-600',
      color: 'text-white'
    }
  }), []);



  // Estabilizar função handleReject - DEVE estar antes dos early returns
  const handleReject = useCallback(() => {
    if (onReject && post) {
      onReject(post.id, rejectionReason); // Passa o motivo da rejeição
      setShowRejectionForm(false);
      setRejectionReason('');
    }
  }, [onReject, post?.id, rejectionReason]);

  // Estabilizar função handleApprove - DEVE estar antes dos early returns
  const handleApprove = useCallback(() => {
    if (onApprove && post) {
      onApprove(post.id);
    }
  }, [onApprove, post?.id]);

  // Efeito para sincronizar a ordem da mídia quando o post muda - DEVE estar antes dos early returns
  useEffect(() => {
    if (post?.media) {
      setLocalMediaOrder(post.media);
    }
  }, [post?.media]);

  const { reorderMedia } = useReorderMedia(post?.id);

  // handleDownload - DEVE estar antes dos early returns
  const handleDownload = useCallback(async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Erro ao baixar o arquivo:', error);
    }
  }, []);

  if (isLoading) {
    return <div>Carregando post...</div>;
  }

  if (isError || !post) {
    return <div>Erro ao carregar post ou post não encontrado.</div>;
  }

  const StatusIcon = statusConfig[post.status]?.icon || Clock;

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setLocalMediaOrder((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over?.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        reorderMedia(newOrder);
        return newOrder;
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
        <h2 className="text-lg font-semibold">Pré-visualização do Post</h2>
        <Badge
          className={`text-xs font-semibold px-2 py-1 rounded-full border ${statusConfig[post.status]?.bg || 'bg-gray-100'} ${statusConfig[post.status]?.color || 'text-gray-800'} shadow-md pointer-events-none`}
        >
          <StatusIcon className="w-3 h-3 mr-1" />
          {statusConfig[post.status]?.label || post.status}
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4 md:sticky md:top-0 md:self-start">
          {/* Detalhes do Post */}
          <div className="p-4 bg-card rounded-lg border">
            <h3 className="font-semibold mb-3">Detalhes do Post</h3>
            <div className="text-sm space-y-2">
              <div className="flex items-center gap-2">
                <strong>Tipo:</strong> {renderTypeBadge(post.type)}
              </div>
              <p><strong>Criado em:</strong> {new Date(post.created_at).toLocaleString()}</p>
              {post.approved_at && <p><strong>Aprovado em:</strong> {new Date(post.approved_at).toLocaleString()}</p>}
              {post.status === 'rejected' && post.updated_at && <p><strong>Rejeitado em:</strong> {new Date(post.updated_at).toLocaleString()}</p>}
              {post.rejection_reason && <p><strong>Motivo da Rejeição:</strong> {post.rejection_reason}</p>}
              {post.deadline && <p><strong>Prazo:</strong> {new Date(post.deadline).toLocaleString()}</p>}
            </div>
          </div>

          {/* Mídia */}
          {localMediaOrder.length > 0 && (
            <div className="p-4 bg-card rounded-lg border">
              <h3 className="font-semibold mb-3">Mídia ({localMediaOrder.length})</h3>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={localMediaOrder.map(item => item.id || item.file_path)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {localMediaOrder.map((mediaItem, index) => (
                      <SortableMediaItem
                        key={mediaItem.id || mediaItem.file_path}
                        mediaItem={mediaItem}
                        index={index}
                        onDownload={handleDownload}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}

          {/* Ações */}
          {showActions && (post.status === 'pending' || post.status === 'revision_requested') && (
            <div className="p-4 bg-card rounded-lg border">
              <h3 className="font-semibold mb-3">Ações</h3>
              <div className="space-y-4">
                {showRejectionForm && (
                  <Textarea
                    placeholder="Adicionar motivo de rejeição (opcional)"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full"
                  />
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={handleApprove}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Aprovar
                  </Button>
                  <Button
                    onClick={() => {
                      if (showRejectionForm) {
                        handleReject();
                      } else {
                        setShowRejectionForm(true);
                      }
                    }}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                  >
                    <XCircle className="w-4 h-4 mr-2" /> {showRejectionForm ? 'Confirmar Rejeição' : 'Rejeitar'}
                  </Button>
                </div>
                {showRejectionForm && (
                  <Button
                    onClick={() => {
                      setShowRejectionForm(false);
                      setRejectionReason('');
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Comentários */}
          <div className="p-4 bg-card rounded-lg border">
            <h3 className="font-semibold mb-3">Comentários</h3>
            <PostComments comments={post.comments} postId={post.id} />
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          {post.platform === 'instagram' && (
            <InstagramPreview
              post={post}
              media={localMediaOrder}
              profile={profile}
              postType={post.type === 'reel' ? 'reels' : post.type === 'carousel' ? 'post' : post.type}
            />
          )}

          {post.platform === 'facebook' && (
            <FacebookPreview
              post={post}
              media={localMediaOrder}
              profile={profile}
              postType={post.type === 'reel' ? 'reels' : post.type === 'carousel' ? 'post' : post.type}
            />
          )}
        </div>
      </div>
    </div>
  );
};

PostPreview.displayName = 'PostPreview';
