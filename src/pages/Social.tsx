
import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MusicPost } from "@/components/social/MusicPost";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useMusic } from "@/contexts/MusicContext";
import { Loader, Search } from "lucide-react";
import { toast } from "sonner";
import EnhancedVideoPlayer from "@/components/EnhancedVideoPlayer";

interface PostProfile {
  username: string;
  avatar_url: string | null;
}

interface PostWithProfile {
  id: string;
  user_id: string;
  video_id: string;
  title: string;
  description: string | null;
  created_at: string;
  thumbnail: string;
  likes: number;
  comments_count: number;
  profile: PostProfile;
}

const Social = () => {
  const { user } = useAuth();
  const { toast: toastShad } = useToast();
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [shareTitle, setShareTitle] = useState("");
  const [shareDescription, setShareDescription] = useState("");
  const [sharing, setSharing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { searchMusicVideos, videos: ytSearchResults, isLoading: isSearching } = useMusic();
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async (pageNumber = 0, refresh = false) => {
    try {
      const limit = 10;
      const from = pageNumber * limit;
      const to = from + limit - 1;

      const commentsCountQuery = await supabase
        .from('post_comments')
        .select('post_id');
      
      if (commentsCountQuery.error) throw commentsCountQuery.error;
      
      const commentsCountMap: Record<string, number> = {};
      if (commentsCountQuery.data) {
        commentsCountQuery.data.forEach(item => {
          if (item.post_id) {
            commentsCountMap[item.post_id] = (commentsCountMap[item.post_id] || 0) + 1;
          }
        });
      }

      const { data, error, count } = await supabase
        .from("music_posts")
        .select(`
          *,
          profile:profiles(username, avatar_url)
        `, { count: 'exact' })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      const processedData = (data || []).map(post => ({
        ...post,
        comments_count: commentsCountMap[post.id] || 0,
        profile: post.profile || { username: 'Unknown', avatar_url: null }
      })) as PostWithProfile[];

      if (refresh || pageNumber === 0) {
        setPosts(processedData);
      } else {
        setPosts(prev => [...prev, ...processedData]);
      }

      if (count !== null) {
        setHasMore(from + data.length < count);
      } else {
        setHasMore(data.length === limit);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(0, false);
  }, []);

  useEffect(() => {
    setSearchResults(ytSearchResults);
  }, [ytSearchResults]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    searchMusicVideos(searchQuery);
  };

  const selectVideo = (video: any) => {
    setSelectedVideo(video);
    setShareTitle(video.title);
    setShareDescription("");
  };

  const shareVideo = async () => {
    if (!user) {
      toastShad({
        title: "Authentication required",
        description: "Please log in to share music",
        variant: "destructive"
      });
      return;
    }

    if (!selectedVideo) {
      toastShad({
        title: "No video selected",
        description: "Please select a video to share",
        variant: "destructive"
      });
      return;
    }

    setSharing(true);

    try {
      const { data, error } = await supabase
        .from("music_posts")
        .insert({
          user_id: user.id,
          video_id: selectedVideo.videoId,
          title: shareTitle,
          description: shareDescription,
          thumbnail: selectedVideo.thumbnail
        })
        .select(`
          *,
          profile:profiles(username, avatar_url)
        `)
        .single();

      if (error) throw error;

      const newPost = {
        ...data,
        comments_count: 0,
        profile: data.profile || { username: 'Unknown', avatar_url: null }
      } as PostWithProfile;
      
      setPosts(prev => [newPost, ...prev]);
      
      toastShad({
        title: "Shared successfully",
        description: "Your music has been shared"
      });
      
      setShareTitle("");
      setShareDescription("");
      setSelectedVideo(null);
      setSearchQuery("");
      setSearchResults([]);
      setDialogOpen(false);
    } catch (error: any) {
      toastShad({
        title: "Share failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSharing(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, false);
  };

  return (
    <Layout>
      <div className="container max-w-6xl py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">Music Discovery</h1>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                Share Music
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-zinc-900 border-zinc-800">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Share Music</DialogTitle>
                <DialogDescription>
                  Search for music videos and share them with the community
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4 space-y-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input 
                    placeholder="Search for music videos..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-zinc-800 border-zinc-700"
                  />
                  <Button type="submit" disabled={isSearching} className="bg-red-600 hover:bg-red-700">
                    {isSearching ? <Loader className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    Search
                  </Button>
                </form>
                
                {isSearching ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {searchResults.map((result) => (
                      <div 
                        key={result.videoId} 
                        className={`flex gap-3 p-2 rounded-lg cursor-pointer hover:bg-zinc-800 ${selectedVideo?.videoId === result.videoId ? 'ring-1 ring-red-500 bg-zinc-800' : ''}`}
                        onClick={() => selectVideo(result)}
                      >
                        <img 
                          src={result.thumbnail} 
                          alt={result.title} 
                          className="w-24 h-16 object-cover rounded" 
                        />
                        <div className="flex-1">
                          <h4 className="font-medium line-clamp-1">{result.title}</h4>
                          <p className="text-xs text-zinc-400">{result.channelTitle}</p>
                        </div>
                      </div>
                    ))}
                    
                    {searchResults.length === 0 && searchQuery && !isSearching && (
                      <p className="text-center py-4 text-zinc-400">No results found</p>
                    )}
                  </div>
                )}
                
                {selectedVideo && (
                  <div className="space-y-4 border-t border-zinc-800 pt-4">
                    <div className="flex gap-3">
                      <img 
                        src={selectedVideo.thumbnail} 
                        alt={selectedVideo.title} 
                        className="w-24 h-16 object-cover rounded" 
                      />
                      <div>
                        <h4 className="font-medium line-clamp-2">{selectedVideo.title}</h4>
                        <p className="text-xs text-zinc-400">{selectedVideo.channelTitle}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Input
                        placeholder="Title (required)"
                        value={shareTitle}
                        onChange={(e) => setShareTitle(e.target.value)}
                        className="bg-zinc-800 border-zinc-700"
                      />
                      <Textarea
                        placeholder="Add a description (optional)"
                        value={shareDescription}
                        onChange={(e) => setShareDescription(e.target.value)}
                        className="min-h-[80px] bg-zinc-800 border-zinc-700"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-zinc-700 text-zinc-300">Cancel</Button>
                <Button 
                  onClick={shareVideo} 
                  disabled={!selectedVideo || !shareTitle || sharing}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {sharing ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Share
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="mb-6 bg-zinc-800 border border-zinc-700 p-1 rounded-full w-full max-w-md mx-auto">
            <TabsTrigger value="feed" className="rounded-full data-[state=active]:bg-red-600">Feed</TabsTrigger>
            <TabsTrigger value="trending" className="rounded-full data-[state=active]:bg-red-600">Trending</TabsTrigger>
            <TabsTrigger value="following" className="rounded-full data-[state=active]:bg-red-600">Following</TabsTrigger>
          </TabsList>
          
          <TabsContent value="feed" className="space-y-6">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-800 rounded-xl overflow-hidden animate-pulse">
                  <div className="h-52 bg-zinc-800"></div>
                  <div className="p-4">
                    <div className="h-6 w-3/4 bg-zinc-700 rounded mb-2"></div>
                    <div className="h-4 w-1/2 bg-zinc-700 rounded"></div>
                  </div>
                </div>
              ))
            ) : posts.length > 0 ? (
              <>
                {posts.map(post => (
                  <MusicPost key={post.id} post={post} />
                ))}
                
                {hasMore && (
                  <div className="flex justify-center pt-4">
                    <Button onClick={loadMore} variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                      {loading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Load more
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-800 p-8 text-center rounded-xl">
                <h3 className="text-xl font-medium mb-2">No posts yet</h3>
                <p className="text-zinc-400 mb-4">Be the first to share some music!</p>
                <Button onClick={() => setDialogOpen(true)} className="bg-red-600 hover:bg-red-700">Share Music</Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="trending">
            <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-800 p-8 text-center rounded-xl">
              <h3 className="text-xl font-medium mb-2">Trending music</h3>
              <p className="text-zinc-400">Coming soon</p>
            </div>
          </TabsContent>
          
          <TabsContent value="following">
            <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-800 p-8 text-center rounded-xl">
              <h3 className="text-xl font-medium mb-2">Follow other music lovers</h3>
              <p className="text-zinc-400">Coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <EnhancedVideoPlayer 
        videoId={selectedVideo?.videoId ?? null}
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        title={selectedVideo?.title}
      />
    </Layout>
  );
};

export default Social;
