
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useMusic } from "@/contexts/MusicContext";
import { toast } from "@/components/ui/use-toast";

const ApiKeyForm = () => {
  const { apiKey, setApiKey } = useMusic();
  const [inputKey, setInputKey] = useState(apiKey || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputKey.trim()) {
      setApiKey(inputKey.trim());
      toast({
        title: "API Key Saved",
        description: "Your YouTube API key has been saved successfully",
      });
    } else {
      toast({
        title: "Invalid API Key",
        description: "Please enter a valid YouTube API key",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto glass-morph animate-enter">
      <CardHeader>
        <CardTitle className="text-xl font-bold glow-text">YouTube API Key</CardTitle>
        <CardDescription>
          Enter your YouTube Data API v3 key to enable music recommendations
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter your YouTube API key"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div className="text-xs text-gray-400">
              <p>To get an API key:</p>
              <ol className="list-decimal list-inside space-y-1 mt-2">
                <li>Go to <a href="https://console.developers.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google Developer Console</a></li>
                <li>Create a project and enable YouTube Data API v3</li>
                <li>Go to Credentials and create an API key</li>
                <li>Copy and paste the key above</li>
              </ol>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full btn-primary glow-effect">
            Save API Key
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ApiKeyForm;
