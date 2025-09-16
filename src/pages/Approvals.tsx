import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricCard } from "@/components/ui/metric-card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, VisuallyHidden } from "@/components/ui/dialog";
import {
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Eye,
  Edit,
  Settings,
  TrendingUp,
  MessageSquare,
  Instagram,
  Trash2,
  AlertTriangle,
  Calendar,
  User,
  Globe
} from "lucide-react";
import { CreatePostForm } from "@/components/approvals/CreatePostForm";
import { PostPreview } from "@/components/approvals/PostPreview";
import { CompanyProfileSettings } from "@/components/approvals/CompanyProfileSettings";
import { useOptimizedApprovalPosts, useApprovalPostsStats } from "@/hooks/useOptimizedApprovalPosts";
import { useUpdateApprovalPost, useDeleteApprovalPost } from "@/hooks/useApprovalPosts";
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { EditPostForm } from "@/components/approvals/EditPostForm";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useConfirm } from "@/hooks/use-confirm";

// Definir o tipo PostCardProps
interface PostCardProps {
  post: any;
  onApprove?: (postId: string) => void;
  onReject?: (postId: string, reason?: string) => void;
  onDelete?: (postId: string) => void;
  onEdit?: (post: any) => void;
}

export default function Approvals() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [previewPost, setPreviewPost] = useState<any>(null);
  const queryClient = useQueryClient();
  const { confirm: confirmAction, confirmState } = useConfirm();
  
  // Use the optimized hooks for better performance and working queries
  const { data, isLoading, error, refetch } = useOptimizedApprovalPosts({ 
    status: activeTab,
    page: 0,
    pageSize: 50
  });
  const { data: statsData, refetch: refetchStats } = useApprovalPostsStats();
  const updateMutation = useUpdateApprovalPost();
  const deleteMutation = useDeleteApprovalPost();
  // Using sonner toast

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['approval-posts-optimized'] });
    queryClient.invalidateQueries({ queryKey: ['approval-posts-stats'] });
  };

  const handleApprove = async (postId: string) => {
    try {
      await updateMutation.mutateAsync({
        id: postId,
        status: 'approved' as const,
        approved_at: new Date().toISOString(),
      });
      toast.success("O post foi aprovado com sucesso.");
      invalidateQueries();
    } catch (error) {
      console.error('Error approving post:', error);
      toast.error("Não foi possível aprovar o post.");
    }
  };

  const handleReject = async (postId: string, rejectionReason?: string) => {
    try {
      await updateMutation.mutateAsync({
        id: postId,
        status: 'rejected' as const,
        rejection_reason: rejectionReason || undefined,
      });
      toast.error("O post foi rejeitado.");
      invalidateQueries();
    } catch (error) {
      console.error('Error rejecting post:', error);
      toast.error("Não foi possível rejeitar o post.");
    }
  };

  const handleDelete = async (postId: string) => {
    const confirmed = await confirmAction({
      title: "Excluir Solicitação",
      description: "Tem certeza que deseja excluir esta solicitação? Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      cancelText: "Cancelar",
      variant: "destructive"
    });
    
    if (confirmed) {
      try {
        console.log('Deleting post with ID:', postId);
        await deleteMutation.mutateAsync(postId);
        toast.success("A solicitação foi excluída com sucesso.");
        invalidateQueries();
      } catch (error) {
        console.error('Error deleting post:', error);
        toast.error("Não foi possível excluir o post.");
      }
    }
  };

  // Remover completamente esta função
  // const handleCommentAdded = () => {
  //   setTimeout(() => {
  //     invalidateQueries();
  //   }, 100);
  // };

  // Helper function to capitalize first letter
  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Function to get priority badge
  // Function to get priority badge
  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return (
          <Badge className="bg-red-600 text-white border-red-600 text-xs h-6 px-2 font-medium shadow-md pointer-events-none">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Alta
          </Badge>
        );
      case 'medium':
        return (
          <Badge className="bg-orange-500 text-white border-orange-500 text-xs h-6 px-2 font-medium shadow-md pointer-events-none">
            <Clock className="w-3 h-3 mr-1" />
            Média
          </Badge>
        );
      case 'low':
        return (
          <Badge className="bg-green-600 text-white border-green-600 text-xs h-6 px-2 font-medium shadow-md pointer-events-none">
            <CheckCircle className="w-3 h-3 mr-1" />
            Baixa
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs h-6 px-2 border-gray-400 text-gray-800 bg-gray-50 font-medium">
            {capitalize(priority)}
          </Badge>
        );
    }
  };

  // Function to get status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-500 text-black border-yellow-500 text-xs h-6 px-2 font-medium shadow-md pointer-events-none">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-green-600 text-white border-green-600 text-xs h-6 px-2 font-medium shadow-md pointer-events-none">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprovado
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-600 text-white border-red-600 text-xs h-6 px-2 font-medium shadow-md pointer-events-none">
            <XCircle className="w-3 h-3 mr-1" />
            Rejeitado
          </Badge>
        );
      case 'revision_requested':
      case 'inReview':
        return (
          <Badge className="bg-blue-600 text-white border-blue-600 text-xs h-6 px-2 font-medium shadow-md">
            <MessageSquare className="w-3 h-3 mr-1" />
            Em Revisão
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs h-6 px-2 border-gray-400 text-gray-800 bg-gray-50 font-medium">
            {capitalize(status)}
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    console.error('Approvals page error:', error);
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar dados</h3>
          <p className="text-muted-foreground">Tente recarregar a página</p>
          <Button onClick={() => refetch()} className="mt-4">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  const posts = data?.posts || [];

  // Use stats data for accurate counts
  const pendingCount = statsData?.pending || 0;
  const inReviewCount = statsData?.inReview || 0;
  const approvedCount = statsData?.approved || 0;
  const rejectedCount = statsData?.rejected || 0;
  const totalCount = statsData?.total || 0;

  const metrics = [
    {
      title: "Posts Pendentes",
      value: pendingCount.toString(),
      change: "Aguardando revisão",
      changeType: "neutral" as const,
      icon: Clock
    },
    {
      title: "Posts Aprovados",
      value: approvedCount.toString(),
      change: "Este mês",
      changeType: "positive" as const,
      icon: CheckCircle
    },
    {
      title: "Posts Rejeitados",
      value: rejectedCount.toString(),
      change: "Não aprovados",
      changeType: "negative" as const,
      icon: XCircle
    },
    {
      title: "Em Revisão",
      value: inReviewCount.toString(),
      change: "Com comentários",
      changeType: "neutral" as const,
      icon: MessageSquare
    }
  ];

  // Componente PostCard atualizado
  const PostCard = ({ post, onApprove, onReject, onDelete, onEdit }: PostCardProps) => {
    return (
      <div className="py-3 px-3 sm:py-4 sm:px-4 mb-3 sm:mb-4 rounded-lg transition-colors duration-200" style={{ backgroundColor: '#171F2C' }}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
              <h3 className="text-base sm:text-lg font-semibold text-white truncate">
                {post.title}
              </h3>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                {renderStatusBadge(post.status)}
                {renderPriorityBadge(post.priority)}
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-600 text-white shadow-md">
                  {post.type === 'post' ? 'Post' : post.type === 'reel' ? 'Reel' : post.type === 'story' ? 'Story' : 'Carrossel'}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 lg:gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                <span className="text-white">
                  Criado em {new Date(post.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
              
              {post.platform && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  <span className="text-gray-300 capitalize">{post.platform}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap lg:flex-nowrap mt-2 lg:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewPost(post)}
              className="text-black border-none font-medium hover:opacity-90 flex-1 sm:flex-none min-w-0 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
              style={{ backgroundColor: '#FFDD47' }}
            >
              <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">Visualizar</span>
              <span className="sm:hidden">Ver</span>
            </Button>
            

            
            {['rejected', 'pending', 'revision_requested'].includes(post.status) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit && onEdit(post)}
                className="text-white border-none hover:opacity-90 flex-1 sm:flex-none min-w-0 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                style={{ backgroundColor: '#3B82F6' }}
              >
                <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Editar</span>
                <span className="sm:hidden">Edit</span>
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete && onDelete(post.id)}
              className="text-white border-none hover:opacity-90 flex-1 sm:flex-none min-w-0 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
              style={{ backgroundColor: '#EF4343' }}
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">Excluir</span>
              <span className="sm:hidden">Del</span>
            </Button>
          </div>
        </div>
      </div>
    );
  };
  
  // Adicionar função handleEdit faltante
  const handleEdit = (post: any) => {
    setEditingPost(post);
    setShowEditForm(true);
  };

  return (
    <main className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Aprovações</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Gerencie e aprove posts para suas redes sociais
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none h-10">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Configurações</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl mx-4">
              <DialogHeader>
                <DialogTitle>Configurações da Empresa</DialogTitle>
                <DialogDescription>
                  Configure as informações da sua empresa para os posts.
                </DialogDescription>
              </DialogHeader>
              <CompanyProfileSettings />
            </DialogContent>
          </Dialog>
          <Button onClick={() => setShowCreateForm(true)} className="flex-1 sm:flex-none">
            <Plus className="h-4 w-4 mr-2" />
            Novo Post
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex flex-wrap w-full gap-1 h-auto p-1">
          <TabsTrigger value="pending" className="text-xs sm:text-sm px-2 py-2 flex-1 min-w-0">
            <span className="truncate">Pendentes ({pendingCount})</span>
          </TabsTrigger>
          <TabsTrigger value="inReview" className="text-xs sm:text-sm px-2 py-2 flex-1 min-w-0">
            <span className="truncate">Em Revisão ({inReviewCount})</span>
          </TabsTrigger>
          <TabsTrigger value="approved" className="text-xs sm:text-sm px-2 py-2 flex-1 min-w-0">
            <span className="truncate">Aprovados ({approvedCount})</span>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="text-xs sm:text-sm px-2 py-2 flex-1 min-w-0">
            <span className="truncate">Rejeitados ({rejectedCount})</span>
          </TabsTrigger>
          <TabsTrigger value="all" className="text-xs sm:text-sm px-2 py-2 flex-1 min-w-0">
            <span className="truncate">Todos ({totalCount})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Nenhum post pendente</h3>
                <p className="text-muted-foreground mb-4">
                  Todos os posts foram revisados. Crie um novo post para começar.
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Post
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="inReview" className="space-y-4">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Nenhum post em revisão</h3>
                <p className="text-muted-foreground">
                  Posts com comentários aparecerão aqui para revisão.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Nenhum post aprovado</h3>
                <p className="text-muted-foreground">
                  Posts aprovados aparecerão aqui.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <XCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Nenhum post rejeitado</h3>
                <p className="text-muted-foreground">
                  Posts rejeitados aparecerão aqui.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Nenhum post encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  Crie seu primeiro post para começar.
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Post
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Post Dialog */}
      {showCreateForm && (
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Post</DialogTitle>
              <DialogDescription>
                Crie um novo post para suas redes sociais.
              </DialogDescription>
            </DialogHeader>
            <CreatePostForm 
              onSuccess={() => {
                setShowCreateForm(false);
                toast.success("Seu post foi enviado para aprovação.");
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Post Dialog */}
      {showEditForm && editingPost && (
        <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Post</DialogTitle>
              <DialogDescription>
                Edite o conteúdo do post rejeitado e reenvie para aprovação.
              </DialogDescription>
            </DialogHeader>
            <EditPostForm 
               post={editingPost}
               onCancel={() => {
                 setShowEditForm(false);
                 setEditingPost(null);
               }}
               onSuccess={() => {
                 setShowEditForm(false);
                 setEditingPost(null);
                 invalidateQueries();
                 toast.success("O post foi editado e reenviado para aprovação.");
               }}
             />
          </DialogContent>
        </Dialog>
      )}

      {/* Preview Dialog */}
      {previewPost && (
        <Dialog open={!!previewPost} onOpenChange={() => setPreviewPost(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <VisuallyHidden>
                <DialogTitle>Preview do Post</DialogTitle>
              </VisuallyHidden>
            </DialogHeader>
            <PostPreview 
              postId={previewPost.id}
              onApprove={(postId) => {
                handleApprove(postId);
                setPreviewPost(null);
              }}
              onReject={(postId, reason) => {
                handleReject(postId, reason);
                setPreviewPost(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Dialog de Confirmação */}
      <ConfirmDialog
        open={confirmState.open}
        onOpenChange={confirmState.onOpenChange}
        title={confirmState.title}
        description={confirmState.description}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        variant={confirmState.variant}
        onConfirm={confirmState.onConfirm}
        onCancel={confirmState.onCancel}
      />
     </main>
   );
}
