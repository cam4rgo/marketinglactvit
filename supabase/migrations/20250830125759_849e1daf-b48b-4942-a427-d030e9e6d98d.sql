-- Ensure admin role has access to comercial module
INSERT INTO public.module_permissions (role, module_name, can_access)
VALUES ('admin', 'comercial', true)
ON CONFLICT (role, module_name) 
DO UPDATE SET can_access = true;

-- Verify that the user has admin role (check if exists, if not create)
-- This is for the current user: 77fd91de-f2a7-4baa-a44f-19227a1da13a
INSERT INTO public.user_roles (user_id, role)
VALUES ('77fd91de-f2a7-4baa-a44f-19227a1da13a', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;