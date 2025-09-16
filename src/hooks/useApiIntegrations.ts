
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import type { Database } from '@/integrations/supabase/types';

type ApiIntegrationRow = Database['public']['Tables']['api_integrations']['Row'];
type ApiIntegrationInsert = Database['public']['Tables']['api_integrations']['Insert'];
type ApiIntegrationUpdate = Database['public']['Tables']['api_integrations']['Update'];

export interface ApiIntegration extends ApiIntegrationRow {}

export const useApiIntegrations = () => {
  const { data: integrations, isLoading: loading, error } = useQuery({
    queryKey: ['api-integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ApiIntegration[];
    },
  });

  return { integrations, loading, error };
};

export const useCreateIntegration = () => {
  const queryClient = useQueryClient();
  // Using sonner toast

  return useMutation({
    mutationFn: async (data: Omit<ApiIntegrationInsert, 'user_id'>) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data: result, error } = await supabase
        .from('api_integrations')
        .insert([{
          ...data,
          user_id: user.user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-integrations'] });
      toast.success("A integração foi configurada com sucesso.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateIntegration = () => {
  const queryClient = useQueryClient();
  // Using sonner toast

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & ApiIntegrationUpdate) => {
      const { data: result, error } = await supabase
        .from('api_integrations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-integrations'] });
      toast.success("As configurações foram salvas com sucesso.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteIntegration = () => {
  const queryClient = useQueryClient();
  // Using sonner toast

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('api_integrations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-integrations'] });
      toast.success("A integração foi removida com sucesso.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
