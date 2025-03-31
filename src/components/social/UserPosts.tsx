
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MusicPost } from "./MusicPost";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { toast } from "sonner";

interface PostProfile {
  username: string;
  avatar_url: string | null;
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

export const UserPosts = ({ userId }: { userId: string }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async (pageNumber = 0) => {
    try {
      const limit = 5;
      const from = pageNumber * limit;
      const to = from + limit - 1;

      // Get comments count using a separate query
      const commentsCountQuery = await supabase
        .from('post_comments')
        .select('post_id')
        .eq('user_id', userId);
        
      if (commentsCountQuery.error) throw commentsCountQuery.error;
      
      // Manually count comments by post_id
      const commentsCountMap: Record<string, number> = {};
      if (commentsCountQuery.data) {
        commentsCountQuery.data.forEach(item => {
          if (item.post_id) {
            commentsCountMap[item.post_id] = (commentsCountMap[item.post_id] || 0) + 1;
          }
        });
      }

      // Then get the posts
      const { data, error, count } = await supabase
        .from("music_posts")
        .select(`
          *,
          profile:profiles(username, avatar_url)
        `, { count: 'exact' })
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      // Add comments_count to each post
      const postsWithCommentCount = (data || []).map((post: any) => ({
        ...post,
        comments_count: commentsCountMap[post.id] || 0,
        profile: post.profile || { username: 'Unknown', avatar_url: null }
      })) as Post[];

      if (pageNumber === 0) {
        setPosts(postsWithCommentCount);
      } else {
        setPosts(prev => [...prev, ...postsWithCommentCount]);
      }

      // Check if there are more posts to load
      if (count !== null) {
        setHasMore(from + data.length < count);
      } else {
        setHasMore(data.length === limit);
      }

    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [userId]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2].map(i => (
          <div key={i} className="glass-morph rounded-xl overflow-hidden animate-pulse">
            <div className="h-52 bg-purple-500/20"></div>
            <div className="p-4">
              <div className="h-6 w-3/4 bg-purple-500/20 rounded mb-2"></div>
              <div className="h-4 w-1/2 bg-purple-500/20 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="glass-morph p-8 text-center rounded-xl">
        <h3 className="text-xl font-medium mb-2">No posts yet</h3>
        <p className="text-muted-foreground mb-4">This user hasn't shared any music yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map(post => (
        <MusicPost key={post.id} post={post as any} />
      ))}
      
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button onClick={loadMore} variant="outline" className="backdrop-blur-sm">
            {loading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
            Load more
          </Button>
        </div>
      )}
    </div>
  );
};
