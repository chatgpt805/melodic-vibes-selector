import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MusicPost } from "@/components/social/MusicPost";
import { YOUTUBE_API_URL, getYoutubeApiKey } from "@/lib/youtube-api";
import { Search, Plus, Music, Loader, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface PostWithProfile {
  id: string;
  user_id: string;
  video_id: string;
  title: string;
  description: string;
  created_at: string;
  likes: number;
  comments_count: number;
  thumbnail: string;
  profile: {
    username: string;
    avatar_url: string;
  };
}

interface YouTubeSearchResult {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      high: { url: string }
    };
    channelTitle: string;
  };
}

const Social = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<YouTubeSearchResult[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeSearchResult | null>(null);
  const [postDescription, setPostDescription] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async (pageNumber = 0) => {
    try {
      const limit = 10;
      const from = pageNumber * limit;
      const to = from + limit - 1;

      setRefreshing(pageNumber === 0);

      const { data, error, count } = await supabase
        .from("music_posts")
        .select(`
          *,
          profile:profiles(username, avatar_url)
        `, { count: 'exact' })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      if (pageNumber === 0) {
        setPosts(data as PostWithProfile[] || []);
      } else {
        setPosts(prev => [...prev, ...(data as PostWithProfile[] || [])]);
      }

      // Check if there are more posts to load
      if (count) {
        setHasMore(from + (data?.length || 0) < count);
      } else {
        setHasMore((data?.length || 0) === limit);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  const refresh = () => {
    setPage(0);
    fetchPosts(0);
  };

  const searchVideos = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    const apiKey = getYoutubeApiKey();

    try {
      const params = new URLSearchParams({
        part: 'snippet',
        q: `${searchQuery} music`,
        type: 'video',
        maxResults: '5',
        key: apiKey
      });

      const response = await fetch(`${YOUTUBE_API_URL}/search?${params.toString()}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || "YouTube API error");
      }

      setSearchResults(data.items || []);
    } catch (error) {
      console.error("Error searching videos:", error);
      toast.error("Failed to search videos");
    } finally {
      setIsSearching(false);
    }
  };

  const handleVideoSelect = (video: YouTubeSearchResult) => {
    setSelectedVideo(video);
  };

  const createPost = async () => {
    if (!user) {
      toast.error("Please sign in to post");
      return;
    }

    if (!selectedVideo) {
      toast.error("Please select a video to share");
      return;
    }

    setIsPosting(true);
    try {
      const { data, error } = await supabase
        .from("music_posts")
        .insert({
          user_id: user.id,
          video_id: selectedVideo.id.videoId,
          title: selectedVideo.snippet.title,
          description: postDescription,
          thumbnail: selectedVideo.snippet.thumbnails.high.url
        } as any)
        .select(`
          *,
          profile:profiles(username, avatar_url)
        `)
        .single();

      if (error) throw error;

      // Add to the top of the posts list
      setPosts(prev => [data as PostWithProfile, ...prev]);
      
      // Reset form
      setSelectedVideo(null);
      setPostDescription("");
      setSearchQuery("");
      setSearchResults([]);
      
      setShowPostDialog(false);
      toast.success("Music shared successfully!");
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to share music");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-ghibli">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-purple-900/40 to-slate-900/90"></div>
        <div className="absolute inset-0 ghibli-overlay"></div>
      </div>

      <div className="relative z-10 container mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold glow-text">Music Feed</h1>
            <p className="text-muted-foreground">Discover and share your favorite music</p>
          </div>
          
          <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-500">
                <Plus className="mr-2 h-4 w-4" /> Share Music
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-morph sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-xl">Share a Music Video</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search for a music video..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-800/60"
                  />
                  <Button onClick={searchVideos} disabled={isSearching}>
                    {isSearching ? <Loader className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>
                
                {searchResults.length > 0 && (
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                    {searchResults.map(video => (
                      <div 
                        key={video.id.videoId}
                        className={`flex gap-3 p-2 rounded-md cursor-pointer hover:bg-white/5 transition-colors ${
                          selectedVideo?.id.videoId === video.id.videoId ? 'bg-white/10 ring-1 ring-purple-500' : ''
                        }`}
                        onClick={() => handleVideoSelect(video)}
                      >
                        <img 
                          src={video.snippet.thumbnails.high.url} 
                          alt={video.snippet.title}
                          className="w-24 h-16 object-cover rounded"
                        />
                        <div className="flex-1 truncate">
                          <h4 className="font-medium text-sm line-clamp-2">{video.snippet.title}</h4>
                          <p className="text-xs text-muted-foreground">{video.snippet.channelTitle}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {selectedVideo && (
                  <div className="bg-black/30 p-3 rounded-md">
                    <div className="flex gap-3">
                      <img 
                        src={selectedVideo.snippet.thumbnails.high.url}
                        alt={selectedVideo.snippet.title}
                        className="w-24 h-16 object-cover rounded"
                      />
                      <div>
                        <h4 className="font-medium text-sm">{selectedVideo.snippet.title}</h4>
                        <p className="text-xs text-muted-foreground">{selectedVideo.snippet.channelTitle}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <Textarea
                  placeholder="Add a description about why you love this song..."
                  value={postDescription}
                  onChange={(e) => setPostDescription(e.target.value)}
                  className="min-h-24 bg-slate-800/60"
                />
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowPostDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={createPost}
                    disabled={!selectedVideo || isPosting}
                    className="bg-gradient-to-r from-purple-600 to-pink-500"
                  >
                    {isPosting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                    Share Music
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2 backdrop-blur-sm h-16"
            onClick={refresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing Feed...' : 'Refresh Feed'}
          </Button>
        </div>

        <div className="space-y-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="glass-morph animate-pulse overflow-hidden">
                <div className="p-4 flex gap-3">
                  <div className="h-10 w-10 rounded-full bg-purple-500/20"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-purple-500/20 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-purple-500/20 rounded w-20"></div>
                  </div>
                </div>
                <div className="px-4 pb-3">
                  <div className="h-4 bg-purple-500/20 rounded w-3/4 mb-3"></div>
                  <div className="h-48 bg-purple-500/20 rounded w-full mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-8 bg-purple-500/20 rounded w-24"></div>
                    <div className="h-8 bg-purple-500/20 rounded w-24"></div>
                  </div>
                </div>
              </Card>
            ))
          ) : posts.length > 0 ? (
            posts.map(post => (
              <MusicPost key={post.id} post={post} />
            ))
          ) : (
            <Card className="glass-morph p-8 text-center">
              <Music size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-medium mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to share your favorite music track!
              </p>
              <Button onClick={() => setShowPostDialog(true)}>
                Share Music
              </Button>
            </Card>
          )}
          
          {hasMore && posts.length > 0 && (
            <div className="flex justify-center pt-4">
              <Button onClick={loadMore} variant="outline" className="backdrop-blur-sm">
                {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Load more
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Social;
