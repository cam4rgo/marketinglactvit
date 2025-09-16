
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ApprovalMedia {
  id: string;
  post_id: string;
  file_path: string;
  file_type: 'image' | 'video';
  file_size?: number;
  mime_type?: string;
  order_index?: number;
  created_at: string;
}

export interface ApprovalPost {
  id: string;
  title: string;
  content_caption?: string;
  type: 'post' | 'reel' | 'carousel' | 'story';
  platform: 'instagram' | 'facebook';
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested';
  priority: 'low' | 'medium' | 'high';
  deadline?: string;
  rejection_reason?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  media?: ApprovalMedia[];
  comments?: ApprovalComment[];
}

export interface ApprovalComment {
  id: string;
  comment_text: string;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

export const getMediaUrl = (filePath: string) => {
  if (!filePath) return '';
  if (filePath.startsWith('http')) return filePath;
  return `https://tqwcibshgrwnleqkkjpd.supabase.co/storage/v1/object/public/post-media/${filePath}`;
};

export const useCreateApprovalPost = () => {
  const queryClient = useQueryClient();
  // Using sonner toast

  return useMutation({
    mutationFn: async ({ post, files }: { post: any, files: File[] }) => {
      console.log('Creating approval post:', post, 'with files:', files.length);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First create the post
      const { data: postData, error: postError } = await supabase
        .from('approval_posts')
        .insert({
          ...post,
          user_id: user.id,
        })
        .select()
        .single();

      if (postError) {
        console.error('Error creating post:', postError);
        throw postError;
      }

      console.log('Post created:', postData);

      // Upload media files if any
      if (files.length > 0) {
        const mediaUploadPromises = files.map(async (file, index) => {
          // Manter o nome original do arquivo, apenas adicionando o ID do post como prefixo
          const fileName = `${postData.id}/${file.name}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('post-media')
            .upload(fileName, file);

          if (uploadError) {
            console.error('Error uploading file:', uploadError);
            throw uploadError;
          }

          // Save media reference to database
          const { error: mediaError } = await supabase
            .from('approval_media')
            .insert({
              post_id: postData.id,
              file_path: uploadData.path,
              file_type: file.type.startsWith('image/') ? 'image' : 'video',
              mime_type: file.type,
              file_size: file.size,
              order_index: index, // Add order_index based on file position
            });

          if (mediaError) {
            console.error('Error saving media reference:', mediaError);
            throw mediaError;
          }

          return uploadData;
        });

        await Promise.all(mediaUploadPromises);
      }

      return postData;
    },
    onSuccess: () => {
      // Invalidar as queries corretas que são usadas na página de Approvals
      queryClient.invalidateQueries({ queryKey: ['approval-posts-optimized'] });
      queryClient.invalidateQueries({ queryKey: ['approval-posts-stats'] });
      // Manter a invalidação original para compatibilidade
      queryClient.invalidateQueries({ queryKey: ['approval-posts'] });
      toast.success('Seu post foi criado e está aguardando aprovação.');
    },
    onError: (error) => {
      console.error('Create post error:', error);
      toast.error('Não foi possível criar o post.');
    },
  });
};

export const useUpdateApprovalPostContent = () => {
  const queryClient = useQueryClient();
  // Using sonner toast

  return useMutation({
    mutationFn: async ({ 
      postId, 
      postData, 
      newFiles, 
      keepExistingMedia = true 
    }: { 
      postId: string;
      postData: Partial<ApprovalPost>;
      newFiles?: File[];
      keepExistingMedia?: boolean;
    }) => {
      console.log('Updating post content:', postId, 'with data:', postData);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Verificar se o post pode ser editado
      const { data: currentPost, error: fetchError } = await supabase
        .from('approval_posts')
        .select('status, user_id')
        .eq('id', postId)
        .single();

      if (fetchError) throw fetchError;
      
      const editableStatuses = ['rejected', 'pending', 'revision_requested'];
      if (!editableStatuses.includes(currentPost.status)) {
        throw new Error('Apenas posts pendentes, em revisão ou rejeitados podem ser editados');
      }

      if (currentPost.user_id !== user.id) {
        throw new Error('Você só pode editar seus próprios posts');
      }

      // Atualizar dados do post e resetar status para pending
      const updateData = {
        ...postData,
        status: 'pending' as const,
        rejection_reason: null,
        approved_at: null,
        updated_at: new Date().toISOString()
      };

      const { data: updatedPost, error: updateError } = await supabase
        .from('approval_posts')
        .update(updateData)
        .eq('id', postId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating post:', updateError);
        throw updateError;
      }

      // Se não deve manter mídia existente, remover todas
      if (!keepExistingMedia) {
        const { data: existingMedia } = await supabase
          .from('approval_media')
          .select('file_path')
          .eq('post_id', postId);

        if (existingMedia && existingMedia.length > 0) {
          // Remover arquivos do storage
          const filePaths = existingMedia.map(media => media.file_path);
          await supabase.storage
            .from('post-media')
            .remove(filePaths);

          // Remover registros da base de dados
          await supabase
            .from('approval_media')
            .delete()
            .eq('post_id', postId);
        }
      }

      // Upload de novos arquivos se fornecidos
      if (newFiles && newFiles.length > 0) {
        const startIndex = keepExistingMedia ? 
          (await supabase.from('approval_media').select('order_index').eq('post_id', postId).order('order_index', { ascending: false }).limit(1)).data?.[0]?.order_index + 1 || 0 
          : 0;

        const mediaUploadPromises = newFiles.map(async (file, index) => {
          // Manter o nome original do arquivo, apenas adicionando o ID do post como prefixo
          const fileName = `${postId}/${file.name}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('post-media')
            .upload(fileName, file);

          if (uploadError) {
            console.error('Error uploading file:', uploadError);
            throw uploadError;
          }

          // Salvar referência da mídia na base de dados
          const { error: mediaError } = await supabase
            .from('approval_media')
            .insert({
              post_id: postId,
              file_path: uploadData.path,
              file_type: file.type.startsWith('image/') ? 'image' : 'video',
              mime_type: file.type,
              file_size: file.size,
              order_index: startIndex + index,
            });

          if (mediaError) {
            console.error('Error saving media reference:', mediaError);
            throw mediaError;
          }

          return uploadData;
        });

        await Promise.all(mediaUploadPromises);
      }

      return updatedPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-posts'] });
      queryClient.invalidateQueries({ queryKey: ['approval-posts-optimized'] });
      queryClient.invalidateQueries({ queryKey: ['approval-posts-stats'] });
      toast.success('Seu post foi editado e reenviado para aprovação.');
    },
    onError: (error) => {
      console.error('Update post content error:', error);
      toast.error(error.message || 'Não foi possível editar o post.');
    },
  });
};

export const useUpdateApprovalPost = () => {
  const queryClient = useQueryClient();
  // Using sonner toast

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<ApprovalPost>) => {
      console.log('Updating post:', id, 'with:', updates);
      
      const { data, error } = await supabase
        .from('approval_posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating post:', error);
        throw error;
      }

      console.log('Post updated:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-posts'] });
    },
    onError: (error) => {
      console.error('Update post error:', error);
      toast.error('Não foi possível atualizar o post.');
    },
  });
};

export const useDeleteApprovalPost = () => {
  const queryClient = useQueryClient();
  // Using sonner toast

  return useMutation({
    mutationFn: async (postId: string) => {
      console.log('Deleting post:', postId);
      
      // First delete associated media files from storage and database
      const { data: mediaFiles } = await supabase
        .from('approval_media')
        .select('file_path')
        .eq('post_id', postId);

      if (mediaFiles && mediaFiles.length > 0) {
        // Delete files from storage
        const filePaths = mediaFiles.map(media => media.file_path);
        await supabase.storage
          .from('post-media')
          .remove(filePaths);

        // Delete media records
        await supabase
          .from('approval_media')
          .delete()
          .eq('post_id', postId);
      }

      // Delete comments
      await supabase
        .from('approval_comments')
        .delete()
        .eq('post_id', postId);

      // Delete the post
      const { error } = await supabase
        .from('approval_posts')
        .delete()
        .eq('id', postId);

      if (error) {
        console.error('Error deleting post:', error);
        throw error;
      }

      console.log('Post deleted successfully');
      return postId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-posts'] });
    },
    onError: (error) => {
      console.error('Delete post error:', error);
      toast.error('Não foi possível excluir o post.');
    },
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();
  // Using sonner toast

  return useMutation({
    mutationFn: async ({ post_id, comment_text }: { post_id: string, comment_text: string }) => {
      console.log('Adding comment to post:', post_id, 'comment:', comment_text);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('approval_comments')
        .insert({
          post_id,
          user_id: user.id,
          comment_text: comment_text.trim()
        })
        .select(`
          id,
          comment_text,
          created_at,
          user_id,
          profiles:user_id (
            full_name,
            email,
            avatar_url
          )
        `)
        .single();

      if (error) {
        console.error('Error adding comment:', error);
        throw error;
      }

      console.log('Comment added:', data);
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch approval posts to update comments
      queryClient.invalidateQueries({ queryKey: ['approval-posts'] });
      queryClient.invalidateQueries({ queryKey: ['approval-post', variables.post_id] });
      
      toast.success('Seu comentário foi adicionado com sucesso.');
    },
    onError: (error) => {
      console.error('Add comment error:', error);
      toast.error('Não foi possível adicionar o comentário.');
    },
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  // Using sonner toast

  return useMutation({
    mutationFn: async ({ postId, comment }: { postId: string, comment: string }) => {
      console.log('Creating comment for post:', postId, 'comment:', comment);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('approval_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          comment_text: comment.trim()
        })
        .select(`
          id,
          comment_text,
          created_at,
          user_id,
          profiles:user_id (
            full_name,
            email,
            avatar_url
          )
        `)
        .single();

      if (error) {
        console.error('Error creating comment:', error);
        throw error;
      }

      console.log('Comment created:', data);
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch approval posts to update comments
      queryClient.invalidateQueries({ queryKey: ['approval-posts'] });
      queryClient.invalidateQueries({ queryKey: ['approval-post', variables.postId] });
      
      toast.success('Seu comentário foi adicionado com sucesso.');
    },
    onError: (error) => {
      console.error('Create comment error:', error);
      toast.error('Não foi possível adicionar o comentário.');
    },
  });
};

export const getApprovalPost = async (postId: string): Promise<ApprovalPost> => {
  const { data, error } = await supabase
    .from('approval_posts')
    .select(`
      *,
      approval_media (
        id,
        file_path,
        file_type,
        file_size,
        mime_type,
        order_index,
        post_id,
        created_at
      ),
      approval_comments (
        id,
        comment_text,
        created_at,
        post_id,
        user_id,
        profiles (
          full_name,
          email,
          avatar_url
        )
      )
    `)
    .eq('id', postId)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Post não encontrado');

  // Normalize the data structure
  const post: ApprovalPost = {
    ...data,
    type: data.type as 'post' | 'reel' | 'carousel' | 'story',
    platform: data.platform as 'instagram' | 'facebook',
    status: data.status as 'pending' | 'approved' | 'rejected' | 'revision_requested',
    priority: data.priority as 'low' | 'medium' | 'high',
    media: (data.approval_media || []).map(media => ({
      ...media,
      file_type: media.file_type as 'image' | 'video'
    })).sort((a, b) => (a.order_index || 0) - (b.order_index || 0)),
    comments: data.approval_comments || []
  };

  return post;
};

export const useReorderMedia = (postId?: string) => {
  const queryClient = useQueryClient();
  // Using sonner toast

  return {
    reorderMedia: async (newOrder: ApprovalMedia[]) => {
      if (!postId) return;
      
      console.log('Reordering media for post:', postId, 'new order:', newOrder);
      
      // Update each media item's order_index
      const updatePromises = newOrder.map((item, index) => 
        supabase
          .from('approval_media')
          .update({ order_index: index })
          .eq('id', item.id)
          .eq('post_id', postId)
      );

      const results = await Promise.all(updatePromises);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error('Error reordering media:', errors);
        throw new Error('Falha ao reordenar mídias');
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['approval-posts'] });
      queryClient.invalidateQueries({ queryKey: ['approval-posts-optimized'] });
      queryClient.invalidateQueries({ queryKey: ['approval-posts-optimized', postId] });
      
      toast.success('A ordem das mídias foi atualizada com sucesso.');
    }
  };
};

export const useApprovalPosts = () => {
  return {
    getApprovalPost
  };
};
