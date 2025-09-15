
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Calendar as CalendarIcon, Filter, X, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export interface FinancialFilters {
  search?: string;
  type?: 'expense';
  category?: 'meta_ads' | 'google_ads' | 'instagram_ads' | 'content_creation' | 'influencer' | 'design' | 'tools_software' | 'consulting' | 'events' | 'other';
  status?: 'pending' | 'confirmed' | 'cancelled';
  dateFrom?: Date;
  dateTo?: Date;
  metrics?: string[];
  amountRange?: {
    min?: number;
    max?: number;
  };
  customCategories?: string[];
}

interface FinancialFiltersProps {
  filters: FinancialFilters;
  onFiltersChange: (filters: FinancialFilters) => void;
  availableMetrics: Array<{
    key: string;
    label: string;
    description?: string;
  }>;
  categories: Array<{
    key: string;
    label: string;
  }>;
  onCreateCategory?: (category: string) => void;
}

export const FinancialFiltersComponent: React.FC<FinancialFiltersProps> = ({
  filters,
  onFiltersChange,
  availableMetrics,
  categories,
  onCreateCategory
}) => {
  const [newCategory, setNewCategory] = React.useState('');
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = React.useState(false);

  const updateFilter = (key: keyof FinancialFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleMetric = (metricKey: string) => {
    const currentMetrics = filters.metrics || [];
    const newMetrics = currentMetrics.includes(metricKey)
      ? currentMetrics.filter(m => m !== metricKey)
      : [...currentMetrics, metricKey];
    
    updateFilter('metrics', newMetrics);
  };

  const handleCreateCategory = () => {
    if (newCategory.trim() && onCreateCategory) {
      onCreateCategory(newCategory.trim());
      setNewCategory('');
      setIsCreateCategoryOpen(false);
    }
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof FinancialFilters];
    return value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true);
  });

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filtros e Métricas</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar transações..."
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tipo, Categoria e Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select value={filters.type || 'all'} onValueChange={(value) => updateFilter('type', value === 'all' ? undefined : value)}>
            <SelectTrigger>
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              <SelectItem value="expense">Despesas</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Select value={filters.category || 'all'} onValueChange={(value) => updateFilter('category', value === 'all' ? undefined : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.key} value={category.key}>
                    {category.label}
                  </SelectItem>
                ))}
                {filters.customCategories?.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Dialog open={isCreateCategoryOpen} onOpenChange={setIsCreateCategoryOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Categoria</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-category">Nome da Categoria</Label>
                    <Input
                      id="new-category"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Ex: Marketing Digital"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateCategoryOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateCategory} disabled={!newCategory.trim()}>
                      Criar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Select value={filters.status || 'all'} onValueChange={(value) => updateFilter('status', value === 'all' ? undefined : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="confirmed">Confirmado</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Faixa de Valor */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            placeholder="Valor mín. (R$)"
            value={filters.amountRange?.min || ''}
            onChange={(e) => updateFilter('amountRange', { ...filters.amountRange, min: e.target.value ? Number(e.target.value) : undefined })}
          />
          <Input
            type="number"
            placeholder="Valor máx. (R$)"
            value={filters.amountRange?.max || ''}
            onChange={(e) => updateFilter('amountRange', { ...filters.amountRange, max: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>

        {/* Período */}
        <div className="grid grid-cols-2 gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("justify-start text-left font-normal", !filters.dateFrom && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateFrom ? format(filters.dateFrom, "dd/MM/yyyy") : "Data inicial"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filters.dateFrom}
                onSelect={(date) => updateFilter('dateFrom', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("justify-start text-left font-normal", !filters.dateTo && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateTo ? format(filters.dateTo, "dd/MM/yyyy") : "Data final"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filters.dateTo}
                onSelect={(date) => updateFilter('dateTo', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Seleção de Métricas */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Métricas a Exibir</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableMetrics.map((metric) => (
              <div key={metric.key} className="flex items-center space-x-2">
                <Checkbox
                  id={metric.key}
                  checked={filters.metrics?.includes(metric.key) || false}
                  onCheckedChange={() => toggleMetric(metric.key)}
                />
                <label
                  htmlFor={metric.key}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {metric.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Filtros Ativos */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {filters.search && (
              <Badge variant="secondary" className="gap-1">
                Busca: {filters.search}
                <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('search', undefined)} />
              </Badge>
            )}
            {filters.type && (
              <Badge variant="secondary" className="gap-1">
                Tipo: Despesas
                <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('type', undefined)} />
              </Badge>
            )}
            {filters.category && (
              <Badge variant="secondary" className="gap-1">
                Categoria: {categories.find(c => c.key === filters.category)?.label || filters.category}
                <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('category', undefined)} />
              </Badge>
            )}
            {filters.status && (
              <Badge variant="secondary" className="gap-1">
                Status: {filters.status}
                <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('status', undefined)} />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
