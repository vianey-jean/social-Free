import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Minimize2, Send } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = "http://localhost:3001/api";

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${API_URL}/messages/${userId}`, {
          withCredentials: true
        });
        setMessages(response.data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        // Mock messages for demo
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
    
    // Set up real-time connection here (e.g., with Socket.IO)
    // This is mock code - in a real app, we'd use WebSockets or similar
    const mockMessageInterval = setInterval(() => {
      if (Math.random() > 0.8) {
        const newMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          senderId: userId,
          content: `Hey! How are you doing? It's ${new Date().toLocaleTimeString()}`,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, newMessage]);
      }
    }, 10000);
    
    return () => {
      clearInterval(mockMessageInterval);
      // Clean up real-time connection here
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
      const response = await axios.post(
        `${API_URL}/messages/${userId}`,
        { content: messageText },
        { withCredentials: true }
      );
      
      // Update the message with the server-provided ID
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id ? response.data : msg
        )
      );
    } catch (error) {
      console.error("Failed to send message:", error);
      // For demo, we'll just keep the optimistically added message
    }
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
                <div className={`max-w-[70%] ${message.senderId === user?.id ? 'bg-liberte-primary text-white' : 'bg-white border'} p-2 rounded-lg`}>
                  <div className="text-sm">{message.content}</div>
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
      
      <div className="p-2 border-t bg-white">
        <div className="flex items-center gap-2">
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
          />
          <Button size="icon" className="shrink-0" onClick={handleSendMessage} disabled={!messageText.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
