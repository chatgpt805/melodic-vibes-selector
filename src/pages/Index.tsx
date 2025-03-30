
import React, { useEffect, useState } from "react";
import { useMusic } from "@/contexts/MusicContext";
import ApiKeyForm from "@/components/ApiKeyForm";
import MusicFilters from "@/components/MusicFilters";
import CustomVideoPlayer from "@/components/CustomVideoPlayer";
import FullPageChatbot from "@/components/FullPageChatbot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Play, MessageSquare } from "lucide-react";
import WelcomeAnimation from "@/components/WelcomeAnimation";

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
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem('has_visited');
    if (hasVisited) {
      setShowWelcome(false);
    } else {
      // Set a timeout to hide the welcome animation after 3.5 seconds
      const timer = setTimeout(() => {
        setShowWelcome(false);
        localStorage.setItem('has_visited', 'true');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, []);

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

  if (showWelcome) {
    return <WelcomeAnimation />;
  }

  if (!hasApiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-ghibli">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover opacity-30"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-purple-900/40 to-slate-900/90"></div>
          <div className="absolute inset-0 ghibli-overlay"></div>
        </div>
        <div className="relative z-10 w-full max-w-md">
          <ApiKeyForm />
        </div>
      </div>
    );
  }

  if (isChatOpen) {
    return <FullPageChatbot onClose={() => setIsChatOpen(false)} />;
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-ghibli overflow-x-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-purple-900/40 to-slate-900/90"></div>
        <div className="absolute inset-0 ghibli-overlay"></div>
      </div>

      <div className="relative z-10">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold glow-text">Music Discovery</h1>
          </div>
          <p className="text-muted-foreground mb-1">
            Discover new music from around the world
          </p>
          <p className="text-muted-foreground text-sm italic mb-4 animate-fade-in">
            नेपालको संगीतको आत्मा पत्ता लगाउनुहोस् – जहाँ परंपरा र नवप्रवर्तनको मिलन हुन्छ, र प्रत्येक गीतले हाम्रो धरोहर र हृदयको कथा बताउँछ।
          </p>
        </header>

        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex w-full max-w-2xl gap-2">
            <Input 
              type="text"
              placeholder="Search for music..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-800/60 border-slate-700"
            />
            <Button type="submit" disabled={isLoading}>
              <Search className="mr-2" />
              Search
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setIsChatOpen(true)}
              className="bg-slate-800/60 border-slate-700 hover:bg-slate-700/70"
            >
              <MessageSquare className="mr-2" />
              Assistant
            </Button>
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
                <div key={video.id} className="music-card group relative animate-enter">
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
        <CustomVideoPlayer 
          videoId={playingVideo?.id ?? null}
          isOpen={!!playingVideo}
          onClose={closePlayer}
          title={playingVideo?.title}
        />
      </div>
    </div>
  );
};

export default Index;
