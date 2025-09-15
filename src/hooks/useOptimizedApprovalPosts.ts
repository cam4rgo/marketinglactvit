
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type ApprovalPost = Database['public']['Tables']['approval_posts']['Row'] & {
  media?: Database['public']['Tables']['approval_media']['Row'][];
  approval_media?: Database['public']['Tables']['approval_media']['Row'][];
  comments?: (Database['public']['Tables']['approval_comments']['Row'] & {
    profiles?: { full_name: string | null; avatar_url: string | null };
  })[];
  approval_comments?: (Database['public']['Tables']['approval_comments']['Row'] & {
    profiles?: { full_name: string | null; avatar_url: string | null };
  })[];
  profiles?: { full_name: string | null; avatar_url: string | null };
};

interface UseOptimizedApprovalPostsProps {
  status?: string;
  page?: number;
  pageSize?: number;
}

export const useOptimizedApprovalPosts = ({ 
  status = 'all', 
  page = 0, 
  pageSize = 10 
}: UseOptimizedApprovalPostsProps = {}) => {
  return useQuery({
    queryKey: ['approval-posts-optimized', status, page, pageSize],
    queryFn: async () => {
      let query = supabase
        .from('approval_posts')
        .select(`
          *,
          approval_media (
            id,
            file_path,
            file_type,
            file_size,
            mime_type,
            order_index,
            post_id,
            created_at
          ),
          approval_comments (
            id,
            comment_text,
            created_at,
            post_id,
            user_id
          )
        `)
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      // Only filter by actual database status, not derived statuses like 'inReview'
      if (status !== 'all' && status !== 'inReview') {
        query = query.eq('status', status);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      // Manually fetch user profiles for post owners
      const userIds = [...new Set(data?.map(post => post.user_id).filter(Boolean) || [])];
      let profilesMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);
        
        if (profiles) {
          profilesMap = profiles.reduce((acc, profile) => {
            acc[profile.id] = { full_name: profile.full_name, avatar_url: profile.avatar_url };
            return acc;
          }, {} as Record<string, { full_name: string | null; avatar_url: string | null }>);
        }
      }

      // Manually fetch comment profiles
      const commentUserIds = [...new Set(
        data?.flatMap(post => 
          (post.approval_comments || []).map(comment => comment.user_id)
        ).filter(Boolean) || []
      )];
      
      let commentProfilesMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
      
      if (commentUserIds.length > 0) {
        const { data: commentProfiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', commentUserIds);
        
        if (commentProfiles) {
          commentProfilesMap = commentProfiles.reduce((acc, profile) => {
            acc[profile.id] = { full_name: profile.full_name, avatar_url: profile.avatar_url };
            return acc;
          }, {} as Record<string, { full_name: string | null; avatar_url: string | null }>);
        }
      }

      // Normalize data structure - ensure media and comments are consistently named
      let postsWithProfiles = data?.map(post => ({
        ...post,
        profiles: profilesMap[post.user_id] || { full_name: null },
        // Normalize media structure and sort by order_index
        media: (post.approval_media || [])
          .sort((a, b) => {
            const aIndex = a.order_index ?? 999;
            const bIndex = b.order_index ?? 999;
            return aIndex - bIndex;
          }),
        // Normalize comments structure with profiles
        comments: (post.approval_comments || []).map(comment => ({
          ...comment,
          profiles: commentProfilesMap[comment.user_id] || { full_name: null, avatar_url: null }
        }))
      })) || [];

      // Apply client-side filtering for derived statuses
      if (status === 'inReview') {
        postsWithProfiles = postsWithProfiles.filter(post => 
          post.status === 'revision_requested' || 
          (post.status === 'pending' && post.comments && post.comments.length > 0)
        );
      }

      return {
        posts: postsWithProfiles as ApprovalPost[],
        totalCount: count || 0,
        hasMore: (count || 0) > (page + 1) * pageSize
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes,
  });
};

export const useApprovalPostsStats = () => {
  return useQuery({
    queryKey: ['approval-posts-stats'],
    queryFn: async () => {
      // Get all posts with their comments to determine "in review" status
      const { data: postsWithComments } = await supabase
        .from('approval_posts')
        .select(`
          id,
          status,
          approval_comments (id)
        `);

      const stats = {
        pending: 0,
        approved: 0,
        rejected: 0,
        inReview: 0,
        total: 0
      };

      postsWithComments?.forEach(post => {
        const hasComments = post.approval_comments && post.approval_comments.length > 0;
        
        if (post.status === 'pending') {
          if (hasComments) {
            stats.inReview++;
          } else {
            stats.pending++;
          }
        } else if (post.status === 'revision_requested') {
          stats.inReview++;
        } else if (post.status === 'approved') {
          stats.approved++;
        } else if (post.status === 'rejected') {
          stats.rejected++;
        }
        
        stats.total++;
      });

      return stats;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 30, // Refresh every 30 seconds
  });
};
