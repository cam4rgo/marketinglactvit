
-- Create financial_transactions table
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('expense', 'investment')),
  category TEXT NOT NULL CHECK (category IN ('meta_ads', 'google_ads', 'instagram_ads', 'content_creation', 'influencer', 'design', 'tools_software', 'consulting', 'events', 'other')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  transaction_date DATE NOT NULL,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for financial_transactions
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

-- Create a view for financial summary
CREATE OR REPLACE VIEW public.financial_summary AS
SELECT 
  user_id,
  type,
  category,
  status,
  SUM(amount) as total_amount,
  COUNT(*) as transaction_count,
  DATE_TRUNC('month', transaction_date) as month
FROM public.financial_transactions
WHERE status = 'confirmed'
GROUP BY user_id, type, category, status, DATE_TRUNC('month', transaction_date);

-- Add RLS to the view
ALTER VIEW public.financial_summary SET (security_invoker = true);
