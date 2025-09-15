
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  role?: 'admin' | 'viewer' | 'user';
}

export interface RolePermission {
  id: string;
  role: 'admin' | 'viewer' | 'user';
  permission_name: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
}

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      const rolesMap = roles.reduce((acc, role) => {
        acc[role.user_id] = role.role;
        return acc;
      }, {} as Record<string, string>);

      return profiles.map(profile => ({
        ...profile,
        role: rolesMap[profile.id] || 'user'
      })) as User[];
    },
  });
};

export const useRolePermissions = () => {
  return useQuery({
    queryKey: ['role-permissions'],
    queryFn: async () => {
      try {
        // Try using the edge function first
        const response = await fetch(`https://mqbukjincdmmvcposrth.supabase.co/functions/v1/get-role-permissions`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xYnVramluY2RtbXZjcG9zcnRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3Njk3OTcsImV4cCI6MjA3MDM0NTc5N30.KF6r12DtZTBCm1wVPIZ7l-n5fjtnp5MMPPYRovNulko`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          return data as RolePermission[];
        }
      } catch (error) {
        console.log('Edge function not available, using direct query');
      }

      // Fallback to direct query with type assertion
      const { data, error } = await (supabase as any)
        .from('role_permissions')
        .select('*')
        .order('role', { ascending: true })
        .order('permission_name', { ascending: true });

      if (error) throw error;
      return data as RolePermission[];
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: 'admin' | 'viewer' | 'user' }) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole as any })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Role do usuário atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar role: ' + error.message);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      // Delete from auth.users will cascade to profiles and user_roles
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário excluído com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao excluir usuário: ' + error.message);
    },
  });
};

export const useUpdatePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<Pick<RolePermission, 'can_create' | 'can_read' | 'can_update' | 'can_delete'>>
    }) => {
      const { error } = await (supabase as any)
        .from('role_permissions')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      toast.success('Permissão atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar permissão: ' + error.message);
    },
  });
};
