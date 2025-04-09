
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import Navbar from "@/components/Navbar";

// API base URL - determine based on environment
const API_URL = import.meta.env.DEV 
  ? "http://localhost:3001/api" 
  : "https://liberte-backend.herokuapp.com/api";

const ForgotPassword = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("L'adresse email est requise");
      return;
    }
    
    if (!validateEmail(email)) {
      setError("Adresse email invalide");
      return;
    }
    
    setError("");
    setIsSubmitting(true);
    
    try {
      console.log("Sending password reset request to:", `${API_URL}/auth/forgot-password`);
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      
      setIsSubmitted(true);
      toast({
        title: "Email envoyé",
        description: "Si cette adresse email est associée à un compte, vous recevrez un email de réinitialisation.",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      // Don't reveal if the email exists or not for security reasons
      setIsSubmitted(true);
      toast({
        title: "Email envoyé",
        description: "Si cette adresse email est associée à un compte, vous recevrez un email de réinitialisation.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Mot de passe oublié</h1>
            <p className="text-gray-600">
              Entrez votre adresse email pour réinitialiser votre mot de passe
            </p>
          </div>
          
          {isSubmitted ? (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mx-auto">
                <svg 
                  className="h-8 w-8 text-green-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold">Email envoyé</h2>
              <p className="text-gray-600">
                Si cette adresse email est associée à un compte, vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.
              </p>
              <div className="pt-4">
                <Button asChild variant="outline" className="w-full">
                  <Link to="/login">Retour à la connexion</Link>
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={error ? "border-liberte-error" : ""}
                />
                {error && (
                  <p className="text-sm text-liberte-error">{error}</p>
                )}
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Envoi en cours..." : "Réinitialiser le mot de passe"}
              </Button>
              
              <div className="text-center">
                <Link to="/login" className="text-liberte-primary hover:underline text-sm">
                  Retour à la connexion
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
