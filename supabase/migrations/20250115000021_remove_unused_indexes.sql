-- Migration: Remove unused indexes to reduce database overhead
-- Date: 2025-01-15
-- Purpose: Fix Supabase performance warnings for unused indexes
-- IMPORTANT: These indexes have been identified as unused by Supabase Performance Advisor

-- Remove unused index on api_integrations.user_type
-- This index has not been used by any query execution plans
DROP INDEX IF EXISTS public.idx_api_integrations_user_type;

-- Remove unused index on approval_comments.user_id
-- This index has not been used by any query execution plans
-- Note: There's already a foreign key constraint that may provide sufficient indexing
DROP INDEX IF EXISTS public.idx_approval_comments_user_id;

-- Remove unused index on approval_links.expires_at
-- This index has not been used by any query execution plans
DROP INDEX IF EXISTS public.idx_approval_links_expires_at;

-- Remove unused index on approval_links.post_id
-- This index has not been used by any query execution plans
-- Note: We just created idx_approval_media_post_id for the foreign key relationship
DROP INDEX IF EXISTS public.idx_approval_links_post_id;

-- Performance benefits of removing unused indexes:
-- 1. Reduced overhead during INSERT, UPDATE, and DELETE operations
-- 2. Less storage space consumption
-- 3. Faster data modification operations
-- 4. Reduced maintenance overhead for the database
-- 5. Better overall write performance

-- Note: Before applying this migration in production, ensure that:
-- 1. Application usage patterns haven't changed
-- 2. No new features require these indexes
-- 3. Performance testing confirms no negative impact