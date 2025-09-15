
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  DollarSign, 
  Megaphone, 
  Settings, 
  CheckSquare, 
  Users, 
  Eye,
  Briefcase,
  Factory,
  Link2,
  Calendar
} from 'lucide-react';

const modules = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, description: 'Visão geral e métricas' },
  { id: 'financial', name: 'Financeiro', icon: DollarSign, description: 'Transações e relatórios financeiros' },
  { id: 'campaigns', name: 'Campanhas', icon: Megaphone, description: 'Gestão de campanhas de marketing' },
  { id: 'commemorative_dates', name: 'Datas Comemorativas', icon: Calendar, description: 'Gestão de datas comemorativas e eventos' },
  { id: 'approvals', name: 'Aprovações', icon: CheckSquare, description: 'Sistema de aprovação de conteúdo' },
  { id: 'comercial', name: 'Comercial', icon: Briefcase, description: 'Gestão de representantes e brokers' },
  { id: 'processing_units', name: 'Unidades', icon: Factory, description: 'Gestão de unidades de processamento e responsáveis' },
  { id: 'users', name: 'Usuários', icon: Users, description: 'Gestão de usuários e permissões' },
  { id: 'integrations', name: 'Integrações', icon: Link2, description: 'APIs e integrações externas' },
  { id: 'settings', name: 'Configurações', icon: Settings, description: 'Configurações do sistema' },
];

interface ModulePermissionsProps {
  role: 'viewer' | 'user' | 'admin';
  permissions: Record<string, boolean>;
  onPermissionChange: (moduleId: string, enabled: boolean) => void;
}

export const ModulePermissions: React.FC<ModulePermissionsProps> = ({
  role,
  permissions,
  onPermissionChange
}) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'viewer': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'user': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'viewer': return 'Visualizador';
      case 'user': return 'Usuário';
      default: return role;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Permissões de Módulos
          <Badge className={getRoleColor(role)}>
            {getRoleLabel(role)}
          </Badge>
        </CardTitle>
        <CardDescription>
          Configure quais módulos do sistema este perfil pode acessar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {modules.map((module) => {
            const IconComponent = module.icon;
            const isEnabled = permissions[module.id] || false;
            
            return (
              <div key={module.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">{module.name}</h4>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                  </div>
                </div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={(checked) => onPermissionChange(module.id, checked)}
                  disabled={role === 'admin'} // Admin sempre tem acesso a tudo
                />
              </div>
            );
          })}
        </div>
        
        {role === 'admin' && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Administradores têm acesso completo a todos os módulos do sistema.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
