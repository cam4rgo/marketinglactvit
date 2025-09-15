
import React, { useState } from 'react';
import { ModuleProtection } from '@/components/auth/ModuleProtection';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { UsersList } from '@/components/users/UsersList';
import { ModulePermissions } from '@/components/users/ModulePermissions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useModulePermissions, useUpdateModulePermission } from '@/hooks/useModulePermissions';

function Users() {
  const [selectedRole, setSelectedRole] = useState<'viewer' | 'user' | 'admin'>('viewer');
  const { data: modulePermissions } = useModulePermissions(selectedRole);
  const updateModulePermission = useUpdateModulePermission();

  // Converte array de permissões em objeto para facilitar o uso
  const currentPermissions = modulePermissions?.reduce((acc, permission) => {
    acc[permission.module_name] = permission.can_access;
    return acc;
  }, {} as Record<string, boolean>) || {};

  const handlePermissionChange = (moduleId: string, enabled: boolean) => {
    updateModulePermission.mutate({
      role: selectedRole,
      moduleId,
      canAccess: enabled
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie usuários e suas permissões de acesso aos módulos
          </p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Lista de Usuários</TabsTrigger>
          <TabsTrigger value="permissions">Permissões por Role</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usuários do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <UsersList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurar Permissões por Role</CardTitle>
              <div className="flex items-center gap-4">
                <Select value={selectedRole} onValueChange={(value: 'viewer' | 'user' | 'admin') => setSelectedRole(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Visualizador</SelectItem>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ModulePermissions 
                role={selectedRole}
                permissions={currentPermissions}
                onPermissionChange={handlePermissionChange}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function UsersPage() {
  return (
    <ModuleProtection moduleId="users" moduleName="Usuários">
      <Users />
    </ModuleProtection>
  );
}
