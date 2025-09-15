-- Corrigir constraint da coluna tipo na tabela processing_units
-- Remove a constraint antiga e adiciona a nova com os valores corretos

-- Primeiro, remove a constraint existente
ALTER TABLE public.processing_units DROP CONSTRAINT IF EXISTS processing_units_tipo_check;

-- Atualiza registros existentes que possam ter valores antigos ANTES de adicionar a constraint
UPDATE public.processing_units 
SET tipo = CASE 
  WHEN tipo = 'De processamento' THEN 'Unidade de Processamento'
  WHEN tipo = 'Comercial' THEN 'Unidade Comercial'
  WHEN tipo IS NULL OR tipo = '' THEN 'Unidade de Processamento'
  ELSE 'Unidade de Processamento'
END;

-- Agora adiciona a nova constraint com os valores corretos
ALTER TABLE public.processing_units 
ADD CONSTRAINT processing_units_tipo_check 
CHECK (tipo IN ('Unidade de Processamento', 'Unidade Comercial'));

-- Comentário explicativo
COMMENT ON COLUMN public.processing_units.tipo IS 'Tipo da unidade: Unidade de Processamento ou Unidade Comercial';