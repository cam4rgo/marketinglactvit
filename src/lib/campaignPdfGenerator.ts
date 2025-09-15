import jsPDF from 'jspdf';
import { MetaCampaign, MetaCampaignInsights, MetaAdsFilters, MetricsSelection } from '@/hooks/useMetaAdsData';

// Importação dinâmica para reduzir bundle size
let html2canvas: any;

const loadDependencies = async () => {
  if (!html2canvas) {
    html2canvas = (await import('html2canvas')).default;
  }
};

export interface CampaignPDFOptions {
  includeCharts?: boolean;
  includeRawData?: boolean;
  companyName?: string;
  reportTitle?: string;
  logoUrl?: string;
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

// Função para traduzir status das campanhas
const translateCampaignStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'ACTIVE': 'Ativa',
    'PAUSED': 'Pausada',
    'DELETED': 'Excluída',
    'ARCHIVED': 'Arquivada',
    'PREAPPROVED': 'Pré-aprovada',
  };
  return statusMap[status] || status;
};

// Função para traduzir objetivos das campanhas
const translateCampaignObjective = (objective: string): string => {
  const objectiveMap: Record<string, string> = {
    'OUTCOME_AWARENESS': 'Reconhecimento',
    'BRAND_AWARENESS': 'Reconhecimento da Marca',
    'REACH': 'Alcance',
    'OUTCOME_TRAFFIC': 'Tráfego',
    'LINK_CLICKS': 'Cliques no Link',
    'OUTCOME_ENGAGEMENT': 'Engajamento',
    'POST_ENGAGEMENT': 'Engajamento da Publicação',
    'PAGE_LIKES': 'Curtidas da Página',
    'EVENT_RESPONSES': 'Respostas do Evento',
    'VIDEO_VIEWS': 'Visualizações de Vídeo',
    'OUTCOME_LEADS': 'Leads',
    'LEAD_GENERATION': 'Geração de Leads',
    'OUTCOME_SALES': 'Vendas',
    'CONVERSIONS': 'Conversões'
  };
  return objectiveMap[objective] || objective;
};

// Função para adicionar logo (baseada no PDF financeiro)
const addLogo = async (
  doc: jsPDF, 
  logoUrl: string, 
  x: number, 
  y: number, 
  maxWidth: number, 
  maxHeight: number
): Promise<boolean> => {
  try {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          const aspectRatio = img.naturalWidth / img.naturalHeight;
          let logoWidth = maxWidth;
          let logoHeight = maxWidth / aspectRatio;
          
          if (logoHeight > maxHeight) {
            logoHeight = maxHeight;
            logoWidth = maxHeight * aspectRatio;
          }
          
          const centeredY = y + (maxHeight - logoHeight) / 2;
          
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL('image/png', 0.95);
            doc.addImage(dataUrl, 'PNG', x, centeredY, logoWidth, logoHeight);
          }
          resolve(true);
        } catch (error) {
          console.warn('Erro ao processar logo:', error);
          resolve(false);
        }
      };
      
      img.onerror = () => {
        console.warn('Erro ao carregar logo:', logoUrl);
        resolve(false);
      };
      
      img.src = logoUrl;
    });
  } catch (error) {
    console.warn('Erro ao adicionar logo:', error);
    return false;
  }
};

export async function generateCampaignPDFReport(
  data: CampaignExportData,
  options: CampaignPDFOptions = {}
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let currentY = 60; // Aumentado para acomodar cabeçalho maior

  // Função para verificar quebra de página
  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - margin) {
      doc.addPage();
      currentY = margin;
      return true;
    }
    return false;
  };

  // Função para adicionar texto com quebra automática
  const addText = (text: string, x: number, y: number, maxWidth?: number) => {
    if (maxWidth) {
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return lines.length * 5;
    } else {
      doc.text(text, x, y);
      return 5;
    }
  };

  // === CABEÇALHO AUMENTADO ===
  // Fundo escuro #10151e com altura aumentada
  doc.setFillColor(16, 21, 30);
  doc.rect(0, 0, pageWidth, 50, 'F'); // Aumentado de 40 para 50
  
  // Adicionar logo amarela posicionada à direita
  const logoPath = '/src/assets/logoamarela.webp';
  const maxLogoWidth = 50;
  const maxLogoHeight = 35;
  const headerHeight = 50; // Atualizado para nova altura
  const logoY = (headerHeight - maxLogoHeight) / 2;
  const logoX = pageWidth - margin - maxLogoWidth - 5;
  
  try {
    const logoUrl = new URL(logoPath, window.location.origin).href;
    await addLogo(doc, logoUrl, logoX, logoY, maxLogoWidth, maxLogoHeight);
  } catch (error) {
    console.warn('Erro ao carregar logo amarela:', error);
  }
  
  // Texto do cabeçalho em branco
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Marketing Lactvit', margin, 18);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Relatório de Tráfego Pago', margin, 30);
  
  doc.setFontSize(10);
  const currentDate = new Date().toLocaleDateString('pt-BR');
  doc.text(`Gerado em: ${currentDate}`, margin, 42);

  // === RESUMO EXECUTIVO COM MÚLTIPLAS CAMPANHAS ===
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('RESUMO EXECUTIVO', margin, currentY);
  currentY += 10;
  
  // Linha separadora com a mesma cor do cabeçalho
  doc.setDrawColor(16, 21, 30);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 15;
  
  // Informações de todas as campanhas selecionadas
  if (data.campaigns.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`Campanhas Selecionadas (${data.campaigns.length}):`, margin, currentY);
    currentY += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    
    for (let i = 0; i < data.campaigns.length; i++) {
      const campaign = data.campaigns[i];
      
      checkPageBreak(25);
      
      doc.setFont('helvetica', 'bold');
      doc.text(`${i + 1}. ${campaign.name}`, margin, currentY);
      currentY += 6;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`   Objetivo: ${translateCampaignObjective(campaign.objective)}`, margin, currentY);
      currentY += 5;
      doc.text(`   Status: ${translateCampaignStatus(campaign.status)}`, margin, currentY);
      currentY += 8;
    }
    
    currentY += 5;
  }

  // === MÉTRICAS PRINCIPAIS COM PERÍODO SINCRONIZADO ===
  checkPageBreak(80);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Métricas Principais', margin, currentY);
  currentY += 15;

  // Função para extrair conversas iniciadas
  const getMessagingConversationsStarted = (insights: MetaCampaignInsights[]): number => {
    return insights.reduce((total, insight) => {
      if (insight.actions && Array.isArray(insight.actions)) {
        const messagingAction = insight.actions.find(action => 
          action.action_type === 'onsite_conversion.messaging_conversation_started_7d' ||
          action.action_type === 'messaging_conversation_started_7d' ||
          action.action_type === 'messaging_conversation_started'
        );
        if (messagingAction) {
          return total + (parseFloat(messagingAction.value) || 0);
        }
      }
      return total + (parseFloat(insight.messaging_conversations_started || '0') || 0);
    }, 0);
  };

  // Calcular período sincronizado (mais antigo até mais recente)
  let startDate: Date;
  let endDate: Date;
  
  // Primeiro, tentar usar o período do summary se disponível e válido
  if (data.summary.period && data.summary.period !== 'Período não especificado' && data.summary.period !== 'Período não definido') {
    const periodMatch = data.summary.period.match(/(\d{2}\/\d{2}\/\d{4})\s*-\s*(\d{2}\/\d{2}\/\d{4})/);
    if (periodMatch) {
      const [, startStr, endStr] = periodMatch;
      const [startDay, startMonth, startYear] = startStr.split('/');
      const [endDay, endMonth, endYear] = endStr.split('/');
      
      startDate = new Date(parseInt(startYear), parseInt(startMonth) - 1, parseInt(startDay));
      endDate = new Date(parseInt(endYear), parseInt(endMonth) - 1, parseInt(endDay));
    } else {
      // Fallback para cálculo baseado nos insights filtrados
      if (data.insights.length > 0) {
        // Filtrar insights apenas das campanhas selecionadas
        const campaignIds = data.campaigns.map(c => c.id);
        const filteredInsights = data.insights.filter(insight => 
          campaignIds.includes(insight.campaign_id)
        );
        
        if (filteredInsights.length > 0) {
          // Encontrar a data mais antiga de início
          startDate = new Date(Math.min(...filteredInsights.map(i => new Date(i.date_start).getTime())));
          // Encontrar a data mais recente de fim
          endDate = new Date(Math.max(...filteredInsights.map(i => new Date(i.date_stop).getTime())));
        } else {
          startDate = new Date();
          endDate = new Date();
        }
      } else {
        startDate = new Date();
        endDate = new Date();
      }
    }
  } else {
    // Fallback para cálculo baseado nos insights filtrados
    if (data.insights.length > 0) {
      // Filtrar insights apenas das campanhas selecionadas
      const campaignIds = data.campaigns.map(c => c.id);
      const filteredInsights = data.insights.filter(insight => 
        campaignIds.includes(insight.campaign_id)
      );
      
      if (filteredInsights.length > 0) {
        // Encontrar a data mais antiga de início
        startDate = new Date(Math.min(...filteredInsights.map(i => new Date(i.date_start).getTime())));
        // Encontrar a data mais recente de fim
        endDate = new Date(Math.max(...filteredInsights.map(i => new Date(i.date_stop).getTime())));
      } else {
        startDate = new Date();
        endDate = new Date();
      }
    } else {
      startDate = new Date();
      endDate = new Date();
    }
  }
  
  const conversasIniciadas = getMessagingConversationsStarted(data.insights);
  const custoConversa = data.summary.totalSpend > 0 && conversasIniciadas > 0 ? 
    data.summary.totalSpend / conversasIniciadas : 0;

  // Métricas na ordem solicitada (sem ícones)
  const metricsData = [
    { label: 'Período', value: `${startDate.toLocaleDateString('pt-BR')} - ${endDate.toLocaleDateString('pt-BR')}` },
    { label: 'Investimento Total', value: `R$ ${data.summary.totalSpend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
    { label: 'Total de Impressões', value: data.summary.totalImpressions.toLocaleString('pt-BR') },
    { label: 'Total de Cliques', value: data.summary.totalClicks.toLocaleString('pt-BR') },
    { label: 'Alcance', value: data.summary.totalReach.toLocaleString('pt-BR') },
    { label: 'Frequência', value: data.summary.totalFrequency.toFixed(2) },
    { label: 'CPM', value: `R$ ${data.summary.totalCPM.toFixed(2)}` },
    { label: 'Conversas Iniciadas', value: conversasIniciadas.toLocaleString('pt-BR') },
    { label: 'Custo por Conversa Iniciada', value: `R$ ${custoConversa.toFixed(2)}` }
  ];

  // Renderizar métricas em grid 2x5
  const colWidth = (pageWidth - 2 * margin - 10) / 2;
  let col = 0;
  
  for (const metric of metricsData) {
    const x = margin + (col * (colWidth + 10));
    
    if (col === 0) checkPageBreak(25);
    
    // Label
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(metric.label, x, currentY);
    
    // Valor
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(metric.value, x, currentY + 8);
    
    col++;
    if (col >= 2) {
      col = 0;
      currentY += 25;
    }
  }
  
  if (col > 0) currentY += 25;
  currentY += 15;

  // === GLOSSÁRIO DE MÉTRICAS (com espaçamento melhorado) ===
  checkPageBreak(100);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Glossário de Métricas', margin, currentY);
  currentY += 15;

  const explanations = [
    { term: 'Impressões', definition: 'Número de vezes que seus anúncios foram exibidos.' },
    { term: 'Cliques', definition: 'Número de cliques recebidos em seus anúncios.' },
    { term: 'Investimento', definition: 'Valor total gasto com os anúncios no período.' },
    { term: 'Alcance', definition: 'Número de pessoas únicas que viram seus anúncios.' },
    { term: 'Frequência', definition: 'Número médio de vezes que cada pessoa viu seus anúncios.' },
    { term: 'CPM', definition: 'Custo por mil impressões - quanto você paga por 1.000 visualizações.' },
    { term: 'Conversas Iniciadas', definition: 'Número de conversas iniciadas através dos anúncios (WhatsApp, Messenger, etc.).' },
    { term: 'Custo por Conversa', definition: 'Valor médio investido para gerar cada conversa iniciada.' }
  ];

  doc.setFontSize(9);
  for (const explanation of explanations) {
    checkPageBreak(15);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`${explanation.term}:`, margin, currentY);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    const termWidth = doc.getTextWidth(`${explanation.term}: `);
    addText(explanation.definition, margin + termWidth + 3, currentY, pageWidth - margin - termWidth - margin - 3);
    
    currentY += 14;
  }

  // === DETALHES DAS CAMPANHAS ===
  if (data.insights.length > 0) {
    currentY += 10;
    checkPageBreak(50);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Detalhes por Campanha', margin, currentY);
    currentY += 15;

    // Cabeçalho da tabela
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    
    const headers = ['Campanha', 'Impressões', 'Alcance', 'Gasto', 'Conversas'];
    const colWidths = [60, 30, 25, 30, 25];
    let headerX = margin;
    
    headers.forEach((header, i) => {
      doc.text(header, headerX, currentY);
      headerX += colWidths[i];
    });
    
    currentY += 8;
    
    // Linha separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 8;

    // Dados das campanhas
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    for (const insight of data.insights) {
      checkPageBreak(12);
      
      const conversas = insight.actions?.find(action => 
        action.action_type === 'onsite_conversion.messaging_conversation_started_7d'
      )?.value || insight.messaging_conversations_started || '0';
      
      const rowData = [
        insight.campaign_name.substring(0, 25) + (insight.campaign_name.length > 25 ? '...' : ''),
        parseFloat(insight.impressions).toLocaleString('pt-BR'),
        parseFloat(insight.reach || '0').toLocaleString('pt-BR'),
        `R$ ${parseFloat(insight.spend).toFixed(2)}`,
        parseFloat(conversas).toLocaleString('pt-BR')
      ];
      
      let rowX = margin;
      rowData.forEach((data, i) => {
        doc.text(data, rowX, currentY);
        rowX += colWidths[i];
      });
      
      currentY += 10;
    }
  }

  // === RODAPÉ ===
  const addFooter = () => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Relatório gerado em ${new Date().toLocaleString('pt-BR')} | Marketing Lactvit`,
      margin,
      pageHeight - 10
    );
  };

  // Adicionar rodapé em todas as páginas
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter();
  }

  // Salvar o PDF
  const fileName = `relatorio-campanhas-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}