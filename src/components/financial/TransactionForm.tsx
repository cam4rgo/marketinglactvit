
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useCreateTransaction, useUpdateTransaction, type Transaction } from '@/hooks/useFinancialTransactions';
import { useFinancialCategories } from '@/hooks/useFinancialCategories';
import { toast } from 'sonner';

const transactionSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  type: z.enum(['expense']),
  category: z.string().min(1, 'Categoria é obrigatória'),
  status: z.enum(['pending', 'confirmed', 'cancelled']),
  transaction_date: z.date({ required_error: 'Data é obrigatória' }),
  notes: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  transaction?: Transaction;
  onClose: () => void;
}

const statusLabels = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado'
};

export const TransactionForm: React.FC<TransactionFormProps> = ({ transaction, onClose }) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const { data: categories, isLoading: categoriesLoading } = useFinancialCategories();

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: transaction?.description || '',
      amount: transaction?.amount ? Number(transaction.amount) : 0,
      type: 'expense',
      category: transaction?.category || '',
      status: (transaction?.status as 'pending' | 'confirmed' | 'cancelled') || 'pending',
      transaction_date: transaction?.transaction_date ? new Date(transaction.transaction_date) : new Date(),
      notes: transaction?.notes || '',
    },
  });

  const onSubmit = async (data: TransactionFormData) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    console.log('Submitting transaction:', data);
    
    try {
      const transactionData = {
        description: data.description.trim(),
        amount: Number(data.amount),
        type: data.type,
        category: data.category,
        status: data.status,
        transaction_date: data.transaction_date.toISOString().split('T')[0],
        notes: data.notes?.trim() || undefined,
      };

      console.log('Transaction data to submit:', transactionData);

      if (transaction) {
        await updateTransaction.mutateAsync(
          { id: transaction.id, ...transactionData }
        );
        toast.success('Transação atualizada com sucesso!');
      } else {
        await createTransaction.mutateAsync(transactionData);
        toast.success('Transação criada com sucesso!');
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao salvar transação: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter categories to show only expense categories
  const filteredCategories = React.useMemo(() => {
    if (!categories) return [];
    return categories.filter(cat => cat.type === 'expense');
  }, [categories]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição *</FormLabel>
              <FormControl>
                <Input placeholder="Descrição da despesa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => {
              const [displayValue, setDisplayValue] = React.useState(
                field.value ? field.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''
              );

              const formatCurrency = (value: number) => {
                return new Intl.NumberFormat('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }).format(value);
              };

              const parseCurrency = (value: string) => {
                const cleanValue = value.replace(/[^\d,]/g, '').replace(',', '.');
                return parseFloat(cleanValue) || 0;
              };

              return (
                <FormItem>
                  <FormLabel>Valor *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0,00"
                      value={displayValue}
                      onChange={(e) => {
                        const rawValue = e.target.value;
                        setDisplayValue(rawValue);
                        
                        // Atualiza o valor numérico apenas quando válido
                        const numericValue = parseCurrency(rawValue);
                        if (!isNaN(numericValue) && numericValue >= 0.01) {
                          field.onChange(numericValue);
                        }
                      }}
                      onBlur={(e) => {
                        const numericValue = parseCurrency(e.target.value);
                        if (numericValue >= 0.01) {
                          field.onChange(numericValue);
                          setDisplayValue(formatCurrency(numericValue));
                        } else {
                          setDisplayValue('');
                          field.onChange(0);
                        }
                      }}
                      onFocus={(e) => {
                        if (field.value > 0) {
                          setDisplayValue(field.value.toString().replace('.', ','));
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="transaction_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Selecionar data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria *</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value} 
                disabled={categoriesLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      categoriesLoading ? "Carregando categorias..." : 
                      filteredCategories.length === 0 ? "Nenhuma categoria de despesa encontrada" :
                      "Selecione a categoria"
                    } />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded ${category.color}`} />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
              {filteredCategories.length === 0 && !categoriesLoading && (
                <p className="text-sm text-muted-foreground">
                  Crie uma categoria de despesa primeiro na seção de categorias.
                </p>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea placeholder="Observações adicionais (opcional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || createTransaction.isPending || updateTransaction.isPending || categoriesLoading}
          >
            {isSubmitting || createTransaction.isPending || updateTransaction.isPending
              ? 'Salvando...'
              : transaction
              ? 'Atualizar'
              : 'Criar'
            }
          </Button>
        </div>
      </form>
    </Form>
  );
};
