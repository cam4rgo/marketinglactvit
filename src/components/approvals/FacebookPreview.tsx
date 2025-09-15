
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, MessageCircle, Share, MoreHorizontal } from 'lucide-react';
import { getMediaUrl } from '@/hooks/useApprovalPosts';
import { CompanyProfile } from '@/hooks/useCompanyProfile';

interface FacebookPreviewProps {
  post: any;
  media?: any[];
  profile?: CompanyProfile | null;
  postType?: 'post' | 'story' | 'reels';
}

export const FacebookPreview = ({ post, media = [], profile, postType = 'post' }: FacebookPreviewProps) => {
  const finalMedia = media || post.media || post.approval_media || [];
  
  console.log('FacebookPreview - finalMedia:', finalMedia);

  // Use company profile data or fallbacks
  const companyName = profile?.company_name || 'Sua Empresa';
  const isVerified = profile?.verified || false;

  // Helper to get profile initials
  const getProfileInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').substring(0, 2).toUpperCase();
  };

  // Helper to get full profile image URL - using the correct bucket 'profile-images'
  const getProfileImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `https://tqwcibshgrwnleqkkjpd.supabase.co/storage/v1/object/public/profile-images/${url}`;
  };

  const profileImageUrl = getProfileImageUrl(profile?.profile_image_url || null);

  // Determine aspect ratio based on post type
  const getAspectRatio = () => {
    switch (postType) {
      case 'story':
      case 'reels':
        return 'aspect-[9/16]'; // 9:16 for stories and reels
      case 'post':
      default:
        return 'aspect-[4/5]'; // 4:5 for regular posts
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="overflow-hidden bg-white border-gray-200 rounded-lg" style={{ borderStyle: 'none' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            {profileImageUrl ? (
              <img 
                src={profileImageUrl} 
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {getProfileInitials(companyName)}
                </span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-1">
                <p className="font-semibold text-sm text-gray-900">{companyName}</p>
                {isVerified && (
                  <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <p className="text-xs text-gray-500">2h · 🌍</p>
            </div>
          </div>
          <MoreHorizontal className="w-5 h-5 text-gray-400" />
        </div>

        {/* Caption */}
        {post.content_caption && (
          <div className="p-4 pb-0">
            <p className="text-sm text-gray-900" style={{ whiteSpace: 'pre-wrap' }}>{post.content_caption}</p>
          </div>
        )}

        {/* Media Content */}
        {finalMedia.length > 0 && (
          <div className={`${getAspectRatio()} bg-gray-100 relative mt-3`}>
            {finalMedia[0].file_type === 'video' ? (
              <video 
                className="w-full h-full object-cover"
                controls
                poster={getMediaUrl(finalMedia[0].file_path)}
              >
                <source src={getMediaUrl(finalMedia[0].file_path)} type={finalMedia[0].mime_type || 'video/mp4'} />
                Seu navegador não suporta vídeo.
              </video>
            ) : (
              <img 
                src={getMediaUrl(finalMedia[0].file_path)} 
                alt="Post content"
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Erro ao carregar imagem:', e);
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            )}
            {finalMedia.length > 1 && (
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="text-xs">
                  +{finalMedia.length - 1}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3 text-gray-500 text-xs">
            <span>👍 ❤️ {profile?.followers_count ? Math.round(profile.followers_count * 0.02) : 23}</span>
            <span>5 comentários</span>
          </div>
          
          <div className="flex items-center justify-around py-2 border-t border-gray-100">
            <button className="flex items-center space-x-2 py-2 px-4 text-gray-600 hover:bg-gray-50 rounded">
              <ThumbsUp className="w-5 h-5" />
              <span className="text-sm font-semibold">Curtir</span>
            </button>
            <button className="flex items-center space-x-2 py-2 px-4 text-gray-600 hover:bg-gray-50 rounded">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-semibold">Comentar</span>
            </button>
            <button className="flex items-center space-x-2 py-2 px-4 text-gray-600 hover:bg-gray-50 rounded">
              <Share className="w-5 h-5" />
              <span className="text-sm font-semibold">Compartilhar</span>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};
