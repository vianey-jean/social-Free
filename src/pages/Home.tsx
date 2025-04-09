
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import OnlineUsersList from "@/components/OnlineUsersList";
import PostFeed from "@/components/PostFeed";
import CreatePostForm from "@/components/CreatePostForm";
import { useChat } from "@/contexts/ChatContext";

const Home = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);
  
  const handlePostCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-liberte-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null; // We're redirecting anyway
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="flex-1 flex">
        <OnlineUsersList />
        
        <div className="flex-1 p-6">
          <div className="max-w-2xl mx-auto">
            <CreatePostForm onPostCreated={handlePostCreated} />
            <PostFeed refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
