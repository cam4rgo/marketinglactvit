
-- Atualizar enum para incluir a nova role 'viewer'
ALTER TYPE public.user_role ADD VALUE 'viewer';

-- Criar tabela para configurações de permissões por role
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role user_role NOT NULL,
  permission_name TEXT NOT NULL,
  can_create BOOLEAN DEFAULT FALSE,
  can_read BOOLEAN DEFAULT TRUE,
  can_update BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role, permission_name)
);

-- Habilitar RLS na tabela de permissões
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Política para permitir que admins vejam todas as permissões
CREATE POLICY "Admins can view all permissions" ON public.role_permissions
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Política para permitir que admins modifiquem permissões
CREATE POLICY "Admins can modify permissions" ON public.role_permissions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Inserir permissões padrão
INSERT INTO public.role_permissions (role, permission_name, can_create, can_read, can_update, can_delete) VALUES
-- Permissões do Admin
('admin', 'financial_transactions', true, true, true, true),
('admin', 'campaigns', true, true, true, true),
('admin', 'instagram_insights', true, true, true, true),
('admin', 'integrations', true, true, true, true),
('admin', 'approvals', true, true, true, true),
('admin', 'users', true, true, true, true),
('admin', 'settings', true, true, true, true),
('admin', 'reports', true, true, true, true),

-- Permissões do Viewer
('viewer', 'financial_transactions', false, true, false, false),
('viewer', 'campaigns', false, true, false, false),
('viewer', 'instagram_insights', false, true, false, false),
('viewer', 'integrations', false, true, false, false),
('viewer', 'approvals', false, true, false, false),
('viewer', 'users', false, true, false, false),
('viewer', 'settings', false, false, false, false),
('viewer', 'reports', false, true, false, false),

-- Permissões do User
('user', 'financial_transactions', false, false, false, false),
('user', 'campaigns', false, false, false, false),
('user', 'instagram_insights', false, false, false, false),
('user', 'integrations', false, false, false, false),
('user', 'approvals', false, false, false, false),
('user', 'users', false, false, false, false),
('user', 'settings', false, false, false, false),
('user', 'reports', false, false, false, false);

-- Atualizar trigger para role_permissions
CREATE TRIGGER update_role_permissions_updated_at
  BEFORE UPDATE ON public.role_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para verificar permissão específica
CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _permission_name TEXT, _action TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    CASE 
      WHEN _action = 'create' THEN COALESCE(rp.can_create, false)
      WHEN _action = 'read' THEN COALESCE(rp.can_read, false)
      WHEN _action = 'update' THEN COALESCE(rp.can_update, false)
      WHEN _action = 'delete' THEN COALESCE(rp.can_delete, false)
      ELSE false
    END
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON ur.role = rp.role
  WHERE ur.user_id = _user_id AND rp.permission_name = _permission_name;
$$;
