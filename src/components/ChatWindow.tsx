
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Minimize2, Send, Paperclip, Video, Mic, Image } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = window.location.hostname === 'localhost' 
  ? "http://localhost:3001/api" 
  : "https://liberte-backend.herokuapp.com/api";

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  attachment?: {
    type: "image" | "video" | "audio" | "file";
    url: string;
    name: string;
  };
}

interface ChatWindowProps {
  userId: string;
  userName: string;
  userAvatar?: string;
  onClose: () => void;
  onMinimize: () => void;
}

const ChatWindow = ({
  userId,
  userName,
  userAvatar,
  onClose,
  onMinimize
}: ChatWindowProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/chat/user/${userId}`, {
          withCredentials: true
        });
        
        if (response.data && response.data.messages) {
          setMessages(response.data.messages.map((msg: any) => ({
            id: msg._id,
            senderId: msg.sender._id || msg.sender,
            content: msg.content,
            timestamp: msg.createdAt,
            attachment: msg.attachment
          })));
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        // For development/demo purposes only:
        const mockMessages: ChatMessage[] = [];
        for (let i = 1; i <= 5; i++) {
          mockMessages.push({
            id: `msg-${i}`,
            senderId: i % 2 === 0 ? userId : user?.id || "",
            content: `This is message #${i} in the conversation.`,
            timestamp: new Date(Date.now() - (6 - i) * 600000).toISOString()
          });
        }
        setMessages(mockMessages);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
    
    // Mark messages as read
    const markAsRead = async () => {
      try {
        await axios.patch(`${API_URL}/chat/${userId}/read`, {}, {
          withCredentials: true
        });
      } catch (error) {
        console.error("Failed to mark messages as read:", error);
      }
    };
    
    if (messages.length > 0) {
      markAsRead();
    }
    
    // Set up real-time connection (in a real app, use WebSocket/Socket.IO)
    const interval = setInterval(fetchMessages, 5000);
    
    return () => {
      clearInterval(interval);
    };
  }, [userId, user?.id]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };
  
  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    
    const newMessage: ChatMessage = {
      id: `local-${Date.now()}`,
      senderId: user?.id || "",
      content: messageText,
      timestamp: new Date().toISOString()
    };
    
    // Optimistically add the message to the UI
    setMessages(prev => [...prev, newMessage]);
    setMessageText("");
    
    try {
      // Fix: Use the correct API endpoint structure
      // Previously we were trying to post to /chat/${userId}/messages
      // But the actual server route expects /chat/:chatId/messages
      // We need to get the chatId first or use the userId as the chatId parameter
      
      const response = await axios.post(
        `${API_URL}/chat/user/${userId}/messages`, // Changed endpoint to match server route
        { content: messageText },
        { withCredentials: true }
      );
      
      // Update the message with the server-provided ID
      if (response.data) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === newMessage.id ? {
              ...msg,
              id: response.data._id || response.data.id
            } : msg
          )
        );
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Erreur d'envoi",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    }
  };
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "Le fichier ne doit pas dépasser 10MB",
        variant: "destructive",
      });
      return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('chatId', userId);
    
    setUploadingFile(true);
    setUploadProgress(0);
    
    try {
      const response = await axios.post(
        `${API_URL}/chat/upload`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setUploadProgress(percentCompleted);
          },
        }
      );
      
      // Add the message with attachment to the chat
      const newMessage: ChatMessage = {
        id: response.data._id || response.data.id,
        senderId: user?.id || "",
        content: response.data.content || "",
        timestamp: new Date().toISOString(),
        attachment: response.data.attachment
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      toast({
        title: "Fichier envoyé",
        description: "Votre fichier a été envoyé avec succès",
      });
    } catch (error) {
      console.error("Failed to upload file:", error);
      toast({
        title: "Erreur d'envoi",
        description: "Impossible d'envoyer le fichier",
        variant: "destructive",
      });
    } finally {
      setUploadingFile(false);
      setUploadProgress(0);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image size={16} className="mr-1" />;
      case 'video':
        return <Video size={16} className="mr-1" />;
      case 'audio':
        return <Mic size={16} className="mr-1" />;
      default:
        return <Paperclip size={16} className="mr-1" />;
    }
  };
  
  const renderAttachment = (message: ChatMessage) => {
    if (!message.attachment) return null;
    
    const { type, url, name } = message.attachment;
    
    switch (type) {
      case 'image':
        return (
          <div className="mt-2 max-w-full">
            <img 
              src={url} 
              alt={name} 
              className="max-h-48 rounded-md object-contain"
              loading="lazy"
            />
          </div>
        );
      case 'video':
        return (
          <div className="mt-2">
            <video 
              src={url} 
              controls 
              className="max-h-48 max-w-full rounded-md"
            />
          </div>
        );
      case 'audio':
        return (
          <div className="mt-2">
            <audio src={url} controls className="max-w-full" />
          </div>
        );
      default:
        return (
          <div className="mt-2">
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center text-xs text-blue-500 hover:underline"
            >
              <Paperclip size={14} className="mr-1" />
              {name}
            </a>
          </div>
        );
    }
  };
  
  return (
    <div className="w-72 h-96 flex flex-col bg-white rounded-t-lg shadow-xl border overflow-hidden">
      <div className="bg-liberte-primary text-white p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Avatar className="h-8 w-8">
              <AvatarImage src={userAvatar} />
              <AvatarFallback>{getInitials(userName)}</AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-0.5 -right-0.5 online-status"></span>
          </div>
          <div className="font-medium truncate">{userName}</div>
        </div>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-blue-700" onClick={onMinimize}>
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-blue-700" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 p-2 overflow-y-auto bg-gray-50">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin h-5 w-5 border-2 border-liberte-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.senderId === user?.id ? 'bg-liberte-primary text-white' : 'bg-white border'} p-2 rounded-lg`}>
                  <div className="text-sm">{message.content}</div>
                  {renderAttachment(message)}
                  <div className={`text-xs mt-1 ${message.senderId === user?.id ? 'text-blue-100' : 'text-gray-500'}`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {uploadingFile && (
        <div className="px-3 py-2 bg-gray-50 border-t">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">Envoi du fichier...</span>
            <span className="text-xs font-medium">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-1.5" />
        </div>
      )}
      
      <div className="p-2 border-t bg-white">
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          />
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 rounded-full" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFile}
                >
                  <Paperclip size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Joindre un fichier</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Textarea
            placeholder="Écrire un message..."
            className="min-h-10 resize-none"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={uploadingFile}
          />
          <Button 
            size="icon" 
            className="shrink-0" 
            onClick={handleSendMessage} 
            disabled={!messageText.trim() || uploadingFile}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
