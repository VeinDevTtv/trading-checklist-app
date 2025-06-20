'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { YouTubeAuthManager } from '@/utils/youtubeAuth';

interface VideoPlayerProps {
  videoId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  requireAuth?: boolean;
  autoplay?: boolean;
  className?: string;
}

export function VideoPlayer({
  videoId,
  title,
  description,
  thumbnailUrl,
  requireAuth = true,
  autoplay = false,
  className = ''
}: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (!requireAuth) {
        setHasAccess(true);
        setIsLoading(false);
        return;
      }

      try {
        const authManager = YouTubeAuthManager.getInstance();
        await authManager.initialize();

        const isAuthenticated = authManager.isAuthenticated();
        const hasYouTubeAccess = authManager.hasValidYouTubeAccess();

        if (!isAuthenticated) {
          setError('Please sign in to watch this video');
          setHasAccess(false);
        } else if (!hasYouTubeAccess) {
          setError('YouTube access required for video playback');
          setHasAccess(false);
        } else {
          setHasAccess(true);
        }
      } catch (err) {
        console.error('Video access check failed:', err);
        setError('Failed to verify video access');
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [requireAuth]);

  const handlePlayVideo = () => {
    if (hasAccess) {
      setShowPlayer(true);
    }
  };

  const getVideoThumbnail = () => {
    return thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const getVideoEmbedUrl = () => {
    const params = new URLSearchParams({
      autoplay: autoplay ? '1' : '0',
      controls: '1',
      rel: '0',
      modestbranding: '1',
      fs: '1'
    });
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  };

  if (isLoading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="bg-gray-300 dark:bg-gray-700 h-48 w-full rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasAccess) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Video Access Restricted</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="bg-gray-200 dark:bg-gray-800 h-48 w-full rounded-lg mb-4 flex items-center justify-center">
              <Play className="h-16 w-16 text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error || 'This video requires special access to view'}
            </p>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/mentorship-access-denied'}
            >
              Get Access
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-0">
        {!showPlayer ? (
          <div className="relative group cursor-pointer" onClick={handlePlayVideo}>
            <div className="relative">
              <img
                src={getVideoThumbnail()}
                alt={title}
                className="w-full h-48 sm:h-64 md:h-80 object-cover rounded-t-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-200 rounded-t-lg flex items-center justify-center">
                <div className="bg-red-600 hover:bg-red-700 rounded-full p-4 transform group-hover:scale-110 transition-transform duration-200">
                  <Play className="h-8 w-8 text-white ml-1" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            <iframe
              src={getVideoEmbedUrl()}
              title={title}
              className="w-full h-48 sm:h-64 md:h-80 rounded-t-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
        
        {(title || description) && (
          <div className="p-6">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// YouTube Player with Playlist Support
interface PlaylistPlayerProps {
  videos: Array<{
    id: string;
    title: string;
    description?: string;
    duration?: string;
  }>;
  title: string;
  className?: string;
}

export function PlaylistPlayer({ videos, title, className = '' }: PlaylistPlayerProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const authManager = YouTubeAuthManager.getInstance();
        await authManager.initialize();
        
        const isAuthenticated = authManager.isAuthenticated();
        const hasYouTubeAccess = authManager.hasValidYouTubeAccess();
        
        setHasAccess(isAuthenticated && hasYouTubeAccess);
      } catch (error) {
        console.error('Playlist access check failed:', error);
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, []);

  if (isLoading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="bg-gray-300 dark:bg-gray-700 h-48 w-full rounded-lg mb-4"></div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasAccess) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Playlist Access Restricted</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Sign in with YouTube to access this video playlist
            </p>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/mentorship-access-denied'}
            >
              Get Access
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentVideo = videos[currentVideoIndex];

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {currentVideoIndex + 1} of {videos.length} videos
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-6">
          {/* Main Video Player */}
          <div className="lg:col-span-2">
            <VideoPlayer
              videoId={currentVideo.id}
              title={currentVideo.title}
              description={currentVideo.description}
              requireAuth={false} // Already checked at playlist level
            />
          </div>
          
          {/* Playlist Sidebar */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              Playlist ({videos.length} videos)
            </h4>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {videos.map((video, index) => (
                <div
                  key={video.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    index === currentVideoIndex
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setCurrentVideoIndex(index)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {video.title}
                      </p>
                      {video.duration && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {video.duration}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 