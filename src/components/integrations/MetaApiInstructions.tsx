
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ExternalLink, 
  CheckCircle, 
  Info, 
  AlertTriangle, 
  Copy, 
  Settings,
  Key,
  Shield,
  Zap,
  Building2,
  Instagram,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const MetaApiInstructions: React.FC = () => {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência.",
    });
  };

  const steps = [
    {
      id: 1,
      title: "Criar Conta Meta for Developers (2025)",
      description: "Configure sua conta de desenvolvedor com as novas políticas 2025",
      actions: [
        "Acesse https://developers.facebook.com/",
        "Faça login com sua conta Meta/Facebook Business",
        "Complete a verificação de identidade obrigatória (2025)",
        "Aceite os novos Termos de Desenvolvedor 2025",
        "Configure autenticação de dois fatores (obrigatório)"
      ],
      links: [
        { text: "Meta for Developers 2025", url: "https://developers.facebook.com/" },
        { text: "Política de Desenvolvedores 2025", url: "https://developers.facebook.com/policy/" }
      ],
      important: "A verificação de identidade é obrigatória desde 2025 para todas as novas contas de desenvolvedor."
    },
    {
      id: 2,
      title: "Configurar Meta Business Manager",
      description: "Configure o Business Manager para gerenciar suas integrações empresariais",
      actions: [
        "Acesse https://business.facebook.com/",
        "Crie ou acesse sua conta Business Manager",
        "Adicione sua página do Facebook à conta Business",
        "Conecte sua conta Instagram Business à página",
        "Configure permissões de administrador para a conta",
        "Verifique o domínio do seu site (obrigatório para APIs)"
      ],
      links: [
        { text: "Meta Business Manager", url: "https://business.facebook.com/" },
        { text: "Verificação de Domínio", url: "https://developers.facebook.com/docs/sharing/domain-verification/" }
      ],
      warning: "Sem Business Manager configurado, você não conseguirá acessar dados de campanhas publicitárias!"
    },
    {
      id: 3,
      title: "Criar App com Graph API v19.0",
      description: "Configure seu aplicativo com a versão mais recente da Graph API",
      actions: [
        "No Meta for Developers, clique em 'Meus Apps' → 'Criar App'",
        "Selecione 'Business' como tipo de app (recomendado para 2025)",
        "Preencha nome do app e email de contato empresarial",
        "Selecione Graph API versão 19.0 ou superior",
        "Associe o app ao seu Business Manager",
        "Anote o App ID gerado"
      ],
      important: "Use sempre a versão mais recente da Graph API para melhor performance e recursos."
    },
    {
      id: 4,
      title: "Configurar Produtos e Permissões (2025)",
      description: "Adicione produtos necessários e configure permissões atualizadas",
      actions: [
        "Adicione 'Facebook Login for Business' ao app",
        "Adicione 'Instagram Basic Display API'",
        "Adicione 'Marketing API' para campanhas publicitárias",
        "Configure URLs de redirecionamento válidas:",
        `- ${window.location.origin}/integrations`,
        `- ${window.location.origin}/auth/callback`,
        "Solicite as seguintes permissões:",
        "• pages_show_list (páginas)",
        "• pages_read_engagement (métricas de página)",
        "• instagram_basic (Instagram básico)",
        "• instagram_manage_insights (Instagram Analytics)",
        "• ads_read (leitura de campanhas)",
        "• business_management (gestão empresarial)"
      ],
      copyableUrls: [
        `${window.location.origin}/integrations`,
        `${window.location.origin}/auth/callback`
      ],
      warning: "As permissões instagram_manage_insights e business_management são novas em 2025 e essenciais!"
    },
    {
      id: 5,
      title: "Obter Credenciais de Produção",
      description: "Colete todas as credenciais necessárias para integração",
      actions: [
        "Vá para 'Configurações' → 'Básico' do seu app",
        "Copie o 'App ID'",
        "Clique em 'Mostrar' no 'Chave Secreta do App'",
        "Copie a 'App Secret' (mantenha ultra segura!)",
        "Vá para 'Marketing API' → 'Ferramentas'",
        "Gere um 'Token de Acesso do Sistema' (recomendado para 2025)",
        "Configure o token para não expirar (para produção)"
      ],
      warning: "Nunca compartilhe App Secret ou tokens de acesso! Use variáveis de ambiente sempre."
    },
    {
      id: 6,
      title: "Configurar Instagram Business API",
      description: "Configure acesso completo aos dados do Instagram Business",
      actions: [
        "Certifique-se que sua conta Instagram é Business/Creator",
        "Conecte o Instagram à sua página do Facebook",
        "No app, vá para 'Instagram Basic Display' → 'Configurações'",
        "Adicione usuários de teste (sua conta Instagram)",
        "Configure webhook para atualizações em tempo real",
        "Teste a conexão com Graph API Explorer"
      ],
      links: [
        { text: "Graph API Explorer", url: "https://developers.facebook.com/tools/explorer/" },
        { text: "Instagram Business API", url: "https://developers.facebook.com/docs/instagram-api/" }
      ]
    },
    {
      id: 7,
      title: "Configurar Webhooks (Tempo Real)",
      description: "Configure webhooks para receber dados em tempo real",
      actions: [
        "Vá para 'Produtos' → 'Webhooks'",
        "Adicione webhook para 'page' (dados da página)",
        "Adicione webhook para 'instagram' (dados do Instagram)",
        "Configure URL do webhook: [SEU_DOMINIO]/api/webhooks/meta",
        "Defina token de verificação seguro",
        "Selecione eventos: feed, live_videos, posts, comments",
        "Teste e valide o webhook"
      ],
      important: "Webhooks garantem dados em tempo real para campanhas e Instagram Analytics!"
    },
    {
      id: 8,
      title: "Análise e Aprovação (2025)",
      description: "Processo de aprovação atualizado para 2025",
      actions: [
        "Para desenvolvimento: mantenha em 'Modo de Desenvolvimento'",
        "Para produção: solicite 'Análise do App'",
        "Preencha casos de uso detalhados (obrigatório em 2025)",
        "Forneça vídeo demonstrativo da integração",
        "Documente políticas de privacidade atualizadas",
        "Aguarde aprovação (3-7 dias úteis em 2025)"
      ],
      warning: "O processo de aprovação ficou mais rigoroso em 2025. Prepare documentação completa!"
    },
    {
      id: 9,
      title: "Configurar Contas Publicitárias",
      description: "Conecte suas contas de anúncios para dados de campanhas",
      actions: [
        "No Business Manager, vá para 'Contas de Anúncios'",
        "Adicione todas as contas que deseja monitorar",
        "Configure permissões de 'Analista' para o app",
        "Teste acesso via Marketing API",
        "Verifique se consegue acessar insights de campanhas"
      ],
      links: [
        { text: "Marketing API Reference", url: "https://developers.facebook.com/docs/marketing-api/" }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Configuração Meta API 2025</h2>
        <p className="text-muted-foreground">
          Guia completo atualizado para configurar integração com Facebook Ads e Instagram Business
        </p>
        <Badge variant="default" className="bg-blue-600">
          Atualizado para Graph API v19.0 • Janeiro 2025
        </Badge>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">📋 Pré-requisitos 2025:</p>
            <ul className="text-sm space-y-1 ml-4">
              <li>• Conta Meta/Facebook Business verificada</li>
              <li>• Meta Business Manager configurado</li>
              <li>• Página do Facebook com Instagram Business conectado</li>
              <li>• Domínio verificado (obrigatório desde 2025)</li>
              <li>• Autenticação de dois fatores ativada</li>
              <li>• Tempo estimado: 45-60 minutos</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      <Alert className="border-amber-500/20 bg-amber-500/5">
        <TrendingUp className="h-4 w-4 text-amber-500" />
        <AlertDescription className="text-amber-700">
          <div className="space-y-2">
            <p className="font-medium">🚀 Novidades 2025:</p>
            <ul className="text-sm space-y-1 ml-4">
              <li>• Graph API v19.0 com melhor performance</li>
              <li>• Verificação de identidade obrigatória</li>
              <li>• Novas permissões para Instagram Analytics</li>
              <li>• Processo de aprovação mais rigoroso</li>
              <li>• Webhooks em tempo real aprimorados</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {steps.map((step, index) => (
          <Card key={step.id} className="relative">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  {step.id}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {step.actions.map((action, actionIndex) => (
                  <div key={actionIndex} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{action}</span>
                  </div>
                ))}
              </div>

              {step.copyableUrls && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">URLs para copiar:</p>
                  {step.copyableUrls.map((url, urlIndex) => (
                    <div key={urlIndex} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <code className="text-xs flex-1">{url}</code>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(url)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {step.links && (
                <div className="flex flex-wrap gap-2">
                  {step.links.map((link, linkIndex) => (
                    <Button
                      key={linkIndex}
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        {link.text}
                      </a>
                    </Button>
                  ))}
                </div>
              )}

              {step.important && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="font-medium">
                    💡 {step.important}
                  </AlertDescription>
                </Alert>
              )}

              {step.warning && (
                <Alert variant="destructive">
                  <Shield className="h-4 w-4" />
                  <AlertDescription className="font-medium">
                    ⚠️ {step.warning}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Seção de Troubleshooting */}
      <Card className="bg-red-50 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            Problemas Comuns e Soluções
          </CardTitle>
        </CardHeader>
        <CardContent className="text-red-700 space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium">❌ Erro: "App não aprovado para uso em produção"</h4>
              <p className="text-sm ml-4">Solução: Complete o processo de análise do app no passo 8</p>
            </div>
            <div>
              <h4 className="font-medium">❌ Erro: "Permissões insuficientes para Instagram"</h4>
              <p className="text-sm ml-4">Solução: Verifique se o Instagram está conectado à página do Facebook</p>
            </div>
            <div>
              <h4 className="font-medium">❌ Erro: "Token de acesso expirado"</h4>
              <p className="text-sm ml-4">Solução: Configure token de sistema que não expira (passo 5)</p>
            </div>
            <div>
              <h4 className="font-medium">❌ Erro: "Domínio não verificado"</h4>
              <p className="text-sm ml-4">Solução: Complete a verificação de domínio no Business Manager</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Zap className="h-5 w-5" />
            Configuração Concluída!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-green-700">
          <p className="mb-3">
            Após concluir todos os passos, você terá:
          </p>
          <ul className="space-y-1 text-sm">
            <li>✅ App ID da Meta (Graph API v19.0)</li>
            <li>✅ App Secret da Meta</li>
            <li>✅ Token de Acesso do Sistema</li>
            <li>✅ Permissões para Facebook e Instagram</li>
            <li>✅ Business Manager configurado</li>
            <li>✅ Webhooks para dados em tempo real</li>
            <li>✅ Contas publicitárias conectadas</li>
          </ul>
          <Separator className="my-4" />
          <div className="flex items-center gap-2 p-3 bg-green-100 rounded-lg">
            <Building2 className="h-5 w-5" />
            <div>
              <p className="font-medium">Próximo passo:</p>
              <p className="text-sm">Vá para a aba "Meta API" e insira suas credenciais para ativar a integração!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
