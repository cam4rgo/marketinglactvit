
-- Criar tabela para perfis de empresa
CREATE TABLE IF NOT EXISTS public.company_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  company_name TEXT NOT NULL,
  instagram_username TEXT NOT NULL,
  profile_image_url TEXT,
  bio TEXT,
  website TEXT,
  followers_count INTEGER NOT NULL DEFAULT 0,
  following_count INTEGER NOT NULL DEFAULT 0,
  posts_count INTEGER NOT NULL DEFAULT 0,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Users can view their own company profile" ON public.company_profiles;
CREATE POLICY "Users can view their own company profile" 
  ON public.company_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own company profile" ON public.company_profiles;
CREATE POLICY "Users can create their own company profile" 
  ON public.company_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own company profile" ON public.company_profiles;
CREATE POLICY "Users can update their own company profile" 
  ON public.company_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own company profile" ON public.company_profiles;
CREATE POLICY "Users can delete their own company profile" 
  ON public.company_profiles 
  FOR DELETE 
  USING (auth.uid() = user_id);
