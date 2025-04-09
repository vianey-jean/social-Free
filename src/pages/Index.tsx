
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import PostFeed from "@/components/PostFeed";
import { Link } from "react-router-dom";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="flex-1">
        <div className="max-w-screen-xl mx-auto px-4 py-12 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-liberte-dark mb-4">
                Bienvenue sur <span className="text-liberte-primary">Liberté</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Connectez-vous, partagez et exprimez-vous librement avec votre communauté.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="text-lg">
                  <Link to="/register">Créer un compte</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg">
                  <Link to="/login">Se connecter</Link>
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4">Publications récentes</h2>
                <div className="max-h-[600px] overflow-y-auto pr-2">
                  <PostFeed />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="bg-white border-t py-8">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold text-liberte-primary">Liberté</h2>
              <p className="text-gray-600">Votre réseau social de liberté</p>
            </div>
            <div className="flex gap-8">
              <Link to="/about" className="text-gray-600 hover:text-liberte-primary">À propos</Link>
              <Link to="/privacy" className="text-gray-600 hover:text-liberte-primary">Confidentialité</Link>
              <Link to="/terms" className="text-gray-600 hover:text-liberte-primary">Conditions</Link>
              <Link to="/contact" className="text-gray-600 hover:text-liberte-primary">Contact</Link>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Liberté. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
