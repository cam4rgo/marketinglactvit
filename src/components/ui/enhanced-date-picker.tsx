import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface EnhancedDatePickerProps {
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  className?: string;
}

export const EnhancedDatePicker: React.FC<EnhancedDatePickerProps> = ({
  selected,
  onSelect,
  disabled,
  className
}) => {
  const currentDate = new Date();
  const [viewDate, setViewDate] = useState(selected || currentDate);
  
  // Sincronizar viewDate com selected quando selected mudar
  useEffect(() => {
    if (selected) {
      setViewDate(selected);
    }
  }, [selected]);
  
  // Gerar anos (20 anos para trás e 10 para frente)
  const currentYear = currentDate.getFullYear();
  const years = Array.from({ length: 31 }, (_, i) => currentYear - 20 + i);
  
  // Meses em português
  const months = [
    { value: 0, label: 'Janeiro' },
    { value: 1, label: 'Fevereiro' },
    { value: 2, label: 'Março' },
    { value: 3, label: 'Abril' },
    { value: 4, label: 'Maio' },
    { value: 5, label: 'Junho' },
    { value: 6, label: 'Julho' },
    { value: 7, label: 'Agosto' },
    { value: 8, label: 'Setembro' },
    { value: 9, label: 'Outubro' },
    { value: 10, label: 'Novembro' },
    { value: 11, label: 'Dezembro' }
  ];

  const handleYearChange = (year: string) => {
    const newDate = new Date(viewDate);
    newDate.setFullYear(parseInt(year));
    setViewDate(newDate);
  };

  const handleMonthChange = (month: string) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(parseInt(month));
    setViewDate(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setViewDate(today);
    onSelect(today);
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Seletores de Ano e Mês */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Ano</label>
          <Select
            value={viewDate.getFullYear().toString()}
            onValueChange={handleYearChange}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Mês</label>
          <Select
            value={viewDate.getMonth().toString()}
            onValueChange={handleMonthChange}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value.toString()}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Botão para ir para hoje */}
      <Button
        variant="outline"
        size="sm"
        onClick={goToToday}
        className="w-full h-8 text-xs"
      >
        Ir para Hoje
      </Button>
      
      {/* Calendário */}
      <Calendar
        mode="single"
        selected={selected}
        onSelect={onSelect}
        disabled={disabled}
        month={viewDate}
        onMonthChange={setViewDate}
        locale={ptBR}
        className="rounded-md border-0"
        modifiers={{
          today: currentDate
        }}
        modifiersStyles={{
          today: { 
            backgroundColor: 'hsl(var(--primary))', 
            color: 'hsl(var(--primary-foreground))',
            fontWeight: 'bold'
          }
        }}
      />
    </div>
  );
};

export default EnhancedDatePicker;