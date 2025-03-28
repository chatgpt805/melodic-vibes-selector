
import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface VideoPlayerProps {
  videoId: string | null;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoId, 
  isOpen, 
  onClose,
  title
}) => {
  if (!videoId) return null;
  
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl bg-slate-900/95 border-slate-800">
        <SheetHeader className="flex flex-row items-center justify-between mb-4">
          <SheetTitle className="text-lg truncate text-left">
            {title || "Now Playing"}
          </SheetTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X />
          </Button>
        </SheetHeader>
        
        <div className="aspect-video w-full overflow-hidden rounded-md glass-morph">
          <iframe
            src={embedUrl}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default VideoPlayer;
