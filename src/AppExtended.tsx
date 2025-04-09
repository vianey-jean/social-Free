// Importation des composants de React Router pour gérer la navigation entre les pages
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importation du composant Toaster (système de notifications) à partir du dossier components/ui
import { Toaster } from "@/components/ui/toaster";

// Importation du hook personnalisé useAuth pour accéder au contexte d’authentification
import { useAuth } from '@/contexts/AuthContext';

// Importation du contexte de discussion (chat) qui sera disponible dans l’application
import { ChatProvider } from '@/contexts/ChatContext';

// Importation des différentes pages utilisées dans l’application
import Index from '@/pages/Index';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Contact from '@/pages/Contact';
import About from '@/pages/About';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';
import EditProfile from '@/pages/EditProfile';
import Chat from '@/pages/Chat';
import Settings from '@/pages/Settings';

// Définition du composant principal AppExtended
const AppExtended = () => {
  // Récupération de l'état d'authentification depuis le contexte AuthContext
  const { isAuthenticated } = useAuth();
  
  return (
    // Composant Router (BrowserRouter) qui gère l’historique de navigation HTML5
    <Router>
      {/* Fournit un contexte global pour le chat à toute l’application */}
      <ChatProvider>

        {/* Définition de toutes les routes de l’application */}
        <Routes>

          {/* 🔓 Routes publiques (accessibles sans authentification) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          
          {/* 🔒 Routes protégées : accessibles uniquement si l'utilisateur est authentifié */}

          {/* Page profil avec paramètre d'ID */}
          <Route 
            path="/profile/:id" 
            element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} 
          />

          {/* Page profil sans ID : probablement l’utilisateur connecté */}
          <Route 
            path="/profile" 
            element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} 
          />

          {/* Page d'accueil protégée */}
          <Route 
            path="/home" 
            element={isAuthenticated ? <Home /> : <Navigate to="/login" />} 
          />

          {/* Page pour modifier son profil */}
          <Route 
            path="/edit-profile" 
            element={isAuthenticated ? <EditProfile /> : <Navigate to="/login" />} 
          />

          {/* Accès au chat */}
          <Route 
            path="/chat" 
            element={isAuthenticated ? <Chat /> : <Navigate to="/login" />} 
          />

          {/* Accès aux paramètres de l’utilisateur */}
          <Route 
            path="/settings" 
            element={isAuthenticated ? <Settings /> : <Navigate to="/login" />} 
          />
          
          {/* Route racine : redirige vers /home si connecté, sinon vers la page d’accueil publique */}
          <Route 
            path="/" 
            element={isAuthenticated ? <Navigate to="/home" /> : <Index />} 
          />
          
          {/* Route 404 (catch-all) : affiche une page NotFound pour toute URL non définie */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Composant pour afficher les notifications (toasts) dans l’application */}
        <Toaster />
      </ChatProvider>
    </Router>
  );
};

// Exportation du composant AppExtended pour qu'il puisse être utilisé dans index.tsx
export default AppExtended;
