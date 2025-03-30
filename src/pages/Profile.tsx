
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPosts } from "@/components/social/UserPosts";
import { Edit, Music, Settings, Share2 } from "lucide-react";
import { toast } from "sonner";

interface Profile {
  username: string;
  bio: string;
  avatar_url: string;
  created_at: string;
}

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Could not load profile");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse h-32 w-32 rounded-full bg-purple-500/20 mx-auto mb-4"></div>
          <div className="animate-pulse h-8 w-48 bg-purple-500/20 mx-auto mb-3 rounded"></div>
          <div className="animate-pulse h-4 w-64 bg-purple-500/20 mx-auto rounded"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-screen items-center justify-center flex-col">
        <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
        <p className="mb-6 text-muted-foreground">This user does not exist or has deleted their profile</p>
        <Link to="/">
          <Button>Go back home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-ghibli">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-purple-900/40 to-slate-900/90"></div>
        <div className="absolute inset-0 ghibli-overlay"></div>
      </div>

      <div className="relative z-10 container mx-auto max-w-4xl">
        {/* Profile Header */}
        <Card className="glass-morph mb-6 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-purple-600 to-pink-500"></div>
          <CardContent className="-mt-16 pb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center md:items-end">
              <Avatar className="h-28 w-28 border-4 border-background glass-morph">
                {profile.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt={profile.username} />
                ) : (
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    {profile.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold glow-text mt-2">{profile.username}</h1>
                <p className="text-muted-foreground mt-1">{profile.bio || "No bio yet"}</p>
              </div>

              <div className="flex gap-2 mt-4 md:mt-0">
                {isOwnProfile ? (
                  <Button variant="outline" className="backdrop-blur-sm">
                    <Edit size={16} className="mr-2" /> Edit Profile
                  </Button>
                ) : (
                  <Button variant="outline" className="backdrop-blur-sm">
                    <Music size={16} className="mr-2" /> Follow
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="backdrop-blur-sm">
                  <Share2 size={16} />
                </Button>
                {isOwnProfile && (
                  <Button variant="ghost" size="icon" className="backdrop-blur-sm">
                    <Settings size={16} />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Content */}
        <Tabs defaultValue="posts" className="animate-fade-in">
          <TabsList className="bg-black/30 backdrop-blur-md mb-6">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="liked">Liked</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="space-y-6">
            <UserPosts userId={userId!} />
          </TabsContent>
          
          <TabsContent value="liked">
            <Card className="glass-morph">
              <CardHeader>
                <CardTitle>Liked Videos</CardTitle>
                <CardDescription>Videos this user has liked</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  This feature will be available soon!
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="about">
            <Card className="glass-morph">
              <CardHeader>
                <CardTitle>About {profile.username}</CardTitle>
                <CardDescription>Profile information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-1">Bio</h3>
                    <p className="text-muted-foreground">{profile.bio || "No bio yet"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Joined</h3>
                    <p className="text-muted-foreground">
                      {new Date(profile.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
