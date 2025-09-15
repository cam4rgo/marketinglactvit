import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Eye,
  MousePointer,
  DollarSign,
  Target,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Settings,
  MessageCircle,
  Users,
  BarChart3  // Adicionar este import
} from 'lucide-react';
import {
  useMetaCampaigns,
  useMetaCampaignInsights,
  type MetaCampaign,
  type MetaCampaignInsights,
  type MetaAdsFilters,
  type MetricsSelection
} from '@/hooks/useMetaAdsData';

interface MetaAdsCampaignsListProps {
  filters?: MetaAdsFilters;
  selectedMetrics?: MetricsSelection;
  onCampaignSelect?: (campaignIds: string[]) => void;
  selectedCampaignIds?: string[];
}

export const MetaAdsCampaignsList: React.FC<MetaAdsCampaignsListProps> = ({
  filters = {},
  selectedMetrics,
  onCampaignSelect,
  selectedCampaignIds = []
}) => {
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set());

  // Buscar campanhas
  const {
    data: campaigns = [],
    isLoading: campaignsLoading,
    error: campaignsError,
    refetch: refetchCampaigns
  } = useMetaCampaigns(filters);

  // Buscar insights das campanhas selecionadas
  const {
    data: insights = [],
    isLoading: insightsLoading,
    error: insightsError
  } = useMetaCampaignInsights(
    // Se não há campanhas selecionadas, buscar insights de todas as campanhas
    selectedCampaignIds.length > 0 
      ? selectedCampaignIds 
      : (campaigns as MetaCampaign[]).map(c => c.id),
    filters,
    selectedMetrics
  );

  // Função para formatar valores
  const formatValue = (value: string | number | undefined, type: 'currency' | 'number' | 'percentage') => {
    if (value === undefined || value === null || value === '') return '-';
    
    // Converter string para número se necessário
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    
    // Verificar se a conversão resultou em um número válido
    if (isNaN(numericValue)) return '-';
    
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(numericValue);
      case 'percentage':
        return `${(numericValue * 100).toFixed(2)}%`;
      case 'number':
      default:
        return new Intl.NumberFormat('pt-BR').format(numericValue);
    }
  };

  // Função para obter status badge
  const getStatusBadge = (status: MetaCampaign['status']) => {
    const statusConfig = {
      ACTIVE: { label: 'Ativo', variant: 'default' as const },
      PAUSED: { label: 'Pausado', variant: 'secondary' as const },
      DELETED: { label: 'Excluído', variant: 'destructive' as const },
      ARCHIVED: { label: 'Arquivado', variant: 'outline' as const }
    };

    const config = statusConfig[status] || statusConfig.ACTIVE;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Função para alternar expansão de campanha
  const toggleCampaignExpansion = (campaignId: string) => {
    const newExpanded = new Set(expandedCampaigns);
    if (newExpanded.has(campaignId)) {
      newExpanded.delete(campaignId);
    } else {
      newExpanded.add(campaignId);
    }
    setExpandedCampaigns(newExpanded);
  };

  // Função para obter insights de uma campanha específica
  const getCampaignInsights = (campaignId: string): MetaCampaignInsights | undefined => {
    return (insights as MetaCampaignInsights[]).find(insight => insight.campaign_id === campaignId);
  };

  // Função para obter badge do objetivo da campanha
  const getObjectiveBadge = (objective: string) => {
    const objectiveConfig = {
      // Awareness objectives
      'OUTCOME_AWARENESS': { label: 'Reconhecimento', variant: 'secondary' as const, color: 'bg-blue-100 text-blue-800' },
      'BRAND_AWARENESS': { label: 'Reconhecimento da Marca', variant: 'secondary' as const, color: 'bg-blue-100 text-blue-800' },
      'REACH': { label: 'Alcance', variant: 'secondary' as const, color: 'bg-blue-100 text-blue-800' },
      
      // Traffic objectives
      'OUTCOME_TRAFFIC': { label: 'Tráfego', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      'LINK_CLICKS': { label: 'Cliques no Link', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      
      // Engagement objectives
      'OUTCOME_ENGAGEMENT': { label: 'Engajamento', variant: 'outline' as const, color: 'bg-purple-100 text-purple-800' },
      'POST_ENGAGEMENT': { label: 'Engajamento da Publicação', variant: 'outline' as const, color: 'bg-purple-100 text-purple-800' },
      'PAGE_LIKES': { label: 'Curtidas da Página', variant: 'outline' as const, color: 'bg-purple-100 text-purple-800' },
      'EVENT_RESPONSES': { label: 'Respostas do Evento', variant: 'outline' as const, color: 'bg-purple-100 text-purple-800' },
      'VIDEO_VIEWS': { label: 'Visualizações de Vídeo', variant: 'outline' as const, color: 'bg-purple-100 text-purple-800' },
      
      // Leads objectives
      'OUTCOME_LEADS': { label: 'Leads', variant: 'default' as const, color: 'bg-orange-100 text-orange-800' },
      'LEAD_GENERATION': { label: 'Geração de Leads', variant: 'default' as const, color: 'bg-orange-100 text-orange-800' },
      'MESSAGES': { label: 'Mensagens', variant: 'default' as const, color: 'bg-orange-100 text-orange-800' },
      
      // Sales/Conversion objectives
      'OUTCOME_SALES': { label: 'Vendas', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
      'CONVERSIONS': { label: 'Conversões', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
      'CATALOG_SALES': { label: 'Vendas do Catálogo', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
      'STORE_VISITS': { label: 'Visitas à Loja', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
      
      // App objectives
      'OUTCOME_APP_PROMOTION': { label: 'Promoção de App', variant: 'secondary' as const, color: 'bg-indigo-100 text-indigo-800' },
      'APP_INSTALLS': { label: 'Instalações de App', variant: 'secondary' as const, color: 'bg-indigo-100 text-indigo-800' },
      'APP_ENGAGEMENT': { label: 'Engajamento do App', variant: 'secondary' as const, color: 'bg-indigo-100 text-indigo-800' }
    };
    
    const config = objectiveConfig[objective as keyof typeof objectiveConfig] || {
      label: objective || 'N/A',
      variant: 'outline' as const,
      color: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge 
        variant={config.variant} 
        className={`${config.color} border-0 font-medium text-xs px-2 py-1`}
      >
        {config.label}
      </Badge>
    );
  };

  // Renderizar loading state
  if (campaignsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campanhas Meta Ads</CardTitle>
          <CardDescription>Carregando campanhas...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {[...Array(4)].map((_, j) => (
                    <Skeleton key={j} className="h-16" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Renderizar erro state
  if (campaignsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campanhas Meta Ads</CardTitle>
          <CardDescription>Erro ao carregar campanhas</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {campaignsError.message}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => refetchCampaigns()} 
            className="mt-4"
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Renderizar lista vazia
  if (!(campaigns as MetaCampaign[]).length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campanhas Meta Ads</CardTitle>
          <CardDescription>Nenhuma campanha encontrada</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              Nenhuma campanha foi encontrada com os filtros aplicados.
            </p>
            <Button 
              onClick={() => refetchCampaigns()} 
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Campanhas Meta Ads
          <Badge variant="secondary">{(campaigns as MetaCampaign[]).length}</Badge>
        </CardTitle>
        <CardDescription>
          {insightsLoading ? 'Carregando métricas...' : 'Campanhas ativas e suas métricas de performance'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Erro ao carregar insights */}
        {insightsError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar métricas: {insightsError.message}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          {(campaigns as MetaCampaign[]).map((campaign) => {
            const campaignInsights = getCampaignInsights(campaign.id);
            const isExpanded = expandedCampaigns.has(campaign.id);
            const isSelected = selectedCampaignIds.includes(campaign.id);
            
            return (
              <div 
                key={campaign.id} 
                className={`
                  bg-card border border-border rounded-lg p-6 transition-all duration-200 hover:shadow-lg
                  ${isSelected 
                    ? 'border-primary bg-primary/10 shadow-md ring-1 ring-primary/20' 
                    : 'border-border hover:border-primary/50'
                  }
                `}
              >
                {/* Header da Campanha */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (onCampaignSelect) {
                          if (e.target.checked) {
                            onCampaignSelect([...selectedCampaignIds, campaign.id]);
                          } else {
                            onCampaignSelect(selectedCampaignIds.filter(id => id !== campaign.id));
                          }
                        }
                      }}
                      className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary focus:ring-2"
                    />
                    <div className="flex flex-col gap-2">
                      <h3 className="font-semibold text-lg text-card-foreground">{campaign.name}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getObjectiveBadge(campaign.objective)}
                        {getStatusBadge(campaign.status)}
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">
                          Criada em {new Date(campaign.created_time).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleCampaignExpansion(campaign.id)}
                      className="border-border hover:border-primary hover:bg-primary/10"
                    >
                      {isExpanded ? 'Recolher' : 'Expandir'}
                      <Settings className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>

                {/* Métricas Resumidas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {selectedMetrics?.impressions && (
                    <div className="bg-muted/50 border border-border rounded-lg p-4 hover:bg-muted/70 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-muted-foreground">Impressões</span>
                      </div>
                      <p className="text-xl font-bold text-card-foreground">
                        {campaignInsights ? formatValue(campaignInsights.impressions, 'number') : '0'}
                      </p>
                    </div>
                  )}

                  {selectedMetrics?.reach && (
                    <div className="bg-muted/50 border border-border rounded-lg p-4 hover:bg-muted/70 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-info" />
                        <span className="text-sm font-medium text-muted-foreground">Alcance</span>
                      </div>
                      <p className="text-xl font-bold text-card-foreground">
                        {campaignInsights ? formatValue(campaignInsights.reach, 'number') : '0'}
                      </p>
                    </div>
                  )}

                  {selectedMetrics?.frequency && (
                    <div className="bg-muted/50 border border-border rounded-lg p-4 hover:bg-muted/70 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="w-4 h-4 text-warning" />
                        <span className="text-sm font-medium text-muted-foreground">Frequência</span>
                      </div>
                      <p className="text-xl font-bold text-card-foreground">
                        {campaignInsights ? formatValue(campaignInsights.frequency, 'number') : '0.00'}
                      </p>
                    </div>
                  )}

                  {selectedMetrics?.clicks && (
                    <div className="bg-muted/50 border border-border rounded-lg p-4 hover:bg-muted/70 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <MousePointer className="w-4 h-4 text-success" />
                        <span className="text-sm font-medium text-muted-foreground">Cliques</span>
                      </div>
                      <p className="text-xl font-bold text-card-foreground">
                        {campaignInsights ? formatValue(campaignInsights.clicks, 'number') : '0'}
                      </p>
                    </div>
                  )}

                  {selectedMetrics?.messaging_conversations_started && (
                    <div className="bg-muted/50 border border-border rounded-lg p-4 hover:bg-muted/70 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageCircle className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-muted-foreground">Conversas Iniciadas</span>
                      </div>
                      <p className="text-xl font-bold text-card-foreground">
                        {formatValue(getMessagingConversationsStarted(campaignInsights), 'number')}
                      </p>
                    </div>
                  )}

                  {selectedMetrics?.spend && (
                    <div className="bg-muted/50 border border-border rounded-lg p-4 hover:bg-muted/70 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-destructive" />
                        <span className="text-sm font-medium text-muted-foreground">Gasto</span>
                      </div>
                      <p className="text-xl font-bold text-card-foreground">
                        {campaignInsights ? formatValue(campaignInsights.spend, 'currency') : 'R$ 0,00'}
                      </p>
                    </div>
                  )}

                  {selectedMetrics?.ctr && (
                    <div className="bg-muted/50 border border-border rounded-lg p-4 hover:bg-muted/70 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-success" />
                        <span className="text-sm font-medium text-muted-foreground">CTR</span>
                      </div>
                      <p className="text-xl font-bold text-card-foreground">
                        {campaignInsights ? formatValue(campaignInsights.ctr, 'percentage') : '0%'}
                      </p>
                    </div>
                  )}

                  {selectedMetrics?.cpm && (
                    <div className="bg-muted/50 border border-border rounded-lg p-4 hover:bg-muted/70 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-info" />
                        <span className="text-sm font-medium text-muted-foreground">CPM</span>
                      </div>
                      <p className="text-xl font-bold text-card-foreground">
                        {campaignInsights ? formatValue(campaignInsights.cpm, 'currency') : 'R$ 0,00'}
                      </p>
                    </div>
                  )}

                  {selectedMetrics?.conversions && (
                    <div className="bg-muted/50 border border-border rounded-lg p-4 hover:bg-muted/70 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-success" />
                        <span className="text-sm font-medium text-muted-foreground">Conversões</span>
                      </div>
                      <p className="text-xl font-bold text-card-foreground">
                        {campaignInsights ? formatValue(campaignInsights.conversions, 'number') : '0'}
                      </p>
                    </div>
                  )}

                  {selectedMetrics?.cost_per_messaging_conversation_started && (
                    <div className="bg-muted/50 border border-border rounded-lg p-4 hover:bg-muted/70 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageCircle className="w-4 h-4 text-warning" />
                        <span className="text-sm font-medium text-muted-foreground">Custo por Conversa Iniciada</span>
                      </div>
                      <p className="text-xl font-bold text-card-foreground">
                        {campaignInsights ? formatValue(getCostPerConversationStarted(campaignInsights), 'currency') : 'R$ 0,00'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Detalhes Expandidos */}
                {isExpanded && campaignInsights && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Métricas Detalhadas</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Métrica</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Métrica</TableHead>
                          <TableHead>Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Alcance</TableCell>
                          <TableCell>{formatValue(campaignInsights.reach, 'number')}</TableCell>
                          <TableCell className="font-medium">Frequência</TableCell>
                          <TableCell>{formatValue(campaignInsights.frequency, 'number')}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">CPM</TableCell>
                          <TableCell>{formatValue(campaignInsights.cpm, 'currency')}</TableCell>
                          <TableCell className="font-medium">CPC</TableCell>
                          <TableCell>{formatValue(campaignInsights.cpc, 'currency')}</TableCell>
                        </TableRow>
                        {campaignInsights.conversions && (
                          <TableRow>
                            <TableCell className="font-medium">Conversões</TableCell>
                            <TableCell>{formatValue(campaignInsights.conversions, 'number')}</TableCell>
                            <TableCell className="font-medium">Taxa de Conversão</TableCell>
                            <TableCell>{formatValue(campaignInsights.conversion_rate, 'percentage')}</TableCell>
                          </TableRow>
                        )}
                        {campaignInsights.messaging_conversations_started && (
                          <TableRow>
                            <TableCell className="font-medium">Conversas Iniciadas</TableCell>
                            <TableCell>{formatValue(getMessagingConversationsStarted(campaignInsights), 'number')}</TableCell>
                            <TableCell className="font-medium">Custo por Conversão</TableCell>
                            <TableCell>{formatValue(campaignInsights?.cost_per_conversion, 'currency')}</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                    
                    <div className="mt-4 p-3 rounded-lg border" style={{ backgroundColor: '#131a25' }}>
                      <p className="text-sm text-gray-300">
                        <strong className="text-white">Período:</strong> 
                        {getCampaignStartDate(campaign)} até {getCampaignEndDate(campaign)}
                      </p>
                      {campaign.daily_budget && (
                        <p className="text-sm text-gray-300 mt-1">
                          <strong className="text-white">Orçamento Diário:</strong> {formatValue(campaign.daily_budget / 100, 'currency')}
                        </p>
                      )}
                      {campaign.lifetime_budget && (
                        <p className="text-sm text-gray-300 mt-1">
                          <strong className="text-white">Orçamento Total:</strong> {formatValue(campaign.lifetime_budget / 100, 'currency')}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default MetaAdsCampaignsList;

// Função para determinar a data final da campanha
const getCampaignEndDate = (campaign: MetaCampaign): string => {
  // Se existe stop_time (data de parada específica), usar ela primeiro
  if (campaign.stop_time) {
    return new Date(campaign.stop_time).toLocaleDateString('pt-BR');
  }
  
  // Se a campanha está ativa e não tem stop_time, mostrar "Ativo"
  if (campaign.status === 'ACTIVE') {
    return 'Ativo';
  }
  
  // Para campanhas pausadas ou arquivadas, usar updated_time
  if (campaign.status === 'PAUSED' || campaign.status === 'ARCHIVED') {
    return `Pausada em ${new Date(campaign.updated_time).toLocaleDateString('pt-BR')}`;
  }
  
  // Para campanhas deletadas, usar updated_time
  if (campaign.status === 'DELETED') {
    return `Deletada em ${new Date(campaign.updated_time).toLocaleDateString('pt-BR')}`;
  }
  
  // Fallback para updated_time
  return new Date(campaign.updated_time).toLocaleDateString('pt-BR');
};

// Função para determinar a data de início da campanha
const getCampaignStartDate = (campaign: MetaCampaign): string => {
  // Se existe start_time, usar ela; senão usar created_time
  const startDate = campaign.start_time || campaign.created_time;
  return new Date(startDate).toLocaleDateString('pt-BR');
};

// Função para extrair conversas iniciadas do campo actions
const getMessagingConversationsStarted = (insight: MetaCampaignInsights | undefined): number => {
  if (!insight) return 0;
  
  // Extrair do campo actions primeiro
  if (insight.actions && Array.isArray(insight.actions)) {
    const messagingAction = insight.actions.find(action => 
      action.action_type === 'messaging_conversation_started_7d' ||
      action.action_type === 'messaging_conversation_started' ||
      action.action_type === 'onsite_conversion.messaging_conversation_started_7d' ||
      action.action_type === 'onsite_conversion.messaging_conversation_started'
    );
    if (messagingAction) {
      return parseFloat(messagingAction.value) || 0;
    }
  }
  
  // Fallback para o campo direto (se ainda existir)
  return parseFloat(insight.messaging_conversations_started || '0') || 0;
};

// Função para calcular custo por conversa iniciada
const getCostPerConversationStarted = (insight: MetaCampaignInsights | undefined): number => {
  if (!insight) return 0;
  
  const spend = parseFloat(insight.spend || '0');
  const conversations = getMessagingConversationsStarted(insight);
  
  if (conversations === 0) return 0;
  return spend / conversations;
};