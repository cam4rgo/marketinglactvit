
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CompanySettings {
  id: string;
  company_name: string | null;
  description: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useCompanySettings = () => {
  return useQuery({
    queryKey: ['company-settings'],
    queryFn: async () => {
      console.log('Fetching company settings...');
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error fetching company settings:', error);
        throw error;
      }

      console.log('Company settings fetched:', data);
      return data as CompanySettings | null;
    },
  });
};

export const useUpdateCompanySettings = () => {
  const queryClient = useQueryClient();
  // Using sonner toast

  return useMutation({
    mutationFn: async (updates: Partial<CompanySettings>) => {
      console.log('Updating company settings:', updates);
      
      // First get the existing settings
      const { data: existing } = await supabase
        .from('company_settings')
        .select('*')
        .maybeSingle();

      let result;
      if (!existing) {
        // If no settings exist, create one
        const { data, error } = await supabase
          .from('company_settings')
          .insert({
            company_name: updates.company_name || 'Sistema',
            description: updates.description || 'Marketing System',
            logo_url: updates.logo_url,
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating company settings:', error);
          throw error;
        }
        
        result = data;
      } else {
        // Update existing settings
        const { data, error } = await supabase
          .from('company_settings')
          .update(updates)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating company settings:', error);
          throw error;
        }
        
        result = data;
      }
      
      console.log('Company settings updated:', result);
      
      // Trigger event to update components that depend on company settings
      window.dispatchEvent(new CustomEvent('companySettingsUpdated', { 
        detail: result 
      }));
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-settings'] });
      toast.success('As configurações da empresa foram salvas com sucesso.');
    },
    onError: (error) => {
      console.error('Update company settings error:', error);
      toast.error('Não foi possível salvar as configurações.');
    },
  });
};
