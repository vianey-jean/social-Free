import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import PostFeedLister from "@/components/PostFeedLister";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const API_URL = window.location.hostname === 'localhost' 
  ? "http://localhost:3001/api" 
  : "https://liberte-backend.herokuapp.com/api";

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isOnline: boolean;
}

type FriendshipStatus = "none" | "friends" | "pending_sent" | "pending_received";

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus>("none");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshPosts, setRefreshPosts] = useState(0);
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!id) return;
        console.log("Fetching user profile for:", id);
        
        const response = await axios.get(`${API_URL}/users/${id}`, {
          withCredentials: true
        });
        
        console.log("User profile data:", response.data);
        setProfileUser(response.data.user);
        setFriendshipStatus(response.data.friendshipStatus);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger le profil de l'utilisateur.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated && id) {
      fetchUserProfile();
    }
  }, [id, isAuthenticated, user, toast]);
  
  const handleFriendRequest = async () => {
    try {
      await axios.post(`${API_URL}/friends/request/${id}`, {}, {
        withCredentials: true
      });
      
      setFriendshipStatus("pending_sent");
      toast({
        title: "Demande envoyée",
        description: "Votre demande d'ami a été envoyée avec succès.",
      });
    } catch (error) {
      console.error("Failed to send friend request:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande d'ami.",
        variant: "destructive",
      });
    }
  };
  
  const handleAcceptFriend = async () => {
    try {
      await axios.post(`${API_URL}/friends/accept/${id}`, {}, {
        withCredentials: true
      });
      
      setFriendshipStatus("friends");
      toast({
        title: "Demande acceptée",
        description: "Vous êtes maintenant amis.",
      });
    } catch (error) {
      console.error("Failed to accept friend request:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'accepter la demande d'ami.",
        variant: "destructive",
      });
    }
  };
  
  const handleRejectFriend = async () => {
    try {
      await axios.post(`${API_URL}/friends/reject/${id}`, {}, {
        withCredentials: true
      });
      
      setFriendshipStatus("none");
      toast({
        title: "Demande rejetée",
        description: "La demande d'ami a été rejetée.",
      });
    } catch (error) {
      console.error("Failed to reject friend request:", error);
      toast({
        title: "Erreur",
        description: "Impossible de rejeter la demande d'ami.",
        variant: "destructive",
      });
    }
  };
  
  const handleRemoveFriend = async () => {
    try {
      await axios.post(`${API_URL}/friends/remove/${id}`, {}, {
        withCredentials: true
      });
      
      setFriendshipStatus("none");
      toast({
        title: "Ami retiré",
        description: "Cette personne a été retirée de vos amis.",
      });
    } catch (error) {
      console.error("Failed to remove friend:", error);
      toast({
        title: "Erreur",
        description: "Impossible de retirer cet ami.",
        variant: "destructive",
      });
    }
  };
  
  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-liberte-primary"></div>
      </div>
    );
  }
  
  if (!profileUser) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Utilisateur non trouvé</h1>
            <p className="text-gray-600 mb-4">
              L'utilisateur que vous cherchez n'existe pas.
            </p>
            <Button onClick={() => navigate('/home')}>
              Retourner à l'accueil
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  const isOwnProfile = user?.id === profileUser._id;
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="bg-white shadow">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
              {profileUser.avatar ? (
                <img 
                  src={profileUser.avatar.startsWith('http') ? profileUser.avatar : `${API_URL}${profileUser.avatar}`} 
                  alt={`${profileUser.firstName}'s avatar`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-liberte-primary text-white text-4xl font-bold">
                  {profileUser.firstName.charAt(0)}
                </div>
              )}
            </div>
            
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                {profileUser.firstName} {profileUser.lastName}
                {profileUser.isOnline && (
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                )}
              </h1>
              
              {!isOwnProfile && (
                <div className="mt-4 flex gap-2">
                  {friendshipStatus === "none" && (
                    <Button onClick={handleFriendRequest}>
                      Ajouter comme ami
                    </Button>
                  )}
                  
                  {friendshipStatus === "pending_sent" && (
                    <Button variant="outline" disabled>
                      Demande envoyée
                    </Button>
                  )}
                  
                  {friendshipStatus === "pending_received" && (
                    <div className="flex gap-2">
                      <Button onClick={handleAcceptFriend}>
                        Accepter
                      </Button>
                      <Button variant="outline" onClick={handleRejectFriend}>
                        Refuser
                      </Button>
                    </div>
                  )}
                  
                  {friendshipStatus === "friends" && (
                    <Button variant="outline" onClick={handleRemoveFriend}>
                      Retirer des amis
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold mb-4">Publications</h2>
          <PostFeedLister userId={profileUser._id} refreshTrigger={refreshPosts} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
