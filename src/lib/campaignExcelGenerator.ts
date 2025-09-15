import { MetaCampaign, MetaCampaignInsights, MetaAdsFilters, MetricsSelection } from '@/hooks/useMetaAdsData';

// Importação dinâmica para reduzir bundle size
let XLSX: any;

const loadXLSX = async () => {
  if (!XLSX) {
    XLSX = await import('xlsx');
  }
};

export interface CampaignExcelOptions {
  fileName?: string;
  includeCharts?: boolean;
  includeRawData?: boolean;
  companyName?: string;
}

export interface CampaignExportData {
  campaigns: MetaCampaign[];
  insights: MetaCampaignInsights[];
  filters: MetaAdsFilters;
  selectedMetrics: MetricsSelection;
  summary: {
    totalCampaigns: number;
    totalSpend: number;
    totalImpressions: number;
    totalClicks: number;
    averageCTR: number;
    period: string;
    generatedAt: string;
  };
}

export const generateCampaignExcelReport = async (
  data: CampaignExportData,
  options: CampaignExcelOptions = {}
) => {
  await loadXLSX();
  
  const {
    fileName = `relatorio-campanhas-meta-ads-${new Date().toISOString().split('T')[0]}.xlsx`,
    companyName = 'Marketing Lactvit',
    includeRawData = true
  } = options;

  // Criar novo workbook
  const workbook = XLSX.utils.book_new();

  // Aba 1: Resumo
  const summaryData = [
    ['RELATÓRIO DE CAMPANHAS META ADS', '', '', ''],
    [companyName, '', '', ''],
    [`Gerado em: ${data.summary.generatedAt}`, '', '', ''],
    ['', '', '', ''],
    ['RESUMO EXECUTIVO', '', '', ''],
    ['Período:', data.summary.period, '', ''],
    ['Total de Campanhas:', data.summary.totalCampaigns, '', ''],
    ['Investimento Total (R$):', data.summary.totalSpend.toFixed(2), '', ''],
    ['Impressões Totais:', data.summary.totalImpressions, '', ''],
    ['Cliques Totais:', data.summary.totalClicks, '', ''],
    ['CTR Médio (%):', data.summary.averageCTR.toFixed(2), '', ''],
    ['', '', '', ''],
    ['MÉTRICAS SELECIONADAS', '', '', ''],
    ...Object.entries(data.selectedMetrics)
      .filter(([_, selected]) => selected)
      .map(([metric, _]) => [metric.charAt(0).toUpperCase() + metric.slice(1), 'Incluído', '', ''])
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Formatação da aba resumo
  summarySheet['!cols'] = [
    { width: 25 },
    { width: 20 },
    { width: 15 },
    { width: 15 }
  ];

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');

  // Aba 2: Campanhas
  if (includeRawData && data.campaigns.length > 0) {
    const campaignHeaders = [
      'ID da Campanha',
      'Nome da Campanha', 
      'Status',
      'Objetivo',
      'Data de Criação',
      'Orçamento Diário',
      'Orçamento Total'
    ];

    const campaignData = [
      campaignHeaders,
      ...data.campaigns.map(campaign => [
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.objective || 'N/A',
        new Date(campaign.created_time).toLocaleDateString('pt-BR'),
        campaign.daily_budget || 'N/A',
        campaign.lifetime_budget || 'N/A'
      ])
    ];

    const campaignSheet = XLSX.utils.aoa_to_sheet(campaignData);
    
    // Formatação da aba campanhas
    campaignSheet['!cols'] = [
      { width: 20 },
      { width: 30 },
      { width: 12 },
      { width: 20 },
      { width: 15 },
      { width: 15 },
      { width: 15 }
    ];

    XLSX.utils.book_append_sheet(workbook, campaignSheet, 'Campanhas');
  }

  // Aba 3: Métricas
  if (includeRawData && data.insights.length > 0) {
    const metricsHeaders = [
      'ID da Campanha',
      'Nome da Campanha',
      'Período Início',
      'Período Fim'
    ];

    // Adicionar cabeçalhos das métricas selecionadas
    if (data.selectedMetrics.impressions) metricsHeaders.push('Impressões');
    if (data.selectedMetrics.clicks) metricsHeaders.push('Cliques');
    if (data.selectedMetrics.spend) metricsHeaders.push('Investimento (R$)');
    if (data.selectedMetrics.reach) metricsHeaders.push('Alcance');
    if (data.selectedMetrics.frequency) metricsHeaders.push('Frequência');
    if (data.selectedMetrics.cpm) metricsHeaders.push('CPM (R$)');
    if (data.selectedMetrics.cpc) metricsHeaders.push('CPC (R$)');
    if (data.selectedMetrics.ctr) metricsHeaders.push('CTR (%)');
    if (data.selectedMetrics.conversions) metricsHeaders.push('Conversões');
    if (data.selectedMetrics.conversion_rate) metricsHeaders.push('Taxa de Conversão (%)');
    if (data.selectedMetrics.cost_per_conversion) metricsHeaders.push('Custo por Conversão (R$)');

    const metricsData = [
      metricsHeaders,
      ...data.insights.map(insight => {
        const row: (string | number)[] = [
          insight.campaign_id,
          insight.campaign_name,
          insight.date_start,
          insight.date_stop
        ];

        // Adicionar valores das métricas selecionadas
        if (data.selectedMetrics.impressions) row.push(insight.impressions || 0);
        if (data.selectedMetrics.clicks) row.push(insight.clicks || 0);
        if (data.selectedMetrics.spend) row.push(Number(parseFloat(insight.spend || '0').toFixed(2)));
        if (data.selectedMetrics.reach) row.push(insight.reach || 0);
        if (data.selectedMetrics.frequency) row.push(Number(parseFloat(insight.frequency || '0').toFixed(2)));
        if (data.selectedMetrics.cpm) row.push(Number(parseFloat(insight.cpm || '0').toFixed(2)));
        if (data.selectedMetrics.cpc) row.push(Number(parseFloat(insight.cpc || '0').toFixed(2)));
        if (data.selectedMetrics.ctr) row.push(Number(parseFloat(insight.ctr || '0').toFixed(2)));
        if (data.selectedMetrics.conversions) row.push(insight.conversions || 0);
        if (data.selectedMetrics.conversion_rate) row.push(Number(parseFloat(insight.conversion_rate || '0').toFixed(2)));
        if (data.selectedMetrics.cost_per_conversion) row.push(Number(parseFloat(insight.cost_per_conversion || '0').toFixed(2)));
        // Remover as linhas duplicadas abaixo:
        // if (data.selectedMetrics.conversion_rate) row.push(parseFloat((insight.conversion_rate || 0).toFixed(2)));
        // if (data.selectedMetrics.cost_per_conversion) row.push(parseFloat((insight.cost_per_conversion || 0).toFixed(2)));

        return row;
      })
    ];

    const metricsSheet = XLSX.utils.aoa_to_sheet(metricsData);
    
    // Formatação da aba métricas
    metricsSheet['!cols'] = Array(metricsHeaders.length).fill({ width: 15 });

    XLSX.utils.book_append_sheet(workbook, metricsSheet, 'Métricas');
  }

  // Salvar o arquivo
  XLSX.writeFile(workbook, fileName);
};