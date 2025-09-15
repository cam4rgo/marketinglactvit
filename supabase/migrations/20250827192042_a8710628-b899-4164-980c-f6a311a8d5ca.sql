
-- Adicionar coluna tipo para diferenciar entre Representante e Broker
ALTER TABLE comercial_representatives 
ADD COLUMN IF NOT EXISTS tipo text NOT NULL DEFAULT 'representante' CHECK (tipo IN ('representante', 'broker'));

-- Adicionar coluna estado para facilitar a filtragem
ALTER TABLE comercial_representatives 
ADD COLUMN IF NOT EXISTS estado text;

-- Criar índice para melhor performance na filtragem por tipo e estado
CREATE INDEX IF NOT EXISTS idx_comercial_representatives_tipo ON comercial_representatives(tipo);
CREATE INDEX IF NOT EXISTS idx_comercial_representatives_estado ON comercial_representatives(estado);
