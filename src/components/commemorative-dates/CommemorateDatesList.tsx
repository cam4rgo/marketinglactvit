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
    <Card key={date.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
        <div className="flex flex-col gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base sm:text-lg mb-2 truncate">{date.title}</CardTitle>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <Badge 
                variant="outline" 
                className={`text-white text-xs ${getMandatoryColor(date.is_mandatory)}`}
              >
                <Clock className="w-3 h-3 mr-1" />
                {date.is_mandatory ? 'Obrigatória' : 'Opcional'}
              </Badge>
              <Badge 
                variant="outline" 
                className={`text-white text-xs ${getPostTypeColor(date.post_type)}`}
              >
                {getPostTypeIcon(date.post_type)}
                <span className="ml-1">
                  {date.post_type === 'story' ? 'Story' : 'Feed'}
                </span>
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(date)}
              className="flex-1 sm:flex-none"
            >
              <Edit className="w-4 h-4 mr-2" />
              <span>Editar</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(date.id)}
              disabled={isDeleting}
              className="flex-1 sm:flex-none text-white border-none hover:opacity-90"
              style={{ backgroundColor: '#EF4343' }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              <span>Excluir</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6">
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
            <span>{format(createLocalDate(date.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
          </div>
          
          {date.description && (
            <div className="text-xs sm:text-sm text-muted-foreground">
              <p className="line-clamp-3">{date.description}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (!groupByMonth) {
    return (
      <div className="space-y-3 sm:space-y-4">
        {dates.map(renderDateCard)}
      </div>
    );
  }

  const groupedDates = groupDatesByMonth(dates);

  return (
    <div className="space-y-4 sm:space-y-6">
      {groupedDates.map(([monthKey, monthDates]) => {
        const isExpanded = expandedMonths.has(monthKey);
        const monthName = format(new Date(monthKey + '-01'), "MMMM 'de' yyyy", { locale: ptBR });
        
        return (
          <div key={monthKey} className="space-y-3 sm:space-y-4">
            <div 
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors gap-3"
              onClick={() => toggleMonth(monthKey)}
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold capitalize truncate">{monthName}</h3>
                <Badge variant="secondary" className="text-xs shrink-0">
                  {monthDates.length} {monthDates.length === 1 ? 'data' : 'datas'}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" className="w-full sm:w-auto shrink-0">
                {isExpanded ? 'Recolher' : 'Expandir'}
              </Button>
            </div>
            
            {isExpanded && (
              <div className="space-y-3 sm:space-y-4 pl-0 sm:pl-4">
                {monthDates.map(renderDateCard)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};