import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, Calendar, Clock, MessageSquare, Instagram } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { createLocalDate } from '@/lib/utils';
import { CommemorativeDate } from '@/types/commemorative-dates';

interface CommemorateDatesListProps {
  dates: CommemorativeDate[];
  onEdit: (date: CommemorativeDate) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  groupByMonth?: boolean;
}

export const CommemorateDatesList: React.FC<CommemorateDatesListProps> = ({
  dates,
  onEdit,
  onDelete,
  isDeleting,
  groupByMonth = false,
}) => {
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  if (dates.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-lg mb-2">Nenhuma data comemorativa cadastrada</p>
        <p className="text-muted-foreground text-sm">
          Adicione datas comemorativas para planejar seu conteúdo ao longo do ano.
        </p>
      </div>
    );
  }

  const getPostTypeIcon = (postType: string) => {
    return postType === 'story' ? (
      <Instagram className="w-4 h-4" />
    ) : (
      <MessageSquare className="w-4 h-4" />
    );
  };

  const getPostTypeColor = (postType: string) => {
    return postType === 'story'
      ? 'bg-purple-600 hover:bg-purple-700 border-purple-600'
      : 'bg-blue-600 hover:bg-blue-700 border-blue-600';
  };

  const getMandatoryColor = (isMandatory: boolean) => {
    return isMandatory
      ? 'bg-red-600 hover:bg-red-700 border-red-600'
      : 'bg-green-600 hover:bg-green-700 border-green-600';
  };

  const groupDatesByMonth = (dates: CommemorativeDate[]) => {
    const groups: { [key: string]: CommemorativeDate[] } = {};
    
    dates.forEach(date => {
      const monthKey = format(createLocalDate(date.date), 'yyyy-MM', { locale: ptBR });
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(date);
    });

    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  };

  const toggleMonth = (monthKey: string) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(monthKey)) {
      newExpanded.delete(monthKey);
    } else {
      newExpanded.add(monthKey);
    }
    setExpandedMonths(newExpanded);
  };

  const renderDateCard = (date: CommemorativeDate) => (
    <Card key={date.id} className="relative overflow-hidden">
      <CardContent className="p-3">
        <div className="space-y-2">
          {/* Header compacto com título e data */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-foreground leading-tight truncate mb-2">
                {date.title}
              </h3>
              <div className="flex items-center gap-2 mb-1">
                <Badge 
                  variant="secondary" 
                  className={`text-white text-xs px-2 py-0.5 ${getMandatoryColor(date.is_mandatory)}`}
                >
                  {date.is_mandatory ? 'Obrigatória' : 'Opcional'}
                </Badge>
                <Badge 
                  variant="secondary" 
                  className={`text-white text-xs px-2 py-0.5 ${getPostTypeColor(date.post_type)}`}
                >
                  {date.post_type === 'story' ? 'Story' : 'Feed'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {format(createLocalDate(date.date), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
            </div>
            
            {/* Ações compactas */}
            <div className="flex gap-1 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(date)}
                className="h-7 w-7 p-0 hover:bg-blue-50"
              >
                <Edit className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(date.id)}
                disabled={isDeleting}
                className="h-7 w-7 p-0 hover:bg-red-50 text-red-600"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
          

          
          {/* Descrição compacta */}
          {date.description && (
            <div className="bg-muted/20 rounded p-2 mt-2">
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {date.description}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (!groupByMonth) {
    return (
      <div className="space-y-2">
        {dates.map(renderDateCard)}
      </div>
    );
  }

  const groupedDates = groupDatesByMonth(dates);

  return (
    <div className="space-y-3">
      {groupedDates.map(([monthKey, monthDates]) => {
        const isExpanded = expandedMonths.has(monthKey);
        const monthName = format(new Date(monthKey + '-01'), "MMMM 'de' yyyy", { locale: ptBR });
        
        return (
          <div key={monthKey} className="space-y-2">
            <div 
              className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg cursor-pointer hover:from-primary/10 hover:to-primary/15 transition-all duration-200 border border-primary/10"
              onClick={() => toggleMonth(monthKey)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-1 h-6 bg-primary rounded-full shrink-0"></div>
                <div className="flex items-center gap-2 min-w-0">
                  <h3 className="text-base font-bold capitalize truncate text-foreground">
                    {monthName}
                  </h3>
                  <Badge variant="default" className="text-xs px-2 py-0.5 bg-primary/20 text-primary border-primary/30 shrink-0">
                    {monthDates.length}
                  </Badge>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs hover:bg-primary/10"
              >
                {isExpanded ? '↑' : '↓'}
              </Button>
            </div>
            
            {isExpanded && (
              <div className="space-y-4 sm:space-y-5 pl-0 sm:pl-6 animate-in slide-in-from-top-2 duration-300">
                {monthDates.map(renderDateCard)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};