
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';
import { formatPhoneNumber, unformatPhoneNumber } from '@/lib/utils';
import type { ComercialRepresentative, CreateRepresentativeData } from '@/hooks/useComercialRepresentatives';

const formSchema = z.object({
  nome_completo: z.string().min(1, 'Nome completo é obrigatório'),
  telefone: z.string().min(14, 'Telefone deve estar no formato (XX) XXXXX-XXXX').max(15, 'Telefone inválido'),
  escritorio: z.string().min(1, 'Escritório é obrigatório'),
  estado: z.string().max(2, 'Estado deve ter no máximo 2 letras (UF)').optional().or(z.literal('')),
  tipo: z.enum(['representante', 'broker'], {
    required_error: 'Tipo é obrigatório',
  }),
  status: z.enum(['ativo', 'inativo'], {
    required_error: 'Status é obrigatório',
  }),
  cidades_atendidas: z.array(z.string()).min(1, 'Pelo menos uma cidade deve ser adicionada'),
});

interface RepresentativeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRepresentativeData) => void;
  representative?: ComercialRepresentative;
  isLoading: boolean;
}

export function RepresentativeForm({ isOpen, onClose, onSubmit, representative, isLoading }: RepresentativeFormProps) {
  const [newCity, setNewCity] = React.useState('');

  const form = useForm<CreateRepresentativeData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome_completo: '',
      telefone: '',
      escritorio: '',
      estado: '',
      tipo: 'representante',
      status: 'ativo',
      cidades_atendidas: [],
    },
  });

  React.useEffect(() => {
    if (representative) {
      console.log('Editando representante:', representative);
      form.reset({
        nome_completo: representative.nome_completo || '',
        telefone: representative.telefone || '',
        escritorio: representative.escritorio || '',
        estado: representative.estado || '',
        tipo: representative.tipo || 'representante',
        status: representative.status || 'ativo',
        cidades_atendidas: representative.cidades_atendidas || [],
      });
    } else if (isOpen) {
      console.log('Novo representante - resetando formulário');
      form.reset({
        nome_completo: '',
        telefone: '',
        escritorio: '',
        estado: '',
        tipo: 'representante',
        status: 'ativo',
        cidades_atendidas: [],
      });
      setNewCity('');
    }
  }, [representative, form, isOpen]);

  const handleSubmit = (data: CreateRepresentativeData) => {
    console.log('Submetendo dados do formulário:', data);
    
    // Garantir que todos os campos obrigatórios estejam preenchidos
    const submitData: CreateRepresentativeData = {
      nome_completo: data.nome_completo.trim(),
      telefone: data.telefone.trim(),
      escritorio: data.escritorio.trim(),
      estado: data.estado?.trim() || undefined,
      tipo: data.tipo,
      status: data.status,
      cidades_atendidas: data.cidades_atendidas.filter(city => city.trim().length > 0),
    };

    console.log('Dados processados para envio:', submitData);
    
    onSubmit(submitData);
  };

  const addCity = () => {
    if (newCity.trim()) {
      const currentCities = form.getValues('cidades_atendidas');
      // Separa as cidades por vírgula e processa cada uma
      const cities = newCity.split(',').map(city => city.trim()).filter(city => city.length > 0);
      const newCities = cities.filter(city => !currentCities.includes(city));
      
      if (newCities.length > 0) {
        form.setValue('cidades_atendidas', [...currentCities, ...newCities]);
        console.log('Cidades adicionadas:', newCities);
      }
      setNewCity('');
    }
  };

  const removeCity = (cityToRemove: string) => {
    const currentCities = form.getValues('cidades_atendidas');
    const updatedCities = currentCities.filter(city => city !== cityToRemove);
    form.setValue('cidades_atendidas', updatedCities);
    console.log('Cidade removida:', cityToRemove);
  };

  const watchedCities = form.watch('cidades_atendidas');
  const watchedTipo = form.watch('tipo');

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCity();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {representative ? `Editar ${watchedTipo}` : `Novo ${watchedTipo}`}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3 sm:space-y-4 p-1 sm:p-0">
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="representante">Representante</SelectItem>
                      <SelectItem value="broker">Broker</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nome_completo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="(11) 99999-9999" 
                        {...field}
                        onChange={(e) => {
                          const formatted = formatPhoneNumber(e.target.value);
                          field.onChange(formatted);
                        }}
                        maxLength={15}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado (UF)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: SP" 
                        maxLength={2}
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="escritorio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Escritório</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do escritório" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cidades_atendidas"
              render={() => (
                <FormItem>
                  <FormLabel>Cidades Atendidas</FormLabel>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        placeholder="Digite uma ou mais cidades (separadas por vírgula)"
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={addCity}
                        disabled={!newCity.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {watchedCities.map((city) => (
                        <Badge key={city} variant="secondary" className="flex items-center gap-1">
                          {city}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeCity(city)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Salvando...' : representative ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
