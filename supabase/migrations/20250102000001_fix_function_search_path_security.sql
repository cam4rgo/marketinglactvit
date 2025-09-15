-- Migration para corrigir warnings de segurança: Function Search Path Mutable
-- Esta migration adiciona 'SET search_path = ''' às funções para prevenir ataques de search_path
-- Referência: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

-- 1. Corrigir função update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- 2. Corrigir função handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  -- Dar role de admin para o primeiro usuário, user para os demais
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    CASE
      WHEN (SELECT COUNT(*) FROM auth.users) = 1 THEN 'admin'::public.user_role
      ELSE 'user'::public.user_role
    END
  );
  
  RETURN NEW;
END;
$$;

-- 3. Corrigir função generate_approval_token
CREATE OR REPLACE FUNCTION public.generate_approval_token()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT md5(random()::text || clock_timestamp()::text);
$$;

-- 4. Corrigir função cleanup_expired_approval_links
CREATE OR REPLACE FUNCTION public.cleanup_expired_approval_links()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  UPDATE public.approval_links 
  SET is_active = false 
  WHERE expires_at < now() AND is_active = true;
$$;

-- Comentário explicativo sobre a correção:
-- O 'SET search_path = ""' previne ataques onde um usuário malicioso
-- poderia criar objetos em schemas que seriam encontrados primeiro
-- no search_path, fazendo com que a função execute código não autorizado.
-- Ao definir search_path como vazio, forçamos o uso de nomes totalmente
-- qualificados (schema.objeto), garantindo que apenas objetos específicos
-- sejam acessados pelas funções.