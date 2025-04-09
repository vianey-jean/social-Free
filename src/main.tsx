// Importation de la fonction createRoot depuis la nouvelle API React 18
// Elle permet de créer un point d’entrée pour le rendu de l’application React dans le DOM
import { createRoot } from 'react-dom/client'

// Importation du composant AuthProvider, qui fournit un contexte global d'authentification à l'application
import { AuthProvider } from './contexts/AuthContext'

// Importation du composant principal de l'application, ici une version étendue appelée AppExtended
import AppExtended from './AppExtended.tsx'

// Importation des styles globaux CSS pour l'application
import './index.css'

// Création de la racine React dans l'élément HTML ayant l'id "root"
// Le point d'exclamation (!) après getElementById indique au compilateur TypeScript que cet élément ne sera pas null
createRoot(document.getElementById("root")!).render(

  // Encapsulation de l'application dans le AuthProvider
  // Cela permet à tous les composants enfants d'accéder aux données et fonctions liées à l'authentification
  <AuthProvider>

    {/* Rendu du composant principal de l'application */}
    <AppExtended />

  </AuthProvider>
);
