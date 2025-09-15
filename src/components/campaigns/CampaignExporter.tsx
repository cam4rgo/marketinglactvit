import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Download, 
  FileText, 
  FileSpreadsheet,
  Loader2,
  BarChart3,
  Settings,
  CheckSquare,
  Square
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { 
  type MetaCampaign, 
  type MetaCampaignInsights, 
  type MetaAdsFilters,
  type MetricsSelection 
} from '@/hooks/useMetaAdsData';

interface CampaignExporterProps {
  campaigns: MetaCampaign[];
  insights: MetaCampaignInsights[];
  filters: MetaAdsFilters;
  selectedMetrics: MetricsSelection;
  className?: string;
}

interface ExportData {
  campaigns: MetaCampaign[];
  insights: MetaCampaignInsights[];
  filters: MetaAdsFilters;
  selectedMetrics: MetricsSelection;
  summary: {
    totalCampaigns: number;
    totalSpend: number;
    totalImpressions: number;
    totalClicks: number;
    totalReach: number;
    totalFrequency: number;
    totalCPM: number;
    totalMessagingConversationsStarted: number;
    totalCostPerMessagingConversationStarted: number;
    averageCTR: number;
    period: string;
    generatedAt: string;
  };
}

export const CampaignExporter: React.FC<CampaignExporterProps> = ({
  campaigns,
  insights,
  filters,
  selectedMetrics,
  className = ''
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [campaignIds, setCampaignIds] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeRawData, setIncludeRawData] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Handlers para os checkboxes que tratam o tipo CheckedState corretamente
  const handleIncludeChartsChange = (checked: boolean | "indeterminate") => {
    if (typeof checked === 'boolean') {
      setIncludeCharts(checked);
    }
  };

  const handleIncludeRawDataChange = (checked: boolean | "indeterminate") => {
    if (typeof checked === 'boolean') {
      setIncludeRawData(checked);
    }
  };

  // Função para traduzir status das campanhas
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Ativa';
      case 'PAUSED':
        return 'Pausada';
      case 'DELETED':
        return 'Excluída';
      default:
        return status;
    }
  };

  // Função para obter labels traduzidas das métricas
  const getMetricLabel = (metricKey: string) => {
    const labels: Record<string, string> = {
      'spend': 'Investimento',
      'impressions': 'Impressões',
      'clicks': 'Cliques',
      'reach': 'Alcance',
      'frequency': 'Frequência',
      'cpm': 'CPM',
      'ctr': 'CTR',
      'messaging_conversations_started': 'Conversas Iniciadas',
      'cost_per_messaging_conversation_started': 'Custo por Conversa'
    };
    return labels[metricKey] || metricKey;
  };

  // Função aprimorada para calcular período baseado nas campanhas selecionadas
  const getPeriod = () => {
    if (campaignIds.length === 0) {
      return 'Nenhuma campanha selecionada';
    }

    // Se há campanhas selecionadas, usar suas datas
    const selectedCampaigns = campaigns.filter(c => campaignIds.includes(c.id));
    const selectedInsights = insights.filter(i => campaignIds.includes(i.campaign_id));
    
    if (selectedCampaigns.length > 0) {
      // Pegar datas das campanhas
      const campaignDates = selectedCampaigns.map(campaign => ({
        start: campaign.start_time ? new Date(campaign.start_time) : null,
        stop: campaign.stop_time ? new Date(campaign.stop_time) : null
      })).filter(d => d.start);

      // Pegar datas dos insights
      const insightDates = selectedInsights.map(insight => new Date(insight.date_start));
      
      const allDates = [
        ...campaignDates.map(d => d.start).filter(Boolean),
        ...campaignDates.map(d => d.stop).filter(Boolean),
        ...insightDates
      ].filter(Boolean) as Date[];

      if (allDates.length > 0) {
        const startDate = new Date(Math.min(...allDates.map(d => d.getTime())));
        const endDate = new Date(Math.max(...allDates.map(d => d.getTime())));
        
        if (startDate.getTime() === endDate.getTime()) {
          return format(startDate, 'dd/MM/yyyy', { locale: ptBR });
        }
        
        return `${format(startDate, 'dd/MM/yyyy', { locale: ptBR })} - ${format(endDate, 'dd/MM/yyyy', { locale: ptBR })}`;
      }
    }

    // Fallback para filtros de data usando time_range
    if (filters.time_range?.since && filters.time_range?.until) {
      const startDate = new Date(filters.time_range.since);
      const endDate = new Date(filters.time_range.until);
      return `${format(startDate, 'dd/MM/yyyy', { locale: ptBR })} - ${format(endDate, 'dd/MM/yyyy', { locale: ptBR })}`;
    }

    if (filters.date_preset) {
      const presetLabels: Record<string, string> = {
        'today': 'Hoje',
        'yesterday': 'Ontem',
        'last_7d': 'Últimos 7 dias',
        'last_14d': 'Últimos 14 dias',
        'last_30d': 'Últimos 30 dias',
        'this_month': 'Este mês',
        'last_month': 'Mês passado'
      };
      return presetLabels[filters.date_preset] || filters.date_preset;
    }

    return 'Período não definido';
  };

  const exportData = (): ExportData => {
    const filteredCampaigns = campaigns.filter(campaign => 
      campaignIds.includes(campaign.id)
    );
    const filteredInsights = insights.filter(insight => 
      campaignIds.includes(insight.campaign_id)
    );

    // Converter strings para números antes das operações matemáticas
    const totalSpend = filteredInsights.reduce((sum, insight) => {
      const spend = typeof insight.spend === 'string' ? parseFloat(insight.spend) : insight.spend;
      return sum + (spend || 0);
    }, 0);
    
    const totalImpressions = filteredInsights.reduce((sum, insight) => {
      const impressions = typeof insight.impressions === 'string' ? parseInt(insight.impressions) : insight.impressions;
      return sum + (impressions || 0);
    }, 0);
    
    const totalClicks = filteredInsights.reduce((sum, insight) => {
      const clicks = typeof insight.clicks === 'string' ? parseInt(insight.clicks) : insight.clicks;
      return sum + (clicks || 0);
    }, 0);
    
    const totalReach = filteredInsights.reduce((sum, insight) => {
      const reach = typeof insight.reach === 'string' ? parseInt(insight.reach) : insight.reach;
      return sum + (reach || 0);
    }, 0);
    
    // Cálculo corrigido para conversas iniciadas usando actions
    const totalMessagingConversationsStarted = filteredInsights.reduce((sum, insight) => {
      if (insight.actions && Array.isArray(insight.actions)) {
        const messagingAction = insight.actions.find(action => 
          action.action_type === 'onsite_conversion.messaging_conversation_started_7d'
        );
        const value = messagingAction?.value;
        const numericValue = typeof value === 'string' ? parseInt(value) : value;
        return sum + (numericValue || 0);
      }
      // Fallback para o campo direto se existir
      const conversations = typeof insight.messaging_conversations_started === 'string' 
        ? parseInt(insight.messaging_conversations_started) 
        : insight.messaging_conversations_started;
      return sum + (conversations || 0);
    }, 0);

    const totalCostPerMessagingConversationStarted = totalMessagingConversationsStarted > 0 
      ? totalSpend / totalMessagingConversationsStarted 
      : 0;

    const totalFrequency = filteredInsights.reduce((sum, insight) => {
      const frequency = typeof insight.frequency === 'string' ? parseFloat(insight.frequency) : insight.frequency;
      return sum + (frequency || 0);
    }, 0) / Math.max(filteredInsights.length, 1);
    
    const totalCPM = filteredInsights.reduce((sum, insight) => {
      const cpm = typeof insight.cpm === 'string' ? parseFloat(insight.cpm) : insight.cpm;
      return sum + (cpm || 0);
    }, 0) / Math.max(filteredInsights.length, 1);
    
    const averageCTR = filteredInsights.reduce((sum, insight) => {
      const ctr = typeof insight.ctr === 'string' ? parseFloat(insight.ctr) : insight.ctr;
      return sum + (ctr || 0);
    }, 0) / Math.max(filteredInsights.length, 1);

    return {
      campaigns: filteredCampaigns,
      insights: filteredInsights,
      filters,
      selectedMetrics,
      summary: {
        totalCampaigns: filteredCampaigns.length,
        totalSpend,
        totalImpressions,
        totalClicks,
        totalReach,
        totalFrequency,
        totalCPM,
        totalMessagingConversationsStarted,
        totalCostPerMessagingConversationStarted,
        averageCTR,
        period: getPeriod(),
        generatedAt: new Date().toISOString()
      }
    };
  };

  // Estado para campanhas selecionadas
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>(
    campaigns.map(campaign => campaign.id) // Inicialmente todas selecionadas
  );

  // Função para alternar seleção de campanha individual
  const toggleCampaignSelection = (campaignId: string) => {
    setSelectedCampaignIds(prev => 
      prev.includes(campaignId)
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  // Função para selecionar/deselecionar todas as campanhas
  const toggleAllCampaigns = () => {
    if (selectedCampaignIds.length === campaigns.length) {
      setSelectedCampaignIds([]);
    } else {
      setSelectedCampaignIds(campaigns.map(campaign => campaign.id));
    }
  };

  // Filtrar campanhas e insights selecionados
  const selectedCampaigns = campaigns.filter(campaign => 
    selectedCampaignIds.includes(campaign.id)
  );
  const selectedInsights = insights.filter(insight => 
    selectedCampaignIds.includes(insight.campaign_id)
  );

  // Preparar dados para exportação
  const prepareExportData = (): ExportData => {
    const totalSpend = selectedInsights.reduce((sum, insight) => sum + (parseFloat(insight.spend) || 0), 0);
    const totalImpressions = selectedInsights.reduce((sum, insight) => sum + (parseFloat(insight.impressions) || 0), 0);
    const totalClicks = selectedInsights.reduce((sum, insight) => sum + (parseFloat(insight.clicks) || 0), 0);
    const totalReach = selectedInsights.reduce((sum, insight) => sum + (parseFloat(insight.reach) || 0), 0);
    const totalFrequency = selectedInsights.length > 0 ? 
      selectedInsights.reduce((sum, insight) => sum + (parseFloat(insight.frequency) || 0), 0) / selectedInsights.length : 0;
    const totalCPM = selectedInsights.reduce((sum, insight) => sum + (parseFloat(insight.cpm) || 0), 0);
    const totalMessagingConversationsStarted = selectedInsights.reduce((sum, insight) => {
      // Buscar no campo actions por onsite_conversion.messaging_conversation_started_7d
      if (insight.actions && Array.isArray(insight.actions)) {
        const messagingAction = insight.actions.find(action => 
          action.action_type === 'onsite_conversion.messaging_conversation_started_7d'
        );
        if (messagingAction && messagingAction.value) {
          const value = parseFloat(messagingAction.value);
          return sum + (isNaN(value) ? 0 : value);
        }
      }
      
      // Fallback para o campo messaging_conversations_started se actions não estiver disponível
      const fallbackValue = insight.messaging_conversations_started;
      return sum + (fallbackValue && !isNaN(parseFloat(fallbackValue)) ? parseFloat(fallbackValue) : 0);
    }, 0);
    
    const totalCostPerMessagingConversationStarted = totalMessagingConversationsStarted > 0 ? 
      totalSpend / totalMessagingConversationsStarted : 0;
    
    // Melhorar a lógica do período
    const getPeriod = () => {
      if (filters.date_preset) {
        const presetLabels: Record<string, string> = {
          'today': 'Hoje',
          'yesterday': 'Ontem', 
          'last_3d': 'Últimos 3 dias',
          'last_7d': 'Últimos 7 dias',
          'last_14d': 'Últimos 14 dias',
          'last_28d': 'Últimos 28 dias',
          'last_30d': 'Últimos 30 dias',
          'last_90d': 'Últimos 90 dias',
          'this_month': 'Este mês',
          'last_month': 'Mês passado',
          'this_year': 'Este ano',
          'last_year': 'Ano passado',
          'lifetime': 'Todo o período'
        };
        return presetLabels[filters.date_preset] || filters.date_preset;
      }
      
      if (filters.time_range) {
        return `${format(new Date(filters.time_range.since), 'dd/MM/yyyy', { locale: ptBR })} - ${format(new Date(filters.time_range.until), 'dd/MM/yyyy', { locale: ptBR })}`;
      }
      
      // NOVA LÓGICA: Usar datas das campanhas selecionadas
      if (selectedCampaigns.length > 0) {
        const campaignDates: Date[] = [];
        
        selectedCampaigns.forEach(campaign => {
          // Data de início: start_time ou created_time
          const startDate = campaign.start_time || campaign.created_time;
          if (startDate) {
            campaignDates.push(new Date(startDate));
          }
          
          // Data de fim: stop_time, ou data atual se ativa
          if (campaign.stop_time) {
            campaignDates.push(new Date(campaign.stop_time));
          } else if (campaign.status === 'ACTIVE') {
            campaignDates.push(new Date()); // Data atual para campanhas ativas
          } else {
            // Para campanhas pausadas/arquivadas, usar updated_time
            campaignDates.push(new Date(campaign.updated_time));
          }
        });
        
        if (campaignDates.length > 0) {
          const validDates = campaignDates.filter(date => !isNaN(date.getTime()));
          if (validDates.length > 0) {
            const minDate = new Date(Math.min(...validDates.map(d => d.getTime())));
            const maxDate = new Date(Math.max(...validDates.map(d => d.getTime())));
            return `${format(minDate, 'dd/MM/yyyy', { locale: ptBR })} - ${format(maxDate, 'dd/MM/yyyy', { locale: ptBR })}`;
          }
        }
      }
      
      // Fallback: usar datas dos insights se disponíveis
      if (selectedInsights.length > 0) {
        const dates = selectedInsights.map(insight => {
          return [new Date(insight.date_start), new Date(insight.date_stop)];
        }).flat().filter(date => !isNaN(date.getTime()));
        
        if (dates.length > 0) {
          const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
          const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
          return `${format(minDate, 'dd/MM/yyyy', { locale: ptBR })} - ${format(maxDate, 'dd/MM/yyyy', { locale: ptBR })}`;
        }
      }
      
      return 'Período não especificado';
    };
    
    const period = getPeriod();
    const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    return {
      campaigns: selectedCampaigns,
      insights: selectedInsights,
      filters,
      selectedMetrics,
      summary: {
        totalCampaigns: selectedCampaigns.length,
        totalSpend,
        totalImpressions,
        totalClicks,
        totalReach,
        totalFrequency,
        totalCPM,
        totalMessagingConversationsStarted,
        totalCostPerMessagingConversationStarted,
        averageCTR,
        period,
        generatedAt: format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })
      }
    };
  };

  // Exportar para PDF
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const { generateCampaignPDFReport } = await import('@/lib/campaignPdfGenerator');
      const exportData = prepareExportData();
      
      await generateCampaignPDFReport(exportData, {
        includeCharts,
        includeRawData,
        companyName: 'Marketing Lactvit',
        reportTitle: 'Relatório de Campanhas Meta Ads'
      });
      
      toast({
        title: 'Relatório exportado!',
        description: 'O arquivo PDF foi baixado com sucesso.'
      });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível gerar o relatório PDF.',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Exportar para Excel
  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const { generateCampaignExcelReport } = await import('@/lib/campaignExcelGenerator');
      const exportData = prepareExportData();
      
      await generateCampaignExcelReport(exportData, {
        fileName: `relatorio-campanhas-meta-ads-${format(new Date(), 'yyyy-MM-dd')}.xlsx`,
        includeCharts,
        includeRawData,
        companyName: 'Marketing Lactvit'
      });
      
      toast({
        title: 'Relatório exportado!',
        description: 'O arquivo Excel foi baixado com sucesso.'
      });
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível gerar o relatório Excel.',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = () => {
    if (exportFormat === 'pdf') {
      handleExportPDF();
    } else {
      handleExportExcel();
    }
  };

  // Contar métricas selecionadas
  const selectedMetricsCount = Object.values(selectedMetrics).filter(Boolean).length;
  const totalMetricsCount = Object.keys(selectedMetrics).length;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          <CardTitle>Exportar Relatório de Campanhas</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="max-h-[80vh] overflow-y-auto">
        <div className="space-y-6">
          {/* Seleção de Campanhas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Campanhas para Exportar</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAllCampaigns}
                className="h-8"
              >
                {selectedCampaignIds.length === campaigns.length ? (
                  <>
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Desmarcar Todas
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4 mr-2" />
                    Selecionar Todas
                  </>
                )}
              </Button>
            </div>
            
            <ScrollArea className="h-48 border rounded-md p-4">
              <div className="space-y-3">
                {campaigns.map((campaign) => {
                  const isSelected = selectedCampaignIds.includes(campaign.id);
                  const campaignInsight = insights.find(insight => insight.campaign_id === campaign.id);
                  const spend = campaignInsight ? parseFloat(campaignInsight.spend) || 0 : 0;
                  
                  return (
                    <div key={campaign.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50">
                      <Checkbox
                        id={`campaign-${campaign.id}`}
                        checked={isSelected}
                        onCheckedChange={() => toggleCampaignSelection(campaign.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <Label 
                          htmlFor={`campaign-${campaign.id}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {campaign.name}
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {getStatusLabel(campaign.status)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            R$ {spend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            
            <div className="text-sm text-muted-foreground">
              {selectedCampaignIds.length} de {campaigns.length} campanhas selecionadas
            </div>
          </div>

          {/* Resumo dos Dados */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Resumo dos Dados</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-muted-foreground block">Campanhas:</span>
                <p className="font-medium text-base">{selectedCampaigns.length}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground block">Métricas Selecionadas:</span>
                <p className="font-medium text-base">{selectedMetricsCount}/{totalMetricsCount}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground block">Investimento Total:</span>
                <p className="font-medium text-base text-orange-600">
                  R$ {selectedInsights.reduce((sum, insight) => sum + (parseFloat(insight.spend) || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground block">Período:</span>
                <p className="font-medium text-base">
                  {filters.date_preset || 
                    (filters.time_range ? 
                      `${format(new Date(filters.time_range.since), 'dd/MM', { locale: ptBR })} - ${format(new Date(filters.time_range.until), 'dd/MM', { locale: ptBR })}` : 
                      'Personalizado')}
                </p>
              </div>
            </div>
          </div>

          {/* Formato de Exportação */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Formato de Exportação</Label>
            <Select value={exportFormat} onValueChange={(value: 'pdf' | 'excel') => setExportFormat(value)}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    PDF - Relatório Formatado
                  </div>
                </SelectItem>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    Excel - Planilha de Dados
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Métricas Selecionadas - Movido para baixo */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Métricas Selecionadas</Label>
            <div className="min-h-[60px] p-3 border rounded-md bg-background">
              <div className="flex flex-wrap gap-2">
                {Object.entries(selectedMetrics)
                  .filter(([_, enabled]) => enabled)
                  .map(([metric]) => (
                    <Badge key={metric} variant="secondary" className="text-xs px-2 py-1">
                      {getMetricLabel(metric)}
                    </Badge>
                  ))
                }
                {Object.entries(selectedMetrics).filter(([_, enabled]) => enabled).length === 0 && (
                  <span className="text-sm text-muted-foreground">Nenhuma métrica selecionada</span>
                )}
              </div>
            </div>
          </div>

          {/* Opções Adicionais */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Opções Adicionais</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 border rounded-md hover:bg-muted/50 transition-colors">
                <Checkbox
                  id="include-charts"
                  checked={includeCharts}
                  onCheckedChange={handleIncludeChartsChange}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <div className="space-y-1">
                  <Label htmlFor="include-charts" className="text-sm font-medium cursor-pointer">
                    Incluir gráficos
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Adiciona visualizações gráficas ao relatório
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-md hover:bg-muted/50 transition-colors">
                <Checkbox
                  id="include-raw-data"
                  checked={includeRawData}
                  onCheckedChange={handleIncludeRawDataChange}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <div className="space-y-1">
                  <Label htmlFor="include-raw-data" className="text-sm font-medium cursor-pointer">
                    Incluir dados detalhados
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Adiciona tabelas com dados brutos
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botão de Exportação */}
          <div className="pt-4 border-t">
            <Button 
              onClick={handleExport} 
              disabled={isExporting || selectedCampaigns.length === 0 || selectedMetricsCount === 0}
              className="w-full"
              size="lg"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar {exportFormat === 'pdf' ? 'PDF' : 'Excel'}
                </>
              )}
            </Button>
          </div>

          {/* Avisos */}
          {campaigns.length === 0 && (
            <div className="text-sm text-muted-foreground text-center p-4 bg-muted/30 rounded-lg">
              Nenhuma campanha disponível para exportação
            </div>
          )}
          
          {selectedCampaigns.length === 0 && campaigns.length > 0 && (
            <div className="text-sm text-muted-foreground text-center p-4 bg-muted/30 rounded-lg">
              Selecione pelo menos uma campanha para exportar
            </div>
          )}
          
          {selectedMetricsCount === 0 && selectedCampaigns.length > 0 && (
            <div className="text-sm text-muted-foreground text-center p-4 bg-muted/30 rounded-lg">
              Selecione pelo menos uma métrica para exportar
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};