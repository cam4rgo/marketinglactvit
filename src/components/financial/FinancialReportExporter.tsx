import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Calendar as CalendarIcon,
  Loader2,
  Settings
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useFinancialReports, type ReportFilters } from '@/hooks/useFinancialReports';
import { type TransactionFilters } from '@/hooks/useFinancialTransactions';
import { toast } from 'sonner';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { useFinancialCategories } from '@/hooks/useFinancialCategories';

interface FinancialReportExporterProps {
  defaultFilters?: ReportFilters;
}

export const FinancialReportExporter: React.FC<FinancialReportExporterProps> = ({ 
  defaultFilters 
}) => {
  // Using sonner toast
  const { data: companySettings } = useCompanySettings();
  const { data: categories = [], isLoading: categoriesLoading } = useFinancialCategories();
  
  // Filtrar apenas categorias de despesa
  const expenseCategories = categories.filter(category => category.type === 'expense');
  
  // Inicializar as datas a partir dos defaultFilters se existirem
  const [dateFrom, setDateFrom] = useState<Date | undefined>(() => {
    if (defaultFilters?.dateFrom) {
      return new Date(defaultFilters.dateFrom);
    }
    return undefined;
  });
  
  const [dateTo, setDateTo] = useState<Date | undefined>(() => {
    if (defaultFilters?.dateTo) {
      return new Date(defaultFilters.dateTo);
    }
    return undefined;
  });
  
  const [filters, setFilters] = useState<ReportFilters>(() => {
    const initialFilters = { ...defaultFilters, type: 'expense' as const };
    // Garantir que as datas sejam formatadas corretamente na inicialização
    if (defaultFilters?.dateFrom) {
      initialFilters.dateFrom = defaultFilters.dateFrom;
    }
    if (defaultFilters?.dateTo) {
      initialFilters.dateTo = defaultFilters.dateTo;
    }
    return initialFilters;
  });
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [dateFromOpen, setDateFromOpen] = useState(false);
  const [dateToOpen, setDateToOpen] = useState(false);

  // Função para converter Date para string no formato YYYY-MM-DD
  const formatDateForFilter = (date: Date | undefined): string | undefined => {
    if (!date) return undefined;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formatted = `${year}-${month}-${day}`;

    return formatted;
  };

  // Atualizar filtros quando as datas mudarem (apenas quando há mudança real)
  useEffect(() => {
    const newDateFrom = formatDateForFilter(dateFrom);
    const newDateTo = formatDateForFilter(dateTo);
    
    // Só atualizar se houve mudança real nos valores
    if (filters.dateFrom !== newDateFrom || filters.dateTo !== newDateTo) {

      
      setFilters(prev => {
        const newFilters = {
          ...prev,
          dateFrom: newDateFrom,
          dateTo: newDateTo
        };

        return newFilters;
      });
    }
  }, [dateFrom, dateTo, filters.dateFrom, filters.dateTo]);

  // Função para lidar com mudanças no checkbox de gráficos
  const handleIncludeChartsChange = (checked: boolean | "indeterminate") => {
    setIncludeCharts(checked === true);
  };

  // Função para lidar com mudanças de data com validação
  const handleDateFromSelect = (date: Date | undefined) => {

    
    if (date && dateTo && date > dateTo) {

      toast.error('A data inicial deve ser anterior à data final.');
      return;
    }
    

    setDateFrom(date);
    setDateFromOpen(false);
  };

  const handleDateToSelect = (date: Date | undefined) => {

    
    if (date && dateFrom && date < dateFrom) {

      toast.error('A data final deve ser posterior à data inicial.');
      return;
    }
    

    setDateTo(date);
    setDateToOpen(false);
  };



  const { data: reportData, isLoading } = useFinancialReports({
    ...filters,
    includeCharts
  });



  const handleExportPDF = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsExporting(true);
    try {
      // Importação dinâmica para reduzir bundle size
      const { generatePDFReport } = await import('@/lib/pdfReportGenerator');
      await generatePDFReport(reportData, {
        includeCharts,
        companyName: 'Marketing Lactvit',
        reportTitle: 'Relatório Financeiro',
        logoUrl: companySettings?.logo_url || undefined
      });
      
      toast.success('O arquivo PDF foi baixado com sucesso.');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Não foi possível gerar o relatório PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsExporting(true);
    try {
      // Importação dinâmica para reduzir bundle size
      const { generateExcelReport } = await import('@/lib/excelReportGenerator');
      await generateExcelReport(reportData, {
        fileName: `relatorio-financeiro-${format(new Date(), 'yyyy-MM-dd')}.xlsx`
      });
      
      toast.success('O arquivo Excel foi baixado com sucesso.');
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      toast.error('Não foi possível gerar o relatório Excel.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (exportFormat === 'pdf') {
      handleExportPDF();
    } else {
      handleExportExcel();
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Carregando dados...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          <CardTitle>Exportar Relatórios Financeiros</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Período */}
          <div className="space-y-2">
            <Label>Data Inicial</Label>
            <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateFrom && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "PPP", { locale: ptBR }) : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={handleDateFromSelect}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Data Final</Label>
            <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateTo && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "PPP", { locale: ptBR }) : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={handleDateToSelect}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={filters.category || 'all'}
              onValueChange={(value) => 
                setFilters(prev => ({ 
                  ...prev, 
                  category: value === 'all' ? undefined : value as TransactionFilters['category']
                }))
              }
              disabled={categoriesLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={categoriesLoading ? "Carregando categorias..." : "Todas as categorias"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {expenseCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${category.color}`} />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => 
                setFilters(prev => ({ 
                  ...prev, 
                  status: value === 'all' ? undefined : value as any
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="confirmed">Confirmado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Opções de Exportação */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Formato de Exportação</Label>
            <Select value={exportFormat} onValueChange={(value: 'pdf' | 'excel') => setExportFormat(value)}>
              <SelectTrigger>
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

          <div className="flex items-center space-x-2 pt-6">
            <Checkbox
              id="include-charts"
              checked={includeCharts}
              onCheckedChange={handleIncludeChartsChange}
            />
            <Label htmlFor="include-charts">Incluir gráficos no relatório</Label>
          </div>
        </div>

        {/* Resumo dos Dados */}
        {reportData && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Resumo dos Dados</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total de Transações:</span>
                <p className="font-medium">{reportData.summary.transactionCount}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Total de Despesas:</span>
                <p className="font-medium text-red-600">
                  R$ {reportData.summary.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Período:</span>
                <p className="font-medium">{reportData.summary.period}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Gerado em:</span>
                <p className="font-medium">{reportData.summary.generatedAt}</p>
              </div>
            </div>
          </div>
        )}

        {/* Botão de Exportação */}
        <Button 
          type="button"
          onClick={handleExport} 
          disabled={isExporting || !reportData}
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
      </CardContent>
    </Card>
  );
};