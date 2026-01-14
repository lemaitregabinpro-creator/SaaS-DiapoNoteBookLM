import React from 'react';
import { TypewriterEffect } from './TypewriterEffect';

export const Hero: React.FC = () => {
  return (
    <div className="text-center space-y-8 py-10">
      {/* Badge SmartUnityIA - Plus discret, plus "Private Club" */}
      <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-gold/5 rounded-full border border-gold/10 mb-4 backdrop-blur-sm">
        <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse"></span>
        <span className="text-[10px] font-bold text-gold/80 uppercase tracking-[0.3em]">
          Signature SmartUnityIA
        </span>
      </div>

      {/* Titre dynamique - Mots de Puissance */}
      <h1 className="text-4xl md:text-7xl font-black text-white leading-tight tracking-tighter">
        <span className="block mb-2">L'Art de la</span>
        <TypewriterEffect 
          words={[
            'Clarté Absolue', 
            'Pureté Visuelle', 
            'Bienveillance'
          ]} 
        />
      </h1>

      {/* Sous-texte - On vend le résultat émotionnel + la preuve sociale éthique */}
      <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
        Éliminez le bruit visuel de vos présentations. Transformez vos diapositives NotebookLM en œuvres d'art haute définition.
        <span className="block mt-4 text-gold/90 font-semibold">
          Performance technologique. Impact éthique.
        </span>
      </p>
      
      {/* Call to Action (CTA) implicite visuel */}
      <div className="pt-4 flex justify-center gap-4 text-xs font-bold tracking-widest text-slate-500 uppercase opacity-60">
        <span>Sans engagement</span> • <span>Confidentialité totale</span> • <span>Qualité Studio</span>
      </div>
    </div>
  );
};