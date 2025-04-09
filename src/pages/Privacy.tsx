
import React from "react";
import Navbar from "@/components/Navbar";
import { Separator } from "@/components/ui/separator";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="flex-1 p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">Politique de confidentialité</h1>
          
          <Separator className="my-6" />
          
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-gray-700">
                Chez Liberté, nous prenons votre vie privée très au sérieux. Cette politique de confidentialité explique comment nous recueillons, utilisons, divulguons et protégeons vos informations personnelles lorsque vous utilisez notre plateforme.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">2. Informations que nous collectons</h2>
              <p className="text-gray-700">
                Nous collectons plusieurs types d'informations, notamment :
              </p>
              <ul className="list-disc pl-6 text-gray-700 mt-2 space-y-1">
                <li>Les informations que vous nous fournissez lors de la création de votre compte (nom, adresse e-mail, date de naissance, etc.)</li>
                <li>Les contenus que vous publiez sur notre plateforme</li>
                <li>Vos interactions avec d'autres utilisateurs et contenus</li>
                <li>Des informations techniques sur votre appareil et votre connexion</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">3. Comment nous utilisons vos informations</h2>
              <p className="text-gray-700">
                Nous utilisons vos informations pour :
              </p>
              <ul className="list-disc pl-6 text-gray-700 mt-2 space-y-1">
                <li>Fournir, maintenir et améliorer notre plateforme</li>
                <li>Personnaliser votre expérience</li>
                <li>Communiquer avec vous</li>
                <li>Assurer la sécurité de notre plateforme</li>
                <li>Se conformer aux obligations légales</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">4. Partage de vos informations</h2>
              <p className="text-gray-700">
                Nous ne vendons pas vos informations personnelles. Nous pouvons partager vos informations dans les situations suivantes :
              </p>
              <ul className="list-disc pl-6 text-gray-700 mt-2 space-y-1">
                <li>Avec d'autres utilisateurs, selon vos paramètres de confidentialité</li>
                <li>Avec nos fournisseurs de services qui nous aident à exploiter notre plateforme</li>
                <li>Pour se conformer aux lois et réglementations</li>
                <li>En cas de réorganisation, fusion ou vente de notre entreprise</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">5. Vos droits et choix</h2>
              <p className="text-gray-700">
                Vous avez certains droits concernant vos informations personnelles, notamment :
              </p>
              <ul className="list-disc pl-6 text-gray-700 mt-2 space-y-1">
                <li>Accéder à vos informations</li>
                <li>Mettre à jour ou corriger vos informations</li>
                <li>Supprimer votre compte</li>
                <li>Contrôler qui peut voir vos publications</li>
                <li>Refuser certains types de traitement de données</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">6. Sécurité des données</h2>
              <p className="text-gray-700">
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos informations personnelles contre tout accès, utilisation ou divulgation non autorisés.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">7. Modifications de cette politique</h2>
              <p className="text-gray-700">
                Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. Nous vous informerons de tout changement important et obtiendrons votre consentement si nécessaire.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">8. Nous contacter</h2>
              <p className="text-gray-700">
                Si vous avez des questions ou des préoccupations concernant cette politique de confidentialité ou nos pratiques en matière de données, veuillez nous contacter à <a href="mailto:privacy@liberte.com" className="text-liberte-primary hover:underline">privacy@liberte.com</a>.
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

export default Privacy;
