
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useMusic } from "@/contexts/MusicContext";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ApiKeyForm = () => {
  const { setApiKey } = useMusic();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    // Use the provided API key
    const youtubeApiKey = "AIzaSyCdyJti7GTDfKKDYAmzb0qf3-7GQn2HBzA";
    setApiKey(youtubeApiKey);
    
    if (user) {
      toast({
        title: "Welcome back to VidAI!",
        description: "Get ready to explore amazing music from around the world",
      });
      navigate("/");
    } else {
      // If not logged in, redirect to auth page
      navigate("/auth");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto glass-morph animate-enter">
      <CardHeader>
        <CardTitle className="text-xl font-bold glow-text font-ghibli">VidAI Music Discovery</CardTitle>
        <CardDescription className="font-ghibli">
          Explore music from around the world with our AI-powered discovery platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center mb-4">
            <img 
              src="/src/assets/logo.png" 
              alt="VidAI Logo" 
              className="mx-auto h-32 w-32 object-contain mb-4"
              onError={(e) => {
                // Fallback in case the image isn't available yet
                const target = e.target as HTMLImageElement;
                target.src = "https://via.placeholder.com/150?text=VidAI";
              }}
            />
          </div>
          <div className="text-center">
            <p className="text-lg text-white font-ghibli">Discover new music and explore sounds from different cultures and regions</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleGetStarted} className="w-full btn-primary glow-effect text-lg py-6 font-ghibli">
          Get Started
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ApiKeyForm;
