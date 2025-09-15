
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateWhatsAppLink, unformatPhoneNumber } from '@/lib/utils';

export interface ComercialRepresentative {
  id: string;
  user_id: string;
  nome_completo: string;
  telefone: string;
  link_whatsapp?: string;
  escritorio: string;
  cidades_atendidas: string[];
  estado?: string;
  tipo: 'representante' | 'broker';
  status: 'ativo' | 'inativo';
  created_at: string;
  updated_at: string;
}

export interface CreateRepresentativeData {
  nome_completo: string;
  telefone: string;
  escritorio: string;
  cidades_atendidas: string[];
  estado?: string;
  tipo: 'representante' | 'broker';
  status: 'ativo' | 'inativo';
  link_whatsapp?: string;
}

export function useComercialRepresentatives() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateWhatsAppLinkDeprecated = (telefone: string) => {
    const cleanPhone = telefone.replace(/\D/g, '');
    
    // Check if number already has country code (55 for Brazil)
    if (cleanPhone.startsWith('55') && cleanPhone.length >= 12) {
      return `https://wa.me/${cleanPhone}`;
    }
    
    // Add Brazil country code (+55)
    return `https://wa.me/55${cleanPhone}`;
  };

  const { data: representatives, isLoading, error } = useQuery({
    queryKey: ['comercial-representatives'],
    queryFn: async () => {
      console.log('🔍 [REPRESENTATIVES DEBUG] Iniciando busca de representantes...');
      
      try {
        const { data, error } = await supabase
          .from('comercial_representatives')
          .select('*')
          .eq('status', 'ativo')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ [REPRESENTATIVES DEBUG] Erro ao buscar representantes:', error);
          throw error;
        }

        console.log('✅ [REPRESENTATIVES DEBUG] Representantes encontrados:', data?.length || 0);
        console.log('📊 [REPRESENTATIVES DEBUG] Dados dos representantes:', data);

        return data?.map(rep => ({
          ...rep,
          status: rep.status as 'ativo' | 'inativo',
          tipo: rep.tipo as 'representante' | 'broker',
          link_whatsapp: rep.link_whatsapp || generateWhatsAppLink(rep.telefone)
        })) || [];
      } catch (error) {
        console.error('Erro na query de representantes:', error);
        throw error;
      }
    },
  });

  // Query para obter estados únicos dos representantes cadastrados
  const { data: availableStates } = useQuery({
    queryKey: ['comercial-representatives-states'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('comercial_representatives')
          .select('estado')
          .not('estado', 'is', null);

        if (error) {
          console.error('Erro ao buscar estados:', error);
          throw error;
        }

        // Retorna array único de estados
        const states = [...new Set(data?.map(item => item.estado).filter(Boolean))];
        return states.sort();
      } catch (error) {
        console.error('Erro na query de estados:', error);
        return [];
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateRepresentativeData) => {
      console.log('Criando novo representante:', data);
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Usuário não autenticado');
        }

        const whatsappLink = data.link_whatsapp || generateWhatsAppLink(data.telefone);

        // Garantir que todos os campos sejam enviados corretamente
        const insertData = {
          user_id: user.id,
          nome_completo: data.nome_completo,
          telefone: data.telefone,
          escritorio: data.escritorio,
          cidades_atendidas: data.cidades_atendidas,
          estado: data.estado || null,
          tipo: data.tipo,
          status: data.status,
          link_whatsapp: whatsappLink,
        };

        console.log('Dados que serão inseridos:', insertData);

        const { data: newRep, error } = await supabase
          .from('comercial_representatives')
          .insert(insertData)
          .select()
          .single();

        if (error) {
          console.error('Erro ao criar representante:', error);
          throw error;
        }

        console.log('Representante criado com sucesso:', newRep);

        return {
          ...newRep,
          status: newRep.status as 'ativo' | 'inativo',
          tipo: newRep.tipo as 'representante' | 'broker'
        };
      } catch (error) {
        console.error('Erro na criação do representante:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comercial-representatives'] });
      queryClient.invalidateQueries({ queryKey: ['comercial-representatives-states'] });
      toast({
        title: 'Sucesso',
        description: 'Representante cadastrado com sucesso!',
      });
    },
    onError: (error: any) => {
      console.error('Erro na criação:', error);
      
      let errorMessage = 'Erro ao cadastrar representante.';
      
      // Verificar se é um erro de RLS/Permissão
      if (error.message?.includes('row-level security') || error.message?.includes('policy')) {
        errorMessage = 'Você não tem permissão para cadastrar representantes. Contate um administrador.';
      }
      
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateRepresentativeData> }) => {
      console.log('Atualizando representante:', id, data);
      
      try {
        const updateData: any = {
          nome_completo: data.nome_completo,
          telefone: data.telefone,
          escritorio: data.escritorio,
          cidades_atendidas: data.cidades_atendidas,
          estado: data.estado || null,
          tipo: data.tipo,
          status: data.status,
          updated_at: new Date().toISOString(),
        };

        if (data.telefone) {
          updateData.link_whatsapp = data.link_whatsapp || generateWhatsAppLink(data.telefone);
        }

        console.log('Dados de atualização:', updateData);

        const { error } = await supabase
          .from('comercial_representatives')
          .update(updateData)
          .eq('id', id);

        if (error) {
          console.error('Erro ao atualizar representante:', error);
          throw error;
        }

        console.log('Representante atualizado com sucesso');
      } catch (error) {
        console.error('Erro na atualização do representante:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comercial-representatives'] });
      queryClient.invalidateQueries({ queryKey: ['comercial-representatives-states'] });
      toast({
        title: 'Sucesso',
        description: 'Representante atualizado com sucesso!',
      });
    },
    onError: (error: any) => {
      console.error('Erro na atualização:', error);
      
      let errorMessage = 'Erro ao atualizar representante.';
      
      if (error.message?.includes('row-level security') || error.message?.includes('policy')) {
        errorMessage = 'Você não tem permissão para atualizar representantes. Contate um administrador.';
      }
      
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deletando representante:', id);
      
      try {
        const { error } = await supabase
          .from('comercial_representatives')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Erro ao deletar representante:', error);
          throw error;
        }

        console.log('Representante deletado com sucesso');
      } catch (error) {
        console.error('Erro na exclusão do representante:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comercial-representatives'] });
      queryClient.invalidateQueries({ queryKey: ['comercial-representatives-states'] });
      toast({
        title: 'Sucesso',
        description: 'Representante removido com sucesso!',
      });
    },
    onError: (error: any) => {
      console.error('Erro na exclusão:', error);
      
      let errorMessage = 'Erro ao remover representante.';
      
      if (error.message?.includes('row-level security') || error.message?.includes('policy')) {
        errorMessage = 'Você não tem permissão para remover representantes. Contate um administrador.';
      }
      
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  return {
    representatives: representatives || [],
    availableStates: availableStates || [],
    isLoading,
    error,
    createRepresentative: createMutation.mutate,
    updateRepresentative: updateMutation.mutate,
    deleteRepresentative: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
