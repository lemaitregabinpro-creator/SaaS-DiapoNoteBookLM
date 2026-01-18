import React from 'react';
import { TypewriterEffect } from './TypewriterEffect';

export const Hero: React.FC = () => {
  return (
    <div className="text-center space-y-4 md:space-y-8 py-6 md:py-10 px-4">

      {/* Badge SmartUnityIA - Plus discret, plus "Private Club" */}
      <div className="inline-flex items-center space-x-2 px-3 md:px-4 py-1 md:py-1.5 bg-gold/5 rounded-full border border-gold/10 mb-2 md:mb-4 backdrop-blur-sm">
        <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse"></span>
        <span className="text-[9px] md:text-[10px] font-bold text-gold/80 uppercase tracking-[0.3em]">
          Signature SmartUnityIA
        </span>
      </div>

      {/* Titre SmartBookLM */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter mb-4 md:mb-6">
        SmartBook<span className="text-gold">LM</span>
      </h1>

      {/* Titre dynamique - Mots de Puissance */}
      <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-black text-white leading-tight tracking-tighter px-2">
        <span className="block mb-1 md:mb-2">L'Art de la</span>
        <TypewriterEffect 
          words={[
            'Clarté Absolue', 
            'Pureté Visuelle', 
            'Bienveillance'
          ]} 
        />
      </h2>

      {/* Sous-texte - On vend le résultat émotionnel + la preuve sociale éthique */}
      <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium px-2">
        Éliminez le bruit visuel de vos présentations. Transformez vos diapositives NotebookLM en œuvres d'art haute définition.
        <span className="block mt-2 md:mt-4 text-gold/90 font-semibold">
          Performance technologique. Impact éthique.
        </span>
      </p>
      
      {/* Call to Action (CTA) implicite visuel */}
      <div className="pt-2 md:pt-4 flex flex-wrap justify-center gap-2 md:gap-4 text-[10px] md:text-xs font-bold tracking-widest text-slate-500 uppercase opacity-60 px-4">
        <span>Sans engagement</span>
        <span className="hidden sm:inline">•</span>
        <span>Confidentialité totale</span>
        <span className="hidden sm:inline">•</span>
        <span>Qualité Studio</span>
      </div>
    </div>
  );
};