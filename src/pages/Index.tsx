import React, { useEffect, useState } from "react";
import { useMusic } from "@/contexts/MusicContext";
import ApiKeyForm from "@/components/ApiKeyForm";
import MusicFilters from "@/components/MusicFilters";
import VideoPlayer from "@/components/VideoPlayer";
import ChatbotSuggestions from "@/components/ChatbotSuggestions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Play, MessageSquare } from "lucide-react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useMediaQuery } from "@/hooks/use-media-query";

const Index = () => {
  const { 
    videos, 
    hasApiKey, 
    loadTrendingMusic, 
    isLoading, 
    searchFilters, 
    searchMusicVideos, 
    searchQuery, 
    setSearchQuery 
  } = useMusic();

  const [playingVideo, setPlayingVideo] = useState<{id: string, title: string} | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    if (hasApiKey) {
      loadTrendingMusic(searchFilters.regionCode);
    }
  }, [hasApiKey, searchFilters.regionCode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchMusicVideos(searchQuery, searchFilters);
    }
  };

  const handlePlayVideo = (videoId: string, title: string) => {
    setPlayingVideo({ id: videoId, title });
  };

  const closePlayer = () => {
    setPlayingVideo(null);
  };

  if (!hasApiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ApiKeyForm />
      </div>
    );
  }

  const ChatbotWrapper = isDesktop ? Dialog : Drawer;
  const ChatbotTrigger = isDesktop ? DialogTrigger : DrawerTrigger;
  const ChatbotContainer = isDesktop ? DialogContent : DrawerContent;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold glow-text mb-2">Music Discovery</h1>
        <p className="text-muted-foreground">
          Discover new music from around the world
        </p>
      </header>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex w-full max-w-2xl gap-2">
          <Input 
            type="text"
            placeholder="Search for music..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-800 border-slate-700"
          />
          <Button type="submit" disabled={isLoading}>
            <Search className="mr-2" />
            Search
          </Button>
          
          <ChatbotWrapper open={isChatOpen} onOpenChange={setIsChatOpen}>
            <ChatbotTrigger asChild>
              <Button variant="outline">
                <MessageSquare className="mr-2" />
                Assistant
              </Button>
            </ChatbotTrigger>
            <ChatbotContainer className={isDesktop ? "max-w-md p-0 bg-slate-900 border-slate-800" : "p-0 pb-0 bg-slate-900"}>
              <div className="h-[70vh] md:h-[500px]">
                <ChatbotSuggestions />
              </div>
            </ChatbotContainer>
          </ChatbotWrapper>
        </div>
      </form>

      <MusicFilters />

      <main className="mt-8">
        <h2 className="text-2xl font-semibold mb-6 glow-text">
          {searchQuery ? `Results for "${searchQuery}"` : `Trending Music in ${searchFilters.regionCode}`}
        </h2>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <p className="text-muted-foreground">Loading music...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {videos.map((video) => (
              <div key={video.id} className="music-card group relative">
                <div className="relative aspect-video overflow-hidden rounded-md">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full p-8"
                      onClick={() => handlePlayVideo(video.id, video.title)}
                    >
                      <Play className="h-8 w-8" />
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold line-clamp-2 mb-1 group-hover:text-primary transition-colors">{video.title}</h3>
                  <p className="text-sm text-muted-foreground">{video.channelTitle}</p>
                  <div className="flex mt-2 justify-between items-center">
                    <span className="text-xs text-muted-foreground">{video.publishedAt}</span>
                    {video.viewCount && (
                      <span className="text-xs text-muted-foreground">{video.viewCount}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {videos.length === 0 && !isLoading && (
          <div className="text-center p-8">
            <p className="text-muted-foreground">No videos found. Try another search or filter.</p>
          </div>
        )}
      </main>

      {/* Video player component */}
      <VideoPlayer 
        videoId={playingVideo?.id ?? null}
        isOpen={!!playingVideo}
        onClose={closePlayer}
        title={playingVideo?.title}
      />
    </div>
  );
};

export default Index;
