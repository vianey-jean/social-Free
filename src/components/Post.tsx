
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Share, MoreHorizontal } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

const API_URL = window.location.hostname === 'localhost' 
  ? "http://localhost:3001/api" 
  : "https://liberte-backend.herokuapp.com/api";

interface PostProps {
  post: {
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
  };
  onLikeToggle?: (postId: string) => void;
}

const Post = ({ post, onLikeToggle }: PostProps) => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [liked, setLiked] = useState(post.liked);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(post.comments);
  const [viewLikes, setViewLikes] = useState(false);
  const [likesUsers, setLikesUsers] = useState<{id: string, firstName: string, lastName: string, avatar?: string}[]>([]);
  const [loadingLikes, setLoadingLikes] = useState(false);
  
  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) {
      return "?";
    }
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };
  
  // Helper function to format image URLs
  const formatImageUrl = (url: string): string => {
    if (!url) return '';
    
    // If it's already an absolute URL
    if (url.startsWith('http')) return url;
    
    // If it's a relative URL without the /api prefix
    if (url.startsWith('/uploads')) {
      return `${API_URL}${url}`;
    }
    
    return url;
  };
  
  const handleLike = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Non connecté",
        description: "Vous devez être connecté pour aimer une publication",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await axios.post(`${API_URL}/posts/${post.id}/like`, {}, { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        },
      });
      const newLikedState = !liked;
      setLiked(newLikedState);
      setLikesCount(newLikedState ? likesCount + 1 : likesCount - 1);
      
      if (onLikeToggle) {
        onLikeToggle(post.id);
      }
    } catch (error) {
      console.error("Failed to like post:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'aimer cette publication pour le moment",
        variant: "destructive",
      });
    }
  };
  
  const handleComment = async () => {
    if (!isAuthenticated || !commentText.trim()) return;
    
    try {
      const response = await axios.post(
        `${API_URL}/posts/${post.id}/comment`,
        { content: commentText },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          },
        }
      );
      
      setComments([...comments, response.data]);
      setCommentText("");
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter un commentaire pour le moment",
        variant: "destructive",
      });
      
      if (user) {
        const newComment = {
          id: Date.now().toString(),
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar
          },
          content: commentText,
          createdAt: new Date().toISOString()
        };
        
        setComments([...comments, newComment]);
        setCommentText("");
      }
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };
  
  const fetchLikes = async () => {
    setLoadingLikes(true);
    try {
      const response = await axios.get(`${API_URL}/posts/${post.id}/likes`, {
        withCredentials: true
      });
      setLikesUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch likes:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les personnes qui aiment cette publication",
        variant: "destructive",
      });
      
      // Fallback data for demo
      setLikesUsers(Array(likesCount).fill(null).map((_, i) => ({
        id: `user-${i}`,
        firstName: ["John", "Jane", "Alice", "Bob", "Charlie"][Math.floor(Math.random() * 5)],
        lastName: ["Doe", "Smith", "Johnson", "Brown", "Wilson"][Math.floor(Math.random() * 5)],
        avatar: Math.random() > 0.5 ? `https://i.pravatar.cc/150?img=${i+1}` : undefined
      })));
    } finally {
      setLoadingLikes(false);
    }
  };
  
  const handleViewLikes = () => {
    if (likesCount > 0) {
      fetchLikes();
      setViewLikes(true);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <Link to={`/profile/${post.user.id}`} className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={post.user.avatar} />
              <AvatarFallback>{getInitials(post.user.firstName, post.user.lastName)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{post.user.firstName} {post.user.lastName}</div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                {formatDate(post.createdAt)}
                {post.isPrivate && <span className="text-liberte-error">• Privé</span>}
              </div>
            </div>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user?.id === post.user.id && (
                <DropdownMenuItem>Supprimer</DropdownMenuItem>
              )}
              <DropdownMenuItem>Signaler</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <p className="mb-4">{post.content}</p>
        
        {post.images && post.images.length > 0 && (
          <div className="mb-4">
            {post.images.length === 1 ? (
              <Dialog>
                <DialogTrigger asChild>
                  <img 
                    src={formatImageUrl(post.images[0])} 
                    alt="Post" 
                    className="w-full rounded-md object-cover max-h-96 cursor-pointer"
                  />
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl">
                  <img 
                    src={formatImageUrl(post.images[0])} 
                    alt="Post" 
                    className="w-full object-contain"
                  />
                </DialogContent>
              </Dialog>
            ) : (
              <Carousel className="w-full">
                <CarouselContent>
                  {post.images.map((image, index) => (
                    <CarouselItem key={index}>
                      <Dialog>
                        <DialogTrigger asChild>
                          <img 
                            src={formatImageUrl(image)} 
                            alt={`Post image ${index + 1}`} 
                            className="w-full rounded-md object-cover max-h-96 cursor-pointer"
                          />
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-3xl">
                          <img 
                            src={formatImageUrl(image)} 
                            alt={`Post image ${index + 1}`} 
                            className="w-full object-contain"
                          />
                        </DialogContent>
                      </Dialog>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between pt-2 border-t">
          <Dialog open={viewLikes} onOpenChange={setViewLikes}>
            <DialogTrigger asChild>
              <button 
                onClick={handleViewLikes}
                className="flex items-center gap-1 text-sm text-gray-500 hover:underline"
                disabled={likesCount === 0}
              >
                <Heart className={`h-4 w-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                <span>{likesCount} J'aime</span>
              </button>
            </DialogTrigger>
            <DialogContent>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Heart className="h-5 w-5 mr-2 text-liberte-primary" /> 
                Personnes qui aiment cette publication
              </h3>
              {loadingLikes ? (
                <div className="flex justify-center p-4">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-liberte-primary"></div>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {likesUsers.length > 0 ? (
                    likesUsers.map(user => (
                      <Link 
                        key={user.id} 
                        to={`/profile/${user.id}`}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md"
                      >
                        <Avatar>
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
                        </Avatar>
                        <span>{user.firstName} {user.lastName}</span>
                      </Link>
                    ))
                  ) : (
                    <p className="text-center text-gray-500">Aucun utilisateur n'a aimé cette publication</p>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
          
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <MessageCircle className="h-4 w-4" />
            <span>{comments.length} Commentaires</span>
          </div>
        </div>
      </div>
      
      <div className="flex border-t px-4 py-2">
        <Button
          variant={liked ? "destructive" : "outline"}
          size="sm"
          className="flex-1 gap-1"
          onClick={handleLike}
        >
          <Heart className={`h-4 w-4 ${liked ? 'fill-white' : ''}`} />
          {liked ? "J'aime" : "J'aime"}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1 ml-2"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle className="h-4 w-4" />
          Commenter
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1 ml-2"
        >
          <Share className="h-4 w-4" />
          Partager
        </Button>
      </div>
      
      {showComments && (
        <div className="p-4 bg-gray-50">
          {isAuthenticated ? (
            <div className="flex gap-2 mb-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>
                  {user ? getInitials(user.firstName, user.lastName) : "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Écrire un commentaire..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="min-h-10 resize-none"
                />
                <div className="flex justify-end mt-2">
                  <Button
                    size="sm"
                    onClick={handleComment}
                    disabled={!commentText.trim()}
                  >
                    Commenter
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-2 mb-4">
              <Button asChild variant="outline" size="sm">
                <Link to="/login">Connectez-vous pour commenter</Link>
              </Button>
            </div>
          )}
          
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.user.avatar} />
                  <AvatarFallback>{getInitials(comment.user.firstName, comment.user.lastName)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-white p-3 rounded-lg">
                    <div className="font-medium text-sm">
                      {comment.user.firstName} {comment.user.lastName}
                    </div>
                    <div className="text-sm">{comment.content}</div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDate(comment.createdAt)}
                  </div>
                </div>
              </div>
            ))}
            
            {comments.length === 0 && (
              <div className="text-center text-gray-500 py-2">
                Aucun commentaire pour l'instant.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;
