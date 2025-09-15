import React, { useState } from 'react';
import { Plus, Calendar, List, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useCommemorateDates } from '@/hooks/useCommemorateDates';
import { CommemorateDateForm } from '@/components/commemorative-dates/CommemorateDateForm';
import { CommemorateDatesList } from '@/components/commemorative-dates/CommemorateDatesList';
import { CommemorateDatesCalendar } from '@/components/commemorative-dates/CommemorateDatesCalendar';
import { CommemorativeDate, CommemorateDateFilters } from '@/types/commemorative-dates';
import { createLocalDate } from '@/lib/utils';
import { toast } from 'sonner';

export const CommemorateDatesPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDate, setEditingDate] = useState<CommemorativeDate | null>(null);
  const [activeTab, setActiveTab] = useState('calendar');
  const [filters, setFilters] = useState<CommemorateDateFilters>({
    year: undefined,
  });

  const {
    dates,
    isLoading,
    createDate,
    updateDate,
    deleteDate,
    getDatesByMonth,
    getUpcomingDates,
    getDatesByType,
    getStatistics,
    getMonthGroups,
    isCreating,
    isUpdating,
    isDeleting,
  } = useCommemorateDates(filters);



  const statistics = getStatistics() || {
    total: 0,
    mandatory: 0,
    optional: 0,
    feedPosts: 0,
    storyPosts: 0,
    byMonth: []
  };
  const upcomingDates = getUpcomingDates(5);

  const handleSubmit = async (data: Omit<CommemorativeDate, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingDate) {
        await updateDate(editingDate.id, data);
        toast.success('Data comemorativa atualizada com sucesso!');
      } else {
        await createDate(data);
        toast.success('Data comemorativa criada com sucesso!');
      }
      setIsFormOpen(false);
      setEditingDate(null);
    } catch (error) {
      toast.error('Erro ao salvar data comemorativa');
    }
  };

  const handleEdit = (date: CommemorativeDate) => {
    setEditingDate(date);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDate(id);
      toast.success('Data comemorativa excluída com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir data comemorativa');
    }
  };



  const handleNewDate = () => {
    setEditingDate(null);
    setIsFormOpen(true);
  };

  const handleYearChange = (year: string) => {
    setFilters(prev => ({ ...prev, year: parseInt(year) }));
  };

  const handlePostTypeFilter = (postType: string) => {
    setFilters(prev => ({
      ...prev,
      post_type: postType === 'all' ? undefined : postType as 'feed' | 'story'
    }));
  };

  const handleMandatoryFilter = (mandatory: string) => {
    setFilters(prev => ({
      ...prev,
      is_mandatory: mandatory === 'all' ? undefined : mandatory === 'true'
    }));
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">Calendário de Datas Comemorativas</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Gerencie e visualize datas comemorativas para planejamento de conteúdo
          </p>
        </div>
        
        <Button onClick={handleNewDate} className="shrink-0 w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Nova Data
        </Button>
        
        <CommemorateDateForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingDate(null);
          }}
          commemorativeDate={editingDate}
          onSubmit={handleSubmit}
          isLoading={editingDate ? isUpdating : isCreating}
        />
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="h-fit">
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium truncate">Total de Datas</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold">{statistics.total}</div>
          </CardContent>
        </Card>
        
        <Card className="h-fit">
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium truncate">Obrigatórias</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold text-red-600">{statistics.mandatory}</div>
          </CardContent>
        </Card>
        
        <Card className="h-fit">
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium truncate">Posts Feed</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">{statistics.feedPosts}</div>
          </CardContent>
        </Card>
        
        <Card className="h-fit">
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium truncate">Posts Story</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold text-purple-600">{statistics.storyPosts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="truncate">Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-xs sm:text-sm font-medium shrink-0">Ano:</label>
              <Select value={filters.year?.toString()} onValueChange={handleYearChange}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-xs sm:text-sm font-medium shrink-0">Tipo:</label>
              <Select 
                value={filters.post_type || 'all'} 
                onValueChange={handlePostTypeFilter}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="feed">Feed</SelectItem>
                  <SelectItem value="story">Story</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Prioridade:</label>
              <Select 
                value={filters.is_mandatory === undefined ? 'all' : filters.is_mandatory.toString()} 
                onValueChange={handleMandatoryFilter}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="true">Obrigatórias</SelectItem>
                  <SelectItem value="false">Opcionais</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>



      {/* Conteúdo Principal */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Lista
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">Carregando calendário...</div>
            </div>
          ) : (
            <CommemorateDatesCalendar
              dates={dates}
              onEdit={handleEdit}
              initialDate={new Date()}
            />
          )}
        </TabsContent>
        
        <TabsContent value="list" className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">Carregando lista...</div>
            </div>
          ) : (
            <CommemorateDatesList
              dates={dates}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={isDeleting}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};