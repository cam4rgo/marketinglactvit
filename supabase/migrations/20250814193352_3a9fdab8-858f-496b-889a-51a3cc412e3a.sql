
-- Criar tabela para armazenar publicações para aprovação
CREATE TABLE public.approval_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('reel', 'post', 'carousel', 'story')),
  platform TEXT NOT NULL DEFAULT 'instagram' CHECK (platform IN ('instagram', 'facebook', 'tiktok')),
  content_caption TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revision_requested')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  deadline TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para armazenar arquivos de mídia das publicações
CREATE TABLE public.approval_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.approval_posts(id) ON DELETE CASCADE NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video')),
  file_size INTEGER,
  mime_type TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para comentários e feedbacks
CREATE TABLE public.approval_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.approval_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar storage bucket para mídia das aprovações
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'approval-media',
  'approval-media',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm']
);

-- RLS policies para approval_posts
ALTER TABLE public.approval_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all posts for approval" 
  ON public.approval_posts 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own posts" 
  ON public.approval_posts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts or approve others" 
  ON public.approval_posts 
  FOR UPDATE 
  USING (auth.uid() = user_id OR auth.uid() = approved_by);

-- RLS policies para approval_media
ALTER TABLE public.approval_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all media" 
  ON public.approval_media 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage media for their posts" 
  ON public.approval_media 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.approval_posts 
      WHERE id = approval_media.post_id 
      AND user_id = auth.uid()
    )
  );

-- RLS policies para approval_comments
ALTER TABLE public.approval_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all comments" 
  ON public.approval_comments 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create comments" 
  ON public.approval_comments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS policies para storage
CREATE POLICY "Users can view approval media" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'approval-media');

CREATE POLICY "Users can upload approval media" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'approval-media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own media" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'approval-media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own media" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'approval-media' AND auth.uid() IS NOT NULL);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_approval_posts_updated_at
  BEFORE UPDATE ON public.approval_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
