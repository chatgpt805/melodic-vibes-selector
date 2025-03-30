
import React, { useState, useRef, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  X, Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  SkipBack, SkipForward, RotateCw, Loader
} from "lucide-react";

interface CustomVideoPlayerProps {
  videoId: string | null;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({ 
  videoId, 
  isOpen, 
  onClose,
  title
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      // Reset states when opening new video
      setIsPlaying(true);
      setCurrentTime(0);
      setIsLoading(true);
      
      // Simulate loading state
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, videoId]);

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
    setCurrentTime(value[0]);
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
  
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl bg-slate-900/95 border-slate-800 p-0 overflow-hidden">
        <SheetHeader className="flex flex-row items-center justify-between p-4">
          <SheetTitle className="text-lg truncate text-left">
            {title || "Now Playing"}
          </SheetTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X />
          </Button>
        </SheetHeader>
        
        <div ref={playerContainerRef} className="relative aspect-video w-full overflow-hidden rounded-md glass-morph">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <Loader className="h-12 w-12 animate-spin text-white" />
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
                max={duration || 100}
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
                <Button variant="ghost" size="icon" className="text-white">
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
                    <Play className="h-5 w-5" />
                  )}
                </Button>
                
                <Button variant="ghost" size="icon" className="text-white">
                  <SkipForward className="h-4 w-4" />
                </Button>
                
                <Button variant="ghost" size="icon" className="text-white" onClick={toggleMute}>
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                
                <div className="w-20 hidden sm:block">
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
                <Button variant="ghost" size="icon" className="text-white">
                  <RotateCw className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white"
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
        
        {/* Video info section */}
        <div className="p-4">
          <h3 className="text-lg font-medium mb-2">{title}</h3>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              <span>Watch on YouTube</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CustomVideoPlayer;
