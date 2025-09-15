
-- Primeiro, remover as políticas existentes que podem estar causando conflito
DROP POLICY IF EXISTS "Users can upload post media" ON storage.objects;
DROP POLICY IF EXISTS "Users can view post media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own post media" ON storage.objects;

-- Criar políticas RLS mais permissivas para o bucket post-media
CREATE POLICY "Allow authenticated users to upload post media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'post-media');

CREATE POLICY "Allow public to view post media" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'post-media');

CREATE POLICY "Allow authenticated users to update post media" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'post-media');

CREATE POLICY "Allow authenticated users to delete post media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'post-media');
