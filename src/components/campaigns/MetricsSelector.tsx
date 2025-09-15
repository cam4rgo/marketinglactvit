import React, { memo, useMemo } from 'react';
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
  basic: 'border-blue-500/40 bg-blue-500/5',
  engagement: 'border-emerald-500/40 bg-emerald-500/5',
  cost: 'border-amber-500/40 bg-amber-500/5',
  conversion: 'border-violet-500/40 bg-violet-500/5'
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
    <Card className={`${className} bg-slate-900 border-slate-600/50 shadow-xl`}>
      <CardHeader className="pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 lg:gap-6">
          <div className="space-y-3">
            <CardTitle className="flex items-center gap-4 text-white text-xl font-bold">
              <div className="p-3 bg-blue-600 rounded-lg">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <span className="text-white">
                Seletor de Métricas
              </span>
            </CardTitle>
            <CardDescription className="text-slate-400 text-sm max-w-md">
              Escolha as métricas que deseja visualizar nos relatórios e dashboards
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full sm:w-auto">
            <Badge 
              variant="outline" 
              className="border-slate-500/50 bg-slate-800 text-slate-200 px-3 py-1 text-sm"
            >
              {selectedCount} de {totalCount} selecionadas
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Botões de Ação Rápida */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={selectEssentialMetrics}
            className="border-blue-500/50 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20 hover:border-blue-400 transition-colors duration-200 px-4 py-2 w-full sm:w-auto"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Métricas Essenciais
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearAllMetrics}
            className="border-slate-500/50 bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:border-slate-400 transition-colors duration-200 px-4 py-2 w-full sm:w-auto"
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
              className={`border rounded-xl p-6 transition-colors duration-200 ${
                CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]
              }`}
            >
              
              {/* Header da Categoria */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${
                    category === 'basic' ? 'bg-blue-600' :
                    category === 'engagement' ? 'bg-emerald-600' :
                    category === 'cost' ? 'bg-amber-600' :
                    'bg-violet-600'
                  }`}>
                    <CategoryIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-white text-lg">
                      {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                    </h3>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs font-medium px-3 py-1 ${
                        someSelected ? 'bg-yellow-500/20 text-yellow-200 border-yellow-400/40' :
                        allSelected ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40' :
                        'bg-slate-700/60 text-slate-300 border-slate-500/40'
                      } transition-colors duration-200`}
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
                    className="text-slate-300 hover:bg-slate-700 hover:text-white transition-colors duration-200 disabled:opacity-50 px-4 py-2 border border-slate-600/50"
                  >
                    Todos
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => selectCategoryMetrics(category, false)}
                    disabled={categorySelected === 0}
                    className="text-slate-300 hover:bg-slate-700 hover:text-white transition-colors duration-200 disabled:opacity-50 px-4 py-2 border border-slate-600/50"
                  >
                    Nenhum
                  </Button>
                </div>
              </div>

              {/* Lista de Métricas */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {metrics.map((metric) => {
                  const isSelected = selectedMetrics[metric.key];
                  const IconComponent = metric.icon;
                  
                  return (
                    <div
                      key={metric.key}
                      className={`flex items-start gap-3 p-4 rounded-lg border transition-colors duration-200 cursor-pointer min-h-[100px] ${
                        isSelected 
                          ? 'border-emerald-500/60 bg-emerald-500/10' 
                          : 'border-slate-600/40 bg-slate-800/50 hover:bg-slate-700/60 hover:border-slate-500/60'
                      }`}
                      onClick={() => toggleMetric(metric.key)}
                    >

                      
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-lg transition-colors duration-200 ${
                          isSelected 
                            ? 'bg-emerald-600' 
                            : 'bg-slate-700'
                        }`}>
                          <IconComponent className={`w-4 h-4 transition-colors duration-200 ${
                            isSelected ? 'text-white' : 'text-slate-300'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white text-sm mb-1 leading-tight">
                            {metric.label}
                          </h4>
                          <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                            {metric.description}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        )}
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
              <div className="p-2 bg-blue-600 rounded-lg">
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
                      className="text-sm bg-slate-700 text-slate-200 border-slate-500/30 px-3 py-1.5 flex items-center gap-2 hover:bg-slate-600 transition-colors duration-200 cursor-pointer"
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