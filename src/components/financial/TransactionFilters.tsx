
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Filter, X, Search, Calendar, DollarSign } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { TransactionFilters as FilterType } from '@/hooks/useFinancialTransactions';
import { useFinancialCategories } from '@/hooks/useFinancialCategories';
import { Separator } from '@/components/ui/separator';

interface TransactionFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
}

export const statusOptions = [
  { value: 'all', label: 'Todos os status', color: 'bg-gray-100' },
  { value: 'pending', label: 'Pendente', color: 'bg-yellow-50' },
  { value: 'confirmed', label: 'Confirmado', color: 'bg-green-50' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-50' }
];

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const [dateFromOpen, setDateFromOpen] = useState(false);
  const [dateToOpen, setDateToOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  const { data: categories = [] } = useFinancialCategories();

  const handleFilterChange = (key: keyof FilterType, value: string) => {
    const newFilters = { ...filters };
    
    if (value === 'all' || value === '') {
      delete newFilters[key];
    } else {
      (newFilters as any)[key] = value;
    }
    
    onFiltersChange(newFilters);
  };

  const handleDateChange = (key: 'dateFrom' | 'dateTo', date: Date | undefined) => {
    const newFilters = { ...filters };
    
    if (date) {
      newFilters[key] = date.toISOString().split('T')[0];
    } else {
      delete newFilters[key];
    }
    
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const clearSpecificFilter = (key: keyof FilterType) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof FilterType];
    return value !== undefined && value !== '' && value !== 'all';
  });

  const getFilterLabel = (key: keyof FilterType, value: string) => {
    switch (key) {
      case 'category':
        const category = categories.find(cat => cat.id === value);
        return category ? category.name : value;
      case 'status':
        return statusOptions.find(opt => opt.value === value)?.label || value;
      case 'dateFrom':
        if (!value || value.trim() === '') return 'Data inicial';
        const fromDate = new Date(value);
        return isNaN(fromDate.getTime()) ? 'Data inválida' : `De: ${format(fromDate, 'dd/MM/yyyy')}`;
      case 'dateTo':
        if (!value || value.trim() === '') return 'Data final';
        const toDate = new Date(value);
        return isNaN(toDate.getTime()) ? 'Data inválida' : `Até: ${format(toDate, 'dd/MM/yyyy')}`;
      default:
        return value;
    }
  };

  const activeFilterCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof FilterType];
    return value !== undefined && value !== '' && value !== 'all' && key !== 'search';
  }).length;

  return (
    <>
      {/* Barra de busca e botão de filtros na mesma linha */}
      <div className="flex items-center gap-4 mb-4">
        {/* Barra de busca */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar transações..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Botão de filtros */}
        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2 whitespace-nowrap">
              <Filter className="w-4 h-4" />
              Filtros
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filtros</h4>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-1" />
                    Limpar Filtros
                  </Button>
                )}
              </div>

              <Separator />

              {/* Category Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Categoria
                </Label>
                <Select
                  value={filters.category || ''}
                  onValueChange={(value) => handleFilterChange('category', value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Status
                </Label>
                <Select
                  value={filters.status || ''}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filters */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Data inicial</Label>
                  <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-10",
                          !filters.dateFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateFrom ? (
                          format(new Date(filters.dateFrom), "dd/MM/yyyy")
                        ) : (
                          "Selecionar"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
                        onSelect={(date) => {
                          handleDateChange('dateFrom', date);
                          setDateFromOpen(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Data final</Label>
                  <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-10",
                          !filters.dateTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateTo ? (
                          format(new Date(filters.dateTo), "dd/MM/yyyy")
                        ) : (
                          "Selecionar"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={filters.dateTo ? new Date(filters.dateTo) : undefined}
                        onSelect={(date) => {
                          handleDateChange('dateTo', date);
                          setDateToOpen(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Filtros ativos como badges - só aparecem quando há filtros realmente ativos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4">
          {Object.entries(filters)
            .filter(([key, value]) => key !== 'search' && value && value !== 'all')
            .map(([key, value]) => (
              <Badge 
                key={key} 
                variant="secondary" 
                className="gap-2 py-1 px-3 hover:bg-secondary/80 transition-colors"
              >
                {getFilterLabel(key as keyof FilterType, value as string)}
                <button
                  onClick={() => clearSpecificFilter(key as keyof FilterType)}
                  className="hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))
          }
        </div>
      )}
    </>
  );
};
