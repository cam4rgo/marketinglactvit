import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Calendar, Clock, MessageSquare, Instagram } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn, createLocalDate } from '@/lib/utils';
import { CommemorativeDate } from '@/types/commemorative-dates';

interface CommemorateDatesCalendarProps {
  dates: CommemorativeDate[];
  onDateClick?: (date: CommemorativeDate) => void;
  onEdit?: (date: CommemorativeDate) => void;
  initialDate?: Date;
}

export const CommemorateDatesCalendar: React.FC<CommemorateDatesCalendarProps> = ({
  dates,
  onDateClick,
  onEdit,
  initialDate = new Date(),
}) => {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getDatesForDay = (day: Date): CommemorativeDate[] => {
    return dates.filter(date => isSameDay(createLocalDate(date.date), day));
  };

  const getPostTypeIcon = (postType: string, size = 'w-3 h-3') => {
    return postType === 'story' ? (
      <Instagram className={size} />
    ) : (
      <MessageSquare className={size} />
    );
  };

  const getPostTypeColor = (postType: string) => {
    return postType === 'story'
      ? 'bg-purple-600 hover:bg-purple-700 border-purple-600 text-white'
      : 'bg-blue-600 hover:bg-blue-700 border-blue-600 text-white';
  };

  const getMandatoryColor = (isMandatory: boolean) => {
    return isMandatory
      ? 'bg-red-600 hover:bg-red-700 border-red-600 text-white'
      : 'bg-green-600 hover:bg-green-700 border-green-600 text-white';
  };

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
    setSelectedDate(null);
  };

  const handleDayClick = (day: Date, dayDates: CommemorativeDate[]) => {
    setSelectedDate(day);
    if (dayDates.length === 1 && onDateClick) {
      onDateClick(dayDates[0]);
    }
  };

  const selectedDayDates = selectedDate ? getDatesForDay(selectedDate) : [];

  // Calcular o primeiro dia da semana para o mês
  const firstDayOfWeek = monthStart.getDay();
  const emptyDays = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header do Calendário */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base sm:text-xl">
              {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
            </CardTitle>
            <div className="flex gap-2 justify-center sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousMonth}
                className="shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
                className="shrink-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 gap-1 mb-3 sm:mb-4">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="p-1 sm:p-2 text-center text-xs sm:text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          {/* Grid do calendário */}
          <div className="grid grid-cols-7 gap-1">
            {/* Dias vazios do início do mês */}
            {emptyDays.map(day => (
              <div key={`empty-${day}`} className="p-1 sm:p-2 h-16 sm:h-20" />
            ))}
            
            {/* Dias do mês */}
            {calendarDays.map(day => {
              const dayDates = getDatesForDay(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'p-1 h-16 sm:h-20 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50',
                    isSelected && 'bg-primary/10 border-primary',
                    isToday && 'bg-purple-600 border-purple-600',
                    !isSameMonth(day, currentDate) && 'opacity-50'
                  )}
                  onClick={() => handleDayClick(day, dayDates)}
                >
                  <div className="text-xs sm:text-sm font-medium mb-1">
                    {format(day, 'd')}
                  </div>
                  
                  {/* Indicadores de datas comemorativas */}
                  <div className="space-y-0.5 sm:space-y-1">
                    {dayDates.slice(0, 2).map(date => (
                      <div
                        key={date.id}
                        className={`text-[10px] sm:text-xs p-0.5 sm:p-1 rounded truncate text-white ${
                          date.is_mandatory 
                            ? 'bg-red-600 border border-red-600' 
                            : 'bg-green-600 border border-green-600'
                        }`}
                        title={date.title}
                      >
                        <div className="flex items-center gap-0.5 sm:gap-1">
                          {getPostTypeIcon(date.post_type, 'w-2 h-2 shrink-0')}
                          <span className="truncate">{date.title}</span>
                        </div>
                      </div>
                    ))}
                    
                    {dayDates.length > 2 && (
                      <div className="text-[10px] sm:text-xs text-muted-foreground text-center">
                        +{dayDates.length - 2} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Detalhes do dia selecionado */}
      {selectedDate && selectedDayDates.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">
              {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3 sm:space-y-4">
              {selectedDayDates.map(date => (
                <div
                  key={date.id}
                  className="p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium mb-2 text-sm sm:text-base">{date.title}</h4>
                      
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getMandatoryColor(date.is_mandatory)}`}
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          {date.is_mandatory ? 'Obrigatória' : 'Opcional'}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getPostTypeColor(date.post_type)}`}
                        >
                          {getPostTypeIcon(date.post_type)}
                          <span className="ml-1">
                            {date.post_type === 'story' ? 'Story' : 'Feed'}
                          </span>
                        </Badge>
                      </div>
                      
                      {date.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {date.description}
                        </p>
                      )}
                    </div>
                    
                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(date)}
                        className="w-full sm:w-auto shrink-0"
                      >
                        Editar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Legenda */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-base">Legenda</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-600 border border-red-600 rounded shrink-0" />
                <span>Obrigatória</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-600 border border-green-600 rounded shrink-0" />
                <span>Opcional</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
                <span>Feed</span>
              </div>
              <div className="flex items-center gap-2">
                <Instagram className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 shrink-0" />
                <span>Story</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};