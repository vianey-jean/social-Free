import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import Post from "./Post";

const API_URL = window.location.hostname === "localhost"
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

interface PostFeedListerProps {
  refreshTrigger?: number;
  userId?: string;
  feedType?: "all" | "friends" | "user" | "popular" | "recent";
  limit?: number;
}

// 🔧 Corrige les chemins d’image pour éviter NS_BINDING_ABORTED
const getProperImageUrl = (url: string): string => {
  if (!url) return "";

  if (url.startsWith("http")) return url;

  const filename = url.split("/").pop();
  const base = window.location.hostname === "localhost"
    ? "http://localhost:3001/uploads"
    : "https://liberte-backend.herokuapp.com/uploads";

  return `${base}/${filename}`;
};

const PostFeedLister = ({
  refreshTrigger = 0,
  userId,
  feedType = "all",
  limit,
}: PostFeedListerProps) => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);

      let endpoint = `${API_URL}/posts?page=1`;
      const params: Record<string, string> = {};

      if (limit) params.limit = String(limit);

      if (userId) {
        endpoint = `${API_URL}/posts/user/${userId}`;
      } else {
        switch (feedType) {
          case "friends":
            endpoint = `${API_URL}/posts/friends`;
            break;
          case "popular":
            endpoint = `${API_URL}/posts?sort=popularity`;
            break;
          case "recent":
            endpoint = `${API_URL}/posts?sort=latest`;
            break;
        }
      }

      const response = await axios.get(endpoint, {
        params,
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 15000,
      });

      const postList = response.data?.posts;

      if (!Array.isArray(postList)) {
        throw new Error("Format de réponse invalide");
      }

      const fixedPosts = postList.map((post: PostData) => ({
        ...post,
        images: post.images?.map(getProperImageUrl) || [],
      }));

      setPosts(fixedPosts);
    } catch (error: any) {
      console.error("Erreur de chargement des posts:", error.message);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les publications.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger, userId, feedType]);

  const handleLikeToggle = (postId: string) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="text-center py-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent text-liberte-primary"></div>
        </div>
      ) : posts.length > 0 ? (
        posts.map((post) => (
          <Post key={post.id} post={post} onLikeToggle={handleLikeToggle} />
        ))
      ) : (
        <div className="text-center py-4 bg-white rounded-lg shadow p-8">
          <h3 className="text-xl font-semibold mb-2">Aucune publication pour le moment</h3>
          <p className="text-gray-500">
            {isAuthenticated
              ? "Soyez le premier à publier quelque chose !"
              : "Connectez-vous pour voir plus de contenu et interagir avec la communauté."}
          </p>
        </div>
      )}
    </div>
  );
};

export default PostFeedLister;
