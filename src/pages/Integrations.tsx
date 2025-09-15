
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MetaAdsIntegration } from '@/components/integrations/MetaAdsIntegration';
// Removed unused import since InstagramIntegration component doesn't exist yet
import { IntegrationsList } from '@/components/integrations/IntegrationsList';
import { IntegrationInstructions } from '@/components/integrations/IntegrationInstructions';
import { useApiIntegrations } from '@/hooks/useApiIntegrations';
import { Loader2, Settings, Shield, Zap, BookOpen, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ModuleProtection } from '@/components/auth/ModuleProtection';

function Integrations() {
  const { integrations, loading } = useApiIntegrations();
  const [activeTab, setActiveTab] = useState("overview");

  const metaAdsIntegration = integrations?.find(i => i.integration_type === 'meta_ads');


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const activeIntegrationsCount = integrations?.filter(i => i.status === 'active').length || 0;
  const totalIntegrationsCount = integrations?.length || 0;
  const errorIntegrationsCount = integrations?.filter(i => i.status === 'error').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrações</h1>
          <p className="text-muted-foreground">
            Configure e gerencie suas integrações com APIs externas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={metaAdsIntegration?.status === 'active' ? 'default' : 'secondary'}>
            Meta API {metaAdsIntegration?.status === 'active' ? '✓' : '○'}
          </Badge>
        </div>
      </div>

      {/* Alert de importância */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">🔗 Integrações Essenciais</p>
            <p className="text-sm">
              A <strong>Meta API</strong> é fundamental para o funcionamento dos módulos "Campanhas" e "Aprovações". 
              Configure-a primeiro para garantir dados em tempo real.
            </p>
          </div>
        </AlertDescription>
      </Alert>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Integrações Ativas</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activeIntegrationsCount}
            </div>
            <p className="text-xs text-muted-foreground">
              de {totalIntegrationsCount} configuradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Validação</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrations?.some(i => i.last_validated_at) ? 'Hoje' : 'Nunca'}
            </div>
            <p className="text-xs text-muted-foreground">
              Status das conexões
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Problemas</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {errorIntegrationsCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Precisam atenção
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="instructions">Instruções</TabsTrigger>
          <TabsTrigger value="meta-api">Meta API</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Suas Integrações</CardTitle>
              <CardDescription>
                Gerencie todas as suas integrações de API em um só lugar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IntegrationsList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructions" className="space-y-4">
          <IntegrationInstructions />
        </TabsContent>

        <TabsContent value="meta-api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📘 Meta API (Facebook & Instagram)
              </CardTitle>
              <CardDescription>
                Configure sua integração principal para acessar Facebook Ads e Instagram Business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MetaAdsIntegration integration={metaAdsIntegration} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <ModuleProtection moduleId="integrations" moduleName="Integrações">
      <Integrations />
    </ModuleProtection>
  );
}
