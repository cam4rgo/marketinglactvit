
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ModulePermission {
  id: string;
  role: 'admin' | 'viewer' | 'user';
  module_name: string;
  can_access: boolean;
  created_at: string;
  updated_at: string;
}

export const useModulePermissions = (role?: string) => {
  return useQuery({
    queryKey: ['module-permissions', role],
    queryFn: async () => {
      let query = supabase
        .from('module_permissions')
        .select('*')
        .order('role', { ascending: true })
        .order('module_name', { ascending: true });

      if (role) {
        query = query.eq('role', role);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data as ModulePermission[];
    },
  });
};

export const useUpdateModulePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      role,
      moduleId,
      canAccess
    }: {
      role: 'admin' | 'viewer' | 'user';
      moduleId: string;
      canAccess: boolean;
    }) => {
      // Primeiro tenta atualizar
      const { data: existing } = await supabase
        .from('module_permissions')
        .select('id')
        .eq('role', role)
        .eq('module_name', moduleId)
        .single();

      if (existing) {
        // Atualiza registro existente
        const { error } = await supabase
          .from('module_permissions')
          .update({ can_access: canAccess })
          .eq('id', existing.id);
        
        if (error) throw error;
      } else {
        // Cria novo registro
        const { error } = await supabase
          .from('module_permissions')
          .insert([{
            role,
            module_name: moduleId,
            can_access: canAccess
          }]);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module-permissions'] });
      toast.success('Permissões atualizadas com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar permissões: ' + error.message);
    },
  });
};

export const useUserModuleAccess = () => {
  return useQuery({
    queryKey: ['user-module-access'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return {};

      // Pega o role do usuário
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.user.id)
        .single();

      if (!userRole) return {};

      // Se for admin, tem acesso a tudo
      if (userRole.role === 'admin') {
        return {
          dashboard: true,
          financial: true,
          campaigns: true,
          comercial: true,
          processing_units: true,
          integrations: true,
          approvals: true,
          users: true,
          settings: true,
        };
      }

      // Busca permissões específicas do role
      const { data: permissions } = await supabase
        .from('module_permissions')
        .select('module_name, can_access')
        .eq('role', userRole.role);

      if (!permissions) return {};

      // Converte array em objeto
      const moduleAccess: Record<string, boolean> = {};
      permissions.forEach(permission => {
        moduleAccess[permission.module_name] = permission.can_access;
      });

      return moduleAccess;
    },
  });
};
