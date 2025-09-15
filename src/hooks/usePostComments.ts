
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, comment }: { postId: string, comment: string }) => {

      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      


      // Buscar dados do perfil do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();
        


      const { data, error } = await supabase
        .from('approval_comments')
        .insert({
          post_id: postId,
          comment_text: comment,
          user_id: user.id
        })
        .select(`
          id,
          comment_text,
          created_at,
          post_id,
          user_id
        `)
        .single();

      if (error) {
        console.error('🔴 [DEBUG] Erro ao inserir comentário:', error);
        throw error;
      }
      


      // Verificar se o post deve mudar para revision_requested
      let statusChanged = false;
      const { data: currentPost, error: postError } = await supabase
        .from('approval_posts')
        .select('status')
        .eq('id', postId)
        .single();

      if (!postError && currentPost.status === 'pending') {
        const { error: updateError } = await supabase
          .from('approval_posts')
          .update({ status: 'revision_requested' })
          .eq('id', postId);

        if (!updateError) statusChanged = true;
      }
      


      // Adicionar dados do perfil ao comentário
      const commentWithProfile = {
        ...data,
        profiles: profile || { full_name: null, avatar_url: null }
      };
      


      return { comment: commentWithProfile, statusChanged };
    },
    onSuccess: (result) => {
      
      // Atualização otimista do cache PRIMEIRO
      queryClient.setQueriesData(
        { queryKey: ['approval-posts-optimized'] },
        (oldData: any) => {
          console.log('🔄 [DEBUG] Atualizando cache com novo comentário:', oldData);
          
          if (!oldData?.posts) {
            console.log('⚠️ [DEBUG] Dados antigos não encontrados');
            return oldData;
          }
          
          const updatedPosts = oldData.posts.map((post: any) => {
            if (post.id === result.comment.post_id) {
              console.log('🎯 [DEBUG] Post encontrado, adicionando comentário:', {
                postId: post.id,
                currentComments: post.comments?.length || 0,
                newComment: result.comment
              });
              
              return {
                ...post,
                comments: [...(post.comments || []), result.comment],
                status: result.statusChanged ? 'revision_requested' : post.status
              };
            }
            return post;
          });
          
          return {
            ...oldData,
            posts: updatedPosts
          };
        }
      );
      
      // Invalidar queries APÓS atualização otimista para sincronizar com servidor
      setTimeout(() => {
        queryClient.invalidateQueries({ 
          queryKey: ['approval-posts-optimized'] 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['approval-posts-stats'] 
        });
      }, 100);
    },
    onError: (error) => {
      console.error('🔴 [DEBUG] Erro ao criar comentário:', error);
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, postId }: { commentId: string, postId: string }) => {

      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      


      // Verificar se o comentário pertence ao usuário
      const { data: comment, error: commentError } = await supabase
        .from('approval_comments')
        .select('user_id')
        .eq('id', commentId)
        .single();

      if (commentError) {

        throw commentError;
      }
      
      if (comment.user_id !== user.id) {

        throw new Error('Você só pode excluir seus próprios comentários');
      }
      


      // Excluir o comentário
      const { error } = await supabase
        .from('approval_comments')
        .delete()
        .eq('id', commentId);

      if (error) {

        throw error;
      }
      


      // Verificar se ainda existem comentários para o post
      const { data: remainingComments, error: countError } = await supabase
        .from('approval_comments')
        .select('id')
        .eq('post_id', postId);

      if (countError) throw countError;
      


      // Se não há mais comentários e o status é revision_requested, voltar para pending
      let statusChanged = false;
      if (remainingComments.length === 0) {
        const { data: currentPost, error: postError } = await supabase
          .from('approval_posts')
          .select('status')
          .eq('id', postId)
          .single();

        if (!postError && currentPost.status === 'revision_requested') {
          const { error: updateError } = await supabase
            .from('approval_posts')
            .update({ status: 'pending' })
            .eq('id', postId);

          if (!updateError) statusChanged = true;
        }
      }
      


      return { commentId, postId, statusChanged };
    },
    onSuccess: (result) => {
      
      // Atualização otimista do cache PRIMEIRO
      queryClient.setQueriesData(
        { queryKey: ['approval-posts-optimized'] },
        (oldData: any) => {
          console.log('🔄 [DEBUG] Removendo comentário do cache:', oldData);
          
          if (!oldData?.posts) {
            console.log('⚠️ [DEBUG] Dados antigos não encontrados');
            return oldData;
          }
          
          const updatedPosts = oldData.posts.map((post: any) => {
            if (post.id === result.postId) {
              console.log('🎯 [DEBUG] Post encontrado, removendo comentário:', {
                postId: post.id,
                currentComments: post.comments?.length || 0,
                commentToRemove: result.commentId
              });
              
              return {
                ...post,
                comments: (post.comments || []).filter((c: any) => c.id !== result.commentId),
                status: result.statusChanged ? 'pending' : post.status
              };
            }
            return post;
          });
          
          return {
            ...oldData,
            posts: updatedPosts
          };
        }
      );
      
      // Invalidar queries APÓS atualização otimista para sincronizar com servidor
      setTimeout(() => {
        queryClient.invalidateQueries({ 
          queryKey: ['approval-posts-optimized'] 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['approval-posts-stats'] 
        });
      }, 100);
    },
    onError: (error) => {

    },
  });
};
