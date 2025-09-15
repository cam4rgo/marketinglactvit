import { useMemo } from 'react';
import { useFinancialTransactions, type TransactionFilters } from './useFinancialTransactions';
import { useFinancialCategories } from './useFinancialCategories';
import { formatCurrency, formatDate } from '@/lib/utils';

export interface ReportData {
  summary: {
    totalExpenses: number;
    totalInvestments: number;
    transactionCount: number;
    period: string;
    generatedAt: string;
  };
  transactions: {
    id: string;
    date: string;
    description: string;
    category: string;
    type: string;
    amount: string;
    status: string;
  }[];
  categoryBreakdown: {
    category: string;
    amount: number;
    percentage: number;
    transactionCount: number;
  }[];
  monthlyTrends: {
    month: string;
    expenses: number;
    investments: number;
  }[];
}

export interface ReportFilters extends TransactionFilters {
  includeCharts?: boolean;
  groupByCategory?: boolean;
  includeMonthlyTrends?: boolean;
}

export const useFinancialReports = (filters?: ReportFilters) => {
  const { data: transactions = [], isLoading } = useFinancialTransactions(filters);
  const { data: categories = [] } = useFinancialCategories();

  const reportData = useMemo((): ReportData => {
    const now = new Date();
    const confirmedTransactions = transactions.filter(t => t.status === 'confirmed');
    
    // Cálculos do resumo
    const totalExpenses = confirmedTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const totalInvestments = confirmedTransactions
      .filter(t => t.type === 'investment')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Formatação das transações
    const formattedTransactions = confirmedTransactions.map(transaction => {
      const category = categories.find(c => c.id === transaction.category);
      return {
        id: transaction.id,
        date: formatDate(transaction.transaction_date),
        description: transaction.description,
        category: category?.name || 'Outros',
        type: transaction.type === 'expense' ? 'Despesa' : 'Investimento',
        amount: formatCurrency(Number(transaction.amount)),
        status: transaction.status === 'confirmed' ? 'Confirmado' : 
                transaction.status === 'pending' ? 'Pendente' : 'Cancelado'
      };
    });

    // Breakdown por categoria
    const categoryTotals: { [key: string]: { amount: number; count: number } } = {};
    
    confirmedTransactions.forEach(transaction => {
      const category = categories.find(c => c.id === transaction.category);
      const categoryName = category?.name || 'Outros';
      
      if (!categoryTotals[categoryName]) {
        categoryTotals[categoryName] = { amount: 0, count: 0 };
      }
      
      categoryTotals[categoryName].amount += Number(transaction.amount);
      categoryTotals[categoryName].count += 1;
    });

    const totalAmount = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.amount, 0);
    
    const categoryBreakdown = Object.entries(categoryTotals)
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
        transactionCount: data.count
      }))
      .sort((a, b) => b.amount - a.amount);

    // Tendências mensais
    const monthlyTotals: { [key: string]: { expenses: number; investments: number } } = {};
    
    confirmedTransactions.forEach(transaction => {
      const date = new Date(transaction.transaction_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyTotals[monthKey]) {
        monthlyTotals[monthKey] = { expenses: 0, investments: 0 };
      }
      
      if (transaction.type === 'expense') {
        monthlyTotals[monthKey].expenses += Number(transaction.amount);
      } else {
        monthlyTotals[monthKey].investments += Number(transaction.amount);
      }
    });

    const monthlyTrends = Object.entries(monthlyTotals)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12) // Últimos 12 meses
      .map(([monthKey, data]) => {
        const [year, month] = monthKey.split('-');
        const date = new Date(Number(year), Number(month) - 1);
        return {
          month: date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
          expenses: data.expenses,
          investments: data.investments
        };
      });

    // Determinar período do relatório
    let period = 'Todos os períodos';
    if (filters?.dateFrom && filters?.dateTo) {
      period = `${formatDate(filters.dateFrom)} - ${formatDate(filters.dateTo)}`;
    } else if (filters?.dateFrom) {
      period = `A partir de ${formatDate(filters.dateFrom)}`;
    } else if (filters?.dateTo) {
      period = `Até ${formatDate(filters.dateTo)}`;
    }

    return {
      summary: {
        totalExpenses,
        totalInvestments,
        transactionCount: confirmedTransactions.length,
        period,
        generatedAt: now.toLocaleString('pt-BR')
      },
      transactions: formattedTransactions,
      categoryBreakdown,
      monthlyTrends
    };
  }, [transactions, categories, filters]);

  return {
    data: reportData,
    isLoading,
    isEmpty: transactions.length === 0
  };
};