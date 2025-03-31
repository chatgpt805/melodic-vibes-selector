
import React, { useState, useRef, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  X, Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  SkipBack, SkipForward, RotateCw, Loader, Youtube,
  Settings, Subtitles, Share2, ThumbsUp, Bell, UserPlus, Search
} from "lucide-react";

interface EnhancedVideoPlayerProps {
  videoId: string | null;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

const EnhancedVideoPlayer: React.FC<EnhancedVideoPlayerProps> = ({ 
  videoId, 
  isOpen, 
  onClose,
  title
}) => {
  // Player state
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(100);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // YouTube specific state
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 25000) + 1000);
  const [hasLiked, setHasLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  
  // Quality and subtitle options
  const [selectedQuality, setSelectedQuality] = useState("auto");
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [relatedVideos, setRelatedVideos] = useState<any[]>([]);
  
  // Refs
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);
  
  const qualityOptions = [
    { label: "Auto", value: "auto" },
    { label: "4K (2160p)", value: "2160p" },
    { label: "1440p", value: "1440p" },
    { label: "1080p", value: "1080p" },
    { label: "720p", value: "720p" },
    { label: "480p", value: "480p" },
    { label: "360p", value: "360p" },
    { label: "240p", value: "240p" },
    { label: "144p", value: "144p" },
  ];
  
  const subtitleLanguages = [
    { label: "English", value: "en" },
    { label: "Spanish", value: "es" },
    { label: "French", value: "fr" },
    { label: "German", value: "de" },
    { label: "Japanese", value: "ja" },
    { label: "Korean", value: "ko" },
    { label: "Chinese", value: "zh" },
  ];
  
  // Generate mock comments
  useEffect(() => {
    if (isOpen && showComments && comments.length === 0) {
      // Generate mock comments for demonstration
      const mockComments = Array.from({ length: 12 }, (_, i) => ({
        id: `comment-${i}`,
        author: `User${Math.floor(Math.random() * 999)}`,
        avatar: `https://i.pravatar.cc/150?img=${i + 10}`,
        content: [
          "Love this track! Been on repeat all day.",
          "The beat on this is insane, who's the producer?",
          "Discovered this artist last week, their whole catalog is fire!",
          "This reminds me of summer '19... good times.",
          "Underrated gem right here, deserves more views.",
          "The lyrics really hit different at 3am...",
          "That drop at 2:14 is everything!",
          "Anyone else here from TikTok?",
          "This would be perfect for my workout playlist.",
          "Waiting for them to announce a tour already!",
          "Music video aesthetic is on point.",
          "Been a fan since day one, so proud of their growth!",
        ][i % 12],
        time: `${Math.floor(Math.random() * 12) + 1} hours ago`,
        likes: Math.floor(Math.random() * 500),
      }));
      
      setComments(mockComments);
    }
  }, [isOpen, showComments, comments.length]);
  
  // Generate related videos
  useEffect(() => {
    if (isOpen && relatedVideos.length === 0) {
      const mockRelatedVideos = Array.from({ length: 8 }, (_, i) => ({
        id: `video-${i}`,
        title: [
          "Top 10 Summer Hits You Need In Your Playlist",
          "Best Music Covers of 2023 | Amazing Voice Compilation",
          "Relaxing Study Music - Deep Focus for Work & Concentration",
          "Morning Vibes - Chill Playlist to Start Your Day",
          "Epic Workout Motivation Mix 2023 | Gym Playlist",
          "Acoustic Covers of Popular Songs | Relaxing Music",
          "Lo-Fi Hip Hop Radio - Beats to Study/Relax to",
          "Late Night Drive - Synthwave & Retrowave Mix",
        ][i % 8],
        thumbnail: `https://picsum.photos/id/${210 + i}/320/180`,
        channel: `Channel${Math.floor(Math.random() * 100)}`,
        views: `${Math.floor(Math.random() * 10) + 1}M views`,
        age: `${Math.floor(Math.random() * 12) + 1} months ago`,
      }));
      
      setRelatedVideos(mockRelatedVideos);
    }
  }, [isOpen, relatedVideos.length]);
  
  // Simulate video progress for demo purposes
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
  
  useEffect(() => {
    if (isOpen) {
      // Reset states when opening new video
      setIsPlaying(true);
      setCurrentTime(0);
      setDuration(Math.floor(Math.random() * 180) + 120); // Random duration between 2-5 minutes
      setIsLoading(true);
      setHasLiked(false);
      setIsSubscribed(false);
      setShowComments(false);
      setSelectedQuality("auto");
      setSubtitlesEnabled(false);
      
      // Simulate loading state
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, videoId]);
  
  // Handle like action
  const toggleLike = () => {
    setHasLiked(!hasLiked);
    setLikeCount(prev => hasLiked ? prev - 1 : prev + 1);
  };
  
  // Handle subscribe action
  const toggleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
    
    if (!isSubscribed) {
      toast.success("Successfully subscribed to the channel!");
    }
  };
  
  // Handle notification toggle
  const toggleNotifications = () => {
    setNotificationEnabled(!notificationEnabled);
    
    if (!notificationEnabled) {
      toast.success("Notifications enabled for this channel");
    } else {
      toast.success("Notifications disabled for this channel");
    }
  };
  
  // Format number for display (e.g., 1.2K, 3.5M)
  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (!videoId) return null;
  
  // YouTube embed URL with API enabled
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&controls=0&rel=0`;
  
  // Handle play/pause toggle
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    // In a real implementation, this would use YouTube Player API to control playback
  };
  
  // Handle seeking in the video
  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    // In a real implementation, this would use YouTube Player API to seek
  };
  
  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (isMuted && value[0] > 0) {
      setIsMuted(false);
    }
    // In a real implementation, this would use YouTube Player API to set volume
  };
  
  // Toggle mute state
  const toggleMute = () => {
    setIsMuted(!isMuted);
    // In a real implementation, this would use YouTube Player API to mute/unmute
  };
  
  // Toggle fullscreen
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
  
  // Format time display (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle skip forward/backward
  const handleSkipForward = () => {
    const newTime = Math.min(currentTime + 10, duration);
    setCurrentTime(newTime);
  };
  
  const handleSkipBackward = () => {
    const newTime = Math.max(currentTime - 10, 0);
    setCurrentTime(newTime);
  };
  
  // Handle restart
  const handleRestart = () => {
    setCurrentTime(0);
    setIsPlaying(true);
  };
  
  // Handle quality change
  const changeQuality = (quality: string) => {
    setSelectedQuality(quality);
    // In a real implementation, this would use YouTube Player API to change quality
    toast.success(`Video quality changed to ${quality}`);
  };
  
  // Handle subtitle toggle
  const toggleSubtitles = () => {
    setSubtitlesEnabled(!subtitlesEnabled);
  };
  
  // Handle subtitle language change
  const changeSubtitleLanguage = (language: string) => {
    setSelectedLanguage(language);
    // In a real implementation, this would use YouTube Player API to change subtitles
    toast.success(`Subtitle language changed to ${language}`);
  };
  
  // Mock function to simulate comment posting
  const postComment = () => {
    if (commentInputRef.current && commentInputRef.current.value.trim()) {
      const newComment = {
        id: `new-comment-${comments.length}`,
        author: "Current User",
        avatar: "https://i.pravatar.cc/150?img=1",
        content: commentInputRef.current.value,
        time: "Just now",
        likes: 0,
      };
      
      setComments([newComment, ...comments]);
      commentInputRef.current.value = "";
      toast.success("Comment posted successfully!");
    }
  };
  
  // Toast functions (could be imported from a real toast library)
  const toast = {
    success: (message: string) => console.log(`Toast success: ${message}`),
    error: (message: string) => console.log(`Toast error: ${message}`),
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-4xl lg:max-w-7xl xl:max-w-7xl p-0 overflow-hidden bg-black border-none">
        <div className="h-full flex flex-col">
          <div ref={playerContainerRef} className="relative aspect-video w-full overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                <Loader className="h-12 w-12 animate-spin text-red-500" />
              </div>
            )}
            
            <iframe
              ref={iframeRef}
              src={embedUrl}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
              style={{ opacity: isLoading ? 0.3 : 1 }}
            ></iframe>
            
            {/* Custom controls overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              {/* Progress bar */}
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
              
              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-white/10"
                    onClick={handleSkipBackward}
                  >
                    <SkipBack className="h-4 w-4" />
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
                      <Play className="h-5 w-5 ml-0.5" />
                    )}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-white/10"
                    onClick={handleSkipForward}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-white/10"
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
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-white hover:bg-white/10"
                      >
                        <Subtitles className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 bg-zinc-900 border-zinc-800">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="subtitles" 
                            checked={subtitlesEnabled}
                            onCheckedChange={() => toggleSubtitles()} 
                          />
                          <Label htmlFor="subtitles">Show subtitles</Label>
                        </div>
                        
                        {subtitlesEnabled && (
                          <div className="space-y-2">
                            <Label>Language</Label>
                            <div className="grid grid-cols-1 gap-2">
                              {subtitleLanguages.map((language) => (
                                <Button 
                                  key={language.value}
                                  variant="ghost" 
                                  size="sm"
                                  className={selectedLanguage === language.value ? 
                                    "bg-red-600 hover:bg-red-700 text-white justify-start" : 
                                    "hover:bg-zinc-800 justify-start"}
                                  onClick={() => changeSubtitleLanguage(language.value)}
                                >
                                  {language.label}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-white hover:bg-white/10"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 bg-zinc-900 border-zinc-800">
                      <div className="space-y-2">
                        <Label>Quality</Label>
                        <div className="grid grid-cols-1 gap-2">
                          {qualityOptions.map((quality) => (
                            <Button 
                              key={quality.value}
                              variant="ghost" 
                              size="sm"
                              className={selectedQuality === quality.value ? 
                                "bg-red-600 hover:bg-red-700 text-white justify-start" : 
                                "hover:bg-zinc-800 justify-start"}
                              onClick={() => changeQuality(quality.value)}
                            >
                              {quality.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-white/10"
                    onClick={handleRestart}
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
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
          
          <div className="flex-1 overflow-y-auto bg-zinc-900 p-4">
            <div className="space-y-4">
              {/* Video title and info */}
              <div>
                <h2 className="text-xl font-bold leading-tight">{title || "Video title"}</h2>
                <div className="flex flex-wrap items-center justify-between mt-2">
                  <div className="flex items-center space-x-1 text-sm text-zinc-400">
                    <span>{formatCount(Math.floor(Math.random() * 2000000) + 10000)} views</span>
                    <span>•</span>
                    <span>{Math.floor(Math.random() * 12) + 1} months ago</span>
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="ghost" 
                  className={`flex items-center gap-1.5 ${hasLiked ? "text-white bg-zinc-800" : "text-zinc-300"}`} 
                  onClick={toggleLike}
                >
                  <ThumbsUp className={`h-5 w-5 ${hasLiked ? "fill-white" : ""}`} />
                  <span>{formatCount(likeCount)}</span>
                </Button>
                
                <Button variant="ghost" className="flex items-center gap-1.5 text-zinc-300">
                  <Share2 className="h-5 w-5" />
                  <span>Share</span>
                </Button>
              </div>
              
              {/* Channel info */}
              <div className="flex items-start justify-between pt-4 pb-3 border-t border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-xl font-bold">
                    {title?.charAt(0) || "Y"}
                  </div>
                  <div>
                    <h3 className="font-bold">{title?.split(" ")[0] || "Channel Name"}</h3>
                    <p className="text-sm text-zinc-400">{formatCount(Math.floor(Math.random() * 5000000) + 100000)} subscribers</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {isSubscribed ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-zinc-300 hover:bg-zinc-800"
                        onClick={toggleNotifications}
                      >
                        <Bell className={`h-5 w-5 ${notificationEnabled ? "fill-white" : ""}`} />
                      </Button>
                      <Button 
                        onClick={toggleSubscribe}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white"
                      >
                        Subscribed
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={toggleSubscribe}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Subscribe
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Comments section */}
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  className="w-full justify-between bg-zinc-800/50 hover:bg-zinc-800 p-4 h-auto"
                  onClick={() => setShowComments(!showComments)}
                >
                  <span className="font-semibold">{formatCount(comments.length * 10)} Comments</span>
                  <span className="text-zinc-400">{showComments ? "Hide" : "Show"}</span>
                </Button>
                
                {showComments && (
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold">
                        Y
                      </div>
                      <div className="flex-1">
                        <Input
                          ref={commentInputRef}
                          placeholder="Add a comment..."
                          className="bg-zinc-800 border-zinc-700"
                        />
                        <div className="flex justify-end mt-2 gap-2">
                          <Button variant="ghost" size="sm">Cancel</Button>
                          <Button 
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={postComment}
                          >
                            Comment
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                          <img 
                            src={comment.avatar} 
                            alt={comment.author} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{comment.author}</h4>
                            <span className="text-xs text-zinc-400">{comment.time}</span>
                          </div>
                          <p className="text-sm mt-1">{comment.content}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              {comment.likes}
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Related videos */}
              <div className="pt-4 border-t border-zinc-800">
                <h3 className="text-lg font-bold mb-4">Related videos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {relatedVideos.map((video) => (
                    <div key={video.id} className="flex gap-3">
                      <div className="w-32 h-20 rounded overflow-hidden flex-shrink-0">
                        <img 
                          src={video.thumbnail} 
                          alt={video.title} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium line-clamp-2 text-sm">{video.title}</h4>
                        <p className="text-xs text-zinc-400 mt-1">{video.channel}</p>
                        <div className="flex text-xs text-zinc-400 mt-1">
                          <span>{video.views}</span>
                          <span className="mx-1">•</span>
                          <span>{video.age}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 z-10"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </SheetContent>
    </Sheet>
  );
};

export default EnhancedVideoPlayer;
