
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useMusic } from "@/contexts/MusicContext";
import { toast } from "@/components/ui/use-toast";

const ApiKeyForm = () => {
  const { setApiKey } = useMusic();

  const handleGetStarted = () => {
    // Use the provided API key
    const youtubeApiKey = "AIzaSyCdyJti7GTDfKKDYAmzb0qf3-7GQn2HBzA";
    setApiKey(youtubeApiKey);
    toast({
      title: "Welcome to Music Discovery!",
      description: "Get ready to explore amazing music from around the world",
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto glass-morph animate-enter">
      <CardHeader>
        <CardTitle className="text-xl font-bold glow-text">Music Discovery</CardTitle>
        <CardDescription>
          Explore music from around the world with our AI-powered discovery platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center mb-4">
            <img 
              src="/src/assets/logo.png" 
              alt="Music Discovery Logo" 
              className="mx-auto h-32 w-32 object-contain mb-4"
              onError={(e) => {
                // Fallback in case the image isn't available yet
                const target = e.target as HTMLImageElement;
                target.src = "https://via.placeholder.com/150?text=Music";
              }}
            />
          </div>
          <div className="text-center">
            <p className="text-lg text-white">Discover new music and explore sounds from different cultures and regions</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleGetStarted} className="w-full btn-primary glow-effect text-lg py-6">
          Get Started
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ApiKeyForm;
