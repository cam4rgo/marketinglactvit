-- Corrigir definitivamente a constraint da coluna tipo na tabela processing_units
-- Esta migration resolve o conflito entre os valores esperados pelo frontend e backend

-- Remove qualquer constraint existente relacionada ao tipo
ALTER TABLE public.processing_units DROP CONSTRAINT IF EXISTS processing_units_tipo_check;

-- Atualiza todos os registros existentes para usar os valores corretos
UPDATE public.processing_units 
SET tipo = CASE 
  WHEN tipo IN ('De processamento', 'representante', 'broker') THEN 'Unidade de Processamento'
  WHEN tipo IN ('Comercial') THEN 'Unidade Comercial'
  WHEN tipo IS NULL OR tipo = '' THEN 'Unidade de Processamento'
  ELSE 'Unidade de Processamento'
END;

-- Adiciona a constraint final com os valores corretos que o frontend espera
ALTER TABLE public.processing_units 
ADD CONSTRAINT processing_units_tipo_check 
CHECK (tipo IN ('Unidade de Processamento', 'Unidade Comercial'));

-- Comentário explicativo
COMMENT ON COLUMN public.processing_units.tipo IS 'Tipo da unidade: Unidade de Processamento ou Unidade Comercial';

-- Atualiza o valor padrão para novos registros
ALTER TABLE public.processing_units ALTER COLUMN tipo SET DEFAULT 'Unidade de Processamento';