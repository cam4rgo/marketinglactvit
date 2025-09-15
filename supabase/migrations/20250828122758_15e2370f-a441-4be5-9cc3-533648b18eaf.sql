
-- Adicionar chave estrangeira para relacionar approval_comments com profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'approval_comments_user_id_fkey' 
    AND table_name = 'approval_comments'
  ) THEN
    ALTER TABLE public.approval_comments 
    ADD CONSTRAINT approval_comments_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Criar índice para melhorar performance das consultas
CREATE INDEX IF NOT EXISTS idx_approval_comments_user_id ON public.approval_comments(user_id);
