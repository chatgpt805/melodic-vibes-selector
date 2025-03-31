
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Share, Youtube } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface PostProfile {
  username: string;
  avatar_url: string | null;
}

interface PostComment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
  profile: PostProfile;
}

interface Post {
  id: string;
  user_id: string;
  video_id: string;
  title: string;
  description: string | null;
  created_at: string;
  thumbnail: string;
  likes: number;
  comments_count: number;
  profile: PostProfile;
}

export const MusicPost = ({ post }: { post: Post }) => {
  const { user } = useAuth();
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<PostComment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Check if the user has liked the post
  useEffect(() => {
    if (user) {
      checkLikeStatus();
    }
  }, [user, post.id]);

  const checkLikeStatus = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("post_likes")
      .select("*")
      .eq("user_id", user.id)
      .eq("post_id", post.id)
      .single();
      
    setIsLiked(!!data);
  };

  const loadComments = async () => {
    if (!showComments) return;
    
    setLoadingComments(true);
    
    try {
      const { data, error } = await supabase
        .from("post_comments")
        .select(`
          *,
          profile:profiles(username, avatar_url)
        `)
        .eq("post_id", post.id)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      // Handle missing profile data if relation can't be found
      const processedComments = (data || []).map(comment => {
        return {
          ...comment,
          profile: comment.profile || { username: "Unknown user", avatar_url: null }
        };
      }) as PostComment[];
      
      setComments(processedComments);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (showComments) {
      loadComments();
    }
  }, [showComments]);

  const toggleLike = async () => {
    if (!user) {
      toast.error("Please log in to like posts");
      return;
    }
    
    if (isLiked) {
      // Unlike
      await supabase
        .from("post_likes")
        .delete()
        .eq("user_id", user.id)
        .eq("post_id", post.id);
        
      setLikeCount(prev => Math.max(prev - 1, 0));
    } else {
      // Like
      await supabase
        .from("post_likes")
        .insert({
          user_id: user.id,
          post_id: post.id
        });
        
      setLikeCount(prev => prev + 1);
    }
    
    setIsLiked(!isLiked);
  };

  const postComment = async () => {
    if (!user) {
      toast.error("Please log in to comment");
      return;
    }
    
    if (!comment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from("post_comments")
        .insert({
          user_id: user.id,
          post_id: post.id,
          content: comment.trim()
        })
        .select(`
          *,
          profile:profiles(username, avatar_url)
        `)
        .single();
        
      if (error) throw error;
      
      // Add the newly created comment to the list
      const newComment = {
        ...data,
        profile: data.profile || { username: "Unknown user", avatar_url: null }
      } as PostComment;
      
      setComments(prev => [newComment, ...prev]);
      setComment("");
      
      // Ensure comments are showing
      setShowComments(true);
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Failed to post comment");
    }
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <Card className="glass-morph overflow-hidden relative">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <Link to={`/profile/${post.user_id}`}>
              <Avatar>
                <AvatarImage src={post.profile?.avatar_url || ""} />
                <AvatarFallback className="bg-primary/20">
                  {post.profile?.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
            
            <div>
              <Link to={`/profile/${post.user_id}`} className="font-medium hover:underline">
                {post.profile?.username || "Unknown user"}
              </Link>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          <Button variant="ghost" size="icon" asChild>
            <a 
              href={`https://www.youtube.com/watch?v=${post.video_id}`} 
              target="_blank" 
              rel="noreferrer"
            >
              <Youtube className="h-5 w-5 text-red-500" />
            </a>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2">
        <h3 className="font-medium">{post.title}</h3>
        {post.description && (
          <p className="text-sm text-muted-foreground">{post.description}</p>
        )}
        
        <div className="relative rounded-lg overflow-hidden">
          {isPlaying ? (
            <VideoPlayer 
              videoId={post.video_id} 
              height="240px" 
              className="w-full shadow-lg rounded-lg" 
            />
          ) : (
            <div 
              className="relative cursor-pointer group" 
              onClick={togglePlayback}
            >
              <img 
                src={post.thumbnail} 
                alt={post.title} 
                className="w-full h-48 object-cover rounded-lg" 
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center">
                  <div className="w-0 h-0 border-y-8 border-y-transparent border-l-12 border-l-white ml-1"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 flex flex-col">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleLike}
              className={isLiked ? "text-red-500" : ""}
            >
              <Heart className={`h-5 w-5 mr-1 ${isLiked ? "fill-current" : ""}`} />
              {likeCount > 0 && likeCount}
            </Button>
            
            <Collapsible open={showComments} onOpenChange={setShowComments}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MessageCircle className="h-5 w-5 mr-1" />
                  {comments.length > 0 ? comments.length : ""}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
          
          <Button variant="ghost" size="sm">
            <Share className="h-5 w-5 mr-1" />
            Share
          </Button>
        </div>
        
        <Collapsible open={showComments} onOpenChange={setShowComments} className="w-full">
          <CollapsibleContent className="pt-3 space-y-3 w-full">
            <div className="flex items-start space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.user_metadata?.avatar_url || ""} />
                <AvatarFallback className="bg-primary/20">
                  {user?.user_metadata?.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 flex space-x-2">
                <Textarea 
                  placeholder="Add a comment..." 
                  value={comment} 
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[40px] resize-none bg-slate-800/50 border-slate-700"
                />
                <Button size="sm" onClick={postComment} className="self-end">Post</Button>
              </div>
            </div>
            
            {loadingComments ? (
              <div className="py-4 text-center">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {comments.length > 0 ? (
                  comments.map(comment => (
                    <div key={comment.id} className="flex items-start space-x-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={comment.profile?.avatar_url || ""} />
                        <AvatarFallback className="bg-primary/20">
                          {comment.profile?.username?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-baseline space-x-2">
                          <Link to={`/profile/${comment.user_id}`} className="font-medium text-sm hover:underline">
                            {comment.profile?.username || "Unknown user"}
                          </Link>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
                )}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardFooter>
    </Card>
  );
};
