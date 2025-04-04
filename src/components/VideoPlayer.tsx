import React, { useState, useEffect, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { 
  X, Play, Pause, Volume2, VolumeX, 
  Maximize, Minimize, RotateCw, Loader, 
  Settings, Subtitles, MessageCircle, ThumbsUp,
  Bell, User, UserPlus, MoreHorizontal, Share,
  Youtube
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface VideoPlayerProps {
  videoId: string | null;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

interface SubtitleOption {
  label: string;
  value: string;
}

interface QualityOption {
  label: string;
  value: string;
}

interface ChannelInfo {
  name: string;
  avatar: string;
  subscribers: string;
  isSubscribed: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoId, 
  isOpen, 
  onClose,
  title
}) => {
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(100);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuality, setSelectedQuality] = useState<string>("auto");
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);
  const [selectedSubtitle, setSelectedSubtitle] = useState<string>("off");
  const [relatedVideos, setRelatedVideos] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("related");
  const [commentText, setCommentText] = useState("");
  const [channelInfo, setChannelInfo] = useState<ChannelInfo>({
    name: "Channel Name",
    avatar: "",
    subscribers: "1.2M subscribers",
    isSubscribed: false
  });
  const [onlineUsers, setOnlineUsers] = useState<{ id: string, name: string, avatar: string }[]>([
    { id: "1", name: "Alex", avatar: "" },
    { id: "2", name: "Jamie", avatar: "" },
    { id: "3", name: "Taylor", avatar: "" }
  ]);
  
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const qualityOptions: QualityOption[] = [
    { label: "Auto", value: "auto" },
    { label: "4K (2160p)", value: "2160p" },
    { label: "HD (1080p)", value: "1080p" },
    { label: "HD (720p)", value: "720p" },
    { label: "480p", value: "480p" },
    { label: "360p", value: "360p" },
    { label: "240p", value: "240p" },
    { label: "144p", value: "144p" }
  ];
  
  const subtitleOptions: SubtitleOption[] = [
    { label: "Off", value: "off" },
    { label: "English", value: "en" },
    { label: "Spanish", value: "es" },
    { label: "French", value: "fr" },
    { label: "German", value: "de" },
    { label: "Japanese", value: "ja" },
    { label: "Korean", value: "ko" },
    { label: "Hindi", value: "hi" }
  ];
  
  useEffect(() => {
    if (isOpen && videoId) {
      setIsLoading(true);
      setCurrentTime(0);
      setIsPlaying(true);
      
      setTimeout(() => {
        setChannelInfo({
          name: "Music Channel",
          avatar: `https://api.dicebear.com/6.x/initials/svg?seed=${Math.random()}`,
          subscribers: "1.2M subscribers",
          isSubscribed: Math.random() > 0.5
        });
      }, 1000);
      
      setTimeout(() => {
        setDuration(Math.floor(Math.random() * 400) + 180);
        
        const mockRelatedVideos = Array.from({ length: 10 }, (_, i) => ({
          id: `related-${i}`,
          videoId: `vid-${i}`,
          title: `Related Music Video ${i + 1}`,
          channelTitle: `Channel ${i + 1}`,
          thumbnail: `https://picsum.photos/seed/${i + videoId}/320/180`,
          views: `${Math.floor(Math.random() * 1000)}K views`,
          published: `${Math.floor(Math.random() * 12) + 1} months ago`
        }));
        setRelatedVideos(mockRelatedVideos);
        
        const mockComments = Array.from({ length: 15 }, (_, i) => ({
          id: `comment-${i}`,
          author: `User ${i + 1}`,
          authorAvatar: `https://api.dicebear.com/6.x/initials/svg?seed=user${i}`,
          text: `This is such an amazing video! I love the music at ${Math.floor(Math.random() * 3) + 1}:${Math.floor(Math.random() * 59).toString().padStart(2, '0')}.`,
          likes: Math.floor(Math.random() * 1000),
          time: `${Math.floor(Math.random() * 7) + 1} days ago`,
          replies: Math.floor(Math.random() * 10)
        }));
        setComments(mockComments);
        
        setIsLoading(false);
      }, 2000);
    }
  }, [isOpen, videoId]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isOpen && isPlaying && !isLoading) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return prev + 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, isPlaying, duration, isLoading]);
  
  if (!videoId) return null;
  
  const buildEmbedUrl = () => {
    const ytQuality = selectedQuality !== "auto" 
      ? `&vq=${selectedQuality.replace('p', '')}`
      : "";
      
    const ytCaptions = subtitlesEnabled && selectedSubtitle !== "off" 
      ? `&cc_load_policy=1&cc_lang_pref=${selectedSubtitle}`
      : "";
      
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&modestbranding=1&rel=0&controls=0${ytQuality}${ytCaptions}`;
  };
  
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
  };
  
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const toggleFullscreen = () => {
    if (playerContainerRef.current) {
      if (!document.fullscreenElement) {
        playerContainerRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };
  
  const changeQuality = (quality: string) => {
    setSelectedQuality(quality);
    toast({
      title: "Quality Changed",
      description: `Video quality set to ${quality}`,
    });
  };
  
  const toggleSubtitles = () => {
    setSubtitlesEnabled(!subtitlesEnabled);
  };
  
  const changeSubtitleLanguage = (language: string) => {
    setSelectedSubtitle(language);
    if (language !== "off") {
      setSubtitlesEnabled(true);
    }
    toast({
      title: "Subtitles Changed",
      description: language === "off" ? "Subtitles turned off" : `Subtitles set to ${language}`,
    });
  };
  
  const handleRestart = () => {
    setCurrentTime(0);
    setIsPlaying(true);
  };
  
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleSkipForward = () => {
    const newTime = Math.min(currentTime + 10, duration);
    setCurrentTime(newTime);
  };
  
  const handleSkipBackward = () => {
    const newTime = Math.max(currentTime - 10, 0);
    setCurrentTime(newTime);
  };
  
  const toggleSubscribe = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe to channels",
        variant: "destructive"
      });
      return;
    }
    
    setChannelInfo(prev => ({
      ...prev,
      isSubscribed: !prev.isSubscribed
    }));
    
    toast({
      title: channelInfo.isSubscribed ? "Unsubscribed" : "Subscribed",
      description: channelInfo.isSubscribed 
        ? `Unsubscribed from ${channelInfo.name}` 
        : `Subscribed to ${channelInfo.name}`,
    });
  };
  
  const handlePostComment = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to comment",
        variant: "destructive"
      });
      return;
    }
    
    if (!commentText.trim()) {
      toast({
        title: "Empty Comment",
        description: "Please enter a comment",
        variant: "destructive"
      });
      return;
    }
    
    const newComment = {
      id: `comment-new-${Date.now()}`,
      author: user.user_metadata?.username || "You",
      authorAvatar: user.user_metadata?.avatar_url || `https://api.dicebear.com/6.x/initials/svg?seed=user${user.id}`,
      text: commentText,
      likes: 0,
      time: "Just now",
      replies: 0
    };
    
    setComments(prev => [newComment, ...prev]);
    setCommentText("");
    
    toast({
      title: "Comment Posted",
      description: "Your comment has been posted successfully",
    });
  };
  
  const sendFriendRequest = (userId: string, userName: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to send friend requests",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Friend Request Sent",
      description: `Friend request sent to ${userName}`,
    });
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl bg-gradient-to-br from-slate-900 to-purple-950/90 border-slate-800 p-0 overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="relative">
            <SheetHeader className="absolute top-0 left-0 right-0 z-10 flex flex-row items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent">
              <SheetTitle className="text-lg truncate text-left font-bold text-white">
                {title || "Now Playing"}
              </SheetTitle>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
                <X />
              </Button>
            </SheetHeader>
            
            <div ref={playerContainerRef} className="relative aspect-video w-full overflow-hidden">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                  <Loader className="h-12 w-12 animate-spin text-white" />
                </div>
              ) : null}
              
              <iframe
                ref={iframeRef}
                src={buildEmbedUrl()}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
                style={{ opacity: isLoading ? 0.3 : 1 }}
              ></iframe>
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="mb-2">
                  <Slider
                    value={[currentTime]}
                    min={0}
                    max={duration}
                    step={1}
                    onValueChange={handleSeek}
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-300 mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-white hover:bg-white/10 rounded-full h-8 w-8"
                      onClick={handleSkipBackward}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 7L5 12L12 17V7Z" fill="currentColor" />
                        <path d="M19 7L12 12L19 17V7Z" fill="currentColor" />
                      </svg>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20 rounded-full h-10 w-10"
                      onClick={togglePlayPause}
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-white hover:bg-white/10 rounded-full h-8 w-8"
                      onClick={handleSkipForward}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 7V17L19 12L12 7Z" fill="currentColor" />
                        <path d="M5 7V17L12 12L5 7Z" fill="currentColor" />
                      </svg>
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-white hover:bg-white/10 rounded-full h-8 w-8"
                      onClick={toggleMute}
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <div className="w-24 hidden sm:block">
                      <Slider
                        value={[isMuted ? 0 : volume]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={handleVolumeChange}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-white hover:bg-white/10 rounded-full h-8 w-8"
                        >
                          <Subtitles className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-slate-700">
                        <DropdownMenuLabel>Subtitles/CC</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {subtitleOptions.map((option) => (
                          <DropdownMenuItem 
                            key={option.value}
                            onClick={() => changeSubtitleLanguage(option.value)}
                            className={selectedSubtitle === option.value ? "bg-slate-700" : ""}
                          >
                            {option.label}
                            {selectedSubtitle === option.value && (
                              <span className="ml-auto">✓</span>
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-white hover:bg-white/10 rounded-full h-8 w-8"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-slate-700">
                        <DropdownMenuLabel>Quality</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {qualityOptions.map((option) => (
                          <DropdownMenuItem 
                            key={option.value}
                            onClick={() => changeQuality(option.value)}
                            className={selectedQuality === option.value ? "bg-slate-700" : ""}
                          >
                            {option.label}
                            {selectedQuality === option.value && (
                              <span className="ml-auto">✓</span>
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-white hover:bg-white/10 rounded-full h-8 w-8"
                      onClick={handleRestart}
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/10 rounded-full h-8 w-8"
                      onClick={toggleFullscreen}
                    >
                      {isFullscreen ? (
                        <Minimize className="h-4 w-4" />
                      ) : (
                        <Maximize className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 border-b border-slate-800">
              <h3 className="text-lg font-bold mb-2">{title}</h3>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={channelInfo.avatar} />
                    <AvatarFallback className="bg-purple-600">
                      {channelInfo.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="font-medium">{channelInfo.name}</div>
                    <div className="text-xs text-muted-foreground">{channelInfo.subscribers}</div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={channelInfo.isSubscribed ? "outline" : "default"}
                    className={channelInfo.isSubscribed ? 
                      "border-red-500 text-red-500 hover:bg-red-500/10" : 
                      "bg-red-500 hover:bg-red-600"}
                    onClick={toggleSubscribe}
                  >
                    {channelInfo.isSubscribed ? "Subscribed" : "Subscribe"}
                  </Button>
                  
                  <Button variant="outline" size="icon" className="text-muted-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex mt-4 gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="bg-slate-800 hover:bg-slate-700 gap-1 whitespace-nowrap"
                >
                  <ThumbsUp className="h-4 w-4" />
                  Like
                </Button>
                
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="bg-slate-800 hover:bg-slate-700 gap-1 whitespace-nowrap"
                  onClick={() => setActiveTab("comments")}
                >
                  <MessageCircle className="h-4 w-4" />
                  Comments
                </Button>
                
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="bg-slate-800 hover:bg-slate-700 gap-1 whitespace-nowrap"
                >
                  <Share className="h-4 w-4" />
                  Share
                </Button>
                
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="bg-slate-800 hover:bg-slate-700 gap-1 whitespace-nowrap"
                  onClick={() => window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank')}
                >
                  <Youtube className="h-4 w-4 text-red-500" />
                  Watch on YouTube
                </Button>
              </div>
            </div>
            
            <div className="p-4 flex gap-2">
              <div className="flex items-center">
                <div className="flex -space-x-2 mr-2">
                  {onlineUsers.slice(0, 3).map((user) => (
                    <Avatar key={user.id} className="border-2 border-slate-900 h-7 w-7">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-emerald-600 text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                {onlineUsers.length > 3 && (
                  <Badge variant="outline" className="text-xs bg-slate-800 border-slate-700">
                    +{onlineUsers.length - 3} online
                  </Badge>
                )}
              </div>
            </div>
            
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-4 border-b border-slate-800">
                <TabsList className="bg-slate-800/50 w-full justify-start">
                  <TabsTrigger value="related" className="data-[state=active]:bg-slate-700">
                    Related
                  </TabsTrigger>
                  <TabsTrigger value="comments" className="data-[state=active]:bg-slate-700">
                    Comments
                  </TabsTrigger>
                  <TabsTrigger value="channel" className="data-[state=active]:bg-slate-700">
                    Channel
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="related" className="p-4 space-y-3">
                {relatedVideos.map((video) => (
                  <div 
                    key={video.id} 
                    className="flex gap-3 hover:bg-slate-800/50 p-2 rounded-lg cursor-pointer transition-colors"
                    onClick={() => onClose()}
                  >
                    <div className="w-32 h-18 relative rounded-md overflow-hidden flex-shrink-0">
                      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                      <div className="absolute bottom-1 right-1 bg-black/70 px-1 text-xs rounded">
                        {formatTime(Math.floor(Math.random() * 600) + 60)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium line-clamp-2 text-sm">{video.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{video.channelTitle}</p>
                      <div className="flex gap-1 text-xs text-muted-foreground mt-1">
                        <span>{video.views}</span>
                        <span>•</span>
                        <span>{video.published}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="comments" className="p-4">
                <div className="flex gap-3 mb-6">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url || ""} />
                    <AvatarFallback className="bg-purple-600">
                      {user ? user.email?.charAt(0).toUpperCase() || "U" : "G"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <Input
                      placeholder={user ? "Add a comment..." : "Sign in to comment"}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="bg-slate-800 border-slate-700"
                      disabled={!user}
                    />
                    {user && commentText.trim() && (
                      <div className="flex justify-end mt-2 gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setCommentText("")}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handlePostComment}>
                          Comment
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.authorAvatar} />
                        <AvatarFallback className="bg-slate-600">
                          {comment.author.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="font-medium text-sm">{comment.author}</span>
                          <span className="text-xs text-muted-foreground">{comment.time}</span>
                        </div>
                        
                        <p className="text-sm mt-1">{comment.text}</p>
                        
                        <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                          <button className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            {comment.likes}
                          </button>
                          <button>Reply</button>
                          {comment.replies > 0 && (
                            <button className="text-primary">{comment.replies} replies</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="channel" className="p-4">
                <div className="text-center mb-6">
                  <Avatar className="h-24 w-24 mx-auto">
                    <AvatarImage src={channelInfo.avatar} />
                    <AvatarFallback className="bg-purple-600 text-4xl">
                      {channelInfo.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h3 className="text-xl font-bold mt-3">{channelInfo.name}</h3>
                  <p className="text-muted-foreground">{channelInfo.subscribers}</p>
                  
                  <div className="flex justify-center mt-4 gap-3">
                    <Button
                      className={channelInfo.isSubscribed ? 
                        "border-red-500 text-red-500 hover:bg-red-500/10" : 
                        "bg-red-500 hover:bg-red-600"}
                      variant={channelInfo.isSubscribed ? "outline" : "default"}
                      onClick={toggleSubscribe}
                    >
                      {channelInfo.isSubscribed ? "Subscribed" : "Subscribe"}
                    </Button>
                    <Button variant="outline">
                      <Bell className="h-4 w-4 mr-2" />
                      Notify
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {relatedVideos.slice(0, 6).map((video) => (
                    <div 
                      key={video.id} 
                      className="hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors overflow-hidden"
                    >
                      <div className="aspect-video relative">
                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                        <div className="absolute bottom-1 right-1 bg-black/70 px-1 text-xs rounded">
                          {formatTime(Math.floor(Math.random() * 600) + 60)}
                        </div>
                      </div>
                      <div className="p-2">
                        <h4 className="font-medium line-clamp-1 text-xs">{video.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{video.views}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default VideoPlayer;
