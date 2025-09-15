
-- Dar role admin para o usuário específico
UPDATE public.user_roles 
SET role = 'admin' 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'feernando_camargo@live.com'
);

-- Se o usuário não tiver role ainda, inserir uma nova
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users 
WHERE email = 'feernando_camargo@live.com' 
AND id NOT IN (SELECT user_id FROM public.user_roles);
