
-- Criar tabela para links de aprovação públicos
CREATE TABLE IF NOT EXISTS public.approval_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.approval_posts(id) ON DELETE CASCADE NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_approval_links_token ON public.approval_links(token);
CREATE INDEX IF NOT EXISTS idx_approval_links_expires_at ON public.approval_links(expires_at);
CREATE INDEX IF NOT EXISTS idx_approval_links_post_id ON public.approval_links(post_id);

-- RLS policies para links de aprovação
ALTER TABLE public.approval_links ENABLE ROW LEVEL SECURITY;

-- Usuários autenticados podem criar links para seus próprios posts
DROP POLICY IF EXISTS "Users can create approval links for their posts" ON public.approval_links;
CREATE POLICY "Users can create approval links for their posts" 
  ON public.approval_links 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.approval_posts 
      WHERE id = post_id AND user_id = auth.uid()
    )
  );

-- Todos podem visualizar links ativos e não expirados (acesso público)
DROP POLICY IF EXISTS "Public can view active approval links" ON public.approval_links;
CREATE POLICY "Public can view active approval links" 
  ON public.approval_links 
  FOR SELECT 
  USING (is_active = true AND expires_at > now());

-- Apenas criadores podem atualizar seus links
DROP POLICY IF EXISTS "Users can update their own approval links" ON public.approval_links;
CREATE POLICY "Users can update their own approval links" 
  ON public.approval_links 
  FOR UPDATE 
  USING (created_by = auth.uid());

-- Apenas criadores e admins podem deletar links
DROP POLICY IF EXISTS "Users can delete their own approval links" ON public.approval_links;
CREATE POLICY "Users can delete their own approval links" 
  ON public.approval_links 
  FOR DELETE 
  USING (
    created_by = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Habilitar extensão pgcrypto se não existir
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Função para gerar token único
CREATE OR REPLACE FUNCTION generate_approval_token()
RETURNS TEXT
LANGUAGE sql
AS $$
  SELECT md5(random()::text || clock_timestamp()::text);
$$;

-- Trigger para limpar links expirados automaticamente
CREATE OR REPLACE FUNCTION cleanup_expired_approval_links()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.approval_links 
  SET is_active = false 
  WHERE expires_at < now() AND is_active = true;
$$;
