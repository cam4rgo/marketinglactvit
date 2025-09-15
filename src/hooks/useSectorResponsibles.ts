import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { SectorResponsible, CreateSectorResponsibleData, UpdateSectorResponsibleData } from '@/types/processing-units';

// Função para gerar link do WhatsApp
function generateWhatsAppLink(phone: string): string {
  // Remove todos os caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Se não começar com 55 (código do Brasil), adiciona
  const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
  
  return `https://wa.me/${formattedPhone}`;
}

export function useSectorResponsibles() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar todos os responsáveis
  const {
    data: sectorResponsibles,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['sector-responsibles'],
    queryFn: async (): Promise<SectorResponsible[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('sector_responsibles')
        .select(`
          *,
          processing_units(
            id,
            razao_social
          )
        `)
        .order('name', { ascending: true });

      if (error) {
        console.error('Erro ao buscar responsáveis:', error);
        throw new Error('Erro ao carregar responsáveis');
      }

      // Mapear os dados do banco para o tipo SectorResponsible
      const mappedData = (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        nome: item.name,
        unidade: item.processing_units?.razao_social || '',
        processing_unit_id: item.processing_unit_id,
        setor_departamento: item.department,
        whatsapp: item.whatsapp,
        link_whatsapp: item.link_whatsapp,
        created_at: item.created_at,
        updated_at: item.updated_at,
        processingUnit: item.processing_units ? {
          id: item.processing_units.id,
          razao_social: item.processing_units.razao_social
        } : undefined,
      }));

      return mappedData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Query para buscar responsáveis por unidade de processamento
  const getResponsiblesByUnit = (unitId: string) => {
    return useQuery({
      queryKey: ['sector-responsibles', 'by-unit', unitId],
      queryFn: async (): Promise<SectorResponsible[]> => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('Usuário não autenticado');
        }

        const { data, error } = await supabase
          .from('sector_responsibles')
          .select(`
          *,
          processing_units(
            id,
            razao_social
          )
        `)
          .eq('processing_unit_id', unitId)
          .order('name', { ascending: true });

        if (error) {
          console.error('Erro ao buscar responsáveis por unidade:', error);
          throw new Error('Erro ao carregar responsáveis da unidade');
        }

        // Mapear os dados do banco para o tipo SectorResponsible
        const mappedData = (data || []).map(item => ({
          id: item.id,
          user_id: item.user_id,
          nome: item.name,
          unidade: item.processing_units?.razao_social || '',
          processing_unit_id: item.processing_unit_id,
          setor_departamento: item.department,
          whatsapp: item.whatsapp,
          link_whatsapp: item.link_whatsapp,
          created_at: item.created_at,
          updated_at: item.updated_at,
          processingUnit: item.processing_units ? {
            id: item.processing_units.id,
            razao_social: item.processing_units.razao_social
          } : undefined,
        }));

        return mappedData;
      },
      enabled: !!unitId,
      staleTime: 5 * 60 * 1000,
    });
  };

  // Mutation para criar novo responsável
  const createSectorResponsible = useMutation({
    mutationFn: async (data: CreateSectorResponsibleData): Promise<SectorResponsible> => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Gera o link do WhatsApp
      const whatsappLink = generateWhatsAppLink(data.whatsapp);

      let processingUnit = null;
      let processingUnitId = null;
      let unidadeNome = data.unidade;

      // Se não for "Todas", buscar a unidade específica
      if (data.unidade !== 'Todas' && data.processing_unit_id) {
        processingUnitId = data.processing_unit_id;
        const { data: unit } = await supabase
          .from('processing_units')
          .select('razao_social')
          .eq('id', processingUnitId)
          .single();
        processingUnit = unit;
        unidadeNome = unit?.razao_social || '';
      }

      // Mapear os dados para os nomes corretos das colunas do banco
      const responsibleData = {
        name: data.nome,
        nome: data.nome, // Campo obrigatório duplicado
        processing_unit_id: processingUnitId,
        department: data.setor_departamento,
        setor_departamento: data.setor_departamento, // Campo obrigatório duplicado
        unidade: unidadeNome, // Campo obrigatório
        whatsapp: data.whatsapp,
        user_id: user.id,
        link_whatsapp: whatsappLink,
      };

      const { data: newResponsible, error } = await supabase
        .from('sector_responsibles')
        .insert([responsibleData])
        .select(`
          *,
          processing_units(
            id,
            razao_social
          )
        `)
        .single();

      if (error) {
        console.error('Erro ao criar responsável:', error);
        
        if (error.code === '42501') {
          throw new Error('Você não tem permissão para criar responsáveis');
        }
        
        if (error.code === '23503') {
          throw new Error('Unidade de processamento não encontrada');
        }
        
        throw new Error('Erro ao criar responsável');
      }

      // Mapear os dados do banco para o tipo SectorResponsible
      const mappedResponsible = {
        id: newResponsible.id,
        user_id: newResponsible.user_id,
        nome: newResponsible.name,
        unidade: newResponsible.processing_units?.razao_social || newResponsible.unidade || '',
        processing_unit_id: newResponsible.processing_unit_id,
        setor_departamento: newResponsible.department,
        whatsapp: newResponsible.whatsapp,
        link_whatsapp: newResponsible.link_whatsapp,
        created_at: newResponsible.created_at,
        updated_at: newResponsible.updated_at,
        processingUnit: newResponsible.processing_units ? {
          id: newResponsible.processing_units.id,
          razao_social: newResponsible.processing_units.razao_social
        } : undefined,
      };

      return mappedResponsible;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sector-responsibles'] });
      toast({
        title: 'Sucesso',
        description: 'Responsável criado com sucesso!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation para atualizar responsável
  const updateSectorResponsible = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSectorResponsibleData }): Promise<SectorResponsible> => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Mapear os dados para os nomes corretos das colunas do banco
      const updateData: any = {};
      if (data.nome) updateData.name = data.nome;
      
      // Tratar processing_unit_id corretamente
      if (data.processing_unit_id) {
        // Se for 'Todas' ou 'todas', definir como null
        if (data.processing_unit_id === 'Todas' || data.processing_unit_id === 'todas') {
          updateData.processing_unit_id = null;
        } else {
          updateData.processing_unit_id = data.processing_unit_id;
        }
      }
      
      // Tratar unidade corretamente (não sobrescrever processing_unit_id)
      if (data.unidade && data.unidade !== 'Todas' && data.unidade !== 'todas') {
        updateData.processing_unit_id = data.unidade;
      } else if (data.unidade === 'Todas' || data.unidade === 'todas') {
        updateData.processing_unit_id = null;
      }
      
      if (data.setor_departamento) updateData.department = data.setor_departamento;
      if (data.whatsapp) {
        updateData.whatsapp = data.whatsapp;
        updateData.link_whatsapp = generateWhatsAppLink(data.whatsapp);
      }
      if (data.link_whatsapp) updateData.link_whatsapp = data.link_whatsapp;

      const { data: updatedResponsible, error } = await supabase
        .from('sector_responsibles')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          processing_units(
            id,
            razao_social
          )
        `)
        .single();

      if (error) {
        console.error('Erro ao atualizar responsável:', error);
        
        if (error.code === '42501') {
          throw new Error('Você não tem permissão para atualizar este responsável');
        }
        
        if (error.code === '23503') {
          throw new Error('Unidade de processamento não encontrada');
        }
        
        throw new Error('Erro ao atualizar responsável');
      }

      // Mapear os dados do banco para o tipo SectorResponsible
      const mappedResponsible = {
        id: updatedResponsible.id,
        user_id: updatedResponsible.user_id,
        nome: updatedResponsible.name,
        unidade: updatedResponsible.processing_units?.razao_social || '',
        processing_unit_id: updatedResponsible.processing_unit_id,
        setor_departamento: updatedResponsible.department,
        whatsapp: updatedResponsible.whatsapp,
        link_whatsapp: updatedResponsible.link_whatsapp,
        created_at: updatedResponsible.created_at,
        updated_at: updatedResponsible.updated_at,
        processingUnit: updatedResponsible.processing_units ? {
          id: updatedResponsible.processing_units.id,
          razao_social: updatedResponsible.processing_units.razao_social
        } : undefined,
      };

      return mappedResponsible;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sector-responsibles'] });
      toast({
        title: 'Sucesso',
        description: 'Responsável atualizado com sucesso!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation para deletar responsável
  const deleteSectorResponsible = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { error } = await supabase
        .from('sector_responsibles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar responsável:', error);
        
        if (error.code === '42501') {
          throw new Error('Você não tem permissão para deletar este responsável');
        }
        
        throw new Error('Erro ao deletar responsável');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sector-responsibles'] });
      toast({
        title: 'Sucesso',
        description: 'Responsável deletado com sucesso!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    sectorResponsibles,
    isLoading,
    error,
    refetch,
    getResponsiblesByUnit,
    createSectorResponsible: createSectorResponsible.mutate,
    updateSectorResponsible: updateSectorResponsible.mutate,
    deleteSectorResponsible: deleteSectorResponsible.mutate,
    isCreating: createSectorResponsible.isPending,
    isUpdating: updateSectorResponsible.isPending,
    isDeleting: deleteSectorResponsible.isPending,
  };
}