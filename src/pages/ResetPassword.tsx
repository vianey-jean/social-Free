// Importation des hooks React et autres composants nécessaires
import { useState, useEffect } from "react";
// Importation des composants de navigation et du bouton
import { Link, useNavigate, useLocation } from "react-router-dom";
// Importation des composants UI personnalisés
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Importation du hook pour afficher des notifications
import { useToast } from "@/hooks/use-toast";
// Importation d'Axios pour effectuer des requêtes HTTP
import axios from "axios";
// Importation de la barre de navigation
import Navbar from "@/components/Navbar";
// Importation des icônes pour afficher l'œil (afficher/cacher mot de passe)
import { Eye, EyeOff } from "lucide-react";

// Définition de l'URL de l'API
const API_URL = "http://localhost:3001/api";

// Composant fonctionnel principal pour la page de réinitialisation du mot de passe
const ResetPassword = () => {
  // Initialisation du hook de toast pour afficher des messages d'alerte
  const { toast } = useToast();
  // Initialisation du hook de navigation pour rediriger l'utilisateur
  const navigate = useNavigate();
  // Initialisation du hook de localisation pour accéder aux paramètres de l'URL
  const location = useLocation();
  
  // États pour gérer les champs de saisie, les erreurs et le statut de la soumission
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Fonction pour basculer la visibilité du mot de passe
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Fonction pour basculer la visibilité de la confirmation du mot de passe
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  // Effet de bord pour récupérer le token dans les paramètres de l'URL
  useEffect(() => {
    // Extraction des paramètres de l'URL
    const queryParams = new URLSearchParams(location.search);
    const tokenParam = queryParams.get("token");
    
    // Si aucun token n'est trouvé, on affiche un message d'erreur et on redirige
    if (!tokenParam) {
      toast({
        title: "Lien invalide",
        description: "Le lien de réinitialisation est invalide ou a expiré.",
        variant: "destructive",  // Variante destructrice pour l'erreur
      });
      navigate("/forgot-password");
    } else {
      // Sinon, on sauvegarde le token
      setToken(tokenParam);
    }
  }, [location.search, navigate, toast]);  // Déclenche l'effet uniquement si les paramètres changent
  
  // Fonction de validation du formulaire
  const validateForm = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};
    
    // Vérification de la longueur du mot de passe
    if (!password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (password.length < 8) {
      newErrors.password = "Le mot de passe doit comporter au moins 8 caractères";
    }
    
    // Vérification de la correspondance des mots de passe
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }
    
    // Mise à jour des erreurs
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;  // Si aucune erreur, on retourne true
  };
  
  // Fonction de soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();  // Empêche le rechargement de la page lors de la soumission
    
    // Si la validation échoue, on ne soumet pas le formulaire
    if (!validateForm()) return;
    
    // On indique que la soumission est en cours
    setIsSubmitting(true);
    
    try {
      // Envoi de la requête pour réinitialiser le mot de passe
      await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        password,  // Envoi du token et du mot de passe
      });
      
      // Si succès, on affiche un message et on met à jour l'état
      setIsSuccess(true);
      toast({
        title: "Mot de passe réinitialisé",
        description: "Votre mot de passe a été réinitialisé avec succès.",
      });
    } catch (error) {
      // En cas d'erreur, on affiche un message d'erreur
      console.error("Reset password error:", error);
      toast({
        title: "Échec de la réinitialisation",
        description: "Le lien de réinitialisation est invalide ou a expiré.",
        variant: "destructive",
      });
    } finally {
      // On remet à jour l'état de soumission
      setIsSubmitting(false);
    }
  };
  
  return (
    // Conteneur principal, occupe toute la hauteur de l'écran avec une disposition en colonne
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Inclusion de la barre de navigation */}
      <Navbar />
      
      {/* Section contenant le formulaire de réinitialisation du mot de passe */}
      <div className="flex-1 flex items-center justify-center p-4">
        {/* Boîte pour le formulaire avec des bordures arrondies et de l'ombre */}
        <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
          {/* Titre et description du formulaire */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Réinitialiser le mot de passe</h1>
            <p className="text-gray-600">
              Créez un nouveau mot de passe pour votre compte
            </p>
          </div>
          
          {/* Si le mot de passe a été réinitialisé avec succès */}
          {isSuccess ? (
            // Affichage du message de succès
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
              <h2 className="text-xl font-semibold">Mot de passe réinitialisé</h2>
              <p className="text-gray-600">
                Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
              </p>
              <div className="pt-4">
                {/* Bouton pour aller à la page de connexion */}
                <Button asChild className="w-full">
                  <Link to="/login">Se connecter</Link>
                </Button>
              </div>
            </div>
          ) : (
            // Formulaire de réinitialisation du mot de passe
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Champ pour le nouveau mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="password">Nouveau mot de passe</Label>
                <div className="relative">
                  {/* Champ de saisie pour le mot de passe avec visibilité alternée */}
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder=""
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={errors.password ? "border-liberte-error" : ""}
                  />
                  {/* Icône pour afficher ou masquer le mot de passe */}
                  <button 
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {/* Affichage des erreurs pour le mot de passe */}
                {errors.password && (
                  <p className="text-sm text-liberte-error">{errors.password}</p>
                )}
              </div>
              
              {/* Champ pour confirmer le mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <div className="relative">
                  {/* Champ de saisie pour la confirmation du mot de passe */}
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder=""
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={errors.confirmPassword ? "border-liberte-error" : ""}
                  />
                  {/* Icône pour afficher ou masquer la confirmation du mot de passe */}
                  <button 
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {/* Affichage des erreurs pour la confirmation */}
                {errors.confirmPassword && (
                  <p className="text-sm text-liberte-error">{errors.confirmPassword}</p>
                )}
              </div>
              
              {/* Bouton de soumission */}
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}  // Désactive le bouton pendant la soumission
              >
                {isSubmitting ? "Réinitialisation en cours..." : "Réinitialiser le mot de passe"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// Exportation du composant pour utilisation dans l'application
export default ResetPassword;
