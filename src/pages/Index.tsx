
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMusic } from "@/contexts/MusicContext";
import { useAuth } from "@/contexts/AuthContext";
import MusicFilters from "@/components/MusicFilters";
import CustomVideoPlayer from "@/components/CustomVideoPlayer";
import FullPageChatbot from "@/components/FullPageChatbot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, Play, MessageSquare, Music, 
  LogOut, User, Heart, Share2, 
  Menu, X
} from "lucide-react";
import WelcomeAnimation from "@/components/WelcomeAnimation";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Sheet, SheetContent, SheetHeader, 
  SheetTitle, SheetTrigger, SheetClose
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Index = () => {
  const { 
    videos, 
    loadTrendingMusic, 
    isLoading, 
    searchFilters, 
    searchMusicVideos, 
    searchQuery, 
    setSearchQuery 
  } = useMusic();

  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [playingVideo, setPlayingVideo] = useState<{id: string, title: string} | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    loadTrendingMusic(searchFilters.regionCode);
  }, [searchFilters.regionCode]);

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

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  if (showWelcome) {
    return <WelcomeAnimation />;
  }

  if (isChatOpen) {
    return <FullPageChatbot onClose={() => setIsChatOpen(false)} />;
  }

  return (
    <div className="min-h-screen bg-ghibli overflow-x-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-purple-900/40 to-slate-900/90"></div>
        <div className="absolute inset-0 ghibli-overlay"></div>
      </div>

      <div className="relative z-10">
        {/* Navbar */}
        <header className="sticky top-0 z-30 backdrop-blur-md bg-black/30 border-b border-purple-500/20">
          <div className="container max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <Music className="h-7 w-7 text-purple-400" />
                <h1 className="text-2xl font-ghibli glow-text">VidAI</h1>
              </Link>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                <Link to="/">
                  <Button variant="ghost" className="font-medium">
                    Discover
                  </Button>
                </Link>
                <Link to="/social">
                  <Button variant="ghost" className="font-medium">
                    Social
                  </Button>
                </Link>
                <Button variant="ghost" onClick={() => setIsChatOpen(true)} className="font-medium">
                  Assistant
                </Button>
              </nav>

              {/* User Menu (Desktop) */}
              <div className="hidden md:block">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="rounded-full h-10 w-10 p-0 relative">
                        <Avatar>
                          <AvatarFallback>
                            {user.email?.substring(0, 2).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass-morph">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate(`/profile/${user.id}`)}>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/social')}>
                        <Heart className="mr-2 h-4 w-4" />
                        Social Feed
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button onClick={() => navigate('/auth')} className="bg-gradient-to-r from-purple-600 to-pink-500">
                    Sign In
                  </Button>
                )}
              </div>
              
              {/* Mobile Menu Trigger */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="glass-morph border-purple-500/20 w-full max-w-xs">
                  <SheetHeader className="mb-6">
                    <SheetTitle className="font-ghibli text-2xl glow-text">VidAI</SheetTitle>
                  </SheetHeader>
                  
                  {/* User Info */}
                  {user && (
                    <div className="flex items-center gap-3 p-3 mb-4 rounded-lg bg-white/5">
                      <Avatar>
                        <AvatarFallback>
                          {user.email?.substring(0, 2).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 truncate">
                        <p className="font-medium">{user.email}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Mobile Nav Links */}
                  <div className="space-y-1">
                    <SheetClose asChild>
                      <Link to="/">
                        <Button variant="ghost" className="w-full justify-start">
                          <Music className="mr-2 h-5 w-5" />
                          Discover
                        </Button>
                      </Link>
                    </SheetClose>
                    
                    <SheetClose asChild>
                      <Link to="/social">
                        <Button variant="ghost" className="w-full justify-start">
                          <Share2 className="mr-2 h-5 w-5" />
                          Social Feed
                        </Button>
                      </Link>
                    </SheetClose>
                    
                    <SheetClose asChild>
                      <Button variant="ghost" onClick={() => setIsChatOpen(true)} className="w-full justify-start">
                        <MessageSquare className="mr-2 h-5 w-5" />
                        AI Assistant
                      </Button>
                    </SheetClose>
                    
                    {user && (
                      <>
                        <SheetClose asChild>
                          <Link to={`/profile/${user.id}`}>
                            <Button variant="ghost" className="w-full justify-start">
                              <User className="mr-2 h-5 w-5" />
                              Profile
                            </Button>
                          </Link>
                        </SheetClose>
                        
                        <SheetClose asChild>
                          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-red-500">
                            <LogOut className="mr-2 h-5 w-5" />
                            Log Out
                          </Button>
                        </SheetClose>
                      </>
                    )}
                    
                    {!user && (
                      <SheetClose asChild>
                        <Link to="/auth">
                          <Button className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-500">
                            Sign In
                          </Button>
                        </Link>
                      </SheetClose>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8 container mx-auto max-w-7xl">
          <div className="py-8">
            <h1 className="text-4xl md:text-5xl font-bold glow-text mb-2">Music Discovery</h1>
            <p className="text-muted-foreground mb-1">
              Discover new music from around the world
            </p>
            <p className="text-muted-foreground text-sm italic mb-6 animate-fade-in">
              नेपालको संगीतको आत्मा पत्ता लगाउनुहोस् – जहाँ परंपरा र नवप्रवर्तनको मिलन हुन्छ, र प्रत्येक गीतले हाम्रो धरोहर र हृदयको कथा बताउँछ।
            </p>

            <div className="flex flex-col md:flex-row gap-4 mt-8">
              <form onSubmit={handleSearch} className="flex gap-2 flex-1">
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
              </form>
              
              <Button 
                variant="outline" 
                onClick={() => setIsChatOpen(true)}
                className="bg-slate-800/60 border-slate-700 hover:bg-slate-700/70"
              >
                <MessageSquare className="mr-2" />
                Assistant
              </Button>
              
              {!user && (
                <Button 
                  onClick={() => navigate('/auth')} 
                  className="bg-gradient-to-r from-purple-600 to-pink-500"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>

          <MusicFilters />

          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-6 glow-text">
              {searchQuery ? `Results for "${searchQuery}"` : `Trending Music in ${searchFilters.regionCode}`}
            </h2>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="music-card animate-pulse">
                    <div className="relative aspect-video overflow-hidden rounded-md bg-purple-500/20"></div>
                    <div className="p-4">
                      <div className="h-4 bg-purple-500/20 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-purple-500/20 rounded w-2/4 mb-2"></div>
                      <div className="h-2 bg-purple-500/20 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
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
          </div>
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
