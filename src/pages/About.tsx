
import React from "react";
import Navbar from "@/components/Navbar";
import { Separator } from "@/components/ui/separator";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="flex-1 p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">À propos de Liberté</h1>
          
          <Separator className="my-6" />
          
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3">Notre mission</h2>
              <p className="text-gray-700">
                Liberté est un réseau social qui vise à créer un espace où les utilisateurs peuvent
                s'exprimer librement, partager leurs idées et se connecter avec d'autres personnes
                partageant les mêmes valeurs. Notre mission est de construire une communauté en ligne
                où la liberté d'expression est valorisée et respectée.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-3">Notre histoire</h2>
              <p className="text-gray-700">
                Liberté a été fondé en 2023 par une équipe de développeurs et de designers passionnés
                qui croyaient en la création d'une plateforme sociale plus ouverte et transparente.
                Depuis ses débuts, notre plateforme a évolué pour devenir un espace dynamique où les
                utilisateurs peuvent se connecter, partager et interagir en toute liberté.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-3">Nos valeurs</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><span className="font-medium">Liberté d'expression</span> - Nous croyons que chacun a le droit de s'exprimer librement.</li>
                <li><span className="font-medium">Respect</span> - Nous encourageons les discussions respectueuses entre les membres de notre communauté.</li>
                <li><span className="font-medium">Confidentialité</span> - Nous nous engageons à protéger les données et la vie privée de nos utilisateurs.</li>
                <li><span className="font-medium">Transparence</span> - Nous sommes transparents sur la façon dont nous gérons les données et les contenus.</li>
                <li><span className="font-medium">Innovation</span> - Nous cherchons constamment à améliorer notre plateforme pour offrir une meilleure expérience.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-3">Notre équipe</h2>
              <p className="text-gray-700">
                Liberté est soutenu par une équipe diversifiée de professionnels passionnés par la technologie et les médias sociaux. Nos membres apportent une riche variété d'expériences et de compétences pour créer une plateforme sociale qui répond aux besoins de notre communauté.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
