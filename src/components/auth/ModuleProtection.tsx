import React from 'react';
import { useUserModuleAccess } from '@/hooks/useModulePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ModuleProtectionProps {
  children: React.ReactNode;
  moduleId: string;
  moduleName?: string;
}

export const ModuleProtection: React.FC<ModuleProtectionProps> = ({ 
  children, 
  moduleId, 
  moduleName = 'este módulo' 
}) => {
  const { data: moduleAccess = {}, isLoading } = useUserModuleAccess();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Se o acesso não está definido ou é false, bloquear acesso
  const hasAccess = moduleAccess[moduleId] === true;

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Lock className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl">Acesso Negado</CardTitle>
            <CardDescription>
              Você não tem permissão para acessar {moduleName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Entre em contato com o administrador do sistema para solicitar acesso a este módulo.
              </AlertDescription>
            </Alert>
            <div className="flex justify-center">
              <Button 
                onClick={() => navigate('/')}
                variant="outline"
              >
                Voltar ao Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};