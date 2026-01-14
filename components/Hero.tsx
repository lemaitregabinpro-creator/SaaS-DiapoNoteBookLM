
import React from 'react';
import { TypewriterEffect } from './TypewriterEffect';

export const Hero: React.FC = () => {
  return (
    <div className="text-center space-y-6">
      {/* Badge SmartUnityIA */}
      <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-gold/10 rounded-full border border-gold/20 mb-2">
        <span className="w-2 h-2 bg-gold rounded-full animate-pulse"></span>
        <span className="text-[11px] font-black text-gold uppercase tracking-[0.2em]">
          Une initiative SmartUnityIA
        </span>
      </div>

      {/* Titre dynamique */}
      <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">
        <TypewriterEffect 
          words={[
            'Gagnez un temps précieux', 
            'Soutenez la cause canine', 
            'Sublimez vos contenus'
          ]} 
        />
      </h1>

      {/* Sous-texte explicatif */}
      <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
        L'outil ultime pour nettoyer vos filigranes et exporter en haute définition. 
        Boostez votre productivité avec SmartUnityIA : une partie des bénéfices est directement reversée aux associations canines.
      </p>
    </div>
  );
};
