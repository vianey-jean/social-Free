
import React, { createContext, useContext, useState } from "react";
import { ChatContainer, Chat } from "@/components/ChatContainer";

interface ChatContextType {
  openChat: (userId: string, userName: string, userAvatar?: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chatContainerRef] = useState<React.RefObject<any>>(React.createRef());
  
  const openChat = (userId: string, userName: string, userAvatar?: string) => {
    // This is a stub - the actual implementation is in the ChatContainer component
    // We're just forwarding the call
    if (chatContainerRef.current) {
      chatContainerRef.current.openChat(userId, userName, userAvatar);
    }
  };
  
  return (
    <ChatContext.Provider value={{ openChat }}>
      {children}
      <ChatContainerWithRef ref={chatContainerRef} />
    </ChatContext.Provider>
  );
};

// Create a forwardRef component to expose methods
const ChatContainerWithRef = React.forwardRef<any>((props, ref) => {
  const [activeChats, setActiveChats] = useState<Chat[]>([]);
  
  React.useImperativeHandle(ref, () => ({
    openChat: (userId: string, userName: string, userAvatar?: string) => {
      // Check if chat is already open
      const existingChatIndex = activeChats.findIndex(chat => chat.userId === userId);
      
      if (existingChatIndex >= 0) {
        // If minimized, un-minimize it
        if (activeChats[existingChatIndex].minimized) {
          setActiveChats(prev => 
            prev.map((chat, i) => 
              i === existingChatIndex ? { ...chat, minimized: false } : chat
            )
          );
        }
        return;
      }
      
      // Add new chat
      setActiveChats(prev => [
        ...prev,
        { userId, userName, userAvatar, minimized: false }
      ]);
    }
  }));
  
  const closeChat = (userId: string) => {
    setActiveChats(prev => prev.filter(chat => chat.userId !== userId));
  };
  
  const minimizeChat = (userId: string) => {
    setActiveChats(prev => 
      prev.map(chat => 
        chat.userId === userId ? { ...chat, minimized: true } : chat
      )
    );
  };
  
  const maximizeChat = (userId: string) => {
    setActiveChats(prev => 
      prev.map(chat => 
        chat.userId === userId ? { ...chat, minimized: false } : chat
      )
    );
  };
  
  return (
    <div className="fixed bottom-0 right-0 flex items-end gap-2 p-4 z-50">
      {activeChats.map(chat => (
        chat.minimized ? (
          <div 
            key={chat.userId}
            className="h-10 rounded-t-lg bg-liberte-primary text-white px-4 flex items-center cursor-pointer"
            onClick={() => maximizeChat(chat.userId)}
          >
            <span className="font-medium">{chat.userName}</span>
          </div>
        ) : (
          <ChatWindow
            key={chat.userId}
            userId={chat.userId}
            userName={chat.userName}
            userAvatar={chat.userAvatar}
            onClose={() => closeChat(chat.userId)}
            onMinimize={() => minimizeChat(chat.userId)}
          />
        )
      ))}
    </div>
  );
});

// Import the actual ChatWindow component here
import ChatWindow from "@/components/ChatWindow";

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
