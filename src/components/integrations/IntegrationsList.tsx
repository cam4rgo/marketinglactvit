
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useApiIntegrations, useDeleteIntegration, type ApiIntegration } from '@/hooks/useApiIntegrations';
import { useConfirm } from '@/hooks/use-confirm';
import { Trash2, Settings, ExternalLink, Loader2 } from 'lucide-react';

export const IntegrationsList: React.FC = () => {
  const { integrations, loading } = useApiIntegrations();
  const deleteMutation = useDeleteIntegration();
  const { confirm } = useConfirm();

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'meta_ads':
        return '📘';
      default:
        return '🔗';
    }
  };

  const getIntegrationName = (type: string) => {
    switch (type) {
      case 'meta_ads':
        return 'Meta API (Facebook & Instagram)';
      default:
        return type.replace('_', ' ').toUpperCase();
    }
  };

  const getStatusBadge = (status: ApiIntegration['status']) => {
    const statusConfig = {
      pending: { label: 'Pendente', variant: 'secondary' as const },
      active: { label: 'Ativa', variant: 'default' as const },
      error: { label: 'Erro', variant: 'destructive' as const },
      expired: { label: 'Expirada', variant: 'outline' as const },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleDelete = async (id: string, integrationName: string) => {
    const confirmed = await confirm({
      title: "Confirmar exclusão",
      description: `Tem certeza de que deseja excluir a integração ${integrationName}? Esta ação não pode ser desfeita e você perderá acesso aos dados desta API.`,
      variant: "destructive"
    });
    
    if (confirmed) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting integration:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!integrations || integrations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Nenhuma integração configurada ainda.
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Use as abas acima para configurar suas primeiras integrações.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {integrations.map((integration) => (
        <Card key={integration.id}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-2xl">
                  {getIntegrationIcon(integration.integration_type)}
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium">
                    {getIntegrationName(integration.integration_type)}
                  </h3>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(integration.status)}
                    <span className="text-xs text-muted-foreground">
                      Criada em {new Date(integration.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  {integration.last_validated_at && (
                    <p className="text-xs text-muted-foreground">
                      Última validação: {new Date(integration.last_validated_at).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Navegar para a aba específica da integração
                    const tabName = integration.integration_type === 'meta_ads' ? 'meta-ads' : 'overview';
                    const tabs = document.querySelector(`[data-value="${tabName}"]`) as HTMLElement;
                    tabs?.click();
                  }}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={deleteMutation.isPending}
                  className="text-white border-none hover:opacity-90"
                  style={{ backgroundColor: '#EF4343' }}
                  onClick={() => handleDelete(integration.id, getIntegrationName(integration.integration_type))}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
              </div>
            </div>

            {integration.error_message && (
              <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                <strong>Erro:</strong> {integration.error_message}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
