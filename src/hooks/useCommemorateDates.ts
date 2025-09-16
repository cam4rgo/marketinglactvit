import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { createLocalDate } from '@/lib/utils';
import {
  CommemorativeDate,
  CreateCommemorateDateData,
  UpdateCommemorateDateData,
  CommemorateDateFilters,
  CalendarYear,
  CalendarMonth,
  CommemorateDateStats,
  MonthGroup,
  PostType
} from '@/types/commemorative-dates';

export function useCommemorateDates(filters?: CommemorateDateFilters) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar todas as datas comemorativas
  const {
    data: commemorativeDates,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['commemorative-dates', filters],
    queryFn: async (): Promise<CommemorativeDate[]> => {
      console.log('🔍 [DEBUG] Executando query com filtros:', filters);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      let query = supabase
        .from('commemorative_dates')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      // Aplicar filtros
      if (filters?.year) {
        const startDate = `${filters.year}-01-01`;
        const endDate = `${filters.year}-12-31`;
        console.log('📅 [DEBUG] Filtro de ano aplicado:', { startDate, endDate });
        query = query.gte('date', startDate).lte('date', endDate);
      }

      if (filters?.month !== undefined && filters?.year) {
        const month = String(filters.month + 1).padStart(2, '0');
        const startDate = `${filters.year}-${month}-01`;
        const endDate = `${filters.year}-${month}-31`;
        console.log('📅 [DEBUG] Filtro de mês aplicado:', { month, startDate, endDate });
        query = query.gte('date', startDate).lte('date', endDate);
      }

      if (filters?.is_mandatory !== undefined) {
        console.log('⚡ [DEBUG] Filtro de obrigatório aplicado:', filters.is_mandatory);
        query = query.eq('is_mandatory', filters.is_mandatory);
      }

      if (filters?.post_type) {
        console.log('🏷️ [DEBUG] Filtro de tipo aplicado:', filters.post_type);
        query = query.eq('post_type', filters.post_type);
      }

      if (filters?.search) {
        console.log('🔍 [DEBUG] Filtro de busca aplicado:', filters.search);
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ [DEBUG] Erro na query:', error);
        throw new Error('Erro ao carregar datas comemorativas');
      }

      console.log('✅ [DEBUG] Query executada com sucesso. Dados retornados:', data?.length || 0, 'registros');
      console.log('📊 [DEBUG] Primeiros 3 registros:', data?.slice(0, 3));

      // Cast dos dados para garantir tipagem correta
      const result = (data || []) as CommemorativeDate[];
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Mutation para criar nova data comemorativa
  const createCommemorateDateMutation = useMutation({
    mutationFn: async (data: CreateCommemorateDateData): Promise<CommemorativeDate> => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const insertData = {
        ...data,
        user_id: user.id,
      };

      const { data: result, error } = await supabase
        .from('commemorative_dates')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw new Error('Erro ao criar data comemorativa: ' + error.message);
      }

      return result as CommemorativeDate;
    },
    onSuccess: (newDate) => {
      console.log('✅ [DEBUG] Data comemorativa criada com sucesso:', newDate);
      
      // Atualizar cache manualmente para todas as queries relacionadas
      queryClient.getQueryCache().findAll({ 
        predicate: (query) => {
          const queryKey = query.queryKey;
          return queryKey[0] === 'commemorative-dates';
        }
      }).forEach((query) => {
        queryClient.setQueryData(query.queryKey, (oldData: CommemorativeDate[] | undefined) => {
          if (!oldData) return [newDate];
          
          const updatedList = [...oldData, newDate].sort((a, b) => 
            createLocalDate(a.date).getTime() - createLocalDate(b.date).getTime()
          );
          console.log('🔄 [DEBUG] Cache atualizado manualmente após criação para query:', query.queryKey, updatedList.length, 'itens');
          return updatedList;
        });
      });
      
      // Invalidar todas as queries relacionadas para garantir sincronização
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const queryKey = query.queryKey;
          return queryKey[0] === 'commemorative-dates';
        }
      });
      
      // Forçar refetch para garantir que os dados sejam atualizados na UI
      setTimeout(() => {
        queryClient.refetchQueries({ 
          predicate: (query) => {
            const queryKey = query.queryKey;
            return queryKey[0] === 'commemorative-dates';
          }
        });
      }, 100);
      
      console.log('🔄 [DEBUG] Cache atualizado após criação');
      toast({
        title: 'Sucesso!',
        description: 'Data comemorativa criada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation para atualizar data comemorativa
  const updateCommemorateDateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCommemorateDateData }): Promise<CommemorativeDate> => {
      // Verificar autenticação
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      // Preparar payload removendo campos undefined/null
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
      );
      
      const updatePayload = {
        ...cleanData,
        updated_at: new Date().toISOString(),
      };
      
      const { data: result, error } = await supabase
        .from('commemorative_dates')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) {

        throw new Error('Erro ao atualizar data comemorativa: ' + error.message);
      }
      
      console.log('✅ [DEBUG] Mutation executada com sucesso, retornando:', result);
      return result as CommemorativeDate;
    },
    onSuccess: (updatedData) => {
      
      // Atualizar cache manualmente para todas as queries relacionadas
      queryClient.getQueryCache().findAll({ 
        predicate: (query) => {
          const queryKey = query.queryKey;
          return queryKey[0] === 'commemorative-dates';
        }
      }).forEach((query) => {
        queryClient.setQueryData(query.queryKey, (oldData: CommemorativeDate[] | undefined) => {
          if (!oldData) return [updatedData];
          
          const updatedList = oldData.map(item => 
            item.id === updatedData.id ? updatedData : item
          );
          console.log('🔄 [DEBUG] Cache atualizado manualmente para query:', query.queryKey, updatedList.length, 'itens');
          return updatedList;
        });
      });
      
      // Invalidar todas as queries relacionadas para garantir sincronização
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const queryKey = query.queryKey;
          return queryKey[0] === 'commemorative-dates';
        }
      });
      
      // Forçar refetch para garantir que os dados sejam atualizados na UI
      setTimeout(() => {
        queryClient.refetchQueries({ 
          predicate: (query) => {
            const queryKey = query.queryKey;
            return queryKey[0] === 'commemorative-dates';
          }
        });
      }, 100);
      
      console.log('🔄 [DEBUG] Cache atualizado após edição');
      toast({
        title: 'Sucesso!',
        description: 'Data comemorativa atualizada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation para deletar data comemorativa
  const deleteCommemorateDateMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('commemorative_dates')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar data comemorativa:', error);
        throw new Error('Erro ao deletar data comemorativa');
      }
    },
    onSuccess: () => {
      console.log('✅ [DEBUG] Data comemorativa excluída com sucesso');
      // Invalidação otimizada do cache
      queryClient.invalidateQueries({ queryKey: ['commemorative-dates'] });
      // Aguardar um pouco antes de refetch para evitar condições de corrida
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['commemorative-dates'] });
      }, 100);
      console.log('🔄 [DEBUG] Cache invalidado após exclusão');
      toast({
        title: 'Sucesso!',
        description: 'Data comemorativa excluída com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Função para obter dados do calendário por ano
  const getCalendarYear = (year: number): CalendarYear | undefined => {
    console.log('📅 [DEBUG] getCalendarYear chamado para ano:', year);
    if (!commemorativeDates) {
      console.log('⚠️ [DEBUG] commemorativeDates não disponível');
      return undefined;
    }

    const yearDates = commemorativeDates.filter(date => {
      const dateYear = createLocalDate(date.date).getFullYear();
      return dateYear === year;
    });
    
    console.log('📊 [DEBUG] Datas encontradas para o ano', year, ':', yearDates.length);

    const months: CalendarMonth[] = [];
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    for (let month = 0; month < 12; month++) {
      const monthDates = yearDates.filter(date => {
        const dateMonth = createLocalDate(date.date).getMonth();
        return dateMonth === month;
      });

      months.push({
        year,
        month,
        name: monthNames[month],
        dates: monthDates
      });
    }

    const mandatoryDates = yearDates.filter(date => date.is_mandatory).length;
    const optionalDates = yearDates.filter(date => !date.is_mandatory).length;
    const feedPosts = yearDates.filter(date => date.post_type === 'feed').length;
    const storyPosts = yearDates.filter(date => date.post_type === 'story').length;

    return {
      year,
      months,
      totalDates: yearDates.length,
      mandatoryDates,
      optionalDates,
      feedPosts,
      storyPosts
    };
  };

  // Função para obter estatísticas
  const getStats = (): CommemorateDateStats | undefined => {
    console.log('📊 [DEBUG] getStats chamado. Total de datas:', commemorativeDates?.length || 0);
    if (!commemorativeDates) {
      console.log('⚠️ [DEBUG] commemorativeDates não disponível para estatísticas');
      return undefined;
    }

    const mandatory = commemorativeDates.filter(date => date.is_mandatory).length;
    const optional = commemorativeDates.filter(date => !date.is_mandatory).length;
    const feedPosts = commemorativeDates.filter(date => date.post_type === 'feed').length;
    const storyPosts = commemorativeDates.filter(date => date.post_type === 'story').length;

    const byMonth = Array.from({ length: 12 }, (_, month) => {
      const monthDates = commemorativeDates.filter(date => {
        const dateMonth = createLocalDate(date.date).getMonth();
        return dateMonth === month;
      });

      const monthMandatory = monthDates.filter(date => date.is_mandatory).length;
      const monthOptional = monthDates.filter(date => !date.is_mandatory).length;

      return {
        month,
        count: monthDates.length,
        mandatory: monthMandatory,
        optional: monthOptional
      };
    });

    return {
      total: commemorativeDates.length,
      mandatory,
      optional,
      feedPosts,
      storyPosts,
      byMonth
    };
  };

  // Função para agrupar por mês
  const getMonthGroups = (year?: number): MonthGroup[] => {
    if (!commemorativeDates) return [];

    const filteredDates = year 
      ? commemorativeDates.filter(date => createLocalDate(date.date).getFullYear() === year)
      : commemorativeDates;

    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const groups: MonthGroup[] = [];

    for (let month = 0; month < 12; month++) {
      const monthDates = filteredDates.filter(date => {
        const dateMonth = createLocalDate(date.date).getMonth();
        return dateMonth === month;
      });

      if (monthDates.length > 0 || year) {
        groups.push({
          month,
          monthName: monthNames[month],
          year: year || new Date().getFullYear(),
          dates: monthDates,
          count: monthDates.length
        });
      }
    }

    return groups;
  };

  // Funções auxiliares para compatibilidade com a página
  const dates = commemorativeDates || [];
  
  const createDate = async (data: CreateCommemorateDateData) => {
    return createCommemorateDateMutation.mutateAsync(data);
  };
  
  const updateDate = async (id: string, data: UpdateCommemorateDateData) => {
    return updateCommemorateDateMutation.mutateAsync({ id, data });
  };
  
  const deleteDate = async (id: string) => {
    return deleteCommemorateDateMutation.mutateAsync(id);
  };
  
  const getDatesByMonth = (year: number, month: number) => {
    return dates.filter(date => {
      const dateObj = createLocalDate(date.date);
      return dateObj.getFullYear() === year && dateObj.getMonth() === month;
    });
  };
  
  const getUpcomingDates = (limit = 5) => {
    const today = new Date();
    return dates
      .filter(date => createLocalDate(date.date) >= today)
      .sort((a, b) => createLocalDate(a.date).getTime() - createLocalDate(b.date).getTime())
      .slice(0, limit);
  };
  
  const getDatesByType = (postType: PostType) => {
    return dates.filter(date => date.post_type === postType);
  };
  
  const getStatistics = () => {
    return getStats();
  };

  return {
    // Data
    commemorativeDates,
    dates, // Alias para compatibilidade
    isLoading,
    error,
    refetch,

    // Mutations
    createCommemorativeDate: createCommemorateDateMutation.mutate,
    updateCommemorativeDate: updateCommemorateDateMutation.mutate,
    deleteCommemorativeDate: deleteCommemorateDateMutation.mutate,
    createDate,
    updateDate,
    deleteDate,
    isCreating: createCommemorateDateMutation.isPending,
    isUpdating: updateCommemorateDateMutation.isPending,
    isDeleting: deleteCommemorateDateMutation.isPending,

    // Utility functions
    getCalendarYear,
    getStats,
    getStatistics, // Alias para compatibilidade
    getMonthGroups,
    getDatesByMonth,
    getUpcomingDates,
    getDatesByType,
  };
}

// Hook específico para obter datas de um ano
export function useCommemorateDatesYear(year: number) {
  return useCommemorateDates({ year });
}

// Hook específico para obter datas de um mês
export function useCommemorateDatesMonth(year: number, month: number) {
  return useCommemorateDates({ year, month });
}