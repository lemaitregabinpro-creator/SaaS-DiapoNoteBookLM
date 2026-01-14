
import React from 'react';

export const Hero: React.FC = () => {
  return (
    <div className="text-center space-y-6">
      <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-gold/10 rounded-full border border-gold/20 mb-2">
        <span className="w-2 h-2 bg-gold rounded-full animate-pulse"></span>
        <span className="text-[11px] font-black text-gold uppercase tracking-[0.2em]">IA de nettoyage Premium</span>
      </div>
      <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">
        Nettoyez vos slides <br />
        <span className="text-gold italic">en haute fidélité</span>
      </h1>
      <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
        Suppression automatique des filigranes NotebookLM et export haute définition pour des présentations de classe mondiale avec SmartBookLM.
      </p>
    </div>
  );
};
