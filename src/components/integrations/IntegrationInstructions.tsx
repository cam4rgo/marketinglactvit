
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BookOpen, 
  Shield, 
  Zap, 
  ExternalLink, 
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { MetaApiInstructions } from './MetaApiInstructions';

export const IntegrationInstructions: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Guia de Integrações</h2>
        <p className="text-muted-foreground">
          Configurações passo a passo para conectar suas APIs externas
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">⚠️ Acesso Restrito</p>
            <p className="text-sm">
              Este módulo é exclusivo para <strong>administradores</strong>. As configurações aqui 
              afetam o funcionamento dos módulos "Campanhas" e "Instagram Analytics".
            </p>
          </div>
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="meta-api" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="meta-api">Meta API</TabsTrigger>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="meta-api" className="space-y-4">
          <MetaApiInstructions />
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Integrações Disponíveis
                </CardTitle>
                <CardDescription>
                  Plataformas e APIs que você pode conectar ao sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">Meta API (Facebook & Instagram)</h4>
                      <p className="text-sm text-muted-foreground">
                        Conecte com Facebook Ads Manager e Instagram Business para campanhas e analytics
                      </p>
                    </div>
                    <Badge variant="default">Prioritário</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg opacity-60">
                    <div className="space-y-1">
                      <h4 className="font-medium">Google Ads API</h4>
                      <p className="text-sm text-muted-foreground">
                        Gerencie campanhas do Google Ads (Em breve)
                      </p>
                    </div>
                    <Badge variant="outline">Em breve</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg opacity-60">
                    <div className="space-y-1">
                      <h4 className="font-medium">TikTok Ads API</h4>
                      <p className="text-sm text-muted-foreground">
                        Analytics e campanhas do TikTok for Business (Em breve)
                      </p>
                    </div>
                    <Badge variant="outline">Em breve</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Fluxo de Configuração
                </CardTitle>
                <CardDescription>
                  Processo recomendado para configurar suas integrações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                      1
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium">Leia as Instruções</h4>
                      <p className="text-sm text-muted-foreground">
                        Siga o guia detalhado na aba específica da integração
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                      2
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium">Obtenha as Credenciais</h4>
                      <p className="text-sm text-muted-foreground">
                        Crie apps e colete App IDs, secrets e tokens necessários
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                      3
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium">Configure no Sistema</h4>
                      <p className="text-sm text-muted-foreground">
                        Insira as credenciais na aba de configuração específica
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                      4
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium">Teste e Valide</h4>
                      <p className="text-sm text-muted-foreground">
                        Execute testes de conexão antes de ativar a integração
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Importante para Funcionamento</p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• <strong>Campanhas:</strong> Requer Meta API ativa para dados do Facebook Ads</li>
                    <li>• <strong>Instagram Analytics:</strong> Requer Meta API com permissões Instagram</li>
                    <li>• <strong>Dados em Tempo Real:</strong> Integrações devem estar ativas e validadas</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Segurança das Credenciais
                </CardTitle>
                <CardDescription>
                  Como suas informações sensíveis são protegidas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Criptografia em Repouso
                    </h4>
                    <p className="text-sm text-muted-foreground ml-6">
                      Todas as credenciais são criptografadas antes do armazenamento no banco de dados
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Controle de Acesso
                    </h4>
                    <p className="text-sm text-muted-foreground ml-6">
                      Apenas usuários com role "admin" podem acessar este módulo
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Validação Regular
                    </h4>
                    <p className="text-sm text-muted-foreground ml-6">
                      Tokens são validados automaticamente para detectar expirações
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Logs de Auditoria
                    </h4>
                    <p className="text-sm text-muted-foreground ml-6">
                      Todas as operações são registradas para rastreabilidade
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Boas Práticas</CardTitle>
                <CardDescription>
                  Recomendações para manter suas integrações seguras
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Renove credenciais regularmente</p>
                      <p className="text-xs text-muted-foreground">
                        Gere novos tokens e secrets a cada 90 dias
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Monitor status das integrações</p>
                      <p className="text-xs text-muted-foreground">
                        Verifique regularmente se as conexões estão ativas
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Use contas dedicadas</p>
                      <p className="text-xs text-muted-foreground">
                        Crie contas específicas para integrações empresariais
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Mantenha logs atualizados</p>
                      <p className="text-xs text-muted-foreground">
                        Revise periodicamente os logs de sincronização
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
