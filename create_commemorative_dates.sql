-- Criar tabela para datas comemorativas
CREATE TABLE IF NOT EXISTS public.commemorative_dates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  is_mandatory BOOLEAN NOT NULL DEFAULT false,
  post_type TEXT NOT NULL CHECK (post_type IN ('feed', 'story')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela
ALTER TABLE public.commemorative_dates ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para commemorative_dates
CREATE POLICY "Users can view their own commemorative dates"
ON public.commemorative_dates
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own commemorative dates"
ON public.commemorative_dates
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own commemorative dates"
ON public.commemorative_dates
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own commemorative dates"
ON public.commemorative_dates
FOR DELETE
USING (auth.uid() = user_id);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_commemorative_dates_user_id ON public.commemorative_dates(user_id);
CREATE INDEX IF NOT EXISTS idx_commemorative_dates_date ON public.commemorative_dates(date);
CREATE INDEX IF NOT EXISTS idx_commemorative_dates_post_type ON public.commemorative_dates(post_type);
CREATE INDEX IF NOT EXISTS idx_commemorative_dates_is_mandatory ON public.commemorative_dates(is_mandatory);

-- Comentários explicativos
COMMENT ON TABLE public.commemorative_dates IS 'Tabela para armazenar datas comemorativas para planejamento de conteúdo';
COMMENT ON COLUMN public.commemorative_dates.title IS 'Título da data comemorativa';
COMMENT ON COLUMN public.commemorative_dates.description IS 'Descrição detalhada da data comemorativa';
COMMENT ON COLUMN public.commemorative_dates.date IS 'Data da comemoração';
COMMENT ON COLUMN public.commemorative_dates.is_mandatory IS 'Se a data é obrigatória ou opcional para o planejamento';
COMMENT ON COLUMN public.commemorative_dates.post_type IS 'Tipo de post recomendado: feed ou story';