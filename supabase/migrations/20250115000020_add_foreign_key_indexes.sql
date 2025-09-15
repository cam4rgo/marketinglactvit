-- Migration: Add indexes for foreign keys to improve JOIN performance
-- Date: 2025-01-15
-- Purpose: Fix Supabase performance warnings for unindexed foreign keys

-- Add index for approval_comments.post_id foreign key
-- This improves performance when joining approval_comments with approval_posts
CREATE INDEX IF NOT EXISTS idx_approval_comments_post_id 
ON public.approval_comments (post_id);

-- Add index for approval_links.created_by foreign key
-- This improves performance when joining approval_links with auth.users
CREATE INDEX IF NOT EXISTS idx_approval_links_created_by 
ON public.approval_links (created_by);

-- Add index for approval_media.post_id foreign key
-- This improves performance when joining approval_media with approval_posts
CREATE INDEX IF NOT EXISTS idx_approval_media_post_id 
ON public.approval_media (post_id);

-- Add index for sector_responsibles.processing_unit_id foreign key
-- This improves performance when joining sector_responsibles with processing_units
CREATE INDEX IF NOT EXISTS idx_sector_responsibles_processing_unit_id 
ON public.sector_responsibles (processing_unit_id);

-- Performance benefits:
-- 1. Faster JOIN operations between related tables
-- 2. Reduced database resource consumption during queries
-- 3. Better query execution plans for foreign key lookups
-- 4. Improved overall application response time for queries involving these relationships

-- Note: These indexes use B-tree type (default) which is optimal for UUID foreign keys
-- and equality/range queries commonly used in JOIN conditions.