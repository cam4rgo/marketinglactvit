
-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'viewer', 'user')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create module_permissions table
CREATE TABLE IF NOT EXISTS public.module_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('admin', 'viewer', 'user')),
  module_name TEXT NOT NULL,
  can_access BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(role, module_name)
);

-- Add Row Level Security (RLS)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_permissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_roles
DROP POLICY IF EXISTS "Users can view all user roles" ON public.user_roles;
CREATE POLICY "Users can view all user roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Only admins can insert user roles" ON public.user_roles;
CREATE POLICY "Only admins can insert user roles" 
  ON public.user_roles 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

DROP POLICY IF EXISTS "Only admins can update user roles" ON public.user_roles;
CREATE POLICY "Only admins can update user roles" 
  ON public.user_roles 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

DROP POLICY IF EXISTS "Only admins can delete user roles" ON public.user_roles;
CREATE POLICY "Only admins can delete user roles" 
  ON public.user_roles 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Create RLS policies for module_permissions
DROP POLICY IF EXISTS "Users can view all module permissions" ON public.module_permissions;
CREATE POLICY "Users can view all module permissions" 
  ON public.module_permissions 
  FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Only admins can insert module permissions" ON public.module_permissions;
CREATE POLICY "Only admins can insert module permissions" 
  ON public.module_permissions 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

DROP POLICY IF EXISTS "Only admins can update module permissions" ON public.module_permissions;
CREATE POLICY "Only admins can update module permissions" 
  ON public.module_permissions 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

DROP POLICY IF EXISTS "Only admins can delete module permissions" ON public.module_permissions;
CREATE POLICY "Only admins can delete module permissions" 
  ON public.module_permissions 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Insert default module permissions for each role
INSERT INTO public.module_permissions (role, module_name, can_access) VALUES
  -- Admin permissions (full access)
  ('admin', 'dashboard', true),
  ('admin', 'financial', true),
  ('admin', 'campaigns', true),
  ('admin', 'instagram', true),
  ('admin', 'integrations', true),
  ('admin', 'approvals', true),
  ('admin', 'users', true),
  
  -- User permissions (limited access)
  ('user', 'dashboard', true),
  ('user', 'financial', false),
  ('user', 'campaigns', true),
  ('user', 'instagram', true),
  ('user', 'integrations', false),
  ('user', 'approvals', true),
  ('user', 'users', false),
  
  -- Viewer permissions (read-only access)
  ('viewer', 'dashboard', true),
  ('viewer', 'financial', false),
  ('viewer', 'campaigns', false),
  ('viewer', 'instagram', true),
  ('viewer', 'integrations', false),
  ('viewer', 'approvals', false),
  ('viewer', 'users', false)
ON CONFLICT (role, module_name) DO NOTHING;
