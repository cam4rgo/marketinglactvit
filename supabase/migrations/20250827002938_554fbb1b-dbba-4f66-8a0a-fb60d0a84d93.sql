
-- Create financial_categories table
CREATE TABLE IF NOT EXISTS financial_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'bg-blue-500',
  type TEXT NOT NULL CHECK (type IN ('expense', 'investment')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Enable RLS on financial_categories
ALTER TABLE financial_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for financial_categories
DROP POLICY IF EXISTS "Users can view their own categories" ON financial_categories;
CREATE POLICY "Users can view their own categories" ON financial_categories
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own categories" ON financial_categories;
CREATE POLICY "Users can create their own categories" ON financial_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own categories" ON financial_categories;
CREATE POLICY "Users can update their own categories" ON financial_categories
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own categories" ON financial_categories;
CREATE POLICY "Users can delete their own categories" ON financial_categories
  FOR DELETE USING (auth.uid() = user_id);

-- Insert default categories for existing users
INSERT INTO financial_categories (user_id, name, color, type)
SELECT 
  u.id,
  unnest(ARRAY['Meta Ads', 'Google Ads', 'Instagram Ads', 'Criação de Conteúdo', 'Influenciadores', 'Design', 'Ferramentas e Software', 'Consultoria', 'Eventos', 'Outros']),
  unnest(ARRAY['bg-blue-500', 'bg-red-500', 'bg-pink-500', 'bg-purple-500', 'bg-yellow-500', 'bg-green-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-gray-500']),
  unnest(ARRAY['expense', 'expense', 'expense', 'expense', 'expense', 'expense', 'investment', 'investment', 'expense', 'expense'])
FROM auth.users u
WHERE EXISTS (SELECT 1 FROM financial_transactions WHERE user_id = u.id)
ON CONFLICT (user_id, name) DO NOTHING;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_financial_categories_updated_at ON financial_categories;
CREATE TRIGGER update_financial_categories_updated_at
    BEFORE UPDATE ON financial_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
