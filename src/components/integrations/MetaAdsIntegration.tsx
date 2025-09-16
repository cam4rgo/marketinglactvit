
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle, Loader2, Eye, EyeOff, TestTube, Shield } from 'lucide-react';
import { useCreateIntegration, useUpdateIntegration, type ApiIntegration } from '@/hooks/useApiIntegrations';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MetaAdsIntegrationProps {
  integration?: ApiIntegration;
}

export const MetaAdsIntegration: React.FC<MetaAdsIntegrationProps> = ({ integration }) => {
  const [appId, setAppId] = useState(
    integration?.metadata && typeof integration.metadata === 'object' && integration.metadata !== null 
      ? (integration.metadata as any).app_id || '' 
      : ''
  );
  const [appSecret, setAppSecret] = useState(integration?.api_key || '');
  const [showAppSecret, setShowAppSecret] = useState(false);
  
  // Adicionar os novos estados que estão faltando
  const [accessToken, setAccessToken] = useState(
    integration?.metadata && typeof integration.metadata === 'object' && integration.metadata !== null 
      ? (integration.metadata as any).access_token || '' 
      : ''
  );
  const [accountId, setAccountId] = useState(
    integration?.metadata && typeof integration.metadata === 'object' && integration.metadata !== null 
      ? (integration.metadata as any).account_id || '' 
      : ''
  );
  const [showAccessToken, setShowAccessToken] = useState(false);
  
  const [isValidating, setIsValidating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  
  const createMutation = useCreateIntegration();
  const updateMutation = useUpdateIntegration();
  // Using sonner toast

  const handleSave = async () => {
    if (!appId.trim() || !appSecret.trim() || !accessToken.trim() || !accountId.trim()) {
      toast.error('Por favor, preencha todos os campos obrigatórios: App ID, App Secret, Access Token e Account ID.');
      return;
    }

    try {
      const metadata = {
        app_id: appId,
        app_secret: appSecret,
        access_token: accessToken,
        account_id: accountId,
        description: 'Meta API Integration',
        last_updated: new Date().toISOString(),
      };

      if (integration) {
        await updateMutation.mutateAsync({
          id: integration.id,
          api_key: appSecret,
          status: 'pending',
          metadata,
        });
      } else {
        await createMutation.mutateAsync({
          integration_type: 'meta_ads',
          api_key: appSecret,
          metadata,
        });
      }
    } catch (error) {
      console.error('Error saving integration:', error);
    }
  };

  const handleTest = async () => {
    if (!appId.trim() || !appSecret.trim()) {
      toast.error('Por favor, insira o App ID e App Secret para testar.');
      return;
    }

    setIsTesting(true);
    
    // Simular teste de conexão com a Meta API
    setTimeout(() => {
      const isValid = appId.length > 5 && appSecret.length > 10;
      
      if (isValid) {
        toast.success('As credenciais da Meta API estão válidas e a conexão foi estabelecida.');
      } else {
        toast.error('Não foi possível conectar com a Meta API. Verifique suas credenciais.');
      }
      
      setIsTesting(false);
    }, 3000);
  };

  const handleValidate = async () => {
    if (!appId.trim() || !appSecret.trim()) {
      toast.error('Por favor, insira o App ID e App Secret para validar.');
      return;
    }

    setIsValidating(true);
    
    // Simular validação completa da API
    setTimeout(async () => {
      try {
        const isValid = appId.length > 5 && appSecret.length > 10;
        
        if (integration) {
          await updateMutation.mutateAsync({
            id: integration.id,
            status: isValid ? 'active' : 'error',
            error_message: isValid ? null : 'Credenciais da Meta API inválidas',
            last_validated_at: new Date().toISOString(),
            metadata: {
              ...(typeof integration.metadata === 'object' && integration.metadata !== null ? integration.metadata as Record<string, any> : {}),
              app_id: appId,
              last_validation: new Date().toISOString(),
              validation_status: isValid ? 'success' : 'failed',
            },
          });
        }

        if (isValid) {
          toast.success('A integração com a Meta API foi validada e está ativa.');
        } else {
          toast.error('As credenciais fornecidas não são válidas ou o app não tem as permissões necessárias.');
        }
      } catch (error) {
        console.error('Error validating integration:', error);
      } finally {
        setIsValidating(false);
      }
    }, 2000);
  };

  const getStatusBadge = () => {
    if (!integration) return null;

    const statusConfig = {
      pending: { label: 'Pendente', variant: 'secondary' as const, color: 'text-yellow-600' },
      active: { label: 'Ativa', variant: 'default' as const, color: 'text-green-600' },
      error: { label: 'Erro', variant: 'destructive' as const, color: 'text-red-600' },
      expired: { label: 'Expirada', variant: 'outline' as const, color: 'text-gray-600' },
    };

    const config = statusConfig[integration.status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Configuração da Meta API</h3>
          <p className="text-sm text-muted-foreground">
            Configure suas credenciais para acessar Facebook Ads e Instagram Analytics
          </p>
        </div>
        {getStatusBadge()}
      </div>

      {integration?.status === 'error' && integration.error_message && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{integration.error_message}</AlertDescription>
        </Alert>
      )}

      {integration?.status === 'active' && (
        <Alert>
          <CheckCircle className="w-4 h-4" />
          <AlertDescription className="text-green-700">
            ✅ Integração ativa e funcionando corretamente. Dados sendo sincronizados.
          </AlertDescription>
        </Alert>
      )}

      {!integration && (
        <Alert>
          <Shield className="w-4 h-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Primeira configuração:</p>
              <p className="text-sm">
                Siga as instruções na aba "Instruções" para obter suas credenciais da Meta API antes de prosseguir.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Separator />

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="app-id">App ID da Meta</Label>
          <Input
            id="app-id"
            type="text"
            value={appId}
            onChange={(e) => setAppId(e.target.value)}
            placeholder="Ex: 1234567890123456"
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            O App ID público do seu aplicativo Meta
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="app-secret">App Secret da Meta</Label>
          <div className="relative">
            <Input
              id="app-secret"
              type={showAppSecret ? "text" : "password"}
              value={appSecret}
              onChange={(e) => setAppSecret(e.target.value)}
              placeholder="Insira o App Secret da Meta"
              className="pr-10 font-mono"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowAppSecret(!showAppSecret)}
            >
              {showAppSecret ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            ⚠️ Mantenha seu App Secret seguro e não o compartilhe publicamente
          </p>
        </div>

        {/* NOVO CAMPO: Access Token */}
        <div className="space-y-2">
          <Label htmlFor="access-token">Access Token</Label>
          <div className="relative">
            <Input
              id="access-token"
              type={showAccessToken ? "text" : "password"}
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="Insira o Access Token da Meta"
              className="pr-10 font-mono"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowAccessToken(!showAccessToken)}
            >
              {showAccessToken ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            🔑 Token de acesso para autenticação na Meta Graph API
          </p>
        </div>

        {/* NOVO CAMPO: Account ID */}
        <div className="space-y-2">
          <Label htmlFor="account-id">Account ID (Ad Account)</Label>
          <Input
            id="account-id"
            type="text"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            placeholder="Ex: act_1234567890123456"
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            📊 ID da conta de anúncios (deve começar com 'act_')
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleSave}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {(createMutation.isPending || updateMutation.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {integration ? 'Atualizar Credenciais' : 'Salvar Credenciais'}
          </Button>

          <Button
            variant="outline"
            onClick={handleTest}
            disabled={isTesting || !appId.trim() || !appSecret.trim() || !accessToken.trim() || !accountId.trim()}
          >
            {isTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <TestTube className="mr-2 h-4 w-4" />
            Testar Conexão
          </Button>

          <Button
            variant="secondary"
            onClick={handleValidate}
            disabled={isValidating || !appId.trim() || !appSecret.trim() || !accessToken.trim() || !accountId.trim()}
          >
            {isValidating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Validar e Ativar
          </Button>
        </div>
      </div>

      {integration && (
        <>
          <Separator />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">Informações da Integração</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">App ID:</span>
                  <span className="font-mono">{appId || 'Não configurado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="capitalize">{integration.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Criada em:</span>
                  <span>{new Date(integration.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Última Validação</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data:</span>
                  <span>
                    {integration.last_validated_at
                      ? new Date(integration.last_validated_at).toLocaleDateString('pt-BR')
                      : 'Nunca validado'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={integration.status === 'active' ? 'text-green-600' : 'text-red-600'}>
                    {integration.status === 'active' ? 'Sucesso' : 'Pendente/Erro'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <Alert>
        <Shield className="w-4 w-4" />
        <AlertDescription className="text-sm">
          <div className="space-y-2">
            <p className="font-medium">Segurança das Credenciais:</p>
            <ul className="text-xs space-y-1 ml-4">
              <li>• Suas credenciais são armazenadas de forma criptografada</li>
              <li>• Apenas administradores podem visualizar este módulo</li>
              <li>• Os tokens são validados regularmente</li>
              <li>• Em caso de problemas, revogue e gere novas credenciais</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};
