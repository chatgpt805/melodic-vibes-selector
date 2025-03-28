
import React, { useEffect } from "react";
import { useMusic } from "@/contexts/MusicContext";
import ApiKeyForm from "@/components/ApiKeyForm";
import MusicFilters from "@/components/MusicFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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

  if (!hasApiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ApiKeyForm />
      </div>
    );
  }

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
              <div key={video.id} className="music-card">
                <div className="relative aspect-video">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold line-clamp-2 mb-1">{video.title}</h3>
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
    </div>
  );
};

export default Index;
