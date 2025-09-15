-- Adicionar coluna processing_unit_id à tabela sector_responsibles
ALTER TABLE public.sector_responsibles 
ADD COLUMN processing_unit_id UUID REFERENCES public.processing_units(id) ON DELETE CASCADE;

-- Atualizar a coluna name para ser consistente com o hook
ALTER TABLE public.sector_responsibles 
ADD COLUMN name TEXT;

-- Copiar dados da coluna nome para name
UPDATE public.sector_responsibles 
SET name = nome;

-- Atualizar a coluna department para ser consistente com o hook
ALTER TABLE public.sector_responsibles 
ADD COLUMN department TEXT;

-- Copiar dados da coluna setor_departamento para department
UPDATE public.sector_responsibles 
SET department = setor_departamento;

-- Tornar as novas colunas obrigatórias
ALTER TABLE public.sector_responsibles 
ALTER COLUMN name SET NOT NULL;

ALTER TABLE public.sector_responsibles 
ALTER COLUMN department SET NOT NULL;

-- Remover as colunas antigas (opcional, manter por compatibilidade)
-- ALTER TABLE public.sector_responsibles DROP COLUMN nome;
-- ALTER TABLE public.sector_responsibles DROP COLUMN setor_departamento;