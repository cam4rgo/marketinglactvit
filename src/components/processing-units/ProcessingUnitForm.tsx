import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ProcessingUnit, CreateProcessingUnitData, UpdateProcessingUnitData } from '@/types/processing-units';

// Schema de validação
const processingUnitSchema = z.object({
  razao_social: z.string().min(1, 'Razão social é obrigatória'),
  cnpj: z.string()
    .min(1, 'CNPJ é obrigatório')
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/, 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX ou apenas números'),
  email_financeiro: z.string()
    .min(1, 'Email financeiro é obrigatório')
    .email('Email financeiro deve ser válido'),
  email_rh: z.string()
    .min(1, 'Email RH é obrigatório')
    .email('Email RH deve ser válido'),
  address: z.string().min(1, 'Endereço é obrigatório'),
  tipo: z.enum(['Unidade de Processamento', 'Unidade Comercial'], {
    required_error: 'Tipo é obrigatório',
  }),
});

type ProcessingUnitFormData = z.infer<typeof processingUnitSchema>;

interface ProcessingUnitFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProcessingUnitData | UpdateProcessingUnitData) => void;
  processingUnit?: ProcessingUnit;
  isLoading?: boolean;
}

export function ProcessingUnitForm({
  isOpen,
  onClose,
  onSubmit,
  processingUnit,
  isLoading = false,
}: ProcessingUnitFormProps) {
  const form = useForm<ProcessingUnitFormData>({
    resolver: zodResolver(processingUnitSchema),
    defaultValues: {
      razao_social: '',
      cnpj: '',
      email_financeiro: '',
      email_rh: '',
      address: '',
      tipo: 'Unidade de Processamento' as const,
    },
  });

  // Reseta o formulário quando o processingUnit muda (para edição)
  React.useEffect(() => {
    if (processingUnit) {
      form.reset({
        razao_social: processingUnit.razao_social,
        cnpj: processingUnit.cnpj,
        email_financeiro: processingUnit.email_financeiro,
        email_rh: processingUnit.email_rh,
        address: processingUnit.endereco,
        tipo: processingUnit.tipo,
      });
    } else {
      form.reset({
        razao_social: '',
        cnpj: '',
        email_financeiro: '',
        email_rh: '',
        address: '',
        tipo: 'Unidade de Processamento' as const,
      });
    }
  }, [processingUnit, form]);

  const handleSubmit = (data: ProcessingUnitFormData) => {
    // Formata o CNPJ removendo caracteres especiais para salvar no banco
    // e mapeia 'address' para 'endereco' para compatibilidade com o banco
    const formattedData = {
      ...data,
      cnpj: data.cnpj.replace(/\D/g, ''),
      endereco: data.address, // Mapear address para endereco
      tipo: data.tipo,
    };
    
    // Remove o campo address já que foi mapeado para endereco
    delete (formattedData as any).address;
    
    // Log para debug - verificar dados antes de enviar
    console.log('🔍 ProcessingUnitForm - Dados do formulário:', data);
    console.log('🔍 ProcessingUnitForm - Dados formatados:', formattedData);
    console.log('🔍 ProcessingUnitForm - Tipo enviado:', formattedData.tipo);
    
    onSubmit(formattedData);
  };

  // Função para formatar CNPJ durante a digitação
  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 14) {
      return numbers.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        '$1.$2.$3/$4-$5'
      );
    }
    return value;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {processingUnit ? 'Editar Unidade de Processamento' : 'Nova Unidade de Processamento'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="razao_social"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razão Social *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite a razão social"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo da unidade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Unidade de Processamento">Unidade de Processamento</SelectItem>
                      <SelectItem value="Unidade Comercial">Unidade Comercial</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="XX.XXX.XXX/XXXX-XX"
                      {...field}
                      onChange={(e) => {
                        const formatted = formatCNPJ(e.target.value);
                        field.onChange(formatted);
                      }}
                      disabled={isLoading}
                      maxLength={18}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col md:flex-row gap-4">
              <FormField
                control={form.control}
                name="email_financeiro"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Email Financeiro *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="financeiro@empresa.com"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email_rh"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Email RH *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="rh@empresa.com"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite o endereço completo"
                      className="min-h-[100px]"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Salvando...' : processingUnit ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}