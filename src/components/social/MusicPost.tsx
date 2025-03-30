import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Heart, MessageSquare, Share2, Play, MoreVertical,
  ChevronDown, ChevronUp, Loader
} from "lucide-react";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/utils";
import { YOUTUBE_VIDEO_URL } from "@/lib/youtube-api";

interface PostComment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile: {
    username: string;
    avatar_url: string;
  };
}

interface PostProps {
  post: {
    id: string;
    user_id: string;
    video_id: string;
    title: string;
    description: string;
    created_at: string;
    thumbnail: string;
    likes: number;
    comments_count: number;
    profile: {
      username: string;
      avatar_url: string;
    };
  };
}

export const MusicPost = ({ post }: PostProps) => {
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingLike, setSubmittingLike] = useState(false);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleComments = async () => {
    const newState = !showComments;
    setShowComments(newState);
    
    if (newState && comments.length === 0) {
      await loadComments();
    }
  };

  const loadComments = async () => {
    if (loadingComments) return;
    
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
      setComments(data as PostComment[] || []);
    } catch (error) {
      console.error("Error loading comments:", error);
      toast.error("Could not load comments");
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      toast.error("Please sign in to comment");
      return;
    }

    if (!newComment.trim()) return;
    setSubmittingComment(true);

    try {
      const { data, error } = await supabase
        .from("post_comments")
        .insert({
          post_id: post.id,
          user_id: user.id,
          content: newComment.trim()
        } as any)
        .select(`
          *,
          profile:profiles(username, avatar_url)
        `)
        .single();

      if (error) throw error;

      setComments(prev => [data as PostComment, ...prev]);
      setNewComment("");
      toast.success("Comment added");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const toggleLike = async () => {
    if (!user) {
      toast.error("Please sign in to like posts");
      return;
    }

    setSubmittingLike(true);
    try {
      if (!isLiked) {
        const { error } = await supabase
          .from("post_likes")
          .insert({
            post_id: post.id,
            user_id: user.id
          } as any);

        if (error) throw error;
        setLikesCount(prev => prev + 1);
      } else {
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", user.id);

        if (error) throw error;
        setLikesCount(prev => prev - 1);
      }

      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to process like");
    } finally {
      setSubmittingLike(false);
    }
  };

  return (
    <Card className="glass-morph overflow-hidden animate-fade-in">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <Link to={`/profile/${post.user_id}`} className="flex items-center gap-3 group">
            <Avatar className="border border-purple-500/30">
              {post.profile.avatar_url ? (
                <AvatarImage src={post.profile.avatar_url} alt={post.profile.username} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  {post.profile.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h3 className="font-medium group-hover:text-primary transition-colors">
                {post.profile.username}
              </h3>
              <p className="text-xs text-muted-foreground">
                {formatRelativeTime(new Date(post.created_at))}
              </p>
            </div>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-morph">
              <DropdownMenuItem>Report</DropdownMenuItem>
              {user && post.user_id === user.id && (
                <DropdownMenuItem className="text-red-500">
                  Delete post
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="mb-3">{post.description}</p>
        <div className="mb-4">
          <h2 className="font-semibold text-lg glow-text">{post.title}</h2>
        </div>

        <div className="relative aspect-video rounded-md overflow-hidden bg-black/60 mb-4">
          {!isPlaying ? (
            <div className="absolute inset-0 flex items-center justify-center group cursor-pointer" onClick={togglePlay}>
              <img 
                src={post.thumbnail} 
                alt={post.title} 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors"></div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full p-8"
              >
                <Play className="h-8 w-8" />
              </Button>
            </div>
          ) : (
            <iframe
              src={`${YOUTUBE_VIDEO_URL}${post.video_id}?autoplay=1`}
              title={post.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
            ></iframe>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={toggleLike}
              disabled={submittingLike}
            >
              <Heart 
                className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} 
              />
              <span>{likesCount}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={toggleComments}
            >
              <MessageSquare className="h-5 w-5" />
              <span>{comments.length || post.comments_count || 0}</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={toggleComments}
            className="flex items-center gap-1"
          >
            {showComments ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            {showComments ? "Hide comments" : "Show comments"}
          </Button>
        </div>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="border-t border-border px-4 py-3 bg-black/20">
          {user && (
            <div className="flex gap-3 mb-4">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {user.email?.substring(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea 
                  placeholder="Add a comment..." 
                  className="mb-2 min-h-10 bg-slate-800/60"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button 
                    size="sm" 
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || submittingComment}
                  >
                    {submittingComment && (
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Comment
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {loadingComments ? (
              <div className="animate-pulse space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className="flex gap-3">
                    <div className="h-8 w-8 bg-purple-500/20 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 w-1/4 bg-purple-500/20 rounded mb-2"></div>
                      <div className="h-3 w-3/4 bg-purple-500/20 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    {comment.profile?.avatar_url ? (
                      <AvatarImage src={comment.profile.avatar_url} alt={comment.profile.username} />
                    ) : (
                      <AvatarFallback className="text-xs">
                        {comment.profile?.username?.substring(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <div className="flex gap-2 items-center">
                      <Link to={`/profile/${comment.user_id}`} className="font-medium text-sm hover:text-primary transition-colors">
                        {comment.profile?.username || "User"}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(new Date(comment.created_at))}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-2">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};
