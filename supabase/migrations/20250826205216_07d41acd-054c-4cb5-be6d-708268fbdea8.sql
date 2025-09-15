
-- Create api_integrations table
CREATE TABLE IF NOT EXISTS public.api_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  integration_type TEXT NOT NULL CHECK (integration_type IN ('meta_ads', 'instagram_analytics')),
  api_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'error', 'expired')),
  last_validated_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create approval_posts table
CREATE TABLE public.approval_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('reel', 'post', 'carousel', 'story')),
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'tiktok')),
  content_caption TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revision_requested')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  deadline TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create approval_media table
CREATE TABLE public.approval_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.approval_posts(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video')),
  file_size BIGINT,
  mime_type TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create approval_comments table
CREATE TABLE public.approval_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.approval_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.api_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for api_integrations
CREATE POLICY "Users can view their own integrations" ON public.api_integrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own integrations" ON public.api_integrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integrations" ON public.api_integrations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integrations" ON public.api_integrations
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for approval_posts
CREATE POLICY "Users can view all approval posts" ON public.approval_posts
  FOR SELECT USING (true);

CREATE POLICY "Users can create approval posts" ON public.approval_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update approval posts" ON public.approval_posts
  FOR UPDATE USING (true);

-- Create RLS policies for approval_media
CREATE POLICY "Users can view all approval media" ON public.approval_media
  FOR SELECT USING (true);

CREATE POLICY "Users can create approval media" ON public.approval_media
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.approval_posts 
      WHERE id = post_id AND user_id = auth.uid()
    )
  );

-- Create RLS policies for approval_comments
CREATE POLICY "Users can view all approval comments" ON public.approval_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create approval comments" ON public.approval_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for approval media
INSERT INTO storage.buckets (id, name, public)
VALUES ('approval-media', 'approval-media', true);

-- Create storage policy for approval media
CREATE POLICY "Users can upload approval media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'approval-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Public access to approval media" ON storage.objects
  FOR SELECT USING (bucket_id = 'approval-media');
