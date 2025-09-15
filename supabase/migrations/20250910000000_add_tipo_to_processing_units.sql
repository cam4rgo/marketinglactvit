-- Adicionar campo tipo à tabela processing_units
ALTER TABLE public.processing_units 
ADD COLUMN IF NOT EXISTS tipo TEXT NOT NULL DEFAULT 'Unidade de Processamento' 
CHECK (tipo IN ('Unidade de Processamento', 'Unidade Comercial'));

-- Comentário explicativo
COMMENT ON COLUMN public.processing_units.tipo IS 'Tipo da unidade: Unidade de Processamento ou Unidade Comercial';