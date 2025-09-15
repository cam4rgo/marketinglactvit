
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { InstagramPreview } from '@/components/approvals/InstagramPreview';
import { FacebookPreview } from '@/components/approvals/FacebookPreview';
import { usePublicApprovalPost, usePublicApprovalAction } from '@/hooks/useApprovalLinks';
import { CheckCircle, XCircle, Clock, AlertCircle, MessageSquare } from 'lucide-react';

export default function PublicApproval() {
  const { token } = useParams<{ token: string }>();
  const [comment, setComment] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'approved' | 'rejected' | null>(null);

  const { data, isLoading, error } = usePublicApprovalPost(token || '');
  const approvalMutation = usePublicApprovalAction();

  const handleAction = async (action: 'approved' | 'rejected') => {
    if (!data?.post) return;

    if (action === 'rejected' && !comment.trim()) {
      setSelectedAction(action);
      setShowCommentForm(true);
      return;
    }

    try {
      await approvalMutation.mutateAsync({
        postId: data.post.id,
        action,
        comment: comment.trim() || undefined,
      });
      
      // Resetar formulário após sucesso
      setComment('');
      setShowCommentForm(false);
      setSelectedAction(null);
    } catch (error) {
      console.error('Error processing approval:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprovado
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rejeitado
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        );
      case 'revision_requested':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <MessageSquare className="w-3 h-3 mr-1" />
            Em Revisão
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            {status}
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Link Inválido</h3>
            <p className="text-gray-600 mb-4">
              Este link de aprovação é inválido ou expirou.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const { post, link } = data;
  const isExpired = new Date(link.expires_at) < new Date();
  const canTakeAction = post.status === 'pending' && !isExpired;

  // Create a properly typed post object with safe profile handling
  const profilesData = post.profiles;
  
  // Safe type checking for profiles data - completely avoid null access
  let profiles: { full_name: string; email?: string } | undefined = undefined;
  
  if (profilesData !== null && profilesData !== undefined && typeof profilesData === 'object') {
    // Use type assertion after confirming it's not null/undefined and is an object
    const safeProfileData = profilesData as Record<string, any>;
    if ('full_name' in safeProfileData) {
      profiles = {
        full_name: safeProfileData.full_name as string,
        email: safeProfileData.email as string | undefined
      };
    }
  }

  const typedPost = {
    ...post,
    type: post.type as 'reel' | 'post' | 'carousel' | 'story',
    platform: post.platform as 'instagram' | 'facebook',
    status: post.status as 'pending' | 'approved' | 'rejected' | 'revision_requested',
    priority: post.priority as 'low' | 'medium' | 'high',
    profiles,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{post.title}</CardTitle>
                <p className="text-muted-foreground mt-1">
                  Solicitação de aprovação para {post.platform}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(post.status)}
                <Badge variant="outline">
                  {post.platform === 'instagram' ? 'Instagram' : 'Facebook'}
                </Badge>
              </div>
            </div>
            
            {isExpired && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Este link expirou em {new Date(link.expires_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}

            {post.status === 'rejected' && post.rejection_reason && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 flex items-center gap-2 mb-2">
                  <XCircle className="w-4 h-4" />
                  Motivo da Rejeição
                </h4>
                <p className="text-sm text-red-700">{post.rejection_reason}</p>
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Post Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              {post.platform === 'instagram' ? (
                <InstagramPreview 
                  post={typedPost} 
                  media={post.approval_media || []}
                />
              ) : (
                <FacebookPreview 
                  post={typedPost} 
                  media={post.approval_media || []}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {canTakeAction && (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Ação Necessária</h3>
                <p className="text-muted-foreground">
                  Revise o conteúdo acima e tome uma decisão sobre a aprovação.
                </p>
                
                {showCommentForm && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium">
                      {selectedAction === 'rejected' ? 'Motivo da rejeição:' : 'Comentário (opcional):'}
                    </label>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={
                        selectedAction === 'rejected' 
                          ? 'Descreva os pontos que precisam ser ajustados...'
                          : 'Adicione um comentário...'
                      }
                      className="min-h-[100px]"
                    />
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleAction('approved')}
                    disabled={approvalMutation.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {approvalMutation.isPending ? 'Processando...' : 'Aprovar'}
                  </Button>
                  <Button
                    onClick={() => handleAction('rejected')}
                    disabled={approvalMutation.isPending}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    {approvalMutation.isPending ? 'Processando...' : 'Rejeitar'}
                  </Button>
                </div>

                {!showCommentForm && (
                  <Button
                    onClick={() => setShowCommentForm(true)}
                    variant="outline"
                    className="w-full"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Adicionar Comentário
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {post.status !== 'pending' && (
          <Card>
            <CardContent className="p-6 text-center">
              {post.status === 'approved' ? (
                <div className="text-green-600">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Post Aprovado!</h3>
                  <p className="text-muted-foreground">
                    Esta solicitação já foi aprovada e pode ser publicada.
                  </p>
                </div>
              ) : (
                <div className="text-red-600">
                  <XCircle className="w-12 h-12 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Post Rejeitado</h3>
                  <p className="text-muted-foreground">
                    Esta solicitação foi rejeitada e precisa ser revisada.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
