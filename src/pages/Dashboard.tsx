import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Eye, MousePointer, Target, DollarSign, Calendar, Users, FileText, Activity, CreditCard, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useCommemorateDates } from '@/hooks/useCommemorateDates';
import { useFinancialTransactions } from '@/hooks/useFinancialTransactions';
import { useUsers } from '@/hooks/useUsers';
import { useApprovalPostsStats } from '@/hooks/useOptimizedApprovalPosts';
import { formatCurrency, createLocalDate } from '@/lib/utils';
import { useMemo } from 'react';

const Dashboard = () => {
  const { user } = useAuth();
  const { data: userProfile } = useUserProfile();
  const { commemorativeDates, getStats } = useCommemorateDates();
  const { data: transactions } = useFinancialTransactions();
  const { data: users } = useUsers();
  const { data: approvalStats } = useApprovalPostsStats();

  // Calcular estatísticas financeiras
  const financialStats = useMemo(() => {
    if (!transactions) return { totalExpenses: 0, totalInvestments: 0, pendingCount: 0, confirmedCount: 0 };
    
    const confirmedTransactions = transactions.filter(t => t.status === 'confirmed');
    const pendingTransactions = transactions.filter(t => t.status === 'pending');
    
    const totalExpenses = confirmedTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const totalInvestments = confirmedTransactions
      .filter(t => t.type === 'investment')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    return {
      totalExpenses,
      totalInvestments,
      pendingCount: pendingTransactions.length,
      confirmedCount: confirmedTransactions.length
    };
  }, [transactions]);

  // Calcular estatísticas de datas comemorativas
  const commemorativeStats = useMemo(() => {
    const stats = getStats();
    if (!stats) return { total: 0, mandatory: 0, optional: 0, thisMonth: 0 };
    
    const currentMonth = new Date().getMonth();
    const thisMonthStats = stats.byMonth[currentMonth];
    
    return {
      total: stats.total,
      mandatory: stats.mandatory,
      optional: stats.optional,
      thisMonth: thisMonthStats?.count || 0
    };
  }, [getStats]);

  // Próximas datas comemorativas (mês atual)
  const upcomingDates = useMemo(() => {
    if (!commemorativeDates) return [];
    
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    return commemorativeDates
      .filter(date => {
        const dateObj = createLocalDate(date.date);
        return dateObj.getMonth() === currentMonth && 
               dateObj.getFullYear() === currentYear &&
               dateObj >= today;
      })
      .slice(0, 5);
  }, [commemorativeDates]);

  // Métricas principais do sistema
  const systemMetrics = [
    {
      title: 'Datas Comemorativas',
      value: commemorativeStats.total.toString(),
      subtitle: `${commemorativeStats.mandatory} obrigatórias`,
      change: `${commemorativeStats.thisMonth} este mês`,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Posts Pendentes',
      value: (approvalStats?.pending || 0).toString(),
      subtitle: 'Aguardando aprovação',
      change: `${approvalStats?.total || 0} total`,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Despesas Totais',
      value: formatCurrency(financialStats.totalExpenses),
      subtitle: 'Confirmadas',
      change: `${financialStats.confirmedCount} transações`,
      icon: CreditCard,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Usuários Ativos',
      value: users?.length.toString() || '0',
      subtitle: 'Total de usuários',
      change: 'Sistema ativo',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm sm:text-lg text-muted-foreground">
          Bem-vindo de volta, {userProfile?.full_name || user?.email || 'Usuário'}! Aqui está um resumo do seu sistema.
        </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm">
            <Activity className="w-4 h-4 mr-2" />
            Análises
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {systemMetrics.map((metric) => {
          const IconComponent = metric.icon;
          return (
            <Card key={metric.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium leading-tight">
                  {metric.title}
                </CardTitle>
                <IconComponent className={`h-3 w-3 sm:h-4 sm:w-4 ${metric.color} shrink-0`} />
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="text-lg sm:text-2xl font-bold break-words overflow-hidden leading-tight">{metric.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.subtitle}
                </p>
                <p className="text-xs text-muted-foreground">
                  {metric.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Grid de Conteúdo */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Próximas Datas Comemorativas */}
        <Card className="h-fit">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" />
              <span className="truncate">Próximas Datas Comemorativas</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Datas importantes do mês atual
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 px-3 sm:px-6">
            <div className="space-y-3">
              {upcomingDates.length > 0 ? (
                upcomingDates.map((date) => (
                  <div key={date.id} className="flex flex-col gap-2 p-3 bg-muted/30 rounded-lg border border-muted/50">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm leading-tight mb-2 text-foreground">{date.title}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge 
                            variant={date.is_mandatory ? 'destructive' : 'secondary'} 
                            className="text-xs shrink-0 px-2 py-1 font-medium"
                          >
                            {date.is_mandatory ? 'Obrigatória' : 'Opcional'}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-medium">
                            {createLocalDate(date.date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 mt-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Calendar className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium">Nenhuma data comemorativa no mês atual</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transações Recentes */}
        <Card className="h-fit">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 shrink-0" />
              <span className="truncate">Transações Recentes</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Últimas movimentações financeiras
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 px-3 sm:px-6">
            <div className="space-y-3">
              {transactions && transactions.length > 0 ? (
                transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex flex-col gap-2 p-3 bg-muted/30 rounded-lg border border-muted/50">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm leading-tight mb-2 text-foreground">{transaction.description}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge 
                            variant={transaction.status === 'confirmed' ? 'default' : 'secondary'}
                            className="text-xs shrink-0 px-2 py-1 font-medium"
                          >
                            {transaction.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-medium capitalize">
                            {transaction.type === 'expense' ? 'Despesa' : 'Investimento'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-bold mb-1 ${
                          transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(Number(transaction.amount))}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium">
                           {new Date(transaction.transaction_date).toLocaleDateString('pt-BR')}
                         </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <CreditCard className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium">Nenhuma transação encontrada</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            Status do Sistema
          </CardTitle>
          <CardDescription>
            Informações gerais sobre o estado atual do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-medium">Sistema Online</p>
                <p className="text-sm text-muted-foreground">Todos os serviços funcionando</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="font-medium">{users?.length || 0} Usuários</p>
                <p className="text-sm text-muted-foreground">Cadastrados no sistema</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
              <AlertCircle className="w-8 h-8 text-orange-600" />
              <div>
                <p className="font-medium">{financialStats.pendingCount} Pendentes</p>
                <p className="text-sm text-muted-foreground">Transações aguardando</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
