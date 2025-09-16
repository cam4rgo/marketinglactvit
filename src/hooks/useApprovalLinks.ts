
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

export const useApprovalLinks = (postId?: string) => {
  return useQuery({
    queryKey: ['approval-links', postId],
    queryFn: async () => {
      if (!postId) return [];
      
      const { data, error } = await supabase
        .from('approval_links')
        .select('*')
        .eq('post_id', postId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!postId,
  });
};

export const useCreateApprovalLink = () => {
  const queryClient = useQueryClient();
  // Using sonner toast

  return useMutation({
    mutationFn: async (postId: string) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Gerar token único
      const { data: tokenData, error: tokenError } = await supabase
        .rpc('generate_approval_token');

      if (tokenError) throw tokenError;

      // Criar link com expiração de 7 dias
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { data, error } = await supabase
        .from('approval_links')
        .insert([{
          post_id: postId,
          token: tokenData,
          expires_at: expiresAt.toISOString(),
          created_by: user.user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-links'] });
      toast.success("Link de aprovação criado com sucesso.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const usePublicApprovalPost = (token: string) => {
  return useQuery({
    queryKey: ['public-approval-post', token],
    queryFn: async () => {
      if (!token) return null;

      // Buscar o link público
      const { data: linkData, error: linkError } = await supabase
        .from('approval_links')
        .select('*')
        .eq('token', token)
        .eq('is_active', true)
        .single();

      if (linkError || !linkData) {
        throw new Error('Link inválido ou expirado');
      }

      // Verificar se o link ainda está válido
      if (new Date(linkData.expires_at) < new Date()) {
        throw new Error('Link expirado');
      }

      // Buscar o post com média e comentários
      const { data: postData, error: postError } = await supabase
        .from('approval_posts')
        .select(`
          *,
          approval_media (*),
          approval_comments (
            *,
            profiles!approval_comments_user_id_fkey(full_name, email)
          ),
          profiles!approval_posts_user_id_fkey(full_name, email)
        `)
        .eq('id', linkData.post_id)
        .single();

      if (postError) throw postError;

      return {
        post: postData,
        link: linkData,
      };
    },
    enabled: !!token,
  });
};

export const usePublicApprovalAction = () => {
  // Using sonner toast

  return useMutation({
    mutationFn: async ({ 
      postId, 
      action, 
      comment 
    }: { 
      postId: string; 
      action: 'approved' | 'rejected'; 
      comment?: string;
    }) => {
      const updateData: any = { status: action };
      
      if (action === 'rejected' && comment) {
        updateData.rejection_reason = comment;
      }

      const { data, error } = await supabase
        .from('approval_posts')
        .update(updateData)
        .eq('id', postId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      const actionText = variables.action === 'approved' ? 'aprovado' : 'rejeitado';
      toast.success(`O post foi ${actionText} com sucesso.`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
