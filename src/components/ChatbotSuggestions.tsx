
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMusic } from "@/contexts/MusicContext";
import { Send } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
}

const ChatbotSuggestions: React.FC = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: "welcome", 
      content: "Hello! I can suggest music based on your mood, artists you like, or genres. What would you like to listen to today?", 
      sender: "bot" 
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const { searchMusicVideos, searchFilters } = useMusic();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage = { id: Date.now().toString(), content: input, sender: "user" as const };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput("");
    setIsTyping(true);
    
    try {
      // Simulate AI response delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // AI response logic based on user input
      let response = "";
      const userInput = input.toLowerCase();
      
      // Simple keyword matching for demo purposes
      if (userInput.includes("sad") || userInput.includes("feeling down")) {
        response = "I can suggest some comforting songs. Searching for soothing ballads...";
        searchMusicVideos("comforting ballads", searchFilters);
      } 
      else if (userInput.includes("happy") || userInput.includes("upbeat") || userInput.includes("energetic")) {
        response = "Looking for some upbeat tracks to boost your mood!";
        searchMusicVideos("upbeat happy songs", searchFilters);
      }
      else if (userInput.includes("rock")) {
        response = "Rock on! Searching for the best rock tracks...";
        searchMusicVideos("best rock songs", searchFilters);
      }
      else if (userInput.includes("pop")) {
        response = "Pop music coming right up! Here are some trending pop songs...";
        searchMusicVideos("trending pop music", searchFilters);
      }
      else if (userInput.includes("hip hop") || userInput.includes("rap")) {
        response = "Let's find some great hip hop tracks for you...";
        searchMusicVideos("top hip hop songs", searchFilters);
      }
      else if (userInput.includes("relax") || userInput.includes("calm") || userInput.includes("sleep")) {
        response = "Here are some relaxing melodies for you...";
        searchMusicVideos("relaxing ambient music", searchFilters);
      } 
      else {
        response = `Searching for music related to: "${input}"`;
        searchMusicVideos(input, searchFilters);
      }
      
      // Add AI response to chat
      const botMessage = { id: Date.now().toString(), content: response, sender: "bot" };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage = { 
        id: Date.now().toString(), 
        content: "Sorry, I had trouble processing that request. Please try again.", 
        sender: "bot" 
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-800 bg-slate-900/50">
        <h3 className="font-medium">Music Assistant</h3>
        <p className="text-xs text-muted-foreground">Ask for music recommendations</p>
      </div>
      
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
            </div>
          </div>
        ))}
        
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
      
      <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800">
        <div className="flex gap-2">
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
        </div>
      </form>
    </div>
  );
};

export default ChatbotSuggestions;
