import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  MousePointer,
  DollarSign,
  Target,
  Users,
  BarChart3,
  TrendingUp,
  Settings,
  CheckCircle2,
  MessageCircle,
  Sparkles,
  Zap
} from 'lucide-react';
import { type MetricsSelection } from '@/hooks/useMetaAdsData';

interface MetricsSelectorProps {
  selectedMetrics: MetricsSelection;
  onMetricsChange: (metrics: MetricsSelection) => void;
  className?: string;
}

interface MetricConfig {
  key: keyof MetricsSelection;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'basic' | 'engagement' | 'conversion' | 'cost';
  color: string;
}

const METRICS_CONFIG: MetricConfig[] = [
  // Métricas Básicas
  {
    key: 'impressions',
    label: 'Impressões',
    description: 'Número total de vezes que o anúncio foi exibido',
    icon: Eye,
    category: 'basic',
    color: 'text-blue-600'
  },
  {
    key: 'reach',
    label: 'Alcance',
    description: 'Número de pessoas únicas que viram o anúncio',
    icon: Users,
    category: 'basic',
    color: 'text-indigo-600'
  },
  {
    key: 'frequency',
    label: 'Frequência',
    description: 'Número médio de vezes que cada pessoa viu o anúncio',
    icon: BarChart3,
    category: 'basic',
    color: 'text-cyan-600'
  },
  
  // Métricas de Engajamento
  {
    key: 'clicks',
    label: 'Cliques',
    description: 'Número total de cliques no anúncio',
    icon: MousePointer,
    category: 'engagement',
    color: 'text-green-600'
  },
  {
    key: 'ctr',
    label: 'CTR',
    description: 'Taxa de cliques (cliques ÷ impressões)',
    icon: Target,
    category: 'engagement',
    color: 'text-emerald-600'
  },
  // Remover estas linhas do METRICS_CONFIG (linhas 79-86):
  // {
  //   key: 'messaging_conversations_started',
  //   label: 'Conversas Iniciadas',
  //   description: 'Número de conversas iniciadas através dos anúncios',
  //   icon: MessageCircle,
  //   category: 'engagement',
  //   color: 'text-teal-600'
  // },
  
  // E remover estas linhas da função resetToDefaults (linhas 205-206):
  // messaging_conversations_started: false,
  // cost_per_messaging_conversation_started: false
  
  // Métricas de Custo
  {
    key: 'spend',
    label: 'Investimento',
    description: 'Valor total gasto na campanha',
    icon: DollarSign,
    category: 'cost',
    color: 'text-orange-600'
  },
  {
    key: 'cpm',
    label: 'CPM',
    description: 'Custo por mil impressões',
    icon: TrendingUp,
    category: 'cost',
    color: 'text-amber-600'
  },
  {
    key: 'cpc',
    label: 'CPC',
    description: 'Custo por clique',
    icon: MousePointer,
    category: 'cost',
    color: 'text-yellow-600'
  },
  
  // Métricas de Conversão
  {
    key: 'conversions',
    label: 'Conversões',
    description: 'Número total de conversões',
    icon: CheckCircle2,
    category: 'conversion',
    color: 'text-purple-600'
  },
  {
    key: 'conversion_rate',
    label: 'Taxa de Conversão',
    description: 'Percentual de cliques que resultaram em conversão',
    icon: Target,
    category: 'conversion',
    color: 'text-violet-600'
  },
  {
    key: 'cost_per_conversion',
    label: 'Custo por Conversão',
    description: 'Valor médio gasto por conversão',
    icon: DollarSign,
    category: 'conversion',
    color: 'text-pink-600'
  },
  {
    key: 'messaging_conversations_started',
    label: 'Conversas Iniciadas',
    description: 'Número de conversas iniciadas através dos anúncios',
    icon: MessageCircle,
    category: 'engagement',
    color: 'text-teal-600'
  },
  {
    key: 'cost_per_messaging_conversation_started',
    label: 'Custo por Conversa Iniciada',
    description: 'Valor médio gasto por conversa iniciada',
    icon: MessageCircle,
    category: 'cost',
    color: 'text-cyan-600'
  }
];

const CATEGORY_LABELS = {
  basic: 'Métricas Básicas',
  engagement: 'Engajamento',
  cost: 'Custos',
  conversion: 'Conversões'
};

const CATEGORY_COLORS = {
  basic: 'border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-blue-600/5',
  engagement: 'border-green-500/20 bg-gradient-to-br from-green-500/10 to-green-600/5',
  cost: 'border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-orange-600/5',
  conversion: 'border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-purple-600/5'
};

const CATEGORY_ICONS = {
  basic: Eye,
  engagement: Zap,
  cost: DollarSign,
  conversion: Sparkles
};

export const MetricsSelector: React.FC<MetricsSelectorProps> = ({
  selectedMetrics,
  onMetricsChange,
  className = ''
}) => {
  // Agrupar métricas por categoria
  const metricsByCategory = METRICS_CONFIG.reduce((acc, metric) => {
    if (!acc[metric.category]) {
      acc[metric.category] = [];
    }
    acc[metric.category].push(metric);
    return acc;
  }, {} as Record<string, MetricConfig[]>);

  // Função para alternar uma métrica
  const toggleMetric = (metricKey: keyof MetricsSelection) => {
    onMetricsChange({
      ...selectedMetrics,
      [metricKey]: !selectedMetrics[metricKey]
    });
  };

  // Função para selecionar todas as métricas de uma categoria
  const selectCategoryMetrics = (category: string, select: boolean) => {
    const categoryMetrics = metricsByCategory[category];
    const updates = categoryMetrics.reduce((acc, metric) => {
      acc[metric.key] = select;
      return acc;
    }, {} as Partial<MetricsSelection>);
    
    onMetricsChange({
      ...selectedMetrics,
      ...updates
    });
  };

  // Função para selecionar métricas essenciais
  const selectEssentialMetrics = () => {
    onMetricsChange({
      impressions: true,
      clicks: true,
      spend: true,
      ctr: false,
      reach: true,
      frequency: true,
      cpm: true,
      cpc: false,
      conversions: false,
      conversion_rate: false,
      cost_per_conversion: false,
      messaging_conversations_started: true, // ✅ Habilitado por padrão
      cost_per_messaging_conversation_started: true,
    });
  };

  // Função para limpar todas as seleções
  const clearAllMetrics = () => {
    const clearedMetrics = Object.keys(selectedMetrics).reduce((acc, key) => {
      acc[key as keyof MetricsSelection] = false;
      return acc;
    }, {} as MetricsSelection);
    onMetricsChange(clearedMetrics);
  };

  // Contar métricas selecionadas
  const selectedCount = Object.values(selectedMetrics).filter(Boolean).length;
  const totalCount = Object.keys(selectedMetrics).length;

  return (
    <Card className={`${className} bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700/50 shadow-2xl`}>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-3 text-white text-xl font-semibold">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg">
                <Settings className="w-5 h-5 text-white" />
              </div>
              Seletor de Métricas
            </CardTitle>
            <CardDescription className="text-slate-300 text-sm leading-relaxed">
              Escolha as métricas que deseja visualizar nos relatórios
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <Badge 
              variant="outline" 
              className="border-slate-600/50 bg-slate-800/50 text-slate-200 px-3 py-1.5 text-sm font-medium backdrop-blur-sm"
            >
              {selectedCount} de {totalCount} selecionadas
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Botões de Ação Rápida */}
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={selectEssentialMetrics}
            className="border-slate-600/50 bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-slate-200 hover:from-blue-600/30 hover:to-purple-600/30 hover:border-blue-500/50 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-blue-500/25 px-4 py-2"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Métricas Essenciais
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearAllMetrics}
            className="border-slate-600/50 bg-slate-800/30 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500/50 transition-all duration-300 backdrop-blur-sm px-4 py-2"
          >
            Limpar Tudo
          </Button>
        </div>

        {/* Métricas por Categoria */}
        {Object.entries(metricsByCategory).map(([category, metrics]) => {
          const categorySelected = metrics.filter(m => selectedMetrics[m.key]).length;
          const categoryTotal = metrics.length;
          const allSelected = categorySelected === categoryTotal;
          const someSelected = categorySelected > 0 && categorySelected < categoryTotal;
          const CategoryIcon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS];
          
          return (
            <div 
              key={category} 
              className={`border rounded-xl p-6 transition-all duration-300 hover:shadow-xl backdrop-blur-sm ${
                CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]
              } hover:border-opacity-40`}
            >
              {/* Header da Categoria */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg bg-gradient-to-br ${
                    category === 'basic' ? 'from-blue-500 to-blue-600' :
                    category === 'engagement' ? 'from-green-500 to-green-600' :
                    category === 'cost' ? 'from-orange-500 to-orange-600' :
                    'from-purple-500 to-purple-600'
                  } shadow-lg`}>
                    <CategoryIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg">
                      {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                    </h3>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs mt-1 ${
                        someSelected ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                        allSelected ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                        'bg-slate-700/50 text-slate-300 border-slate-600/50'
                      } transition-all duration-300`}
                    >
                      {categorySelected}/{categoryTotal} selecionadas
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => selectCategoryMetrics(category, true)}
                    disabled={allSelected}
                    className="text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-200 disabled:opacity-50 px-3 py-1.5"
                  >
                    Todos
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => selectCategoryMetrics(category, false)}
                    disabled={categorySelected === 0}
                    className="text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-200 disabled:opacity-50 px-3 py-1.5"
                  >
                    Nenhum
                  </Button>
                </div>
              </div>

              {/* Lista de Métricas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {metrics.map((metric) => {
                  const isSelected = selectedMetrics[metric.key];
                  const IconComponent = metric.icon;
                  
                  return (
                    <div
                      key={metric.key}
                      className={`group flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${
                        isSelected 
                          ? 'border-blue-500/50 bg-gradient-to-br from-blue-500/20 to-purple-500/10 shadow-lg shadow-blue-500/25 ring-1 ring-blue-500/20' 
                          : 'border-slate-600/30 bg-slate-800/30 hover:bg-slate-700/40 hover:border-slate-500/50 hover:shadow-lg'
                      }`}
                      onClick={() => toggleMetric(metric.key)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => toggleMetric(metric.key)}
                          className={`transition-all duration-200 ${
                            isSelected ? 'scale-110' : 'group-hover:scale-105'
                          }`}
                        />
                        <div className={`p-2 rounded-lg transition-all duration-300 ${
                          isSelected 
                            ? 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg' 
                            : 'bg-slate-700/50 group-hover:bg-slate-600/50'
                        }`}>
                          <IconComponent className={`w-4 h-4 transition-all duration-300 ${
                            isSelected ? 'text-white' : `${metric.color} group-hover:scale-110`
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium text-sm transition-all duration-200 ${
                              isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'
                            }`}>
                              {metric.label}
                            </span>
                            {isSelected && (
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                            )}
                          </div>
                          <p className={`text-xs mt-1.5 transition-all duration-200 ${
                            isSelected ? 'text-slate-300' : 'text-slate-400 group-hover:text-slate-300'
                          }`}>
                            {metric.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Resumo das Seleções */}
        {selectedCount > 0 && (
          <div className="border-t border-slate-600/30 pt-6 mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-semibold text-white text-lg">Métricas Selecionadas</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {METRICS_CONFIG
                .filter(metric => selectedMetrics[metric.key])
                .map(metric => {
                  const IconComponent = metric.icon;
                  return (
                    <Badge 
                      key={metric.key} 
                      variant="secondary" 
                      className="text-sm bg-gradient-to-r from-slate-700 to-slate-600 text-slate-200 border-slate-500/30 px-3 py-1.5 flex items-center gap-2 hover:from-slate-600 hover:to-slate-500 transition-all duration-200 cursor-pointer"
                      onClick={() => toggleMetric(metric.key)}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                      {metric.label}
                    </Badge>
                  );
                })
              }
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};