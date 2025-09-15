
-- Criar tabela para representantes/brokers
CREATE TABLE IF NOT EXISTS public.comercial_representatives (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  nome_completo text NOT NULL,
  email text NOT NULL,
  telefone text NOT NULL,
  link_whatsapp text,
  escritorio text NOT NULL,
  cidades_atendidas text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_comercial_representatives_user_id ON comercial_representatives(user_id);
CREATE INDEX IF NOT EXISTS idx_comercial_representatives_status ON comercial_representatives(status);
CREATE INDEX IF NOT EXISTS idx_comercial_representatives_escritorio ON comercial_representatives(escritorio);

-- Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_comercial_representatives_updated_at ON comercial_representatives;
CREATE TRIGGER update_comercial_representatives_updated_at
  BEFORE UPDATE ON comercial_representatives
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security
ALTER TABLE comercial_representatives ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - apenas administradores podem acessar
DROP POLICY IF EXISTS "Only admins can view representatives" ON comercial_representatives;
CREATE POLICY "Only admins can view representatives" 
ON comercial_representatives 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

DROP POLICY IF EXISTS "Only admins can create representatives" ON comercial_representatives;
CREATE POLICY "Only admins can create representatives" 
ON comercial_representatives 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

DROP POLICY IF EXISTS "Only admins can update representatives" ON comercial_representatives;
CREATE POLICY "Only admins can update representatives" 
ON comercial_representatives 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

DROP POLICY IF EXISTS "Only admins can delete representatives" ON comercial_representatives;
CREATE POLICY "Only admins can delete representatives" 
ON comercial_representatives 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));
