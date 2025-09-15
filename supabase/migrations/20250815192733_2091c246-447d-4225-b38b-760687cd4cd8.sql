
-- Create module_permissions table
CREATE TABLE IF NOT EXISTS public.module_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user', 'viewer')),
  module_name TEXT NOT NULL,
  can_access BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(role, module_name)
);

-- Enable RLS
ALTER TABLE public.module_permissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admin can manage all module permissions" 
  ON public.module_permissions 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_module_permissions_updated_at
  BEFORE UPDATE ON public.module_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default permissions for viewer role
INSERT INTO public.module_permissions (role, module_name, can_access) VALUES
('viewer', 'dashboard', true),
('viewer', 'financial', false),
('viewer', 'campaigns', false),
('viewer', 'instagram', false),
('viewer', 'integrations', false),
('viewer', 'approvals', false),
('viewer', 'users', false),
('user', 'dashboard', true),
('user', 'financial', true),
('user', 'campaigns', true),
('user', 'instagram', true),
('user', 'integrations', false),
('user', 'approvals', true),
('user', 'users', false)
ON CONFLICT (role, module_name) DO NOTHING;
