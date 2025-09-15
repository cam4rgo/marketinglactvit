-- Criar tabela para unidades de processamento
CREATE TABLE IF NOT EXISTS public.processing_units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  razao_social TEXT NOT NULL,
  cnpj TEXT NOT NULL,
  email_financeiro TEXT NOT NULL,
  email_rh TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para responsáveis dos setores
CREATE TABLE IF NOT EXISTS public.sector_responsibles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  unidade TEXT NOT NULL,
  setor_departamento TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  link_whatsapp TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.processing_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sector_responsibles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para processing_units
CREATE POLICY "Users with processing_units module access can view all units"
ON public.processing_units
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN module_permissions mp ON ur.role = mp.role
    WHERE ur.user_id = auth.uid()
      AND mp.module_name = 'processing_units'
      AND mp.can_access = true
  )
);

CREATE POLICY "Users with processing_units module access can create units"
ON public.processing_units
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN module_permissions mp ON ur.role = mp.role
    WHERE ur.user_id = auth.uid()
      AND mp.module_name = 'processing_units'
      AND mp.can_access = true
  )
);

CREATE POLICY "Users with processing_units module access can update units"
ON public.processing_units
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN module_permissions mp ON ur.role = mp.role
    WHERE ur.user_id = auth.uid()
      AND mp.module_name = 'processing_units'
      AND mp.can_access = true
  )
);

CREATE POLICY "Users with processing_units module access can delete units"
ON public.processing_units
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN module_permissions mp ON ur.role = mp.role
    WHERE ur.user_id = auth.uid()
      AND mp.module_name = 'processing_units'
      AND mp.can_access = true
  )
);

-- Políticas RLS para sector_responsibles
CREATE POLICY "Users with processing_units module access can view all responsibles"
ON public.sector_responsibles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN module_permissions mp ON ur.role = mp.role
    WHERE ur.user_id = auth.uid()
      AND mp.module_name = 'processing_units'
      AND mp.can_access = true
  )
);

CREATE POLICY "Users with processing_units module access can create responsibles"
ON public.sector_responsibles
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN module_permissions mp ON ur.role = mp.role
    WHERE ur.user_id = auth.uid()
      AND mp.module_name = 'processing_units'
      AND mp.can_access = true
  )
);

CREATE POLICY "Users with processing_units module access can update responsibles"
ON public.sector_responsibles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN module_permissions mp ON ur.role = mp.role
    WHERE ur.user_id = auth.uid()
      AND mp.module_name = 'processing_units'
      AND mp.can_access = true
  )
);

CREATE POLICY "Users with processing_units module access can delete responsibles"
ON public.sector_responsibles
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN module_permissions mp ON ur.role = mp.role
    WHERE ur.user_id = auth.uid()
      AND mp.module_name = 'processing_units'
      AND mp.can_access = true
  )
);

-- Adicionar permissões do módulo para todos os roles existentes
INSERT INTO public.module_permissions (module_name, role, can_access)
VALUES 
  ('processing_units', 'admin', true),
  ('processing_units', 'user', true),
  ('processing_units', 'viewer', false)
ON CONFLICT (module_name, role) DO NOTHING;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_processing_units_user_id ON public.processing_units(user_id);
CREATE INDEX IF NOT EXISTS idx_processing_units_cnpj ON public.processing_units(cnpj);
CREATE INDEX IF NOT EXISTS idx_sector_responsibles_user_id ON public.sector_responsibles(user_id);
CREATE INDEX IF NOT EXISTS idx_sector_responsibles_unidade ON public.sector_responsibles(unidade);