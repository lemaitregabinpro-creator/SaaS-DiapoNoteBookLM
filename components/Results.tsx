
import React from 'react';

interface ResultsProps {
  fileName: string;
  onReset: () => void;
}

export const Results: React.FC<ResultsProps> = ({ fileName, onReset }) => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-anthracite-lighter pb-12">
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-white truncate max-w-md tracking-tight">
            {fileName}
          </h3>
          <p className="text-[11px] text-gold font-black uppercase tracking-[0.2em] flex items-center">
            <span className="w-2 h-2 bg-gold rounded-full mr-2 shadow-[0_0_8px_#C5A059]"></span>
            Traitement haute fidélité terminé
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={onReset}
            className="px-8 py-4 text-[11px] font-black text-slate-400 hover:text-white uppercase tracking-widest rounded-2xl transition-all hover:bg-anthracite"
          >
            Nouvelle analyse
          </button>
          <button className="flex items-center justify-center px-10 py-4 bg-gold text-anthracite rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-gold-light transition-all shadow-2xl shadow-gold/20 active:scale-95">
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exporter l'Archive (HD)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="group relative aspect-[16/10] bg-anthracite rounded-3xl overflow-hidden border border-anthracite-lighter transition-all duration-500 hover:border-gold/50 hover:scale-[1.05] cursor-pointer shadow-xl">
            <div className="absolute inset-0 flex items-center justify-center text-slate-700 font-black text-[10px] uppercase tracking-[0.3em] opacity-30 group-hover:opacity-10 transition-opacity">
              IMAGE {i}
            </div>
            {/* Overlay Gradient Premium */}
            <div className="absolute inset-0 bg-gradient-to-tr from-anthracite via-transparent to-gold/5 opacity-60"></div>
            
            <div className="absolute top-4 right-4 px-3 py-1 bg-gold text-anthracite rounded-lg text-[8px] font-black uppercase tracking-widest shadow-xl">
              Purifié
            </div>
            
            <div className="absolute inset-0 border-2 border-gold/0 group-hover:border-gold/20 rounded-3xl transition-all"></div>
          </div>
        ))}
      </div>

      <div className="bg-gold/5 border border-gold/10 rounded-3xl p-8 flex items-start space-x-6">
        <div className="p-3 bg-gold text-anthracite rounded-xl shadow-lg">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="space-y-1">
          <h4 className="text-white font-black text-sm uppercase tracking-widest">Note Technique</h4>
          <p className="text-sm text-slate-400 leading-relaxed font-medium">
            Toutes les slides ont été reconstruites pixel par pixel pour éliminer les artéfacts visuels. La colorimétrie originale a été préservée et optimisée pour un affichage sur écrans 4K.
          </p>
        </div>
      </div>
    </div>
  );
};
