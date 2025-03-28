
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  VideoItem, 
  fetchTrendingMusic, 
  searchMusic, 
  getRelatedVideos,
  getYoutubeApiKey,
  setYoutubeApiKey
} from '@/lib/youtube-api';
import { toast } from '@/components/ui/use-toast';

interface MusicContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  isLoading: boolean;
  videos: VideoItem[];
  selectedVideo: VideoItem | null;
  nextPageToken: string | null;
  hasApiKey: boolean;
  loadTrendingMusic: (regionCode?: string) => Promise<void>;
  loadMoreTrendingMusic: (regionCode?: string) => Promise<void>;
  searchMusicVideos: (query: string, filters: any) => Promise<void>;
  loadMoreSearchResults: () => Promise<void>;
  selectVideo: (video: VideoItem) => void;
  loadRelatedVideos: (videoId: string) => Promise<void>;
  relatedVideos: VideoItem[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchFilters: {
    regionCode: string;
    isClassic: boolean;
    language: string;
  };
  updateSearchFilters: (filters: Partial<{
    regionCode: string;
    isClassic: boolean;
    language: string;
  }>) => void;
  clearResults: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState<string>(getYoutubeApiKey());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<VideoItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchFilters, setSearchFilters] = useState({
    regionCode: 'US',
    isClassic: false,
    language: ''
  });

  const hasApiKey = Boolean(apiKey);

  const setApiKey = (key: string) => {
    setYoutubeApiKey(key);
    setApiKeyState(key);
  };

  const loadTrendingMusic = async (regionCode = 'US') => {
    try {
      if (!hasApiKey) {
        toast({
          title: 'API Key Required',
          description: 'Please set your YouTube API key in settings.',
          variant: 'destructive',
        });
        return;
      }

      setIsLoading(true);
      setSelectedVideo(null);
      const { items, nextPageToken } = await fetchTrendingMusic(regionCode);
      setVideos(items);
      setNextPageToken(nextPageToken);
    } catch (error) {
      console.error('Error loading trending music:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load trending music',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreTrendingMusic = async (regionCode = 'US') => {
    if (!nextPageToken || isLoading) return;

    try {
      setIsLoading(true);
      const { items, nextPageToken: newToken } = await fetchTrendingMusic(
        regionCode,
        10,
        nextPageToken
      );
      setVideos([...videos, ...items]);
      setNextPageToken(newToken);
    } catch (error) {
      console.error('Error loading more trending music:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load more videos',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const searchMusicVideos = async (
    query: string,
    filters = searchFilters
  ) => {
    if (!query.trim()) return;

    try {
      if (!hasApiKey) {
        toast({
          title: 'API Key Required',
          description: 'Please set your YouTube API key in settings.',
          variant: 'destructive',
        });
        return;
      }

      setIsLoading(true);
      setSearchQuery(query);
      setSearchFilters(prev => ({ ...prev, ...filters }));
      setSelectedVideo(null);
      
      const { items, nextPageToken } = await searchMusic(query, filters);
      setVideos(items);
      setNextPageToken(nextPageToken);
    } catch (error) {
      console.error('Error searching music:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to search music',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreSearchResults = async () => {
    if (!nextPageToken || isLoading || !searchQuery) return;

    try {
      setIsLoading(true);
      const { items, nextPageToken: newToken } = await searchMusic(
        searchQuery,
        {
          ...searchFilters,
          pageToken: nextPageToken,
        }
      );
      setVideos([...videos, ...items]);
      setNextPageToken(newToken);
    } catch (error) {
      console.error('Error loading more search results:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load more videos',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectVideo = (video: VideoItem) => {
    setSelectedVideo(video);
    loadRelatedVideos(video.id);
  };

  const loadRelatedVideos = async (videoId: string) => {
    try {
      const items = await getRelatedVideos(videoId);
      setRelatedVideos(items);
    } catch (error) {
      console.error('Error loading related videos:', error);
    }
  };

  const updateSearchFilters = (filters: Partial<typeof searchFilters>) => {
    setSearchFilters(prev => ({ ...prev, ...filters }));
  };

  const clearResults = () => {
    setVideos([]);
    setSelectedVideo(null);
    setNextPageToken(null);
    setRelatedVideos([]);
  };

  return (
    <MusicContext.Provider
      value={{
        apiKey,
        setApiKey,
        isLoading,
        videos,
        selectedVideo,
        nextPageToken,
        hasApiKey,
        loadTrendingMusic,
        loadMoreTrendingMusic,
        searchMusicVideos,
        loadMoreSearchResults,
        selectVideo,
        loadRelatedVideos,
        relatedVideos,
        searchQuery,
        setSearchQuery,
        searchFilters,
        updateSearchFilters,
        clearResults
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = (): MusicContextType => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
