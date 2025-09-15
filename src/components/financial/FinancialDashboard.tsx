
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { useFinancialTransactions, type TransactionFilters } from "@/hooks/useFinancialTransactions";
import { useFinancialCategories } from "@/hooks/useFinancialCategories";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { 
  TrendingDown, 
  DollarSign, 
  Calendar,
  PieChart as PieChartIcon,
  BarChart3,
  Download
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { FinancialReportExporter } from './FinancialReportExporter';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface FinancialDashboardProps {
  filters?: TransactionFilters;
}

const SYSTEM_COLORS = [
  'hsl(49 100% 64%)', // primary
  'hsl(142 76% 36%)', // success
  'hsl(38 92% 50%)', // warning
  'hsl(217 91% 60%)', // info
  'hsl(0 84% 60%)', // destructive
  'hsl(217 32% 40%)', // muted
  'hsl(39 100% 57%)', // orange variant
  'hsl(285 85% 35%)', // purple variant
  'hsl(173 80% 40%)', // teal variant
  'hsl(43 74% 66%)', // yellow variant
];

export const FinancialDashboard = ({ filters }: FinancialDashboardProps) => {
  const { data: transactions = [], isLoading } = useFinancialTransactions(filters);
  const { data: categories = [] } = useFinancialCategories();
  const [showExporter, setShowExporter] = useState(false);

  const metrics = useMemo(() => {
    const totalExpenses = transactions
      .filter(t => t.type === 'expense' && t.status === 'confirmed')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const pendingTransactions = transactions.filter(t => t.status === 'pending').length;

    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    
    const monthlyExpenses = transactions
      .filter(t => {
        const transactionDate = new Date(t.transaction_date);
        return t.type === 'expense' && 
               t.status === 'confirmed' &&
               transactionDate.getMonth() === thisMonth &&
               transactionDate.getFullYear() === thisYear;
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      totalExpenses,
      pendingTransactions,
      monthlyExpenses,
      totalTransactions: transactions.length
    };
  }, [transactions]);

  const categoryData = useMemo(() => {
    const categoryTotals: { [key: string]: number } = {};
  
    const expenseTransactions = transactions.filter(t => t.type === 'expense' && t.status === 'confirmed');
  
    expenseTransactions.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
    });
  
    const totalExpenses = Object.values(categoryTotals).reduce((sum, value) => sum + value, 0);
  
    const result = Object.entries(categoryTotals)
      .map(([categoryId, value], index) => {
        const category = categories.find(c => c.id === categoryId);
        const categoryName = category?.name || 'Outros';
        const percentage = totalExpenses > 0 ? (value / totalExpenses) * 100 : 0;
        return {
          categoryId: categoryId, // Adicionado ID único
          category: categoryName,
          visitors: value,
          percentage: percentage,
          fill: SYSTEM_COLORS[index % SYSTEM_COLORS.length]
        };
      })
      .filter(item => item.visitors > 0)
      .sort((a, b) => b.visitors - a.visitors);
  
    return result;
  }, [transactions, categories]);

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {
      visitors: {
        label: "Gastos",
      },
    };
    
    categoryData.forEach((item) => {
      config[item.categoryId] = { // Usar ID único em vez do nome
        label: item.category,
        color: item.fill,
      };
    });
    
    return config;
  }, [categoryData]);

  const monthlyData = useMemo(() => {
    const monthlyTotals: { [key: string]: number } = {};

    transactions
      .filter(t => t.type === 'expense' && t.status === 'confirmed')
      .forEach(t => {
        const date = new Date(t.transaction_date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyTotals[monthYear] = (monthlyTotals[monthYear] || 0) + Number(t.amount);
      });

    return Object.entries(monthlyTotals)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([monthYear, value]) => {
        const [year, month] = monthYear.split('-');
        const date = new Date(Number(year), Number(month) - 1);
        return {
          name: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
          value: value
        };
      });
  }, [transactions]);

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho com botão de exportação */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Financeiro</h2>
        <Dialog open={showExporter} onOpenChange={setShowExporter}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar Relatório
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Exportar Relatório Financeiro</DialogTitle>
            </DialogHeader>
            <FinancialReportExporter defaultFilters={filters} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Total de Despesas"
          value={`R$ ${metrics.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          change=""
          changeType="neutral"
          icon={TrendingDown}
        />
        <MetricCard
          title="Transações Pendentes"
          value={metrics.pendingTransactions.toString()}
          change="Aguardando confirmação"
          changeType="neutral"
          icon={Calendar}
        />
        <MetricCard
          title="Despesas do Mês"
          value={`R$ ${metrics.monthlyExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          change="Mês atual"
          changeType="neutral"
          icon={DollarSign}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-4 h-4" />
              Gastos por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[400px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent 
                        hideLabel 
                        formatter={(value, name, props) => {
                          const categoryName = props.payload?.category || name;
                          const percentage = props.payload?.percentage || 0;
                          return [
                            `${categoryName} - ${percentage.toFixed(1)}%`,
                            ""
                          ];
                        }}
                      />
                    }
                  />
                  <Pie
                    data={categoryData}
                    dataKey="visitors"
                    nameKey="categoryId" // Usar categoryId em vez de category
                    innerRadius={80}
                    outerRadius={120}
                    strokeWidth={2}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${entry.categoryId}-${index}`} fill={entry.fill} /> // Chave mais específica
                    ))}
                  </Pie>
                  <ChartLegend
                    content={<ChartLegendContent nameKey="categoryId" />}
                    className="flex items-center justify-center pt-3 -translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                  />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[350px] text-muted-foreground w-full">
                <div className="text-center">
                  <PieChartIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Nenhum dado encontrado</p>
                  <p className="text-sm">Adicione transações para visualizar os gastos por categoria</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Gastos Mensais
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    tickLine={{ stroke: '#4b5563' }}
                    axisLine={{ stroke: '#4b5563' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    tickLine={{ stroke: '#4b5563' }}
                    axisLine={{ stroke: '#4b5563' }}
                    tickFormatter={(value: number) => {
                      if (value >= 1000000) {
                        return `R$ ${(value / 1000000).toFixed(1)}M`;
                      } else if (value >= 1000) {
                        return `R$ ${(value / 1000).toFixed(0)}k`;
                      }
                      return `R$ ${value.toLocaleString('pt-BR')}`;
                    }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [
                      `R$ ${value.toLocaleString('pt-BR', { 
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2 
                      })}`, 
                      'Gastos do Mês'
                    ]}
                    labelFormatter={(label) => `Período: ${label}`}
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                      fontSize: '14px',
                      color: '#f9fafb'
                    }}
                    cursor={{ fill: 'rgba(96, 165, 250, 0.1)' }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                    stroke="#2563eb"
                    strokeWidth={1}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Nenhum dado encontrado</p>
                  <p className="text-sm">Adicione transações para visualizar os gastos mensais</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
