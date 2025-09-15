import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { ProcessingUnit, CreateProcessingUnitData, UpdateProcessingUnitData } from '@/types/processing-units';

export function useProcessingUnits() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar todas as unidades de processamento
  const {
    data: processingUnits,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['processing-units'],
    queryFn: async (): Promise<ProcessingUnit[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('processing_units')
        .select(`
          id,
          razao_social,
          cnpj,
          email_financeiro,
          email_rh,
          endereco,
          tipo,
          user_id,
          created_at,
          updated_at
        `)
        .order('razao_social', { ascending: true });

      if (error) {
        console.error('Erro ao buscar unidades de processamento:', error);
        throw new Error('Erro ao carregar unidades de processamento');
      }

      return (data as ProcessingUnit[]) || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Mutation para criar nova unidade de processamento
  const createProcessingUnit = useMutation({
    mutationFn: async (data: CreateProcessingUnitData): Promise<ProcessingUnit> => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const processingUnitData = {
        user_id: user.id,
        razao_social: data.razao_social,
        cnpj: data.cnpj,
        email_financeiro: data.email_financeiro,
        email_rh: data.email_rh,
        endereco: data.endereco,
        tipo: data.tipo,
      };

      const { data: newProcessingUnit, error } = await supabase
        .from('processing_units')
        .insert([processingUnitData])
        .select(`
          id,
          razao_social,
          cnpj,
          email_financeiro,
          email_rh,
          endereco,
          tipo,
          user_id,
          created_at,
          updated_at
        `)
        .single();

      if (error) {
        console.error('Erro ao criar unidade de processamento:', error);
        
        if (error.code === '42501') {
          throw new Error('Você não tem permissão para criar unidades de processamento');
        }
        
        if (error.code === '23505') {
          throw new Error('CNPJ já cadastrado');
        }
        
        throw new Error('Erro ao criar unidade de processamento');
      }

      if (!newProcessingUnit) {
        throw new Error('Failed to create processing unit - no data returned');
      }
      return newProcessingUnit as unknown as ProcessingUnit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processing-units'] });
      toast({
        title: 'Sucesso',
        description: 'Unidade de processamento criada com sucesso!',
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

  // Mutation para atualizar unidade de processamento
  const updateProcessingUnit = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProcessingUnitData }): Promise<ProcessingUnit> => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Log para debug - verificar dados recebidos
      console.log('🔍 useProcessingUnits - Dados recebidos para atualização:', data);
      console.log('🔍 useProcessingUnits - ID da unidade:', id);
      console.log('🔍 useProcessingUnits - Tipo recebido:', data.tipo);

      // Mapear dados de entrada para os nomes corretos das colunas do banco
      const updateData: any = {};
      if (data.razao_social !== undefined) updateData.razao_social = data.razao_social;
      if (data.cnpj !== undefined) updateData.cnpj = data.cnpj;
      if (data.email_financeiro !== undefined) updateData.email_financeiro = data.email_financeiro;
      if (data.email_rh !== undefined) updateData.email_rh = data.email_rh;
      if (data.endereco !== undefined) updateData.endereco = data.endereco;
      if (data.tipo !== undefined) updateData.tipo = data.tipo;
      
      console.log('🔍 useProcessingUnits - Dados mapeados para o banco:', updateData);

      const { data: updatedProcessingUnit, error } = await supabase
        .from('processing_units')
        .update(updateData)
        .eq('id', id)
        .select(`
          id,
          razao_social,
          cnpj,
          email_financeiro,
          email_rh,
          endereco,
          tipo,
          user_id,
          created_at,
          updated_at
        `)
        .single();

      if (error) {
        console.error('Erro ao atualizar unidade de processamento:', error);
        
        if (error.code === '42501') {
          throw new Error('Você não tem permissão para atualizar esta unidade de processamento');
        }
        
        if (error.code === '23505') {
          throw new Error('CNPJ já cadastrado');
        }
        
        throw new Error('Erro ao atualizar unidade de processamento');
      }

      if (!updatedProcessingUnit) {
        throw new Error('Failed to update processing unit - no data returned');
      }
      return updatedProcessingUnit as ProcessingUnit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processing-units'] });
      toast({
        title: 'Sucesso',
        description: 'Unidade de processamento atualizada com sucesso!',
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

  // Mutation para deletar unidade de processamento
  const deleteProcessingUnit = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { error } = await supabase
        .from('processing_units')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar unidade de processamento:', error);
        
        if (error.code === '42501') {
          throw new Error('Você não tem permissão para deletar esta unidade de processamento');
        }
        
        if (error.code === '23503') {
          throw new Error('Não é possível deletar esta unidade pois existem responsáveis vinculados');
        }
        
        throw new Error('Erro ao deletar unidade de processamento');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processing-units'] });
      toast({
        title: 'Sucesso',
        description: 'Unidade de processamento deletada com sucesso!',
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
    processingUnits,
    isLoading,
    error,
    refetch,
    createProcessingUnit: createProcessingUnit.mutate,
    updateProcessingUnit: updateProcessingUnit.mutate,
    deleteProcessingUnit: deleteProcessingUnit.mutate,
    isCreating: createProcessingUnit.isPending,
    isUpdating: updateProcessingUnit.isPending,
    isDeleting: deleteProcessingUnit.isPending,
  };
}