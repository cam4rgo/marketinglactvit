
import React, { useState } from 'react';
import { ModuleProtection } from '@/components/auth/ModuleProtection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Target, 
  DollarSign,
  Download,
  Settings,
  Loader2,
  MessageCircle,
  Users
} from 'lucide-react';
import { useMetaAdsCampaignsPage } from '@/hooks/useMetaAdsData';
import { CampaignFiltersComponent } from '@/components/campaigns/CampaignFilters';
import { MetricsSelector } from '@/components/campaigns/MetricsSelector';
import { CampaignExporter } from '@/components/campaigns/CampaignExporter';
import { MetaAdsCampaignsList } from '@/components/campaigns/MetaAdsCampaignsList';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function Campaigns() {
  const [showMetricsSelector, setShowMetricsSelector] = useState(false);
  const [showExporter, setShowExporter] = useState(false);
  
  const {
    campaigns,
    insights,
    filters,
    selectedMetrics,
    selectedCampaignIds,
    isLoading,
    error,
    updateFilters,
    updateMetrics,
    setSelectedCampaignIds
  } = useMetaAdsCampaignsPage();

  // Calcular métricas resumidas
  const summaryMetrics = React.useMemo(() => {
    if (!insights.length) {
      return {
        totalImpressions: 0,
        totalClicks: 0,
        totalConversions: 0,
        totalSpend: 0,
        totalMessagingConversationsStarted: 0,
        totalReach: 0,
        averageCTR: 0,
        averageCPM: 0,
        averageCPC: 0,
        averageConversionRate: 0,
        averageCostPerConversion: 0,
        // ✅ ADICIONAR:
        averageFrequency: 0
      };
    }

    const totals = insights.reduce((acc, insight) => {
      acc.impressions += parseFloat(insight.impressions) || 0;
      acc.clicks += parseFloat(insight.clicks) || 0;
      acc.conversions += parseFloat(insight.conversions) || 0;
      acc.spend += parseFloat(insight.spend) || 0;
      
      // Extrair conversas iniciadas do campo actions
      let messagingConversations = 0;
      if (insight.actions && Array.isArray(insight.actions)) {
        const messagingAction = insight.actions.find(action => 
          action.action_type === 'messaging_conversation_started_7d' ||
          action.action_type === 'messaging_conversation_started' ||
          action.action_type === 'onsite_conversion.messaging_conversation_started_7d' ||
          action.action_type === 'onsite_conversion.messaging_conversation_started'
        );
        if (messagingAction) {
          messagingConversations = parseFloat(messagingAction.value) || 0;
        }
      }
      // Fallback para o campo direto (se ainda existir)
      if (messagingConversations === 0 && insight.messaging_conversations_started) {
        messagingConversations = parseFloat(insight.messaging_conversations_started) || 0;
      }
      acc.messagingConversationsStarted += messagingConversations;
      
      acc.reach += parseFloat(insight.reach) || 0;
      // ✅ ADICIONAR:
      // Add frequency to accumulator if it exists in insight
      if ('frequency' in insight) {
        acc.frequency = (acc.frequency || 0) + (parseFloat(insight.frequency) || 0);
      }
      return acc;
    }, { impressions: 0, clicks: 0, conversions: 0, spend: 0, messagingConversationsStarted: 0, reach: 0, frequency: 0 });

    const averageCTR = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
    const averageCPM = totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0;
    const averageCPC = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
    const averageConversionRate = totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0;
    const averageCostPerConversion = totals.conversions > 0 ? totals.spend / totals.conversions : 0;
    // ✅ ADICIONAR:
    const averageFrequency = insights.length > 0 ? totals.frequency / insights.length : 0;

    return {
      totalImpressions: totals.impressions,
      totalClicks: totals.clicks,
      totalConversions: totals.conversions,
      totalSpend: totals.spend,
      totalMessagingConversationsStarted: totals.messagingConversationsStarted,
      totalReach: totals.reach,
      averageCTR,
      averageCPM,
      averageCPC,
      averageConversionRate,
      averageCostPerConversion,
      // ✅ ADICIONAR:
      averageFrequency
    };
  }, [insights]);

  const metricsCards = [
    {
      title: 'Impressões',
      value: summaryMetrics.totalImpressions.toLocaleString('pt-BR'),
      icon: Eye,
      color: 'text-blue-600',
      show: selectedMetrics.impressions
    },
    {
      title: 'Alcance',
      value: summaryMetrics.totalReach?.toLocaleString('pt-BR') || '0',
      icon: Users,
      color: 'text-indigo-600',
      show: selectedMetrics.reach
    },
    // ✅ ADICIONAR ESTE CARD:
    {
      title: 'Frequência Média',
      value: summaryMetrics.averageFrequency?.toFixed(2) || '0.00',
      icon: BarChart3,
      color: 'text-cyan-600',
      show: selectedMetrics.frequency
    },
    {
      title: 'Cliques', 
      value: summaryMetrics.totalClicks.toLocaleString('pt-BR'),
      icon: MousePointer,
      color: 'text-green-600',
      show: selectedMetrics.clicks
    },
    {
      title: 'CTR Médio',
      value: `${summaryMetrics.averageCTR.toFixed(2)}%`,
      icon: Target,
      color: 'text-emerald-600',
      show: selectedMetrics.ctr
    },
    {
      title: 'Conversas Iniciadas',
      value: summaryMetrics.totalMessagingConversationsStarted.toLocaleString('pt-BR'),
      icon: MessageCircle,
      color: 'text-teal-600',
      show: selectedMetrics.messaging_conversations_started
    },
    {
      title: 'Investimento',
      value: `R$ ${summaryMetrics.totalSpend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-orange-600',
      show: selectedMetrics.spend
    },
    {
      title: 'CPM Médio',
      value: `R$ ${summaryMetrics.averageCPM.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-amber-600',
      show: selectedMetrics.cpm
    },
    {
      title: 'CPC Médio',
      value: `R$ ${summaryMetrics.averageCPC?.toFixed(2) || '0.00'}`,
      icon: MousePointer,
      color: 'text-yellow-600',
      show: selectedMetrics.cpc
    },
    {
      title: 'Conversões',
      value: summaryMetrics.totalConversions.toLocaleString('pt-BR'),
      icon: Target,
      color: 'text-purple-600',
      show: selectedMetrics.conversions
    },
    {
      title: 'Taxa de Conversão',
      value: `${summaryMetrics.averageConversionRate?.toFixed(2) || '0.00'}%`,
      icon: Target,
      color: 'text-violet-600',
      show: selectedMetrics.conversion_rate
    },
    {
      title: 'Custo por Conversão',
      value: `R$ ${summaryMetrics.averageCostPerConversion?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'text-pink-600',
      show: selectedMetrics.cost_per_conversion
    },
    {
      title: 'Custo por Conversa Iniciada',
      value: `R$ ${(summaryMetrics.totalSpend / summaryMetrics.totalMessagingConversationsStarted || 0).toFixed(2)}`,
      icon: MessageCircle,
      color: 'text-cyan-600',
      show: selectedMetrics.cost_per_messaging_conversation_started
    }
  ].filter(metric => metric.show);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Campanhas Meta Ads</h1>
            <p className="text-muted-foreground">
              Dashboard de métricas de campanhas de marketing
            </p>
          </div>
        </div>
        
        <div className="rounded-lg border text-card-foreground bg-card border-border shadow-sm">
          <div className="p-6 flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 font-medium">Erro ao carregar dados</p>
              <p className="text-muted-foreground text-sm mt-2">{error?.message || 'Erro desconhecido'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }


  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Campanhas Meta Ads</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Dashboard de métricas de campanhas de marketing
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Dialog open={showExporter} onOpenChange={setShowExporter}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Exportar Relatório</DialogTitle>
              </DialogHeader>
              <CampaignExporter
                campaigns={campaigns}
                insights={insights}
                filters={filters}
                selectedMetrics={selectedMetrics}
              />
            </DialogContent>
          </Dialog>
          
          <Dialog open={showMetricsSelector} onOpenChange={setShowMetricsSelector}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Settings className="w-4 h-4 mr-2" />
                Métricas
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Selecionar Métricas</DialogTitle>
              </DialogHeader>
              <MetricsSelector
                selectedMetrics={selectedMetrics}
                onMetricsChange={updateMetrics}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros Meta Ads - Removido Card wrapper e botão */}
      <CampaignFiltersComponent
        filters={filters}
        onFiltersChange={updateFilters}
        selectedCampaignIds={selectedCampaignIds}
        onCampaignSelectionChange={setSelectedCampaignIds}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="rounded-lg border text-card-foreground bg-card border-border shadow-sm">
          <div className="p-6 flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando dados das campanhas...</p>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      {!isLoading && metricsCards.length > 0 && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <TooltipProvider>
            {metricsCards.map((metric) => (
              <Tooltip key={metric.title}>
                <TooltipTrigger asChild>
                  <div className="rounded-lg border text-card-foreground bg-card border-border shadow-sm cursor-help hover:shadow-md transition-shadow">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
                      <h3 className="text-xs sm:text-sm font-medium">
                        {metric.title}
                      </h3>
                      <metric.icon className={`h-4 w-4 ${metric.color}`} />
                    </div>
                    <div className="p-4 pt-0 sm:p-6 sm:pt-0">
                      <div className="text-xl sm:text-2xl font-bold">{metric.value}</div>
                      <p className="text-xs text-muted-foreground">
                        Resultado geral de todas as campanhas
                      </p>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{getMetricTooltip(metric.title)}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      )}

      {/* Tabs */}
      {!isLoading && (
        <Tabs defaultValue="campaigns" className="space-y-4">
          <TabsList>
            <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
            <TabsTrigger value="insights">Insights Detalhados</TabsTrigger>
          </TabsList>
          
          <TabsContent value="campaigns" className="space-y-4">
            <MetaAdsCampaignsList
              filters={filters}
              selectedMetrics={selectedMetrics}
              onCampaignSelect={setSelectedCampaignIds}
              selectedCampaignIds={selectedCampaignIds}
            />
          </TabsContent>
          
          <TabsContent value="insights" className="space-y-4">
            <div className="rounded-lg border text-card-foreground bg-card border-border shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Insights Detalhados
                </h3>
                <p className="text-sm text-muted-foreground">
                  Dados detalhados de performance das campanhas
                </p>
              </div>
              <div className="p-6 pt-0">
                {insights.length > 0 ? (
                  <div className="space-y-4">
                    {insights.map((insight, index) => (
                      <div key={`${insight.campaign_id}-${insight.date_start}-${index}`} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{insight.campaign_name || insight.campaign_id}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(insight.date_start).toLocaleDateString('pt-BR')} - {new Date(insight.date_stop).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                          {selectedMetrics.impressions && (
                            <div>
                              <p className="text-muted-foreground">Impressões</p>
                              <p className="font-medium">{(parseFloat(insight.impressions) || 0).toLocaleString('pt-BR')}</p>
                            </div>
                          )}
                          {selectedMetrics.clicks && (
                            <div>
                              <p className="text-muted-foreground">Cliques</p>
                              <p className="font-medium">{(parseFloat(insight.clicks) || 0).toLocaleString('pt-BR')}</p>
                            </div>
                          )}
                          {selectedMetrics.spend && (
                            <div>
                              <p className="text-muted-foreground">Investimento</p>
                              <p className="font-medium">R$ {(parseFloat(insight.spend) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            </div>
                          )}
                          {selectedMetrics.messaging_conversations_started && (
                            <div>
                              <p className="text-muted-foreground">Conversas Iniciadas</p>
                              <p className="font-medium">
                                {(() => {
                                  // Extrair do campo actions primeiro
                                  let messagingConversations = 0; // ✅ DECLARAR A VARIÁVEL
                                  if (insight.actions && Array.isArray(insight.actions)) {
                                    const messagingAction = insight.actions.find(action => 
                                      action.action_type === 'messaging_conversation_started_7d' ||
                                      action.action_type === 'messaging_conversation_started' ||
                                      action.action_type === 'onsite_conversion.messaging_conversation_started_7d' ||
                                      action.action_type === 'onsite_conversion.messaging_conversation_started'
                                    );
                                    if (messagingAction) {
                                      messagingConversations = parseFloat(messagingAction.value) || 0;
                                    }
                                  }
                                  // Fallback para o campo direto se não encontrou nas actions
                                  if (messagingConversations === 0 && insight.messaging_conversations_started) {
                                    messagingConversations = parseFloat(insight.messaging_conversations_started) || 0;
                                  }
                                  return messagingConversations.toLocaleString('pt-BR');
                                })()
                                }
                              </p>
                            </div>
                          )}
                          {selectedMetrics.ctr && (
                            <div>
                              <p className="text-muted-foreground">CTR</p>
                              <p className="font-medium">{(parseFloat(insight.ctr) || 0).toFixed(2)}%</p>
                            </div>
                          )}
                          {selectedMetrics.cpm && (
                            <div>
                              <p className="text-muted-foreground">CPM</p>
                              <p className="font-medium">R$ {(parseFloat(insight.cpm) || 0).toFixed(2)}</p>
                            </div>
                          )}
                          {selectedMetrics.conversions && (
                            <div>
                              <p className="text-muted-foreground">Conversões</p>
                              <p className="font-medium">{(parseFloat(insight.conversions) || 0).toLocaleString('pt-BR')}</p>
                            </div>
                          )}
                          {selectedMetrics.reach && (
                            <div>
                              <p className="text-muted-foreground">Alcance</p>
                              <p className="font-medium">{(parseFloat(insight.reach) || 0).toLocaleString('pt-BR')}</p>
                            </div>
                          )}
                          {selectedMetrics.frequency && (
                            <div>
                              <p className="text-muted-foreground">Frequência</p>
                              <p className="font-medium">{(parseFloat(insight.frequency) || 0).toFixed(2)}</p>
                            </div>
                          )}
                          {selectedMetrics.cpc && (
                            <div>
                              <p className="text-muted-foreground">CPC</p>
                              <p className="font-medium">R$ {(parseFloat(insight.cpc) || 0).toFixed(2)}</p>
                            </div>
                          )}
                          {selectedMetrics.conversion_rate && (
                            <div>
                              <p className="text-muted-foreground">Taxa de Conversão</p>
                              <p className="font-medium">{(parseFloat(insight.conversion_rate) || 0).toFixed(2)}%</p>
                            </div>
                          )}
                          {selectedMetrics.cost_per_conversion && (
                            <div>
                              <p className="text-muted-foreground">Custo por Conversão</p>
                              <p className="font-medium">R$ {(parseFloat(insight.cost_per_conversion) || 0).toFixed(2)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">Nenhum insight encontrado para os filtros aplicados</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

const getMetricTooltip = (metricTitle: string): string => {
  const tooltips: Record<string, string> = {
    'Impressões': 'Número total de vezes que seus anúncios foram exibidos',
    'Alcance': 'Número de pessoas únicas que viram seus anúncios pelo menos uma vez',
    'Cliques': 'Número total de cliques nos seus anúncios',
    'Conversões': 'Ações valiosas realizadas após clique no anúncio',
    'Investimento': 'Valor total gasto nas campanhas selecionadas',
    'CTR Médio': 'Taxa média de cliques (cliques ÷ impressões × 100)',
    'CPM Médio': 'Custo médio por mil impressões',
    'Conversas Iniciadas': 'Número de conversas iniciadas através dos anúncios',
    'Frequência Média': 'Número médio de vezes que cada pessoa viu seus anúncios'
  };
  
  return tooltips[metricTitle] || 'Métrica de performance da campanha';
};
