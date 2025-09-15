import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useApiIntegrations } from './useApiIntegrations';

// Tipos para Meta Ads API
export interface MetaCampaign {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED';
  objective: string;
  created_time: string;
  updated_time: string;
  account_id: string;
  daily_budget?: number;
  lifetime_budget?: number;
  budget_remaining?: number;
  stop_time?: string; // Data de parada da campanha
  effective_status?: string; // Status efetivo da campanha
  start_time?: string; // Data de início da campanha
}

export interface MetaCampaignInsights {
  campaign_id: string;
  campaign_name: string;
  impressions: string;
  clicks: string;
  spend: string;
  reach: string;
  frequency: string;
  cpm: string;
  cpc: string;
  ctr: string;
  conversions?: string;
  conversion_rate?: string;
  cost_per_conversion?: string;
  messaging_conversations_started?: string;
  actions?: Array<{
    action_type: string;
    value: string;
  }>;
  date_start: string;
  date_stop: string;
}

export interface MetaAdsFilters {
  campaign_ids?: string[];
  date_preset?: 'today' | 'yesterday' | 'last_3d' | 'last_7d' | 'last_14d' | 'last_28d' | 'last_30d' | 'last_90d' | 'this_week_mon_today' | 'this_week_sun_today' | 'last_week_mon_sun' | 'last_week_sun_sat' | 'this_month' | 'last_month' | 'this_quarter' | 'last_quarter' | 'this_year' | 'last_year' | 'lifetime';
  time_range?: {
    since: string; // YYYY-MM-DD
    until: string; // YYYY-MM-DD
  };
  level?: 'account' | 'campaign' | 'adset' | 'ad';
}

export interface MetricsSelection {
  impressions: boolean;
  clicks: boolean;
  spend: boolean;
  reach: boolean;
  frequency: boolean;
  cpm: boolean;
  cpc: boolean;
  ctr: boolean;
  conversions: boolean;
  conversion_rate: boolean;
  cost_per_conversion: boolean;
  messaging_conversations_started: boolean;
  cost_per_messaging_conversation_started: boolean;
}

// Interface para os dados do Meta Ads armazenados no metadata
interface MetaAdsMetadata {
  app_id?: string;
  app_secret?: string;
  access_token?: string;
  account_id?: string;
  [key: string]: any;
}

// Hook principal para dados do Meta Ads
export const useMetaAdsData = () => {
  const { integrations } = useApiIntegrations();
  const { toast } = useToast();

  // Buscar integração ativa do Meta Ads
  const metaIntegration = integrations?.find(
    integration => integration.integration_type === 'meta_ads' && integration.status === 'active'
  );

  // Extrair dados do metadata
  const metadata = metaIntegration?.metadata as MetaAdsMetadata | null;
  
  // ✅ CORREÇÃO: Verificar todas as credenciais necessárias
  const isConfigured = !!metadata?.app_id && !!metadata?.app_secret && !!metadata?.access_token && !!metadata?.account_id;



  return {
    isConfigured,
    integration: metaIntegration,
    metadata,
  };
};

// Hook para buscar campanhas do Meta Ads
export const useMetaCampaigns = (filters?: MetaAdsFilters) => {
  const { integration, isConfigured, metadata } = useMetaAdsData();
  const { toast } = useToast();

  return useQuery({
    queryKey: ['meta-campaigns', integration?.id, filters],
    queryFn: async (): Promise<MetaCampaign[]> => {
      if (!isConfigured || !integration || !metadata) {
        throw new Error('Meta Ads não configurado');
      }

      try {
        // Construir URL da Graph API
        const baseUrl = 'https://graph.facebook.com/v19.0';
        const accountId = metadata.account_id || metadata.app_id;
        
        const params = new URLSearchParams({
          access_token: metadata.access_token || '',
          fields: 'id,name,status,objective,created_time,updated_time,daily_budget,lifetime_budget,budget_remaining,stop_time,effective_status,start_time',
          limit: '100'
        });

        // Adicionar filtros se especificados
        if (filters?.campaign_ids?.length) {
          params.append('filtering', JSON.stringify([
            {
              field: 'campaign.id',
              operator: 'IN',
              value: filters.campaign_ids
            }
          ]));
        }

        const finalUrl = `${baseUrl}/act_${accountId}/campaigns?${params}`;
        


        const response = await fetch(finalUrl);
        

        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Erro ao buscar campanhas');
        }

        const data = await response.json();
        
        return data.data || [];
      } catch (error) {
        console.error('Erro ao buscar campanhas Meta Ads:', error);
        toast({
          title: "Erro ao carregar campanhas",
          description: error instanceof Error ? error.message : 'Erro desconhecido',
          variant: "destructive",
        });
        throw error;
      }
    },
    enabled: isConfigured,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });
};

// Hook para buscar insights/métricas das campanhas
export const useMetaCampaignInsights = (
  campaignIds: string[],
  filters?: MetaAdsFilters,
  selectedMetrics?: MetricsSelection
) => {
  const { integration, isConfigured, metadata } = useMetaAdsData();
  const { toast } = useToast();
  const { data: campaigns } = useMetaCampaigns(); // Adicionar para buscar todas as campanhas

  return useQuery({
    queryKey: ['meta-campaign-insights', integration?.id, campaignIds, filters, selectedMetrics],
    queryFn: async (): Promise<MetaCampaignInsights[]> => {
      if (!isConfigured || !integration || !metadata) {
        return [];
      }



      // Se não há campanhas específicas, buscar insights de todas as campanhas
      let targetCampaignIds = campaignIds;
      if (!campaignIds.length && campaigns?.length) {
        targetCampaignIds = campaigns.map(campaign => campaign.id);
      }

      // Se ainda não há campanhas, retornar vazio
      if (!targetCampaignIds.length) {
        return [];
      }

      try {
        const baseUrl = 'https://graph.facebook.com/v19.0';
        
        // Construir campos baseado nas métricas selecionadas
        const defaultFields = ['campaign_id', 'campaign_name', 'date_start', 'date_stop'];
        const metricFields: string[] = [];
        
        if (!selectedMetrics || selectedMetrics.impressions) metricFields.push('impressions');
        if (!selectedMetrics || selectedMetrics.clicks) metricFields.push('clicks');
        if (!selectedMetrics || selectedMetrics.spend) metricFields.push('spend');
        if (!selectedMetrics || selectedMetrics.reach) metricFields.push('reach');
        if (!selectedMetrics || selectedMetrics.frequency) metricFields.push('frequency');
        if (!selectedMetrics || selectedMetrics.cpm) metricFields.push('cpm');
        if (!selectedMetrics || selectedMetrics.cpc) metricFields.push('cpc');
        if (!selectedMetrics || selectedMetrics.ctr) metricFields.push('ctr');
        if (selectedMetrics?.conversions) metricFields.push('conversions');
        if (selectedMetrics?.conversion_rate) metricFields.push('conversion_rate');
        if (selectedMetrics?.cost_per_conversion) metricFields.push('cost_per_conversion');
        
        // Combinar campos padrão com métricas selecionadas
        const allFields = [...defaultFields, ...metricFields];
        
        // Adicionar 'actions' se messaging_conversations_started estiver habilitado
        if (selectedMetrics?.messaging_conversations_started) {
          allFields.push('actions');
        }
        
        const fields = allFields.join(',');

        const params = new URLSearchParams({
          access_token: metadata.access_token || '',
          fields,
          level: filters?.level || 'campaign',
          limit: '100'
        });

        // Adicionar filtros de data
        if (filters?.date_preset) {
          params.append('date_preset', filters.date_preset);
        } else if (filters?.time_range && filters.time_range.since && filters.time_range.until) {
          params.append('time_range', JSON.stringify(filters.time_range));
        } else {
          // 🔧 CORREÇÃO: Calcular data de início respeitando limite de 37 meses da API do Facebook
          const today = new Date();
          const maxHistoricalDate = new Date(today);
          // Subtrair 37 meses (API do Facebook permite no máximo 37 meses)
          maxHistoricalDate.setMonth(today.getMonth() - 37);
          
          const historicalTimeRange = {
            since: maxHistoricalDate.toISOString().split('T')[0], // Data máxima permitida pela API
            until: today.toISOString().split('T')[0] // Data atual no formato YYYY-MM-DD
          };
          
          params.append('time_range', JSON.stringify(historicalTimeRange));
        }

        // Filtrar por campanhas específicas
        if (campaignIds.length) {
          params.append('filtering', JSON.stringify([
            {
              field: 'campaign.id',
              operator: 'IN',
              value: campaignIds
            }
          ]));
        }

        const accountId = metadata.account_id || metadata.app_id;
        const finalUrl = `${baseUrl}/act_${accountId}/insights?${params}`;

        const response = await fetch(finalUrl);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Erro ao buscar insights');
        }

        const data = await response.json();
        
        return data.data || [];
      } catch (error) {
        console.error('Erro ao buscar insights Meta Ads:', error);
        toast({
          title: "Erro ao carregar métricas",
          description: error instanceof Error ? error.message : 'Erro desconhecido',
          variant: "destructive",
        });
        throw error;
      }
    },
    // 🔧 CORREÇÃO: Remover a condição restritiva campaignIds.length > 0
    enabled: isConfigured,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });
};

// Hook para exportar dados do Meta Ads
export const useExportMetaAdsData = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      campaignIds,
      filters,
      selectedMetrics,
      format = 'csv'
    }: {
      campaignIds: string[];
      filters?: MetaAdsFilters;
      selectedMetrics?: MetricsSelection;
      format?: 'csv' | 'xlsx';
    }) => {
      // Buscar dados das campanhas e insights
      const campaigns = await queryClient.fetchQuery({
        queryKey: ['meta-campaigns', filters],
        staleTime: 0
      });

      const insights = await queryClient.fetchQuery({
        queryKey: ['meta-campaign-insights', campaignIds, filters, selectedMetrics],
        staleTime: 0
      });

      // Combinar dados para exportação
      const exportData = campaignIds.map(campaignId => {
        const campaign = (campaigns as MetaCampaign[])?.find(c => c.id === campaignId);
        const insight = (insights as MetaCampaignInsights[])?.find(i => i.campaign_id === campaignId);

        return {
          campaign_id: campaignId,
          campaign_name: campaign?.name || 'N/A',
          status: campaign?.status || 'N/A',
          objective: campaign?.objective || 'N/A',
          impressions: insight?.impressions || 0,
          clicks: insight?.clicks || 0,
          spend: insight?.spend || 0,
          reach: insight?.reach || 0,
          frequency: insight?.frequency || 0,
          cpm: insight?.cpm || 0,
          cpc: insight?.cpc || 0,
          ctr: insight?.ctr || 0,
          conversions: insight?.conversions || 0,
          conversion_rate: insight?.conversion_rate || 0,
          cost_per_conversion: insight?.cost_per_conversion || 0,
          date_start: insight?.date_start || 'N/A',
          date_stop: insight?.date_stop || 'N/A',
        };
      });

      // Gerar arquivo baseado no formato
      if (format === 'csv') {
        const csvContent = [
          // Cabeçalho
          Object.keys(exportData[0] || {}).join(','),
          // Dados
          ...exportData.map(row => Object.values(row).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `meta-ads-report-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      }

      return exportData;
    },
    onSuccess: () => {
      toast({
        title: "Relatório exportado",
        description: "O relatório foi baixado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro na exportação",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook principal que combina todos os hooks para a página Campaigns
export const useMetaAdsCampaignsPage = () => {
  const [filters, setFilters] = useState<MetaAdsFilters>({
    // Removido: date_preset: 'last_30d'
    // Removido: level: 'campaign' - deixar vazio para não aplicar filtros padrão
  });
  
  const [selectedMetrics, setSelectedMetrics] = useState<MetricsSelection>({
    impressions: true,
    clicks: true,
    spend: true,
    reach: true,
    frequency: true,
    cpm: true,
    cpc: false,
    ctr: false,
    conversions: false,
    conversion_rate: false,
    cost_per_conversion: false,
    messaging_conversations_started: true, // ✅ Habilitado por padrão
    cost_per_messaging_conversation_started: true,
  });
  
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);
  
  // Buscar campanhas
  const {
    data: campaigns = [],
    isLoading: campaignsLoading,
    error: campaignsError
  } = useMetaCampaigns(filters);
  
  // Buscar insights
  const {
    data: insights = [],
    isLoading: insightsLoading,
    error: insightsError
  } = useMetaCampaignInsights(
    // 🔧 CORREÇÃO: Buscar insights de todas as campanhas se nenhuma estiver selecionada
    selectedCampaignIds.length > 0 
      ? selectedCampaignIds 
      : (campaigns as MetaCampaign[]).map(c => c.id), // Buscar todas as campanhas disponíveis
    filters,
    selectedMetrics
  );
  
  const updateFilters = (newFilters: MetaAdsFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };
  
  const updateMetrics = (newMetrics: MetricsSelection) => {
    setSelectedMetrics(newMetrics);
  };
  
  return {
    campaigns,
    insights,
    filters,
    selectedMetrics,
    selectedCampaignIds,
    isLoading: campaignsLoading || insightsLoading,
    error: campaignsError || insightsError,
    updateFilters,
    updateMetrics,
    setSelectedCampaignIds
  };
};