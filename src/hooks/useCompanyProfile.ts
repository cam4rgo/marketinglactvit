import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CompanyProfile {
  id: string;
  user_id: string;
  company_name: string | null;
  instagram_username: string | null;
  profile_image_url: string | null;
  bio: string | null;
  website: string | null;
  followers_count: number;
  following_count: number;
  posts_count: number;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export const useCompanyProfile = () => {
  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ['company-profile'],
    queryFn: async () => {
      console.log('Fetching company profile...');
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.log('No authenticated user');
        return null;
      }

      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('user_id', user.user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching company profile:', error);
        throw error;
      }

      console.log('Company profile fetched:', data);
      return data as CompanyProfile | null;
    },
  });

  return { profile, isLoading, error, refetch };
};

export const useCreateCompanyProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<CompanyProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      console.log('Creating company profile:', data);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const profileData = {
        user_id: user.user.id,
        company_name: data.company_name || null,
        instagram_username: data.instagram_username || null,
        profile_image_url: data.profile_image_url || null,
        bio: data.bio || null,
        website: data.website || null,
        followers_count: data.followers_count || 0,
        following_count: data.following_count || 0,
        posts_count: data.posts_count || 0,
        verified: data.verified || false,
      };

      const { data: result, error } = await supabase
        .from('company_profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        console.error('Error creating company profile:', error);
        throw error;
      }
      console.log('Company profile created:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-profile'] });
      toast({
        title: "Perfil criado",
        description: "Perfil da empresa foi criado com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Create company profile error:', error);
      toast({
        title: "Erro ao criar perfil",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateCompanyProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<CompanyProfile>) => {
      console.log('Updating company profile:', { id, updates });
      
      // Clean updates - remove undefined values and ensure proper types
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([key, value]) => {
          // Keep null values but remove undefined
          return value !== undefined && key !== 'id' && key !== 'user_id' && key !== 'created_at';
        })
      );

      // Ensure numeric fields are properly typed
      if ('followers_count' in cleanUpdates) {
        cleanUpdates.followers_count = Number(cleanUpdates.followers_count) || 0;
      }
      if ('following_count' in cleanUpdates) {
        cleanUpdates.following_count = Number(cleanUpdates.following_count) || 0;
      }
      if ('posts_count' in cleanUpdates) {
        cleanUpdates.posts_count = Number(cleanUpdates.posts_count) || 0;
      }

      console.log('Clean updates:', cleanUpdates);
      
      const { data: result, error } = await supabase
        .from('company_profiles')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating company profile:', error);
        throw error;
      }
      console.log('Company profile updated:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-profile'] });
      toast({
        title: "Perfil atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Update company profile error:', error);
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
