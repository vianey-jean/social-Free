import { useState, useEffect, useRef, useCallback } from "react";
import Post from "./Post";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";

const API_URL = "http://localhost:3001/api";

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
}

const PostFeed = ({ refreshTrigger = 0, userId }: PostFeedProps) => {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const loaderRef = useRef<HTMLDivElement>(null);
  
  const fetchPosts = useCallback(async (pageNum: number) => {
    try {
      const endpoint = userId
        ? `${API_URL}/posts/user/${userId}?page=${pageNum}`
        : `${API_URL}/posts?page=${pageNum}`;
      
      const response = await axios.get(endpoint, {
        withCredentials: true
      });
      
      return response.data;
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      
      const mockPosts: PostData[] = [];
      
      for (let i = 1; i <= 5; i++) {
        const isPrivate = Math.random() > 0.7;
        mockPosts.push({
          id: `post-${pageNum}-${i}`,
          user: {
            id: userId || String(Math.floor(Math.random() * 10) + 1),
            firstName: ["John", "Jane", "Alice", "Bob", "Charlie"][Math.floor(Math.random() * 5)],
            lastName: ["Doe", "Smith", "Johnson", "Brown", "Wilson"][Math.floor(Math.random() * 5)]
          },
          content: `This is a ${isPrivate ? 'private' : 'public'} post #${pageNum}-${i}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
          images: Math.random() > 0.5 ? 
            [
              `https://picsum.photos/seed/${pageNum}-${i}/800/600`
            ] : [],
          createdAt: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
          isPrivate,
          likes: Math.floor(Math.random() * 50),
          liked: Math.random() > 0.5,
          comments: Array(Math.floor(Math.random() * 3)).fill(null).map((_, j) => ({
            id: `comment-${pageNum}-${i}-${j}`,
            user: {
              id: String(Math.floor(Math.random() * 10) + 1),
              firstName: ["John", "Jane", "Alice", "Bob", "Charlie"][Math.floor(Math.random() * 5)],
              lastName: ["Doe", "Smith", "Johnson", "Brown", "Wilson"][Math.floor(Math.random() * 5)]
            },
            content: `This is comment #${j} on post #${pageNum}-${i}. Lorem ipsum dolor sit amet.`,
            createdAt: new Date(Date.now() - Math.random() * 500000000).toISOString()
          }))
        });
      }
      
      return {
        posts: mockPosts,
        hasMore: pageNum < 3
      };
    }
  }, [userId]);
  
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    
    setLoading(true);
    
    try {
      const data = await fetchPosts(page);
      
      if (page === 1) {
        setPosts(data.posts);
      } else {
        setPosts(prev => [...prev, ...data.posts]);
      }
      
      setHasMore(data.hasMore);
      setPage(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  }, [fetchPosts, hasMore, loading, page]);
  
  useEffect(() => {
    if (refreshTrigger > 0) {
      setPosts([]);
      setPage(1);
      setHasMore(true);
      loadMore();
    }
  }, [refreshTrigger, loadMore]);
  
  useEffect(() => {
    loadMore();
  }, [loadMore]);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );
    
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }
    
    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loadMore]);
  
  return (
    <div className="space-y-6">
      {posts.map(post => (
        <Post key={post.id} post={post} />
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
