import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMusic } from "@/contexts/MusicContext";
import { Send, ImagePlus, Smile, Youtube, Facebook, Instagram, Music, Star } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { EmotionTypes, emotionToMusicMap } from "@/lib/emotions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { processQueryWithAI } from "@/lib/huggingface-api";
import { analyzeImageForMusicRecommendation } from "@/lib/deepseek-api";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  artistInfo?: {
    name: string;
    imageUrl?: string;
  };
  platformSuggestions?: {
    platform: "youtube" | "facebook" | "instagram" | "tiktok";
    url?: string;
  }[];
}

interface PlatformState {
  youtube: boolean;
  facebook: boolean;
  instagram: boolean;
  tiktok: boolean;
}

const ChatbotSuggestions: React.FC = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: "welcome", 
      content: "Hello! I can suggest music based on your mood, artists you like, or genres across multiple platforms. What would you like to listen to today?", 
      sender: "bot" 
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { searchMusicVideos, searchFilters } = useMusic();
  const [activePlatforms, setActivePlatforms] = useState<PlatformState>({
    youtube: true,
    facebook: false,
    instagram: false,
    tiktok: false
  });
  const [isPremium, setIsPremium] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() && !imagePreview) return;
    
    // Add user message to chat
    const userMessage: Message = { 
      id: Date.now().toString(), 
      content: imagePreview ? "Looking for music based on this image..." : input, 
      sender: "user" 
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput("");
    setIsTyping(true);
    
    try {
      // Simulate AI response delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // AI response logic based on user input
      let response = "";
      let artistInfo = undefined;
      let platformSuggestions = undefined;
      const userInput = input.toLowerCase();
      
      if (imagePreview) {
        // Handle image-based requests using DeepSeek API
        const imageAnalysisResult = await analyzeImageForMusicRecommendation(imagePreview, isPremium);
        
        response = `I can see what you're looking for. Let me find some suitable music...`;
        searchMusicVideos(`music ${imageAnalysisResult.recommendations.join(" ")}`, searchFilters);
        setImagePreview(null); // Clear the image preview
        
        // Use artist information from the API response
        artistInfo = imageAnalysisResult.artistInfo;
        
        // Add platform suggestions
        platformSuggestions = getActivePlatformSuggestions();
      } else {
        // Process text query using Hugging Face API
        try {
          const processedQuery = await processQueryWithAI(input);
          response = `Searching for music related to your request...`;
          searchMusicVideos(processedQuery, searchFilters);
          
          // Generate artist info based on processed query
          const artists = [
            { name: "Taylor Swift", imageUrl: "https://i.pravatar.cc/150?u=taylor" },
            { name: "Ed Sheeran", imageUrl: "https://i.pravatar.cc/150?u=ed" },
            { name: "Beyoncé", imageUrl: "https://i.pravatar.cc/150?u=beyonce" },
            { name: "BTS", imageUrl: "https://i.pravatar.cc/150?u=bts" },
            { name: "Adele", imageUrl: "https://i.pravatar.cc/150?u=adele" }
          ];
          
          artistInfo = {
            name: artists[Math.floor(Math.random() * artists.length)].name,
            imageUrl: `https://i.pravatar.cc/150?u=${processedQuery.replace(/\s/g, "")}`
          };
          
          // Add platform suggestions
          platformSuggestions = getActivePlatformSuggestions();
        } catch (error) {
          console.error("Error processing query with AI:", error);
          // Fall back to simple keyword matching
          if (userInput.includes("sad") || userInput.includes("feeling down")) {
            response = "I can suggest some comforting songs. Searching for soothing ballads...";
            searchMusicVideos("comforting ballads", searchFilters);
            artistInfo = {
              name: "Adele",
              imageUrl: "https://i.pravatar.cc/150?u=adele"
            };
          } 
          else if (userInput.includes("happy") || userInput.includes("upbeat") || userInput.includes("energetic")) {
            response = "Looking for some upbeat tracks to boost your mood!";
            searchMusicVideos("upbeat happy songs", searchFilters);
            artistInfo = {
              name: "Bruno Mars",
              imageUrl: "https://i.pravatar.cc/150?u=bruno"
            };
          }
          else if (userInput.includes("rock")) {
            response = "Rock on! Searching for the best rock tracks...";
            searchMusicVideos("best rock songs", searchFilters);
            artistInfo = {
              name: "Foo Fighters",
              imageUrl: "https://i.pravatar.cc/150?u=rock"
            };
          }
          else if (userInput.includes("pop")) {
            response = "Pop music coming right up! Here are some trending pop songs...";
            searchMusicVideos("trending pop music", searchFilters);
            artistInfo = {
              name: "Taylor Swift",
              imageUrl: "https://i.pravatar.cc/150?u=pop"
            };
          }
          else if (userInput.includes("hip hop") || userInput.includes("rap")) {
            response = "Let's find some great hip hop tracks for you...";
            searchMusicVideos("top hip hop songs", searchFilters);
            artistInfo = {
              name: "Kendrick Lamar",
              imageUrl: "https://i.pravatar.cc/150?u=hiphop"
            };
          }
          else if (userInput.includes("relax") || userInput.includes("calm") || userInput.includes("sleep")) {
            response = "Here are some relaxing melodies for you...";
            searchMusicVideos("relaxing ambient music", searchFilters);
            artistInfo = {
              name: "Brian Eno",
              imageUrl: "https://i.pravatar.cc/150?u=ambient"
            };
          }
          else if (userInput.includes("nepali") || userInput.includes("nepal")) {
            response = "Here are some amazing Nepali songs for you...";
            searchMusicVideos("nepali music", {...searchFilters, regionCode: "NP"});
            artistInfo = {
              name: "Nepali Artist",
              imageUrl: "https://i.pravatar.cc/150?u=nepal"
            };
          } 
          else {
            response = `Searching for music related to: "${input}"`;
            searchMusicVideos(input, searchFilters);
            
            // Generic artist suggestion
            artistInfo = {
              name: "Recommended Artist",
              imageUrl: "https://i.pravatar.cc/150?u=generic"
            };
          }
        }
      }
      
      // Add AI response to chat
      const botMessage: Message = { 
        id: Date.now().toString(), 
        content: response, 
        sender: "bot",
        artistInfo,
        platformSuggestions
      };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: Message = { 
        id: Date.now().toString(), 
        content: "Sorry, I had trouble processing that request. Please try again.", 
        sender: "bot" 
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const getActivePlatformSuggestions = () => {
    const suggestions: { platform: "youtube" | "facebook" | "instagram" | "tiktok"; url?: string; }[] = [];
    
    if (activePlatforms.youtube) {
      suggestions.push({ platform: "youtube" });
    }
    if (activePlatforms.facebook) {
      suggestions.push({ platform: "facebook" });
    }
    if (activePlatforms.instagram) {
      suggestions.push({ platform: "instagram" });
    }
    if (activePlatforms.tiktok) {
      suggestions.push({ platform: "tiktok" });
    }
    
    return suggestions.length > 0 ? suggestions : undefined;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImagePreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const selectEmotion = (emotion: EmotionTypes) => {
    const musicType = emotionToMusicMap[emotion];
    const message = `I'm feeling ${emotion}`;
    setInput(message);
    handleSendMessage({ preventDefault: () => {} } as React.FormEvent);
  };

  const handlePlatformToggle = (platform: keyof PlatformState) => {
    setActivePlatforms(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  const togglePremium = () => {
    if (!isPremium) {
      // This would be a payment gateway in a real implementation
      const confirmUpgrade = window.confirm("Upgrade to VIP AI access for premium music recommendations? This would connect to a payment processor in a complete implementation.");
      if (confirmUpgrade) {
        setIsPremium(true);
        setMessages(prev => [
          ...prev, 
          { 
            id: Date.now().toString(), 
            content: "🌟 Welcome to VIP AI Access! You now have access to premium music recommendations and multi-platform search features.", 
            sender: "bot" 
          }
        ]);
      }
    } else {
      setIsPremium(false);
      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now().toString(), 
          content: "You've downgraded from VIP AI Access. Standard features are still available.", 
          sender: "bot" 
        }
      ]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Music Assistant</h3>
          <div className="flex items-center space-x-2">
            <Star className={`h-4 w-4 ${isPremium ? 'text-yellow-400' : 'text-slate-500'}`} />
            <Label htmlFor="premium-mode" className="text-xs cursor-pointer">VIP AI</Label>
            <Switch 
              id="premium-mode" 
              checked={isPremium} 
              onCheckedChange={togglePremium} 
              className={isPremium ? "bg-yellow-400" : ""}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Ask for music recommendations across platforms</p>
      </div>
      
      {isPremium && (
        <div className="p-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-y border-amber-500/30">
          <p className="text-xs text-center text-amber-300">VIP AI Access Active - Premium Features Unlocked</p>
        </div>
      )}
      
      <Tabs defaultValue="chat" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2 grid w-auto grid-cols-2">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="settings">Platforms</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="flex-1 flex flex-col">
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user' 
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-slate-800 text-slate-100'
                  }`}
                >
                  {message.content}
                  
                  {message.artistInfo && (
                    <div className="mt-2 pt-2 border-t border-slate-700">
                      <div className="flex items-center space-x-2">
                        <img src={message.artistInfo.imageUrl} alt={message.artistInfo.name} className="w-8 h-8 rounded-full object-cover" />
                        <span className="text-xs font-medium">{message.artistInfo.name}</span>
                      </div>
                    </div>
                  )}
                  
                  {message.platformSuggestions && message.platformSuggestions.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-700">
                      <p className="text-xs mb-1">Available on:</p>
                      <div className="flex space-x-2">
                        {message.platformSuggestions.map((platform, index) => (
                          <div key={index} className="flex items-center space-x-1 bg-slate-700 px-2 py-1 rounded-md text-xs">
                            {platform.platform === "youtube" && <Youtube className="h-3 w-3" />}
                            {platform.platform === "facebook" && <Facebook className="h-3 w-3" />}
                            {platform.platform === "instagram" && <Instagram className="h-3 w-3" />}
                            {platform.platform === "tiktok" && <Music className="h-3 w-3" />}
                            <span>{platform.platform.charAt(0).toUpperCase() + platform.platform.slice(1)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {imagePreview && (
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-lg overflow-hidden">
                  <img 
                    src={imagePreview} 
                    alt="Uploaded" 
                    className="max-w-full h-auto max-h-40 object-contain" 
                  />
                </div>
              </div>
            )}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-800 rounded-lg p-3 max-w-[80%]">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-75"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="p-4">
          <div className="space-y-3">
            <h4 className="text-sm font-medium mb-2">Search Platforms</h4>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Youtube className="h-4 w-4" />
                <Label htmlFor="youtube-toggle">YouTube</Label>
              </div>
              <Switch 
                id="youtube-toggle" 
                checked={activePlatforms.youtube}
                onCheckedChange={() => handlePlatformToggle('youtube')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Facebook className="h-4 w-4" />
                <Label htmlFor="facebook-toggle">Facebook</Label>
              </div>
              <Switch 
                id="facebook-toggle" 
                checked={activePlatforms.facebook}
                onCheckedChange={() => handlePlatformToggle('facebook')}
                disabled={!isPremium}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Instagram className="h-4 w-4" />
                <Label htmlFor="instagram-toggle">Instagram</Label>
              </div>
              <Switch 
                id="instagram-toggle" 
                checked={activePlatforms.instagram}
                onCheckedChange={() => handlePlatformToggle('instagram')}
                disabled={!isPremium}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Music className="h-4 w-4" />
                <Label htmlFor="tiktok-toggle">TikTok</Label>
              </div>
              <Switch 
                id="tiktok-toggle" 
                checked={activePlatforms.tiktok}
                onCheckedChange={() => handlePlatformToggle('tiktok')}
                disabled={!isPremium}
              />
            </div>
            
            {!isPremium && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                <p className="text-xs text-yellow-400">Upgrade to VIP AI access to enable multi-platform search</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 w-full bg-yellow-500/20 border-yellow-500/30 hover:bg-yellow-500/30 text-yellow-400"
                  onClick={togglePremium}
                >
                  <Star className="h-3 w-3 mr-1" />
                  Upgrade to VIP
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="p-4 border-t border-slate-800">
        <div className="mb-3 flex flex-wrap gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <Smile className="h-4 w-4" />
                <span>Emotions</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 grid grid-cols-2 gap-1 p-2 bg-slate-800">
              <Button variant="ghost" size="sm" onClick={() => selectEmotion("happy")}>Happy</Button>
              <Button variant="ghost" size="sm" onClick={() => selectEmotion("sad")}>Sad</Button>
              <Button variant="ghost" size="sm" onClick={() => selectEmotion("energetic")}>Energetic</Button>
              <Button variant="ghost" size="sm" onClick={() => selectEmotion("relaxed")}>Relaxed</Button>
              <Button variant="ghost" size="sm" onClick={() => selectEmotion("romantic")}>Romantic</Button>
              <Button variant="ghost" size="sm" onClick={() => selectEmotion("focused")}>Focused</Button>
            </PopoverContent>
          </Popover>
          
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={triggerFileInput}
          >
            <ImagePlus className="h-4 w-4" />
            <span>Upload Image</span>
          </Button>
          
          {isPremium && (
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
            >
              <Star className="h-4 w-4" />
              <span>Premium</span>
            </Button>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for music suggestions..."
            className="bg-slate-800 border-slate-700"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatbotSuggestions;
