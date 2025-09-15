-- Adicionar campo tipo à tabela processing_units
ALTER TABLE public.processing_units 
ADD COLUMN tipo TEXT NOT NULL DEFAULT 'De processamento' 
CHECK (tipo IN ('De processamento', 'Comercial'));

-- Comentário explicativo
COMMENT ON COLUMN public.processing_units.tipo IS 'Tipo da unidade: De processamento ou Comercial';