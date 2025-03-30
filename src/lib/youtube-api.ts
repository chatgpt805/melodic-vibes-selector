
export const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';
export const YOUTUBE_VIDEO_URL = 'https://www.youtube.com/embed/';
export const DEFAULT_RESULTS_COUNT = 10;

// API key should be configured by the user
let apiKey = 'AIzaSyCdyJti7GTDfKKDYAmzb0qf3-7GQn2HBzA';

export const setYoutubeApiKey = (key: string) => {
  apiKey = key;
  localStorage.setItem('youtube_api_key', key);
};

export const getYoutubeApiKey = () => {
  if (!apiKey) {
    const storedKey = localStorage.getItem('youtube_api_key');
    if (storedKey) {
      apiKey = storedKey;
    } else {
      // Use default key if none is found
      apiKey = 'AIzaSyCdyJti7GTDfKKDYAmzb0qf3-7GQn2HBzA';
    }
  }
  return apiKey;
};

export interface VideoItem {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  publishedAt: string;
  viewCount?: string;
  description?: string;
}

export interface YouTubeApiParams {
  part: string;
  chart?: string;
  q?: string;
  regionCode?: string;
  videoCategoryId?: string;
  maxResults?: number;
  pageToken?: string;
  publishedAfter?: string;
  publishedBefore?: string;
  type?: string;
  videoEmbeddable?: string;
  videoSyndicated?: string;
  videoDuration?: string;
}

// Helper to format video duration from ISO 8601 format
export const formatDuration = (duration: string) => {
  if (!duration) return '';
  
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return duration;
  
  const hours = match[1] ? parseInt(match[1].replace('H', '')) : 0;
  const minutes = match[2] ? parseInt(match[2].replace('M', '')) : 0;
  const seconds = match[3] ? parseInt(match[3].replace('S', '')) : 0;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Helper to format view count
export const formatViewCount = (viewCount: string) => {
  const count = parseInt(viewCount);
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M views`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K views`;
  }
  return `${count} views`;
};

// Fetch trending music videos
export const fetchTrendingMusic = async (
  regionCode = 'US',
  maxResults = DEFAULT_RESULTS_COUNT,
  pageToken = ''
): Promise<{ items: VideoItem[], nextPageToken: string | null }> => {
  if (!apiKey) throw new Error('YouTube API key not set');

  const params: YouTubeApiParams = {
    part: 'snippet,statistics',
    chart: 'mostPopular',
    regionCode,
    videoCategoryId: '10', // Music category ID
    maxResults,
    pageToken,
    type: 'video',
    videoEmbeddable: 'true',
    videoSyndicated: 'true'
  };

  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) queryParams.append(key, value.toString());
  });
  queryParams.append('key', apiKey);

  try {
    const response = await fetch(`${YOUTUBE_API_URL}/videos?${queryParams.toString()}`);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'YouTube API error');
    }

    const items: VideoItem[] = data.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString(),
      viewCount: formatViewCount(item.statistics.viewCount),
      description: item.snippet.description
    }));

    return { 
      items, 
      nextPageToken: data.nextPageToken || null 
    };
  } catch (error) {
    console.error('Error fetching trending music:', error);
    throw error;
  }
};

// Search for videos based on query and filters
export const searchMusic = async (
  query: string,
  filters: {
    regionCode?: string;
    isClassic?: boolean;
    language?: string;
    maxResults?: number;
    pageToken?: string;
  }
): Promise<{ items: VideoItem[], nextPageToken: string | null }> => {
  if (!apiKey) throw new Error('YouTube API key not set');
  
  const { 
    regionCode = 'US', 
    isClassic = false, 
    language = '',
    maxResults = DEFAULT_RESULTS_COUNT,
    pageToken = ''
  } = filters;

  let fullQuery = `${query} ${language ? language + ' music' : 'music'}`;
  
  const params: YouTubeApiParams = {
    part: 'snippet',
    q: fullQuery,
    regionCode,
    maxResults,
    pageToken,
    type: 'video',
    videoEmbeddable: 'true',
  };
  
  // Add time-based filtering
  const now = new Date();
  if (isClassic) {
    // For classics, videos published before 5 years ago
    const fiveYearsAgo = new Date(now);
    fiveYearsAgo.setFullYear(now.getFullYear() - 5);
    params.publishedBefore = fiveYearsAgo.toISOString();
  } else {
    // For new releases, videos published within the last year
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(now.getFullYear() - 1);
    params.publishedAfter = oneYearAgo.toISOString();
  }

  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) queryParams.append(key, value.toString());
  });
  queryParams.append('key', apiKey);

  try {
    const response = await fetch(`${YOUTUBE_API_URL}/search?${queryParams.toString()}`);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'YouTube API error');
    }

    const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
    
    if (!videoIds) return { items: [], nextPageToken: null };
    
    // Get additional details for videos
    const videoResponse = await fetch(
      `${YOUTUBE_API_URL}/videos?part=snippet,statistics&id=${videoIds}&key=${apiKey}`
    );
    const videoData = await videoResponse.json();
    
    if (videoData.error) {
      throw new Error(videoData.error.message || 'YouTube API error');
    }

    const items: VideoItem[] = videoData.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString(),
      viewCount: formatViewCount(item.statistics.viewCount || '0'),
      description: item.snippet.description
    }));

    return { 
      items, 
      nextPageToken: data.nextPageToken || null 
    };
  } catch (error) {
    console.error('Error searching music:', error);
    throw error;
  }
};

// Get related videos for a specific video
export const getRelatedVideos = async (
  videoId: string,
  maxResults = 5
): Promise<VideoItem[]> => {
  if (!apiKey) throw new Error('YouTube API key not set');

  const params = new URLSearchParams({
    part: 'snippet',
    relatedToVideoId: videoId,
    type: 'video',
    maxResults: maxResults.toString(),
    key: apiKey
  });

  try {
    const response = await fetch(`${YOUTUBE_API_URL}/search?${params.toString()}`);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'YouTube API error');
    }

    const items: VideoItem[] = data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString()
    }));

    return items;
  } catch (error) {
    console.error('Error fetching related videos:', error);
    return [];
  }
};
