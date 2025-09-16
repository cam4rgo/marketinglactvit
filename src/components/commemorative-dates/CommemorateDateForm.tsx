import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EnhancedDatePicker } from '@/components/ui/enhanced-date-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn, createLocalDate, formatDateToString } from '@/lib/utils';
import {
  CommemorativeDate,
  CreateCommemorateDateData,
  UpdateCommemorateDateData,
  PostType,
} from '@/types/commemorative-dates';

const formSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(100, 'Título deve ter no máximo 100 caracteres'),
  description: z.string().optional(),
  date: z.date({ required_error: 'Data é obrigatória' }),
  is_mandatory: z.boolean(),
  post_type: z.enum(['feed', 'story'], {
    required_error: 'Tipo de post é obrigatório',
  }),
});

type FormData = z.infer<typeof formSchema>;

interface CommemorateDateFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCommemorateDateData | UpdateCommemorateDateData) => void;
  commemorativeDate?: CommemorativeDate;
  isLoading?: boolean;
}

export const CommemorateDateForm: React.FC<CommemorateDateFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  commemorativeDate,
  isLoading = false,
}) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      date: undefined,
      is_mandatory: false,
      post_type: 'feed',
    },
  });

  // Reset form when dialog opens or commemorativeDate changes
  useEffect(() => {
    if (isOpen) {
      if (commemorativeDate) {
        // Editing existing date
        form.reset({
          title: commemorativeDate.title,
          description: commemorativeDate.description || '',
          date: createLocalDate(commemorativeDate.date),
          is_mandatory: commemorativeDate.is_mandatory,
          post_type: commemorativeDate.post_type,
        });
      } else {
        // Creating new date - ensure form is completely clean
        form.reset({
          title: '',
          description: '',
          date: undefined,
          is_mandatory: false,
          post_type: 'feed',
        });
      }
    }
  }, [isOpen, commemorativeDate, form]);

  const handleSubmit = (data: FormData) => {
    try {
      console.log('📝 [DEBUG] Formulário submetido');
      console.log('📋 [DEBUG] Dados originais do formulário:', data);
      console.log('✏️ [DEBUG] Modo de edição:', !!commemorativeDate);
      console.log('🆔 [DEBUG] ID da data sendo editada:', commemorativeDate?.id);
      
      if (!data.date) {
        return;
      }
      
      const formattedDate = formatDateToString(data.date);
      
      const submitData = {
        title: data.title,
        description: data.description || undefined,
        date: formattedDate,
        is_mandatory: data.is_mandatory,
        post_type: data.post_type,
      };
      
      console.log('📤 [DEBUG] Dados formatados para envio:', submitData);
      console.log('📅 [DEBUG] Data formatada:', formattedDate);
      
      onSubmit(submitData);
    } catch (error) {
      console.error('Erro ao processar formulário:', error);
    }
  };

  const handleClose = () => {
    // Reset form to default values when closing
    form.reset({
      title: '',
      description: '',
      date: undefined,
      is_mandatory: false,
      post_type: 'feed',
    });
    setIsDatePickerOpen(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[500px] max-h-[95vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle>
            {commemorativeDate ? 'Editar Data Comemorativa' : 'Nova Data Comemorativa'}
          </DialogTitle>
          <DialogDescription>
            {commemorativeDate
              ? 'Edite as informações da data comemorativa.'
              : 'Adicione uma nova data comemorativa ao seu calendário de conteúdo.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Dia das Mães"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva a data comemorativa e ideias para o conteúdo..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Adicione detalhes sobre a data e sugestões de conteúdo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data *</FormLabel>
                  <Popover open={isDatePickerOpen} onOpenChange={(open) => {
                    setIsDatePickerOpen(open);
                  }}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal h-10',
                            !field.value && 'text-muted-foreground'
                          )}
                          onClick={() => setIsDatePickerOpen(true)}
                        >
                          {field.value ? (
                            <div className="flex items-center justify-between w-full">
                              <span className="font-medium">
                                {format(field.value, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(field.value, 'EEEE', { locale: ptBR })}
                              </span>
                            </div>
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50 shrink-0" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4" align="start" style={{zIndex: 9999}}>
                      <EnhancedDatePicker
                        selected={field.value}
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(date);
                            setIsDatePickerOpen(false);
                          }
                        }}
                        disabled={(date) =>
                          date < new Date('1900-01-01')
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Use os seletores de ano e mês para navegar rapidamente até a data desejada.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="post_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Post *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de post" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="feed">Feed</SelectItem>
                      <SelectItem value="story">Story</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Escolha o formato de post mais adequado para esta data.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_mandatory"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Data Obrigatória
                    </FormLabel>
                    <FormDescription>
                      Marque se esta data é obrigatória no planejamento de conteúdo.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? 'Salvando...'
                  : commemorativeDate
                  ? 'Atualizar'
                  : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};