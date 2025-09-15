
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Play, Volume2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getMediaUrl } from '@/hooks/useApprovalPosts';
import { CompanyProfile } from '@/hooks/useCompanyProfile';

interface InstagramPreviewProps {
  post: any;
  media?: any[];
  profile?: CompanyProfile | null;
  postType?: 'post' | 'story' | 'reels';
}

export const InstagramPreview = ({ post, media = [], profile, postType = 'post' }: InstagramPreviewProps) => {
  const finalMedia = media || post.media || post.approval_media || [];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  console.log('InstagramPreview - finalMedia:', finalMedia);
  console.log('InstagramPreview - postType:', postType);

  // Limpa o estado de drag quando o slide muda
  useEffect(() => {
    setIsDragging(false);
    setTranslateX(0);
  }, [currentSlide]);

  // Limpa eventos globais quando o componente é desmontado
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setTranslateX(0);
      }
    };

    if (isDragging) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('mouseleave', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mouseleave', handleGlobalMouseUp);
    };
  }, [isDragging]);

  // Use company profile data or fallbacks
  const companyName = profile?.company_name || 'Sua Empresa';
  const instagramUsername = profile?.instagram_username || 'sua_empresa';
  const isVerified = profile?.verified || false;

  // Helper to get profile initials
  const getProfileInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').substring(0, 2).toUpperCase();
  };

  // Helper to get full profile image URL
  const getProfileImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `https://tqwcibshgrwnleqkkjpd.supabase.co/storage/v1/object/public/profile-images/${url}`;
  };

  const profileImageUrl = getProfileImageUrl(profile?.profile_image_url || null);

  // Determine aspect ratio and layout based on post type
  const getAspectRatio = () => {
    switch (postType) {
      case 'story':
      case 'reels':
        return 'aspect-[9/16]'; // 9:16 for stories and reels
      case 'post':
      default:
        return 'aspect-[4/5]'; // 4:5 for regular posts and carousel
    }
  };

  // Carousel navigation functions - Otimizadas
  const nextSlide = useCallback(() => {
    if (currentSlide < finalMedia.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  }, [currentSlide, finalMedia.length]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  }, [currentSlide]);

  // Touch/Mouse handlers for swipe functionality - Otimizados
  const handleStart = useCallback((clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setTranslateX(0);
  }, []);

  const handleMove = useCallback((clientX: number) => {
    if (!isDragging) return;
    const diff = clientX - startX;
    // Limita o movimento para evitar over-scroll
    const maxTranslate = containerRef.current?.offsetWidth || 300;
    const limitedDiff = Math.max(-maxTranslate * 0.3, Math.min(maxTranslate * 0.3, diff));
    setTranslateX(limitedDiff);
  }, [isDragging, startX]);

  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const threshold = 50; // minimum distance to trigger slide change
    
    if (translateX > threshold && currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    } else if (translateX < -threshold && currentSlide < finalMedia.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
    
    setTranslateX(0);
  }, [isDragging, translateX, currentSlide, finalMedia.length]);

  // Mouse events - Otimizados
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  }, [handleStart]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleMove(e.clientX);
  }, [handleMove]);

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      handleEnd();
    }
  }, [isDragging, handleEnd]);

  // Touch events - Otimizados
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleStart(e.touches[0].clientX);
  }, [handleStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleMove(e.touches[0].clientX);
  }, [handleMove]);

  const handleTouchEnd = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // Story Layout
  if (postType === 'story') {
    return (
      <div className="max-w-[280px] mx-auto">
        <Card className="overflow-hidden bg-black border-gray-800 rounded-2xl" style={{ borderStyle: 'none' }}>
          {/* Story Content */}
          <div className={`${getAspectRatio()} bg-black relative`}>
            {/* Story Header */}
            <div className="absolute top-4 left-4 right-4 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {profileImageUrl ? (
                    <img 
                      src={profileImageUrl} 
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border-2 border-white"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center border-2 border-white">
                      <span className="text-white text-xs font-bold">
                        {getProfileInitials(companyName)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <p className="font-semibold text-sm text-white">{instagramUsername}</p>
                    {isVerified && (
                      <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <MoreHorizontal className="w-5 h-5 text-white" />
              </div>
            </div>
  
            {/* Story Media */}
            {finalMedia.length > 0 ? (
              <div className="w-full h-full">
                {finalMedia[0].file_type === 'video' ? (
                  <video 
                    className="w-full h-full object-cover"
                    poster={getMediaUrl(finalMedia[0].file_path)}
                  >
                    <source src={getMediaUrl(finalMedia[0].file_path)} type={finalMedia[0].mime_type || 'video/mp4'} />
                  </video>
                ) : (
                  <img 
                    src={getMediaUrl(finalMedia[0].file_path)} 
                    alt="Story content"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Erro ao carregar imagem:', e);
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <div className="text-center text-gray-400">
                  <div className="text-4xl mb-2">📷</div>
                  <p className="text-sm">Sem mídia</p>
                </div>
              </div>
            )}
  
            {/* REMOVER ESTA SEÇÃO - Story Caption */}
            {/* 
            {post.content_caption && (
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white text-sm font-medium drop-shadow-lg">
                  {post.content_caption}
                </p>
              </div>
            )}
            */}
          </div>
        </Card>
      </div>
    );
  }

  // Reels Layout
  if (postType === 'reels') {
    return (
      <div className="max-w-[280px] mx-auto">
        <Card className="overflow-hidden bg-black border-gray-800 rounded-2xl" style={{ borderStyle: 'none' }}>
          {/* Reels Content */}
          <div className={`${getAspectRatio()} bg-black relative`}>
            {/* Reels Header */}
            <div className="absolute top-4 left-4 right-4 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {/* Badge "Reels" removido */}
                </div>
                <MoreHorizontal className="w-5 h-5 text-white" />
              </div>
            </div>
  
            {/* Reels Media */}
            {finalMedia.length > 0 ? (
              <div className="w-full h-full relative">
                {finalMedia[0].file_type === 'video' ? (
                  <>
                    <video 
                      className="w-full h-full object-cover"
                      poster={getMediaUrl(finalMedia[0].file_path)}
                    >
                      <source src={getMediaUrl(finalMedia[0].file_path)} type={finalMedia[0].mime_type || 'video/mp4'} />
                    </video>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <Play className="w-12 h-12 text-white/80" fill="currentColor" />
                    </div>
                  </>
                ) : (
                  <img 
                    src={getMediaUrl(finalMedia[0].file_path)} 
                    alt="Reels content"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Erro ao carregar imagem:', e);
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <div className="text-center text-gray-400">
                  <div className="text-4xl mb-2">🎬</div>
                  <p className="text-sm">Sem mídia</p>
                </div>
              </div>
            )}
  
            {/* Reels Side Actions */}
            <div className="absolute right-3 bottom-20 flex flex-col space-y-4">
              <div className="flex flex-col items-center">
                <Heart className="w-7 h-7 text-white" />
                <span className="text-white text-xs mt-1">123</span>
              </div>
              <div className="flex flex-col items-center">
                <MessageCircle className="w-7 h-7 text-white" />
                <span className="text-white text-xs mt-1">45</span>
              </div>
              <div className="flex flex-col items-center">
                <Send className="w-7 h-7 text-white" />
              </div>
              <div className="flex flex-col items-center">
                <Bookmark className="w-7 h-7 text-white" />
              </div>
              <div className="flex flex-col items-center">
                <Volume2 className="w-7 h-7 text-white" />
              </div>
            </div>
  
            {/* Reels Bottom Info - APENAS perfil, SEM legenda */}
            <div className="absolute bottom-4 left-4 right-16">
              <div className="flex items-center space-x-2">
                {profileImageUrl ? (
                  <img 
                    src={profileImageUrl} 
                    alt="Profile"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {getProfileInitials(companyName)}
                    </span>
                  </div>
                )}
                <p className="font-semibold text-sm text-white">{instagramUsername}</p>
                {isVerified && (
                  <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              {/* REMOVER ESTA SEÇÃO - Reels Caption */}
              {/* 
              {post.content_caption && (
                <p className="text-white text-sm">
                  {post.content_caption}
                </p>
              )}
              */}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Feed Layout (Post/Carousel) - Com funcionalidade de carrossel
  return (
    <div className="max-w-sm mx-auto">
      <Card className="overflow-hidden bg-white border-gray-200 rounded-lg" style={{ borderStyle: 'none' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            {profileImageUrl ? (
              <img 
                src={profileImageUrl} 
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {getProfileInitials(companyName)}
                </span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-1">
                <p className="font-semibold text-sm text-black">{instagramUsername}</p>
                {isVerified && (
                  <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          </div>
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </div>

        {/* Media Content - Carrossel */}
        <div className={`${getAspectRatio()} bg-gray-100 relative overflow-hidden`}>
          {finalMedia.length > 0 ? (
            <div 
              ref={containerRef}
              className="w-full h-full relative cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Carousel Container */}
              <div 
                className={`flex h-full ${!isDragging ? 'transition-transform duration-200 ease-out' : ''}`}
                style={{
                  transform: `translateX(${-currentSlide * 100 + (isDragging ? (translateX / (containerRef.current?.offsetWidth || 1)) * 100 : 0)}%)`
                }}
              >
                {finalMedia.map((mediaItem: any, index: number) => (
                  <div key={index} className="w-full h-full flex-shrink-0">
                    {mediaItem.file_type === 'video' ? (
                      <video 
                        className="w-full h-full object-cover"
                        controls
                        poster={getMediaUrl(mediaItem.file_path)}
                      >
                        <source src={getMediaUrl(mediaItem.file_path)} type={mediaItem.mime_type || 'video/mp4'} />
                        Seu navegador não suporta vídeo.
                      </video>
                    ) : (
                      <img 
                        src={getMediaUrl(mediaItem.file_path)} 
                        alt={`Post content ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Erro ao carregar imagem:', e);
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Navigation Arrows - apenas se houver múltiplas mídias */}
              {finalMedia.length > 1 && (
                <>
                  {currentSlide > 0 && (
                    <button
                      onClick={prevSlide}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors z-10"
                      type="button"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  )}
                  {currentSlide < finalMedia.length - 1 && (
                    <button
                      onClick={nextSlide}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors z-10"
                      type="button"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}

              {/* Dots Indicator - apenas se houver múltiplas mídias */}
              {finalMedia.length > 1 && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 z-10">
                  {finalMedia.map((_: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentSlide ? 'bg-white' : 'bg-white/50'
                      }`}
                      type="button"
                      aria-label={`Ir para slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Media Counter */}
              {finalMedia.length > 1 && (
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs bg-black/50 text-white border-none">
                    {currentSlide + 1}/{finalMedia.length}
                  </Badge>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <div className="text-center text-gray-400">
                <div className="text-4xl mb-2">📷</div>
                <p className="text-sm">Sem mídia</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-4">
              <Heart className="w-6 h-6 text-gray-700" />
              <MessageCircle className="w-6 h-6 text-gray-700" />
              <Send className="w-6 h-6 text-gray-700" />
            </div>
            <Bookmark className="w-6 h-6 text-gray-700" />
          </div>
          
          <div className="mb-2">
            <p className="text-sm font-semibold text-black">
              {profile?.followers_count ? `${profile.followers_count.toLocaleString()} curtidas` : '123 curtidas'}
            </p>
          </div>
          
          {post.content_caption && (
            <div className="mb-2">
              <p className="text-sm text-black">
                <span className="font-semibold">{instagramUsername}</span>{' '}
                <span style={{ whiteSpace: 'pre-wrap' }}>{post.content_caption}</span>
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
