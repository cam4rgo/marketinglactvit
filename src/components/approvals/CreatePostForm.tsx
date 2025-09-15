import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Instagram, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useCreateApprovalPost } from '@/hooks/useApprovalPosts';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface CreatePostFormProps {
  onSuccess?: () => void;
}

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Título deve ter pelo menos 3 caracteres.",
  }),
  type: z.enum(['reel', 'post', 'carousel', 'story']),
  platform: z.literal('instagram'),
  content_caption: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  deadline: z.date().optional(),
});

export const CreatePostForm = ({ onSuccess }: CreatePostFormProps) => {
  const [files, setFiles] = React.useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const createPostMutation = useCreateApprovalPost();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: 'post',
      platform: 'instagram',
      content_caption: "",
      priority: 'medium',
      deadline: undefined,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    console.log('Files selected:', selectedFiles.length);
    setFiles(selectedFiles);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    console.log('Submitting form with values:', values);
    console.log('Files to upload:', files.length);
    
    try {
      const postData = {
        title: values.title,
        type: values.type,
        platform: values.platform,
        content_caption: values.content_caption || undefined,
        priority: values.priority,
        deadline: values.deadline ? values.deadline.toISOString().split('T')[0] : undefined,
        status: 'pending' as const,
      };
      
      console.log('Submitting data:', { post: postData, files });
      await createPostMutation.mutateAsync({ post: postData, files });
      
      console.log('Post created successfully');
      toast.success('Publicação criada com sucesso!');
      
      form.reset();
      setFiles([]);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Erro ao criar publicação: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título *</FormLabel>
              <FormControl>
                <Input placeholder="Título da publicação" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo de plataforma removido - agora é fixo como Instagram */}
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Instagram className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Plataforma: Instagram</span>
        </div>

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="post">Post</SelectItem>
                  <SelectItem value="reel">Reel</SelectItem>
                  <SelectItem value="carousel">Carrossel</SelectItem>
                  <SelectItem value="story">Story</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content_caption"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Legenda</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Escreva a legenda da publicação"
                  className="min-h-[100px]"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Use quebras de linha para organizar sua legenda.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prioridade *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deadline"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Prazo</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        field.value.toLocaleDateString('pt-BR')
                      ) : (
                        <span>Escolha uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[200]" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Data limite para a publicação.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel htmlFor="mediaFiles">Arquivos de mídia</FormLabel>
          <FormControl>
            <Input
              id="mediaFiles"
              type="file"
              multiple
              onChange={handleFileChange}
              accept="image/*,video/*"
              className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </FormControl>
          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {files.length} arquivo(s) selecionado(s):
              </p>
              <div className="grid gap-2 max-h-32 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md border">
                    <div className="flex items-center gap-3">
                      <div className="text-lg">
                        {file.type.startsWith('image/') ? '📸' : '🎥'}
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-medium truncate max-w-[200px] block">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {file.type} • {(file.size / 1024 / 1024).toFixed(1)} MB
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <FormDescription>
            Adicione imagens ou vídeos para a publicação. Formatos aceitos: JPG, PNG, GIF, MP4, MOV.
          </FormDescription>
        </div>

        <Button type="submit" disabled={isSubmitting || createPostMutation.isPending} className="w-full">
          {createPostMutation.isPending ? 'Criando...' : 'Criar Post'}
        </Button>
      </form>
    </Form>
  );
};
