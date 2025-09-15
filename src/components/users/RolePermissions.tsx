
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRolePermissions, useUpdatePermission } from '@/hooks/useUsers';
import { Shield, Eye, User } from 'lucide-react';

const roleLabels = {
  admin: 'Administrador',
  viewer: 'Visualizador', 
  user: 'Usuário'
};

const roleIcons = {
  admin: Shield,
  viewer: Eye,
  user: User
};

const roleColors = {
  admin: 'bg-red-100 text-red-800 border-red-200',
  viewer: 'bg-blue-100 text-blue-800 border-blue-200',
  user: 'bg-gray-100 text-gray-800 border-gray-200'
};

const permissionLabels = {
  financial_transactions: 'Transações Financeiras',
  campaigns: 'Campanhas',
  instagram_insights: 'Instagram Insights',
  integrations: 'Integrações',
  approvals: 'Aprovações',
  users: 'Usuários',
  settings: 'Configurações',
  reports: 'Relatórios'
};

export const RolePermissions: React.FC = () => {
  const { data: permissions, isLoading } = useRolePermissions();
  const updatePermission = useUpdatePermission();

  const handlePermissionChange = (
    permissionId: string, 
    field: 'can_create' | 'can_read' | 'can_update' | 'can_delete', 
    value: boolean
  ) => {
    updatePermission.mutate({
      id: permissionId,
      updates: { [field]: value }
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!permissions?.length) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Nenhuma permissão encontrada.</p>
        </CardContent>
      </Card>
    );
  }

  // Group permissions by role
  const permissionsByRole = permissions.reduce((acc, permission) => {
    if (!acc[permission.role]) {
      acc[permission.role] = [];
    }
    acc[permission.role].push(permission);
    return acc;
  }, {} as Record<string, typeof permissions>);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração de Permissões</CardTitle>
        <CardDescription>
          Configure os níveis de acesso para cada role do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(permissionsByRole).map(([role, rolePermissions]) => {
          const RoleIcon = roleIcons[role as keyof typeof roleIcons];
          return (
            <div key={role} className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={roleColors[role as keyof typeof roleColors]}>
                  <RoleIcon className="w-3 h-3 mr-1" />
                  {roleLabels[role as keyof typeof roleLabels]}
                </Badge>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Módulo</TableHead>
                      <TableHead className="text-center">Criar</TableHead>
                      <TableHead className="text-center">Visualizar</TableHead>
                      <TableHead className="text-center">Editar</TableHead>
                      <TableHead className="text-center">Excluir</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rolePermissions.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell className="font-medium">
                          {permissionLabels[permission.permission_name as keyof typeof permissionLabels] || permission.permission_name}
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={permission.can_create}
                            onCheckedChange={(value) => 
                              handlePermissionChange(permission.id, 'can_create', value)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={permission.can_read}
                            onCheckedChange={(value) => 
                              handlePermissionChange(permission.id, 'can_read', value)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={permission.can_update}
                            onCheckedChange={(value) => 
                              handlePermissionChange(permission.id, 'can_update', value)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={permission.can_delete}
                            onCheckedChange={(value) => 
                              handlePermissionChange(permission.id, 'can_delete', value)
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
