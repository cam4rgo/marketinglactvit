import React, { useState, useCallback, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { User, Send, Loader2, Trash2 } from 'lucide-react';
import { ApprovalComment } from '@/hooks/useApprovalPosts';
import { useCreateComment, useDeleteComment } from '@/hooks/usePostComments';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';

interface PostCommentsProps {
  postId: string;
  comments: ApprovalComment[];
}

export const PostComments = ({
  postId, 
  comments = [], 
}: PostCommentsProps) => {
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();
  const { data: userRole } = useUserRole();
  const createCommentMutation = useCreateComment();
  const deleteCommentMutation = useDeleteComment();

  // CORRIGIDO: Mover canDeleteComment para antes de seu uso
  const canDeleteComment = useCallback((comment: ApprovalComment) => {
    const isOwner = comment.user_id === user?.id;
    const isAdmin = userRole === 'admin';
    return isOwner || isAdmin;
  }, [user?.id, userRole]);

  // Estabilizar função de submit
  const handleSubmitComment = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    try {
      await createCommentMutation.mutateAsync({
        postId,
        comment: newComment.trim()
      });
      
      setNewComment('');
      
    } catch (error) {
      console.error('Erro ao criar comentário:', error);
    }
  }, [newComment, postId, createCommentMutation]);

  // Estabilizar função de delete
  const handleDeleteComment = useCallback(async (commentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await deleteCommentMutation.mutateAsync({
        commentId,
        postId
      });
      
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
    }
  }, [deleteCommentMutation, postId]);

  // Memoizar lista de comentários renderizada
  const renderedComments = useMemo(() => {
    return comments.map((comment) => (
      <div key={comment.id} className="flex gap-3 p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-sm">
        <Avatar className="w-8 h-8">
          <AvatarImage src={comment.profiles?.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary">
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-100">
              {comment.profiles?.full_name || comment.profiles?.email || 'Usuário'}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                {new Date(comment.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              {canDeleteComment(comment) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteComment(comment.id, e);
                  }}
                  disabled={deleteCommentMutation.isPending}
                  className="p-1 h-auto text-white hover:opacity-90"
                  style={{ backgroundColor: '#EF4343' }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
            {comment.comment_text}
          </p>
        </div>
      </div>
    ));
  }, [comments, canDeleteComment, handleDeleteComment, deleteCommentMutation.isPending]);

  return (
    <div className="space-y-4">
      {/* Render memoized comments */}
      {renderedComments}
      
      {/* Comment form */}
      <form onSubmit={handleSubmitComment} className="space-y-3">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Adicione seu comentário..."
          className="min-h-[80px] resize-none"
          disabled={createCommentMutation.isPending}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={!newComment.trim() || createCommentMutation.isPending}
          >
            {createCommentMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {createCommentMutation.isPending ? 'Enviando...' : 'Comentar'}
          </Button>
        </div>
      </form>
    </div>
  );
};

PostComments.displayName = 'PostComments';
