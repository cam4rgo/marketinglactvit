-- Atualizar políticas RLS para financial_transactions
-- Permitir que usuários com acesso ao módulo vejam todos os dados

-- Remover política antiga de SELECT
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.financial_transactions;

-- Criar nova política de SELECT que permite ver todos os dados se tem acesso ao módulo
CREATE POLICY "Users with financial module access can view all transactions"
ON public.financial_transactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN module_permissions mp ON ur.role = mp.role
    WHERE ur.user_id = auth.uid()
      AND mp.module_name = 'financial'
      AND mp.can_access = true
  )
);

-- Atualizar política de INSERT para continuar associando transações ao usuário que criou
DROP POLICY IF EXISTS "Users can create their own transactions" ON public.financial_transactions;

CREATE POLICY "Users with financial module access can create transactions"
ON public.financial_transactions
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN module_permissions mp ON ur.role = mp.role
    WHERE ur.user_id = auth.uid()
      AND mp.module_name = 'financial'
      AND mp.can_access = true
  )
);

-- Atualizar política de UPDATE
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.financial_transactions;

CREATE POLICY "Users with financial module access can update all transactions"
ON public.financial_transactions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN module_permissions mp ON ur.role = mp.role
    WHERE ur.user_id = auth.uid()
      AND mp.module_name = 'financial'
      AND mp.can_access = true
  )
);

-- Atualizar política de DELETE
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.financial_transactions;

CREATE POLICY "Users with financial module access can delete all transactions"
ON public.financial_transactions
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN module_permissions mp ON ur.role = mp.role
    WHERE ur.user_id = auth.uid()
      AND mp.module_name = 'financial'
      AND mp.can_access = true
  )
);

-- Fazer o mesmo para financial_categories
-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view their own categories" ON public.financial_categories;
DROP POLICY IF EXISTS "Users can create their own categories" ON public.financial_categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON public.financial_categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON public.financial_categories;

-- Criar novas políticas baseadas em permissão de módulo
CREATE POLICY "Users with financial module access can view all categories"
ON public.financial_categories
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN module_permissions mp ON ur.role = mp.role
    WHERE ur.user_id = auth.uid()
      AND mp.module_name = 'financial'
      AND mp.can_access = true
  )
);

CREATE POLICY "Users with financial module access can create categories"
ON public.financial_categories
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN module_permissions mp ON ur.role = mp.role
    WHERE ur.user_id = auth.uid()
      AND mp.module_name = 'financial'
      AND mp.can_access = true
  )
);

CREATE POLICY "Users with financial module access can update all categories"
ON public.financial_categories
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN module_permissions mp ON ur.role = mp.role
    WHERE ur.user_id = auth.uid()
      AND mp.module_name = 'financial'
      AND mp.can_access = true
  )
);

CREATE POLICY "Users with financial module access can delete all categories"
ON public.financial_categories
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN module_permissions mp ON ur.role = mp.role
    WHERE ur.user_id = auth.uid()
      AND mp.module_name = 'financial'
      AND mp.can_access = true
  )
);