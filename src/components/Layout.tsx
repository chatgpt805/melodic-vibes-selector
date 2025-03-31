
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { Music, Home, Users, UserCircle, LogOut, Menu, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface LayoutProps {
  children: React.ReactNode;
}

const MOODS = [
  { name: "Happy", color: "from-yellow-500/20 to-orange-500/30", emoji: "😊" },
  { name: "Chill", color: "from-blue-500/20 to-purple-500/30", emoji: "😌" },
  { name: "Energetic", color: "from-red-500/20 to-pink-500/30", emoji: "⚡" },
  { name: "Focused", color: "from-cyan-500/20 to-blue-500/30", emoji: "🧠" },
  { name: "Romantic", color: "from-pink-500/20 to-rose-500/30", emoji: "❤️" },
  { name: "Melancholic", color: "from-indigo-500/20 to-slate-500/30", emoji: "😢" },
];

export const Layout = ({ children }: LayoutProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentMood, setCurrentMood] = useState(MOODS[1]); // Default to Chill
  const [profile, setProfile] = useState<any>(null);
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setProfile(data);
      }
    };
    
    fetchProfile();
  }, [user]);
  
  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
    toast.success("You've been logged out successfully");
  };

  const changeMood = (mood: typeof MOODS[0]) => {
    setCurrentMood(mood);
    toast(`Mood changed to ${mood.name} ${mood.emoji}`);
  };
  
  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-br ${currentMood.color}`}>
      {/* Fixed navigation */}
      <header className="border-b border-slate-700/50 backdrop-blur-md fixed w-full z-30 top-0">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Music className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">VidAI</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" asChild className={location.pathname === "/" ? "bg-slate-800/50" : ""}>
                <Link to="/">Home</Link>
              </Button>
              <Button variant="ghost" asChild className={location.pathname === "/social" ? "bg-slate-800/50" : ""}>
                <Link to="/social">Social</Link>
              </Button>
              
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={profile?.avatar_url || ""} />
                        <AvatarFallback className="bg-primary/20">
                          {profile?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <span className="font-medium">{profile?.username || "User"}</span>
                        <span className="text-xs text-muted-foreground">{user?.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={`/profile/${user?.id}`} className="cursor-pointer">
                        <UserCircle className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
              )}
            </div>
            
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </header>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-20 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="fixed top-16 right-0 bottom-0 w-3/4 bg-slate-900 border-l border-slate-800">
            <ScrollArea className="h-full">
              <div className="px-6 py-4">
                <div className="flex flex-col space-y-3">
                  <Link to="/" className="flex items-center space-x-2 px-2 py-3 rounded-md hover:bg-slate-800 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <Home className="h-5 w-5" />
                    <span>Home</span>
                  </Link>
                  <Link to="/social" className="flex items-center space-x-2 px-2 py-3 rounded-md hover:bg-slate-800 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <Users className="h-5 w-5" />
                    <span>Social</span>
                  </Link>
                  {user ? (
                    <>
                      <Separator />
                      <Link to={`/profile/${user?.id}`} className="flex items-center space-x-2 px-2 py-3 rounded-md hover:bg-slate-800 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                        <UserCircle className="h-5 w-5" />
                        <span>Profile</span>
                      </Link>
                      <Button variant="outline" onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}>
                        <LogOut className="h-5 w-5 mr-2" />
                        Log out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Separator />
                      <Button asChild onClick={() => setMobileMenuOpen(false)}>
                        <Link to="/auth">Sign In</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
      
      {/* Mood selector */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30">
        <div className="p-1 backdrop-blur-lg bg-slate-900/50 rounded-full border border-slate-700 shadow-xl">
          <div className="flex space-x-1">
            {MOODS.map((mood) => (
              <button
                key={mood.name}
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                  currentMood.name === mood.name 
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-slate-900 bg-slate-800" 
                    : "hover:bg-slate-800/50"
                )}
                onClick={() => changeMood(mood)}
                title={`${mood.name} mood`}
              >
                <span className="text-lg">{mood.emoji}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <main className="pt-16 flex-1">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-slate-700/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Link to="/" className="flex items-center space-x-2">
                <Music className="h-5 w-5 text-primary" />
                <span className="font-semibold">VidAI</span>
              </Link>
              <p className="text-xs text-muted-foreground mt-1">Developed by Ronak Ghimire</p>
            </div>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm">About</Button>
              <Button variant="ghost" size="sm">Terms</Button>
              <Button variant="ghost" size="sm">Privacy</Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
