
import { useState, useEffect, useRef, useCallback } from "react";
import Post from "./Post";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle } from "lucide-react";

const API_URL = window.location.hostname === 'localhost' 
  ? "http://localhost:3001/api" 
  : "https://liberte-backend.herokuapp.com/api";

interface PostData {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  content: string;
  images: string[];
  createdAt: string;
  isPrivate: boolean;
  likes: number;
  liked: boolean;
  comments: {
    id: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
    content: string;
    createdAt: string;
  }[];
}

interface PostFeedProps {
  refreshTrigger?: number;
  userId?: string; // Optional userId for profile pages
  feedType?: "all" | "friends" | "user" | "popular" | "recent"; // Type of feed to display
  limit?: number; // Limit number of posts to display
  simplified?: boolean; // Show simplified posts
}

const PostFeed = ({ 
  refreshTrigger = 0, 
  userId, 
  feedType = "all", 
  limit, 
  simplified = false 
}: PostFeedProps) => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const loaderRef = useRef<HTMLDivElement>(null);
  
  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) {
      return "?";
    }
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };
  
  const fetchPosts = useCallback(async (pageNum: number) => {
    try {
      if (!isAuthenticated) {
        throw new Error("Authentication required");
      }
      
      let endpoint = `${API_URL}/posts?page=${pageNum}`;
      let params: Record<string, string> = {};
      
      if (limit) {
        params.limit = String(limit);
      }
      
      if (userId) {
        endpoint = `${API_URL}/posts/user/${userId}`;
        console.log(`Fetching posts for user ID: ${userId}`);
      } else if (feedType === "friends" && isAuthenticated) {
        endpoint = `${API_URL}/posts/friends`;
      } else if (feedType === "popular") {
        // For popular posts, we'll sort by number of comments
        endpoint = `${API_URL}/posts?sort=popularity`;
      } else if (feedType === "recent") {
        endpoint = `${API_URL}/posts?sort=latest`;
      }
      
      console.log("Fetching posts from:", endpoint, params);
      
      const response = await axios.get(endpoint, {
        params,
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log("Posts fetched:", response.data);
      
      if (response.data && Array.isArray(response.data.posts)) {
        return {
          posts: response.data.posts,
          hasMore: response.data.hasMore || false
        };
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: any) {
      console.error("Failed to fetch posts:", error);
      
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les publications",
        variant: "destructive",
      });
      
      return {
        posts: [],
        hasMore: false
      };
    }
  }, [userId, feedType, isAuthenticated, toast, limit]);
  
  const loadMore = useCallback(async () => {
    if (!hasMore || loading || !isAuthenticated) return;
    
    setLoading(true);
    
    try {
      const data = await fetchPosts(page);
      
      if (page === 1) {
        setPosts(data.posts || []);
      } else {
        setPosts(prev => [...prev, ...(data.posts || [])]);
      }
      
      setHasMore(data.hasMore);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchPosts, hasMore, loading, page, isAuthenticated]);
  
  useEffect(() => {
    if (refreshTrigger > 0) {
      setPosts([]);
      setPage(1);
      setHasMore(true);
      loadMore();
    }
  }, [refreshTrigger, loadMore]);
  
  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    loadMore();
  }, [userId, feedType, loadMore]);
  
  useEffect(() => {
    if (!simplified && loaderRef.current) {
      const observer = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting) {
            loadMore();
          }
        },
        { threshold: 1.0 }
      );
      
      observer.observe(loaderRef.current);
      
      return () => {
        observer.disconnect();
      };
    }
  }, [loadMore, simplified]);
  
  if (simplified) {
    return (
      <div className="space-y-4">
        {posts.map(post => (
          <Link key={post.id} to={`/post/${post.id}`} className="block">
            <Card className="hover:bg-gray-50 transition-colors">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={post.user.avatar} />
                    <AvatarFallback>{getInitials(post.user.firstName, post.user.lastName)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium truncate">{post.user.firstName} {post.user.lastName}</span>
                  <span className="text-xs text-gray-500 ml-auto">{formatDate(post.createdAt)}</span>
                </div>
                <p className="text-sm line-clamp-2 mb-2">{post.content}</p>
                <div className="flex items-center text-xs text-gray-500">
                  <div className="flex items-center gap-1 mr-3">
                    <Heart className={`h-3 w-3 ${post.liked ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    <span>{post.comments.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        
        {loading && (
          <div className="text-center py-3">
            <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-e-transparent align-[-0.125em] text-liberte-primary"></div>
          </div>
        )}
        
        {!loading && posts.length === 0 && (
          <div className="text-center py-3 text-gray-500 text-sm">
            Aucune publication disponible
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {posts.map(post => (
        <Post key={post.id} post={post} onLikeToggle={(postId) => {
          setPosts(currentPosts => 
            currentPosts.map(p => 
              p.id === postId 
                ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
                : p
            )
          );
        }} />
      ))}
      
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-liberte-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        </div>
      )}
      
      <div ref={loaderRef} className="h-10"></div>
      
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-4 text-gray-500">
          Vous avez vu toutes les publications!
        </div>
      )}
      
      {!loading && posts.length === 0 && (
        <div className="text-center py-4 bg-white rounded-lg shadow p-8">
          <h3 className="text-xl font-semibold mb-2">Aucune publication pour le moment</h3>
          <p className="text-gray-500">
            {isAuthenticated
              ? "Soyez le premier à publier quelque chose!"
              : "Connectez-vous pour voir plus de contenu et interagir avec la communauté."}
          </p>
        </div>
      )}
    </div>
  );
};

export default PostFeed;
