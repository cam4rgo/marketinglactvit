
-- Create enum for transaction types
CREATE TYPE transaction_type AS ENUM ('expense', 'investment');

-- Create enum for transaction categories
CREATE TYPE transaction_category AS ENUM (
  'meta_ads',
  'google_ads', 
  'instagram_ads',
  'content_creation',
  'influencer',
  'design',
  'tools_software',
  'consulting',
  'events',
  'other'
);

-- Create enum for transaction status
CREATE TYPE transaction_status AS ENUM ('pending', 'confirmed', 'cancelled');

-- Create table for financial transactions
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  type transaction_type NOT NULL,
  category transaction_category NOT NULL,
  status transaction_status NOT NULL DEFAULT 'pending',
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view their own transactions" 
  ON public.financial_transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" 
  ON public.financial_transactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" 
  ON public.financial_transactions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" 
  ON public.financial_transactions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_financial_transactions_user_id ON public.financial_transactions(user_id);
CREATE INDEX idx_financial_transactions_date ON public.financial_transactions(transaction_date DESC);
CREATE INDEX idx_financial_transactions_category ON public.financial_transactions(category);
CREATE INDEX idx_financial_transactions_type ON public.financial_transactions(type);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_financial_transactions_updated_at
    BEFORE UPDATE ON public.financial_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create view for financial summary
CREATE VIEW public.financial_summary AS
SELECT 
  user_id,
  type,
  category,
  status,
  COUNT(*) as transaction_count,
  SUM(amount) as total_amount,
  AVG(amount) as average_amount,
  DATE_TRUNC('month', transaction_date) as month_year
FROM public.financial_transactions
GROUP BY user_id, type, category, status, DATE_TRUNC('month', transaction_date);

-- Add RLS to the view
ALTER VIEW public.financial_summary SET (security_invoker = true);
