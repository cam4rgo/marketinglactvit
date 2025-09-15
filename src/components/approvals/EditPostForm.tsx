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
import { CalendarIcon, Instagram, X, Upload, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useUpdateApprovalPostContent, ApprovalPost, ApprovalMedia, getMediaUrl } from '@/hooks/useApprovalPosts';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

interface EditPostFormProps {
  post: ApprovalPost;
  onSuccess?: () => void;
  onCancel?: () => void;
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

export const EditPostForm = ({ post, onSuccess, onCancel }: EditPostFormProps) => {
  const [newFiles, setNewFiles] = React.useState<File[]>([]);
  const [keepExistingMedia, setKeepExistingMedia] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const updatePostMutation = useUpdateApprovalPostContent();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: post.title || "",
      type: post.type || 'post',
      platform: 'instagram',
      content_caption: post.content_caption || "",
      priority: post.priority || 'medium',
      deadline: post.deadline ? new Date(post.deadline) : undefined,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    console.log('Files selected:', selectedFiles.length);
    setNewFiles(selectedFiles);
  };

  const removeNewFile = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    console.log('Updating post with values:', values);
    console.log('New files to upload:', newFiles.length);
    console.log('Keep existing media:', keepExistingMedia);
    
    try {
      const postData = {
        title: values.title,
        type: values.type,
        platform: values.platform,
        content_caption: values.content_caption || undefined,
        priority: values.priority,
        deadline: values.deadline ? values.deadline.toISOString().split('T')[0] : undefined,
      };
      
      console.log('Updating data:', { postId: post.id, postData, newFiles, keepExistingMedia });
      await updatePostMutation.mutateAsync({ 
        postId: post.id, 
        postData, 
        newFiles,
        keepExistingMedia 
      });
      
      console.log('Post updated successfully');
      toast.success('Post editado e reenviado para aprovação!');
      
      form.reset();
      setNewFiles([]);
      onSuccess?.();
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Erro ao editar post: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Informação sobre o status do post */}
      {post.status === 'rejected' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">Post Rejeitado</h3>
          <p className="text-sm text-red-700">
            {post.rejection_reason || 'Este post foi rejeitado e pode ser editado para reenvio.'}
          </p>
        </div>
      )}
      
      {post.status === 'pending' && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Post Pendente</h3>
          <p className="text-sm text-yellow-700">
            Este post está aguardando aprovação e pode ser editado.
          </p>
        </div>
      )}
      
      {post.status === 'revision_requested' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Post em Revisão</h3>
          <p className="text-sm text-blue-700">
            Este post possui comentários e pode ser editado para atender às solicitações.
          </p>
        </div>
      )}

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

          {/* Campo de plataforma fixo como Instagram */}
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

          {/* Mídia existente */}
          {post.media && post.media.length > 0 && (
            <div className="space-y-3">
              <FormLabel>Mídia Atual</FormLabel>
              <div className="grid gap-3 max-h-40 overflow-y-auto">
                {post.media.map((media, index) => (
                  <div key={media.id} className="flex items-center gap-3 p-3 bg-muted rounded-md border">
                    <div className="text-lg">
                      {media.file_type === 'image' ? '📸' : '🎥'}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium truncate max-w-[200px] block">
                        {media.file_path.split('/').pop()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {media.mime_type} • {media.file_size ? (media.file_size / 1024 / 1024).toFixed(1) + ' MB' : 'Tamanho desconhecido'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="keepMedia" 
                  checked={keepExistingMedia}
                  onCheckedChange={(checked) => setKeepExistingMedia(checked === true)}
                />
                <label 
                  htmlFor="keepMedia" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Manter mídia existente
                </label>
              </div>
              <FormDescription>
                Desmarque para substituir toda a mídia existente pelos novos arquivos.
              </FormDescription>
            </div>
          )}

          {/* Novos arquivos de mídia */}
          <div className="space-y-2">
            <FormLabel htmlFor="newMediaFiles">
              {keepExistingMedia ? 'Adicionar novos arquivos' : 'Novos arquivos de mídia'}
            </FormLabel>
            <FormControl>
              <Input
                id="newMediaFiles"
                type="file"
                multiple
                onChange={handleFileChange}
                accept="image/*,video/*"
                className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </FormControl>
            {newFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {newFiles.length} novo(s) arquivo(s) selecionado(s):
                </p>
                <div className="grid gap-2 max-h-32 overflow-y-auto">
                  {newFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
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
                        onClick={() => removeNewFile(index)}
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
              {keepExistingMedia 
                ? 'Adicione novos arquivos que serão incluídos junto com a mídia existente.' 
                : 'Selecione os arquivos que substituirão toda a mídia existente.'}
            </FormDescription>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting || updatePostMutation.isPending} 
              className="flex-1"
            >
              {isSubmitting || updatePostMutation.isPending ? "Salvando..." : "Salvar e Reenviar"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting || updatePostMutation.isPending}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};