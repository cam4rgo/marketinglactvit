import { ReportData } from '@/hooks/useFinancialReports';

// Importação dinâmica para reduzir bundle size
let XLSX: any;

const loadXLSX = async () => {
  if (!XLSX) {
    XLSX = await import('xlsx');
  }
};

export interface ExcelReportOptions {
  fileName?: string;
  includeCharts?: boolean;
  companyName?: string;
}

export const generateExcelReport = async (
  data: ReportData,
  options: ExcelReportOptions = {}
) => {
  await loadXLSX();
  
  const {
    fileName = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.xlsx`,
    companyName = 'Marketing Lactvit'
  } = options;

  // Criar novo workbook
  const workbook = XLSX.utils.book_new();

  // Aba 1: Resumo
  const summaryData = [
    ['RELATÓRIO FINANCEIRO', '', '', ''],
    [companyName, '', '', ''],
    [`Gerado em: ${data.summary.generatedAt}`, '', '', ''],
    ['', '', '', ''],
    ['RESUMO EXECUTIVO', '', '', ''],
    ['Período:', data.summary.period, '', ''],
    ['Total de Transações:', data.summary.transactionCount, '', ''],
    ['Total de Despesas:', data.summary.totalExpenses, '', ''],
    // Removida linha: ['Total de Investimentos:', data.summary.totalInvestments, '', ''],
    ['', '', '', ''],
    ['BREAKDOWN POR CATEGORIA', '', '', ''],
    ['Categoria', 'Valor (R$)', 'Percentual (%)', 'Nº Transações'],
    ...data.categoryBreakdown.map(item => [
      item.category,
      item.amount,
      parseFloat(item.percentage.toFixed(2)),
      item.transactionCount
    ])
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

  // Aba 2: Transações Detalhadas
  const transactionsData = [
    ['TRANSAÇÕES DETALHADAS', '', '', '', '', ''],
    ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Status'],
    ...data.transactions.map(transaction => [
      transaction.date,
      transaction.description,
      transaction.category,
      transaction.type,
      transaction.amount,
      transaction.status
    ])
  ];

  const transactionsSheet = XLSX.utils.aoa_to_sheet(transactionsData);
  
  // Formatação da aba transações
  transactionsSheet['!cols'] = [
    { width: 12 },
    { width: 30 },
    { width: 20 },
    { width: 15 },
    { width: 15 },
    { width: 12 }
  ];

  XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'Transações');

  // Aba 3: Tendências Mensais
  if (data.monthlyTrends.length > 0) {
    const trendsData = [
      ['TENDÊNCIAS MENSAIS', ''],
      ['Mês', 'Despesas (R$)'], // Removida coluna de Investimentos
      ...data.monthlyTrends.map(trend => [
        trend.month,
        trend.expenses
        // Removido: trend.investments
      ])
    ];

    const trendsSheet = XLSX.utils.aoa_to_sheet(trendsData);
    
    // Formatação da aba tendências
    trendsSheet['!cols'] = [
      { width: 20 },
      { width: 18 }
    ];

    XLSX.utils.book_append_sheet(workbook, trendsSheet, 'Tendências');
  }

  // Salvar o arquivo
  XLSX.writeFile(workbook, fileName);
};