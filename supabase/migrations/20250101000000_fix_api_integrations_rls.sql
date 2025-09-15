-- Fix RLS policies for api_integrations to allow users with campaigns module access
-- to view integrations needed for Meta Ads data

-- Drop the restrictive policy that only allows users to see their own integrations
DROP POLICY IF EXISTS "Users can view their own integrations" ON public.api_integrations;

-- Create new policy that allows access based on module permissions
DROP POLICY IF EXISTS "Users with campaigns access can view integrations" ON public.api_integrations;
CREATE POLICY "Users with campaigns access can view integrations" ON public.api_integrations
FOR SELECT USING (
  -- Allow access if user has permission for campaigns module
  EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN module_permissions mp ON ur.role = mp.role
    WHERE ur.user_id = auth.uid()
      AND mp.module_name = 'campaigns'
      AND mp.can_access = true
  )
  OR
  -- Or if user is the owner of the integration
  auth.uid() = user_id
  OR
  -- Or if user is admin (fallback safety)
  EXISTS (
    SELECT 1
    FROM user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
  )
);

-- Update other policies to follow the same pattern for consistency
DROP POLICY IF EXISTS "Users can create their own integrations" ON public.api_integrations;
DROP POLICY IF EXISTS "Users with campaigns access can create integrations" ON public.api_integrations;
CREATE POLICY "Users with campaigns access can create integrations" ON public.api_integrations
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN module_permissions mp ON ur.role = mp.role
      WHERE ur.user_id = auth.uid()
        AND mp.module_name = 'campaigns'
        AND mp.can_access = true
    )
    OR
    EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'
    )
  )
);

DROP POLICY IF EXISTS "Users can update their own integrations" ON public.api_integrations;
DROP POLICY IF EXISTS "Users with campaigns access can update integrations" ON public.api_integrations;
CREATE POLICY "Users with campaigns access can update integrations" ON public.api_integrations
FOR UPDATE USING (
  auth.uid() = user_id AND
  (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN module_permissions mp ON ur.role = mp.role
      WHERE ur.user_id = auth.uid()
        AND mp.module_name = 'campaigns'
        AND mp.can_access = true
    )
    OR
    EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'
    )
  )
);

DROP POLICY IF EXISTS "Users can delete their own integrations" ON public.api_integrations;
DROP POLICY IF EXISTS "Users with campaigns access can delete integrations" ON public.api_integrations;
CREATE POLICY "Users with campaigns access can delete integrations" ON public.api_integrations
FOR DELETE USING (
  auth.uid() = user_id AND
  (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN module_permissions mp ON ur.role = mp.role
      WHERE ur.user_id = auth.uid()
        AND mp.module_name = 'campaigns'
        AND mp.can_access = true
    )
    OR
    EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'
    )
  )
);