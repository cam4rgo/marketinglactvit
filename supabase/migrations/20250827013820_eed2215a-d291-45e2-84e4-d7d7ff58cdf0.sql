
-- Verificar e corrigir possíveis problemas na tabela company_profiles
-- Garantir que as colunas tenham os tipos corretos
ALTER TABLE company_profiles 
ALTER COLUMN company_name DROP NOT NULL;

ALTER TABLE company_profiles 
ALTER COLUMN instagram_username DROP NOT NULL;

-- Adicionar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_company_profiles_user_id ON company_profiles(user_id);

-- Verificar e corrigir possíveis problemas na tabela approval_posts
-- Adicionar política para DELETE se não existir
DROP POLICY IF EXISTS "Users can delete approval posts" ON approval_posts;

CREATE POLICY "Users can delete approval posts" 
ON approval_posts 
FOR DELETE 
USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Garantir que as foreign keys estão configuradas corretamente para cascade delete
ALTER TABLE approval_media 
DROP CONSTRAINT IF EXISTS approval_media_post_id_fkey;

ALTER TABLE approval_media 
ADD CONSTRAINT approval_media_post_id_fkey 
FOREIGN KEY (post_id) 
REFERENCES approval_posts(id) 
ON DELETE CASCADE;

ALTER TABLE approval_comments 
DROP CONSTRAINT IF EXISTS approval_comments_post_id_fkey;

ALTER TABLE approval_comments 
ADD CONSTRAINT approval_comments_post_id_fkey 
FOREIGN KEY (post_id) 
REFERENCES approval_posts(id) 
ON DELETE CASCADE;

-- Adicionar políticas para permitir que usuários editem e deletem seus próprios comentários
DROP POLICY IF EXISTS "Users can update their own approval comments" ON approval_comments;
CREATE POLICY "Users can update their own approval comments" 
ON approval_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own approval comments" ON approval_comments;
CREATE POLICY "Users can delete their own approval comments" 
ON approval_comments 
FOR DELETE 
USING (auth.uid() = user_id);
