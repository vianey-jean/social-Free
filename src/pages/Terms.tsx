// Importation de React (utile pour JSX)
import React from "react";

// Importation du composant de navigation principal
import Navbar from "@/components/Navbar";

// Importation d’un séparateur UI (ligne horizontale décorative)
import { Separator } from "@/components/ui/separator";

// Définition du composant Terms qui affiche les Conditions d'utilisation
const Terms = () => {
  return (
    // Conteneur principal avec une hauteur minimale sur tout l’écran, une disposition en colonne et un fond gris clair
    <div className="min-h-screen flex flex-col bg-gray-50">
      
      {/* Inclusion de la barre de navigation en haut de la page */}
      <Navbar />
      
      {/* Contenu principal centré avec des marges, du padding et une largeur maximale */}
      <div className="flex-1 p-6 max-w-4xl mx-auto">
        
        {/* Boîte blanche arrondie avec ombre contenant le texte des conditions */}
        <div className="bg-white rounded-lg shadow p-8">
          
          {/* Titre principal de la page */}
          <h1 className="text-3xl font-bold mb-6 text-center">Conditions d'utilisation</h1>
          
          {/* Ligne de séparation décorative */}
          <Separator className="my-6" />
          
          {/* Conteneur des différentes sections, avec espace entre elles */}
          <div className="space-y-6">
            
            {/* Section 1 : Acceptation des conditions */}
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptation des conditions</h2>
              <p className="text-gray-700">
                En accédant à ou en utilisant Liberté, vous acceptez d'être lié par ces conditions d'utilisation...
              </p>
            </section>

            {/* Section 2 : Éligibilité */}
            <section>
              <h2 className="text-xl font-semibold mb-3">2. Éligibilité</h2>
              <p className="text-gray-700">
                Pour utiliser Liberté, vous devez avoir au moins 18 ans...
              </p>
            </section>

            {/* Section 3 : Votre compte */}
            <section>
              <h2 className="text-xl font-semibold mb-3">3. Votre compte</h2>
              <p className="text-gray-700">
                Vous êtes responsable de maintenir la confidentialité de votre mot de passe...
              </p>
            </section>

            {/* Section 4 : Contenu de l'utilisateur */}
            <section>
              <h2 className="text-xl font-semibold mb-3">4. Contenu de l'utilisateur</h2>
              <p className="text-gray-700">
                Vous conservez tous les droits sur le contenu que vous publiez...
              </p>
              <p className="text-gray-700 mt-2">
                Vous êtes entièrement responsable du contenu que vous publiez. Vous ne pouvez pas publier de contenu qui :
              </p>
              {/* Liste des interdictions concernant le contenu */}
              <ul className="list-disc pl-6 text-gray-700 mt-2 space-y-1">
                <li>Est illégal, diffamatoire, obscène ou autrement répréhensible</li>
                <li>Enfreint les droits de propriété intellectuelle d'autrui</li>
                <li>Constitue du spam ou de la publicité non sollicitée</li>
                <li>Contient des virus ou d'autres codes malveillants</li>
                <li>Harcèle, intimide ou menace d'autres utilisateurs</li>
              </ul>
            </section>

            {/* Section 5 : Conduite de l'utilisateur */}
            <section>
              <h2 className="text-xl font-semibold mb-3">5. Conduite de l'utilisateur</h2>
              <p className="text-gray-700">
                En utilisant Liberté, vous acceptez de ne pas :
              </p>
              {/* Liste des comportements interdits */}
              <ul className="list-disc pl-6 text-gray-700 mt-2 space-y-1">
                <li>Violer les lois applicables ou ces conditions d'utilisation</li>
                <li>Usurper l'identité d'une autre personne ou entité</li>
                <li>Collecter des informations sur d'autres utilisateurs sans leur consentement</li>
                <li>Interférer avec le fonctionnement normal de notre plateforme</li>
                <li>Accéder à notre plateforme par des moyens automatisés sans notre autorisation</li>
              </ul>
            </section>

            {/* Section 6 : Propriété intellectuelle */}
            <section>
              <h2 className="text-xl font-semibold mb-3">6. Propriété intellectuelle</h2>
              <p className="text-gray-700">
                Liberté et son contenu original... restent la propriété exclusive de Liberté et de ses concédants...
              </p>
            </section>

            {/* Section 7 : Résiliation */}
            <section>
              <h2 className="text-xl font-semibold mb-3">7. Résiliation</h2>
              <p className="text-gray-700">
                Nous nous réservons le droit de suspendre ou de résilier votre compte...
              </p>
            </section>

            {/* Section 8 : Limitation de responsabilité */}
            <section>
              <h2 className="text-xl font-semibold mb-3">8. Limitation de responsabilité</h2>
              <p className="text-gray-700">
                Liberté ne sera pas responsable des dommages indirects, spéciaux, etc.
              </p>
            </section>

            {/* Section 9 : Modifications */}
            <section>
              <h2 className="text-xl font-semibold mb-3">9. Modifications</h2>
              <p className="text-gray-700">
                Nous nous réservons le droit de modifier ces conditions d'utilisation à tout moment...
              </p>
            </section>

            {/* Section 10 : Loi applicable */}
            <section>
              <h2 className="text-xl font-semibold mb-3">10. Loi applicable</h2>
              <p className="text-gray-700">
                Ces conditions sont régies par les lois françaises...
              </p>
            </section>
          </div>
          
          {/* Deuxième ligne de séparation */}
          <Separator className="my-6" />
          
          {/* Date de la dernière mise à jour, centrée et en petit texte gris */}
          <p className="text-sm text-gray-500 text-center">
            Dernière mise à jour : 10 avril 2025
          </p>
        </div>
      </div>
    </div>
  );
};

// Exportation du composant pour qu'il soit utilisé dans le système de routes
export default Terms;
