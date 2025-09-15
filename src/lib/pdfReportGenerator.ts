import { ReportData } from '@/hooks/useFinancialReports';

// Importação dinâmica para reduzir bundle size
let jsPDF: any;
let html2canvas: any;

const loadDependencies = async () => {
  if (!jsPDF) {
    const jsPDFModule = await import('jspdf');
    jsPDF = jsPDFModule.default;
  }
  if (!html2canvas) {
    html2canvas = (await import('html2canvas')).default;
  }
};

export interface PDFReportOptions {
  includeCharts?: boolean;
  companyName?: string;
  reportTitle?: string;
  logoUrl?: string;
}

export const generatePDFReport = async (
  data: ReportData,
  options: PDFReportOptions = {}
) => {
  await loadDependencies();
  
  const {
    includeCharts = true,
    companyName = 'Marketing Lactvit',
    reportTitle = 'Relatório Financeiro',
    logoUrl
  } = options;

  // Criar novo documento PDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let currentY = margin;

  // Função para adicionar nova página se necessário
  const checkPageBreak = (requiredHeight: number) => {
    if (currentY + requiredHeight > pageHeight - margin) {
      doc.addPage();
      currentY = margin;
      return true;
    }
    return false;
  };

  // Função para adicionar texto com quebra de linha
  const addText = (text: string, x: number, y: number, options: any = {}) => {
    doc.setFont(options.font || 'helvetica', options.style || 'normal');
    doc.setFontSize(options.fontSize || 12);
    doc.setTextColor(options.color || '#000000');
    doc.text(text, x, y);
  };

  // Função para carregar e adicionar logo
  const addLogo = async (logoUrl: string, x: number, y: number, maxWidth: number, maxHeight: number) => {
    try {
      // Criar uma imagem temporária para carregar a logo
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            // Calcular dimensões preservando proporção
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            let logoWidth = maxWidth;
            let logoHeight = maxWidth / aspectRatio;
            
            // Se a altura calculada exceder o máximo, ajustar pela altura
            if (logoHeight > maxHeight) {
              logoHeight = maxHeight;
              logoWidth = maxHeight * aspectRatio;
            }
            
            // Recalcular posição Y para centralização perfeita
            const centeredY = y + (maxHeight - logoHeight) / 2;
            
            // Criar canvas temporário para converter a imagem
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            // Usar dimensões originais para melhor qualidade
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              const dataUrl = canvas.toDataURL('image/png', 0.95); // Qualidade alta
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

  // Cabeçalho com nova cor #10151e
  // Convertendo #10151e para RGB: rgb(16, 21, 30)
  doc.setFillColor(16, 21, 30);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Adicionar logo amarela com tamanho aumentado e centralizada
  const logoPath = '/src/assets/logoamarela.webp';
  const maxLogoWidth = 50; // Aumentado de 35 para 50
  const maxLogoHeight = 35; // Aumentado de 30 para 35
  const headerHeight = 40;
  const logoY = (headerHeight - maxLogoHeight) / 2; // Base para centralização
  const logoX = pageWidth - margin - maxLogoWidth - 5; // Posição à direita com margem
  
  try {
    // Carregar a logo amarela com proporção preservada e tamanho aumentado
    const logoUrl = new URL(logoPath, window.location.origin).href;
    await addLogo(logoUrl, logoX, logoY, maxLogoWidth, maxLogoHeight);
  } catch (error) {
    console.warn('Erro ao carregar logo amarela:', error);
  }
  
  addText(companyName, margin, 15, { 
    fontSize: 20, 
    style: 'bold', 
    color: '#ffffff' 
  });
  addText(reportTitle, margin, 25, { 
    fontSize: 14, 
    color: '#ffffff' 
  });
  addText(`Gerado em: ${data.summary.generatedAt}`, margin, 35, { 
    fontSize: 10, 
    color: '#ffffff' 
  });

  currentY = 50;

  // Resumo Executivo
  addText('RESUMO EXECUTIVO', margin, currentY, { 
    fontSize: 16, 
    style: 'bold' 
  });
  currentY += 10;

  // Linha separadora com a mesma cor do cabeçalho
  doc.setDrawColor(16, 21, 30);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 10;

  // Linha separadora com cor azul do sistema
  doc.setDrawColor(23, 92, 211);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 10;

  // Métricas principais (removendo investimentos)
  const metrics = [
    ['Período:', data.summary.period],
    ['Total de Transações:', data.summary.transactionCount.toString()],
    ['Total de Despesas:', data.summary.totalExpenses.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })]
  ];

  metrics.forEach(([label, value]) => {
    checkPageBreak(8);
    addText(label, margin, currentY, { style: 'bold' });
    addText(value, margin + 60, currentY);
    currentY += 8;
  });

  currentY += 10;

  // Breakdown por Categoria
  if (data.categoryBreakdown.length > 0) {
    checkPageBreak(20);
    addText('GASTOS POR CATEGORIA', margin, currentY, { 
      fontSize: 16, 
      style: 'bold' 
    });
    currentY += 10;

    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 10;

    // Cabeçalho da tabela
    const tableHeaders = ['Categoria', 'Valor', 'Percentual', 'Transações'];
    const colWidths = [60, 40, 30, 30];
    let tableX = margin;

    doc.setFillColor(240, 240, 240);
    doc.rect(margin, currentY - 5, pageWidth - 2 * margin, 10, 'F');

    tableHeaders.forEach((header, index) => {
      addText(header, tableX, currentY, { style: 'bold', fontSize: 10 });
      tableX += colWidths[index];
    });
    currentY += 10;

    // Dados da tabela
    data.categoryBreakdown.slice(0, 15).forEach((item, index) => {
      checkPageBreak(8);
      
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, currentY - 5, pageWidth - 2 * margin, 8, 'F');
      }

      tableX = margin;
      const rowData = [
        item.category,
        item.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        `${item.percentage.toFixed(1)}%`,
        item.transactionCount.toString()
      ];

      rowData.forEach((data, colIndex) => {
        addText(data, tableX, currentY, { fontSize: 9 });
        tableX += colWidths[colIndex];
      });
      currentY += 8;
    });
  }

  currentY += 10;

  // Tendências Mensais (removendo menções a investimentos)
  if (data.monthlyTrends.length > 0) {
    checkPageBreak(20);
    addText('TENDÊNCIAS MENSAIS', margin, currentY, { 
      fontSize: 16, 
      style: 'bold' 
    });
    currentY += 10;

    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 10;

    data.monthlyTrends.slice(-6).forEach((trend) => {
      checkPageBreak(8);
      addText(`${trend.month}:`, margin, currentY, { style: 'bold', fontSize: 10 });
      addText(
        `Despesas: ${trend.expenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
        margin + 40,
        currentY,
        { fontSize: 10 }
      );
      currentY += 10;
    });
  }

  // Rodapé
  const addFooter = () => {
    const footerY = pageHeight - 15;
    doc.setFontSize(8);
    doc.setTextColor('#666666');
    doc.text(
      `Relatório gerado automaticamente pelo sistema ${companyName}`,
      margin,
      footerY
    );
    doc.text(
      `Página ${doc.internal.getCurrentPageInfo().pageNumber}`,
      pageWidth - margin - 20,
      footerY
    );
  };

  // Adicionar rodapé em todas as páginas
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter();
  }

  // Salvar o arquivo
  const fileName = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};