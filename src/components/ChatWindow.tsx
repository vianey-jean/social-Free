import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Minus, Paperclip, Send, Phone, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

export interface ChatWindowExtendedProps {
  userId: string;
  userName?: string;
  userAvatar?: string;
  onClose: () => void;
  onMinimize: () => void;
}

const API_URL = window.location.hostname === "localhost"
  ? "http://localhost:3001/api"
  : "https://liberte-backend.herokuapp.com/api";

const ChatWindow: React.FC<ChatWindowExtendedProps> = ({
  userId,
  userName = "Utilisateur",
  userAvatar,
  onClose,
  onMinimize
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [contactInfo, setContactInfo] = useState<any>({ firstName: "", lastName: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Récupération des infos utilisateur
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await axios.get(`${API_URL}/users/${userId}`, { withCredentials: true });
        if (res.data?.user) {
          setIsOnline(res.data.user.isOnline || false);
          setContactInfo({
            firstName: res.data.user.firstName || "",
            lastName: res.data.user.lastName || ""
          });
        }
      } catch (err) {
        console.error("Erreur utilisateur :", err);
      }
    };
    if (userId) fetchUserInfo();
  }, [userId]);

  // Chargement des messages et polling
  useEffect(() => {
    let isMounted = true;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${API_URL}/chat/user/${userId}`, { withCredentials: true });
        if (res.data?.messages && isMounted) {
          setMessages((prev) => {
            const newMessages = res.data.messages;
            if (JSON.stringify(prev) !== JSON.stringify(newMessages)) {
              return newMessages;
            }
            return prev;
          });

          if (res.data._id) {
            await axios.patch(`${API_URL}/chat/${res.data._id}/read`, {}, { withCredentials: true });
          }
        }
      } catch (err) {
        console.error("Erreur de polling :", err);
      }
    };

    if (user && userId) {
      fetchMessages();
      pollingRef.current = setInterval(fetchMessages, 3000);
    }

    return () => {
      isMounted = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [userId, user]);

  // Scroll auto vers le bas (observer)
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const observer = new MutationObserver(() => {
      container.scrollTop = container.scrollHeight;
    });

    observer.observe(container, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || isLoading || !userId) return;

    try {
      setIsLoading(true);
      let res;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("receiverId", userId);

        res = await axios.post(`${API_URL}/chat/upload`, formData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" }
        });

        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";

        if (res.data?.attachment) {
          setMessages(prev => [...prev, res.data]);
        }
      } else {
        res = await axios.post(`${API_URL}/chat/user/${userId}/messages`, {
          content: newMessage
        }, { withCredentials: true });

        if (res?.data) {
          setMessages(prev => [...prev, res.data]);
          setNewMessage("");
        }
      }
    } catch (err) {
      console.error("Erreur envoi :", err);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getProperImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_URL}/uploads/${url.split('/').pop()}`;
  };

  const displayName = userName || `${contactInfo.firstName} ${contactInfo.lastName}` || "Utilisateur";

  return (
    <div className="fixed bottom-0 right-4 w-96 bg-white shadow-lg rounded-md flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-100 border-b rounded-t-md cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center">
          <div className="relative">
            <Avatar className="mr-2 w-8 h-8">
              <AvatarImage src={userAvatar} alt={displayName} />
              <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>
          <span className="text-sm font-medium">{displayName}</span>
          <span className="ml-2 text-xs text-gray-500">{isOnline ? "En ligne" : "Hors ligne"}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onMinimize(); }}>
            <Minus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onClose(); }}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Body */}
      {isExpanded && (
        <div className="flex flex-col h-96">
          <ScrollArea className="flex-1 p-4">
            <div ref={scrollRef} className="space-y-2 overflow-y-auto max-h-96">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex flex-col ${message.sender._id === user?.id ? "items-end" : "items-start"}`}
                >
                  <div className={`rounded-lg px-3 py-2 text-sm max-w-[75%] ${message.sender._id === user?.id ? "bg-blue-100 text-blue-800" : "bg-gray-200 text-gray-800"}`}>
                    {message.attachment ? (
                      message.attachment.type === "image" ? (
                        <img
                          src={getProperImageUrl(message.attachment.url)}
                          alt="attachment"
                          className="max-w-full rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Image+non+disponible';
                          }}
                        />
                      ) : (
                        <div className="flex items-center">
                          📎 <span className="ml-2">{message.attachment.name || "Pièce jointe"}</span>
                        </div>
                      )
                    ) : (
                      message.content
                    )}
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
              {selectedFile && (
                <div className="flex items-center justify-end mt-2">
                  <div className="bg-blue-50 text-blue-800 px-3 py-2 rounded-md text-sm">
                    📎 {selectedFile.name}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Zone de saisie */}
          <div className="border-t p-4">
            <div className="flex items-center space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
                className="hidden"
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
              />
              <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
                <Paperclip className="h-5 w-5" />
              </Button>
              <Textarea
                rows={1}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Écrivez votre message..."
                className="resize-none flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isLoading}
              />
              <Button onClick={handleSendMessage} disabled={isLoading || (!newMessage.trim() && !selectedFile)}>
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Send className="h-5 w-5 mr-2" />
                )}
                Envoyer
              </Button>
            </div>

            {/* Boutons d'appel */}
            <div className="flex items-center justify-end space-x-2 mt-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  toast({
                    title: `Appel audio initié`,
                    description: `Tentative d'appel à ${displayName}...`
                  });
                  setTimeout(() => {
                    toast({
                      title: "Information",
                      description: `${displayName} n'est pas disponible pour le moment.`
                    });
                  }, 3000);
                }}
              >
                <Phone className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  toast({
                    title: `Appel vidéo initié`,
                    description: `Tentative d'appel à ${displayName}...`
                  });
                  setTimeout(() => {
                    toast({
                      title: "Information",
                      description: `${displayName} n'est pas disponible pour le moment.`
                    });
                  }, 3000);
                }}
              >
                <Video className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
