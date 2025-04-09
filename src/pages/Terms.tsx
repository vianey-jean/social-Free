
import React from "react";
import Navbar from "@/components/Navbar";
import { Separator } from "@/components/ui/separator";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="flex-1 p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">Conditions d'utilisation</h1>
          
          <Separator className="my-6" />
          
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptation des conditions</h2>
              <p className="text-gray-700">
                En accédant à ou en utilisant Liberté, vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre plateforme.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">2. Éligibilité</h2>
              <p className="text-gray-700">
                Pour utiliser Liberté, vous devez avoir au moins 18 ans. En créant un compte, vous confirmez que vous avez l'âge requis et que vous êtes capable de former un contrat juridiquement contraignant.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">3. Votre compte</h2>
              <p className="text-gray-700">
                Vous êtes responsable de maintenir la confidentialité de votre mot de passe et de toutes les activités qui se produisent sous votre compte. Vous acceptez de nous informer immédiatement de toute utilisation non autorisée de votre compte.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">4. Contenu de l'utilisateur</h2>
              <p className="text-gray-700">
                Vous conservez tous les droits sur le contenu que vous publiez sur Liberté. En publiant du contenu, vous nous accordez une licence mondiale, non exclusive, libre de redevance pour utiliser, reproduire, modifier, adapter, publier et afficher ce contenu sur notre plateforme.
              </p>
              <p className="text-gray-700 mt-2">
                Vous êtes entièrement responsable du contenu que vous publiez. Vous ne pouvez pas publier de contenu qui :
              </p>
              <ul className="list-disc pl-6 text-gray-700 mt-2 space-y-1">
                <li>Est illégal, diffamatoire, obscène ou autrement répréhensible</li>
                <li>Enfreint les droits de propriété intellectuelle d'autrui</li>
                <li>Constitue du spam ou de la publicité non sollicitée</li>
                <li>Contient des virus ou d'autres codes malveillants</li>
                <li>Harcèle, intimide ou menace d'autres utilisateurs</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">5. Conduite de l'utilisateur</h2>
              <p className="text-gray-700">
                En utilisant Liberté, vous acceptez de ne pas :
              </p>
              <ul className="list-disc pl-6 text-gray-700 mt-2 space-y-1">
                <li>Violer les lois applicables ou ces conditions d'utilisation</li>
                <li>Usurper l'identité d'une autre personne ou entité</li>
                <li>Collecter des informations sur d'autres utilisateurs sans leur consentement</li>
                <li>Interférer avec le fonctionnement normal de notre plateforme</li>
                <li>Accéder à notre plateforme par des moyens automatisés sans notre autorisation</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">6. Propriété intellectuelle</h2>
              <p className="text-gray-700">
                Liberté et son contenu original, fonctionnalités et fonctionnalités sont et resteront la propriété exclusive de Liberté et de ses concédants. Notre plateforme est protégée par le droit d'auteur, les marques de commerce et d'autres lois.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">7. Résiliation</h2>
              <p className="text-gray-700">
                Nous nous réservons le droit de suspendre ou de résilier votre compte à notre seule discrétion, sans préavis, pour toute raison, y compris, mais sans s'y limiter, une violation de ces conditions d'utilisation.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">8. Limitation de responsabilité</h2>
              <p className="text-gray-700">
                Dans toute la mesure permise par la loi applicable, Liberté ne sera pas responsable des dommages indirects, accessoires, spéciaux, consécutifs ou punitifs, ou de toute perte de profits ou de revenus.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">9. Modifications</h2>
              <p className="text-gray-700">
                Nous nous réservons le droit de modifier ces conditions d'utilisation à tout moment. Les modifications entreront en vigueur dès leur publication sur cette page, avec la date de "dernière mise à jour" révisée.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">10. Loi applicable</h2>
              <p className="text-gray-700">
                Ces conditions d'utilisation sont régies et interprétées conformément aux lois françaises, sans égard aux principes de conflits de lois.
              </p>
            </section>
          </div>
          
          <Separator className="my-6" />
          
          <p className="text-sm text-gray-500 text-center">
            Dernière mise à jour : 10 avril 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
