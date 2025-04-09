import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OnlineUsersList from "@/components/OnlineUsersList";
import ChatWindow from "@/components/ChatWindow";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { Link } from "react-router-dom";  // Importation de Link

const API_URL = window.location.hostname === 'localhost' 
  ? "http://localhost:3001/api" 
  : "https://liberte-backend.herokuapp.com/api";

interface ChatUser {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isOnline: boolean;
}

interface ChatPreview {
  id: string;
  participants: ChatUser[];
  otherParticipants: ChatUser[];
  unreadCount: number;
  lastMessage: {
    content: string;
    sender: string;
    createdAt: string;
    read: boolean;
    attachment?: {
      type: string;
      url: string;
      name: string;
    };
  };
  updatedAt: string;
}

const ChatPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);

  useEffect(() => {
    const fetchChats = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/chat`, {
          withCredentials: true
        });
        
        if (response.data) {
          setChats(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChats();
    
    // Refresh chats every 30 seconds as a fallback
    const interval = setInterval(fetchChats, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);
  
  const handleSelectUser = (userData: ChatUser) => {
    setSelectedUser(userData);
    setSelectedChat(null); // Reset selected chat when selecting a user
  };
  
  const handleSelectChat = (chatId: string) => {
    setSelectedChat(chatId);
    setSelectedUser(null); // Reset selected user when selecting a chat
  };
  
  const getProperImageUrl = (url: string) => {
    if (!url) return '';
    
    if (url.startsWith('http')) return url;
    
    // If it's a relative URL, make it absolute
    if (url.startsWith('/uploads/')) {
      return `${API_URL}${url}`;
    }
    
    // If it's just a filename
    if (!url.includes('/')) {
      return `${API_URL}/uploads/${url}`;
    }
    
    return url;
  };
  
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Veuillez vous connecter pour accéder au chat.</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Conversations</h1>
        {/* Ajout du bouton de navigation vers la page d'accueil */}
        <Link to="/" className="bg-liberte-primary text-white px-4 py-2 rounded-md">
          Accueil
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 lg:col-span-3">
          <Tabs defaultValue="chats" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="chats">Conversations</TabsTrigger>
              <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chats" className="border rounded-md h-[calc(100vh-240px)]">
              <ScrollArea className="h-full">
                {loading ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                  </div>
                ) : chats.length > 0 ? (
                  <div className="divide-y">
                    {chats.map((chat) => {
                      const otherUser = chat.otherParticipants[0];
                      return (
                        <div 
                          key={chat.id}
                          className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${selectedChat === chat.id ? 'bg-gray-100' : ''}`}
                          onClick={() => handleSelectChat(chat.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <img 
                                src={otherUser?.avatar ? getProperImageUrl(otherUser.avatar) : "https://via.placeholder.com/40"}
                                alt={`${otherUser?.firstName} ${otherUser?.lastName}`}
                                className="w-10 h-10 rounded-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/40?text=?";
                                }}
                              />
                              {otherUser?.isOnline && (
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {otherUser?.firstName} {otherUser?.lastName}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {chat.lastMessage?.content || "Aucun message"}
                              </p>
                            </div>
                            <div className="flex flex-col items-end">
                              <p className="text-xs text-gray-500">
                                {new Date(chat.lastMessage?.createdAt || chat.updatedAt).toLocaleDateString()}
                              </p>
                              {chat.unreadCount > 0 && (
                                <span className="bg-liberte-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mt-1">
                                  {chat.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                    <p>Aucune conversation</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="users" className="border rounded-md h-[calc(100vh-240px)]">
              <OnlineUsersList onSelectUser={handleSelectUser} embedded={true} />
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="md:col-span-8 lg:col-span-9 border rounded-md h-[calc(100vh-240px)]">
          {selectedChat ? (
            <ChatConversation chatId={selectedChat} onClose={() => setSelectedChat(null)} />
          ) : selectedUser ? (
            <ChatWindow 
              userId={selectedUser._id} 
              userName={`${selectedUser.firstName} ${selectedUser.lastName}`}
              userAvatar={selectedUser.avatar}
              embedded={true}
              onClose={() => setSelectedUser(null)}  // Ajout de la possibilité de fermer la fenêtre de chat
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p>Sélectionnez une conversation ou un utilisateur pour commencer à discuter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Component to display a conversation in the main area
const ChatConversation = ({ chatId, onClose }: { chatId: string, onClose: () => void }) => {
  const [chat, setChat] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchChat = async () => {
      if (!chatId) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/chat/${chatId}`, {
          withCredentials: true
        });
        
        if (response.data) {
          setChat(response.data);
          
          // Mark messages as read
          await axios.patch(`${API_URL}/chat/${chatId}/read`, {}, {
            withCredentials: true
          });
        }
      } catch (error) {
        console.error("Error fetching chat:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChat();
  }, [chatId]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }
  
  if (!chat) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <p>Conversation non trouvée</p>
      </div>
    );
  }
  
  const otherUser = chat.participants.find(p => p._id !== user?.id);
  
  return (
    <ChatWindow 
      userId={otherUser._id}
      userName={`${otherUser.firstName} ${otherUser.lastName}`}
      userAvatar={otherUser.avatar}
      embedded={true}
      chatId={chatId}
      onClose={onClose}
    />
  );
};

export default ChatPage;
