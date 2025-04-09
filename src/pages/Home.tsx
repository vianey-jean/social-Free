
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import OnlineUsersList from "@/components/OnlineUsersList";
import PostFeedLister from "@/components/PostFeedLister";
import CreatePostForm from "@/components/CreatePostForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Home = () => {
  const { isAuthenticated, user, loading } = useAuth();
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
          <div className="max-w-4xl mx-auto">
            <CreatePostForm onPostCreated={handlePostCreated} />
            
            <div className="my-6  grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    Toutes les publications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Voir les dernières publications
                  </p>
                  <PostFeedLister 
                    refreshTrigger={refreshTrigger} 
                    feedType="recent" 
                    limit={3}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    Publications populaires
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Publications avec le plus de commentaires
                  </p>
                  <PostFeedLister 
                    refreshTrigger={refreshTrigger} 
                    feedType="popular" 
                    limit={3}
                  />
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="all" className="mt-6">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="all" className="flex-1">Toutes les publications</TabsTrigger>
                <TabsTrigger value="friends" className="flex-1">Publications des amis</TabsTrigger>
                <TabsTrigger value="my" className="flex-1">Mes publications</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <h2 className="text-xl font-semibold mb-4">Publications récentes</h2>
                <PostFeedLister refreshTrigger={refreshTrigger} feedType="all" />
              </TabsContent>
              
              <TabsContent value="friends">
                <h2 className="text-xl font-semibold mb-4">Publications des amis</h2>
                <PostFeedLister refreshTrigger={refreshTrigger} feedType="friends" />
              </TabsContent>
              
              <TabsContent value="my">
                <h2 className="text-xl font-semibold mb-4">Mes publications</h2>
                <PostFeedLister refreshTrigger={refreshTrigger} userId={user?.id} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
