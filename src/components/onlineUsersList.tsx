
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

const API_URL = window.location.hostname === 'localhost' 
  ? "http://localhost:3001/api" 
  : "https://liberte-backend.herokuapp.com/api";

interface OnlineUser {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isOnline: boolean;
}

const OnlineUsersList = () => {
  const { isAuthenticated, user } = useAuth();
  const { openChat } = useChat();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [offlineUsers, setOfflineUsers] = useState<OnlineUser[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/users/online`, {
          withCredentials: true
        });
        
        if (response.data) {
          // Filter users into online and offline
          const online: OnlineUser[] = [];
          const offline: OnlineUser[] = [];
          
          response.data.forEach((userData: OnlineUser) => {
            if (userData.isOnline) {
              online.push(userData);
            } else {
              offline.push(userData);
            }
          });
          
          setOnlineUsers(online);
          setOfflineUsers(offline);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
    
    // Refresh online users every 30 seconds
    const interval = setInterval(fetchUsers, 30000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);
  
  if (!isAuthenticated) {
    return null;
  }
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };
  
  const handleStartChat = (userData: OnlineUser) => {
    openChat(userData._id, `${userData.firstName} ${userData.lastName}`, userData.avatar);
  };
  
  // Filter out current user
  const filteredOnlineUsers = onlineUsers.filter(onlineUser => onlineUser._id !== user?.id);
  const filteredOfflineUsers = offlineUsers.filter(offlineUser => offlineUser._id !== user?.id);
  
  return (
    <aside className="hidden md:flex flex-col w-72 bg-white border-r h-screen">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Utilisateurs</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="h-6 w-6 border-2 border-liberte-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOnlineUsers.length > 0 && (
              <div>
                <div className="flex items-center mb-2">
                  <Badge variant="success" className="mr-2">En ligne</Badge>
                  <span className="text-xs text-gray-500">{filteredOnlineUsers.length} utilisateur(s)</span>
                </div>
                <div className="space-y-2">
                  {filteredOnlineUsers.map((onlineUser) => (
                    <div key={onlineUser._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors">
                      <Link to={`/profile/${onlineUser._id}`} className="flex items-center flex-1">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={onlineUser.avatar} />
                            <AvatarFallback>
                              {getInitials(onlineUser.firstName, onlineUser.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-sm">
                            {onlineUser.firstName} {onlineUser.lastName}
                          </p>
                        </div>
                      </Link>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-gray-500 hover:text-liberte-primary"
                        onClick={() => handleStartChat(onlineUser)}
                      >
                        <MessageCircle size={18} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {filteredOfflineUsers.length > 0 && (
              <div>
                <div className="flex items-center mb-2">
                  <Badge variant="secondary" className="mr-2">Hors ligne</Badge>
                  <span className="text-xs text-gray-500">{filteredOfflineUsers.length} utilisateur(s)</span>
                </div>
                <div className="space-y-2">
                  {filteredOfflineUsers.map((offlineUser) => (
                    <div key={offlineUser._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors">
                      <Link to={`/profile/${offlineUser._id}`} className="flex items-center flex-1">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={offlineUser.avatar} />
                            <AvatarFallback>
                              {getInitials(offlineUser.firstName, offlineUser.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 border-2 border-white rounded-full"></span>
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-sm text-gray-600">
                            {offlineUser.firstName} {offlineUser.lastName}
                          </p>
                        </div>
                      </Link>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-gray-400 hover:text-liberte-primary"
                        onClick={() => handleStartChat(offlineUser)}
                      >
                        <MessageCircle size={18} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {filteredOnlineUsers.length === 0 && filteredOfflineUsers.length === 0 && (
              <p className="text-gray-500 text-sm text-center">
                Aucun utilisateur disponible pour le moment
              </p>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

export default OnlineUsersList;
