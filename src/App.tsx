// Importation du composant AuthProvider depuis le dossier contexts/AuthContext
// Ce composant fournit le contexte d'authentification à toute l'application
import { AuthProvider } from './contexts/AuthContext';

// Importation du composant principal étendu de l'application
// Celui-ci contient les routes, les providers supplémentaires (ex: ChatProvider), etc.
import AppExtended from './AppExtended';

// Définition du composant racine App
const App = () => {
  return (
    // Encapsulation de toute l'application dans le contexte AuthProvider
    // Cela permet à tous les composants enfants d’accéder à l’état d’authentification (utilisateur connecté, etc.)
    <AuthProvider>
      {/* AppExtended contient les routes et autres contextes (comme le chat) */}
      <AppExtended />
    </AuthProvider>
  );
};

// Exportation du composant App pour qu’il soit utilisé dans le fichier index.tsx
export default App;
