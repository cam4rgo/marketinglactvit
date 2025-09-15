
-- Fix RLS policies for approval_media table
DROP POLICY IF EXISTS "Users can create approval media" ON public.approval_media;
CREATE POLICY "Users can create approval media" ON public.approval_media
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM approval_posts 
    WHERE approval_posts.id = approval_media.post_id 
    AND approval_posts.user_id = auth.uid()
  )
);

-- Add missing policies for approval_media
DROP POLICY IF EXISTS "Users can view approval media" ON public.approval_media;
CREATE POLICY "Users can view approval media" ON public.approval_media
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update approval media" ON public.approval_media;
CREATE POLICY "Users can update approval media" ON public.approval_media
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM approval_posts 
    WHERE approval_posts.id = approval_media.post_id 
    AND approval_posts.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete approval media" ON public.approval_media;
CREATE POLICY "Users can delete approval media" ON public.approval_media
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM approval_posts 
    WHERE approval_posts.id = approval_media.post_id 
    AND approval_posts.user_id = auth.uid()
  )
);

-- Fix RLS policies for approval_comments table
DROP POLICY IF EXISTS "Users can create approval comments" ON public.approval_comments;
CREATE POLICY "Users can create approval comments" ON public.approval_comments
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Ensure financial transactions can be created properly
DROP POLICY IF EXISTS "Users can create their own transactions" ON public.financial_transactions;
CREATE POLICY "Users can create their own transactions" ON public.financial_transactions
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Check if there are any constraints that might be causing issues with financial transactions
-- Remove the problematic check constraint if it exists
ALTER TABLE public.financial_transactions DROP CONSTRAINT IF EXISTS financial_transactions_category_check;

-- Add a more flexible constraint that allows category IDs (UUIDs) as well as category names
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'financial_transactions_category_valid' 
    AND table_name = 'financial_transactions'
  ) THEN
    ALTER TABLE public.financial_transactions ADD CONSTRAINT financial_transactions_category_valid 
    CHECK (
      category IS NOT NULL AND 
      (
        category ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' OR
        category IN ('meta_ads', 'google_ads', 'instagram_ads', 'content_creation', 'influencer', 'design', 'tools_software', 'consulting', 'events', 'other')
      )
    );
  END IF;
END $$;
