import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type FinancialTransaction = Database['public']['Tables']['financial_transactions']['Row'];
type FinancialTransactionInsert = Database['public']['Tables']['financial_transactions']['Insert'];
type FinancialTransactionUpdate = Database['public']['Tables']['financial_transactions']['Update'];

export interface Transaction extends FinancialTransaction {}

export interface TransactionFilters {
  type?: 'expense';
  category?: 'meta_ads' | 'google_ads' | 'instagram_ads' | 'content_creation' | 'influencer' | 'design' | 'tools_software' | 'consulting' | 'events' | 'other';
  status?: 'pending' | 'confirmed' | 'cancelled';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export const useFinancialTransactions = (filters?: TransactionFilters) => {
  return useQuery({
    queryKey: ['financial-transactions', filters],
    queryFn: async () => {
      let query = supabase
        .from('financial_transactions')
        .select('*')
        .order('transaction_date', { ascending: false });

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.dateFrom) {
        query = query.gte('transaction_date', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('transaction_date', filters.dateTo);
      }
      if (filters?.search) {
        query = query.ilike('description', `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data as Transaction[];
    },
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: Omit<FinancialTransactionInsert, 'user_id'>) => {
      console.log('Creating transaction with data:', transaction);
      
      // Verificar autenticação
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        console.error('User authentication failed:', authError);
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }

      console.log('User authenticated:', authData.user.id);

      // Preparar dados da transação - garantindo que category seja string
      const transactionData = {
        user_id: authData.user.id,
        description: transaction.description,
        amount: Number(transaction.amount),
        type: transaction.type,
        category: String(transaction.category), // Garantir que seja string
        status: transaction.status,
        transaction_date: transaction.transaction_date,
        notes: transaction.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Inserting transaction data:', transactionData);

      const { data, error } = await supabase
        .from('financial_transactions')
        .insert([transactionData])
        .select()
        .single();

      if (error) {
        console.error('Error creating transaction:', error);
        throw new Error(`Erro ao criar transação: ${error.message}`);
      }

      console.log('Transaction created successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Transaction creation mutation completed successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      toast.success('Transação criada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error in createTransaction mutation:', error);
      toast.error('Erro ao criar transação: ' + error.message);
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & FinancialTransactionUpdate) => {
      console.log('Updating transaction:', id, updates);
      
      const updateData = {
        ...updates,
        amount: updates.amount ? Number(updates.amount) : undefined,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('financial_transactions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating transaction:', error);
        throw new Error(`Erro ao atualizar transação: ${error.message}`);
      }

      console.log('Transaction updated successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Transaction update mutation completed successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      toast.success('Transação atualizada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error in updateTransaction mutation:', error);
      toast.error('Erro ao atualizar transação: ' + error.message);
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting transaction:', id);
      
      const { error } = await supabase
        .from('financial_transactions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting transaction:', error);
        throw new Error(`Erro ao excluir transação: ${error.message}`);
      }

      console.log('Transaction deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      toast.success('Transação excluída com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error in deleteTransaction mutation:', error);
      toast.error('Erro ao excluir transação: ' + error.message);
    },
  });
};

export const useFinancialSummary = () => {
  return useQuery({
    queryKey: ['financial-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_summary')
        .select('*');

      if (error) throw error;
      return data;
    },
  });
};
