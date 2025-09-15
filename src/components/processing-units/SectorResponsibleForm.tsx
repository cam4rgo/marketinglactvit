import React, { useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SectorResponsible, CreateSectorResponsibleData } from '@/types/processing-units';
import { ProcessingUnit } from '@/types/processing-units';
import { formatPhoneNumber } from '@/lib/utils';

const sectorResponsibleSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  processing_unit_id: z.string().min(1, 'Unidade é obrigatória'),
  setor_departamento: z.string().min(1, 'Setor/Departamento é obrigatório'),
  whatsapp: z.string()
    .min(1, 'WhatsApp é obrigatório')
    .regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, 'Formato de telefone inválido'),
});

type SectorResponsibleFormData = z.infer<typeof sectorResponsibleSchema>;

interface SectorResponsibleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSectorResponsibleData) => void;
  responsible?: SectorResponsible;
  isLoading: boolean;
  processingUnits: ProcessingUnit[];
}

export const SectorResponsibleForm: React.FC<SectorResponsibleFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  responsible,
  isLoading,
  processingUnits,
}) => {
  const form = useForm<SectorResponsibleFormData>({
    resolver: zodResolver(sectorResponsibleSchema),
    defaultValues: {
      nome: '',
      processing_unit_id: '',
      setor_departamento: '',
      whatsapp: '',
    },
  });

  const watchedWhatsapp = form.watch('whatsapp');

  useEffect(() => {
    if (responsible) {
      form.reset({
        nome: responsible.nome,
        processing_unit_id: responsible.unidade === 'Todas' ? 'todas' : responsible.processing_unit_id || '',
        setor_departamento: responsible.setor_departamento,
        whatsapp: responsible.whatsapp,
      });
    } else {
      form.reset({
        nome: '',
        processing_unit_id: '',
        setor_departamento: '',
        whatsapp: '',
      });
    }
  }, [responsible, form]);

  const handleFormSubmit = (data: SectorResponsibleFormData) => {
    const submitData: CreateSectorResponsibleData = {
      unidade: data.processing_unit_id === 'todas' ? 'Todas' : data.processing_unit_id,
      nome: data.nome,
      processing_unit_id: data.processing_unit_id === 'todas' ? undefined : data.processing_unit_id,
      setor_departamento: data.setor_departamento,
      whatsapp: data.whatsapp,
    };

    onSubmit(submitData);
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    form.setValue('whatsapp', formatted);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {responsible ? 'Editar Responsável' : 'Novo Responsável'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="flex flex-col md:flex-row md:flex-wrap gap-6">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem className="flex-1 min-w-[250px]">
                    <FormLabel>Nome *</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="processing_unit_id"
                render={({ field }) => (
                  <FormItem className="flex-1 min-w-[250px]">
                    <FormLabel>Unidade *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a unidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="todas">
                          Todas
                        </SelectItem>
                        {processingUnits.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.razao_social}
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
                name="setor_departamento"
                render={({ field }) => (
                  <FormItem className="flex-1 min-w-[250px]">
                    <FormLabel>Setor/Departamento *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Financeiro, RH, Produção"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem className="flex-1 min-w-[250px]">
                    <FormLabel>WhatsApp *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(11) 99999-9999"
                        value={watchedWhatsapp}
                        onChange={handleWhatsappChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Salvando...' : responsible ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};