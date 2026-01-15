import React from 'react';

export const Mission: React.FC = () => {
  return (
    <section id="mission" className="py-8 md:py-12 relative">
      {/* SVG décoratifs très subtils en arrière-plan */}
      <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,0 Q50,100 100,0" stroke="#C5A059" strokeWidth="0.1" fill="none" />
          <path d="M0,100 Q50,0 100,100" stroke="#C5A059" strokeWidth="0.1" fill="none" />
        </svg>
      </div>
      
      <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10">
        <div className="flex flex-col lg:flex-row items-start gap-20 lg:gap-32">
          
          {/* Colonne de texte - côté gauche */}
          <div className="flex-1 space-y-12 lg:max-w-2xl">
            {/* Badge */}
            <div className="inline-block px-5 py-2 bg-gold/5 rounded-full border border-gold/10 text-gold text-[10px] font-black uppercase tracking-[0.3em]">
              SmartUnityIA
            </div>
            
            {/* Titre principal - très impactant */}
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tight">
              Nettoyer pour <br />
              <span className="text-gold italic">Protéger.</span>
            </h2>
            
            {/* Description */}
            <p className="text-slate-400 text-lg md:text-xl leading-relaxed font-medium max-w-xl">
              Le luxe ne réside pas seulement dans l'apparence, mais dans l'impact. Avec SmartBookLM, nous reversons 15% de nos revenus pour financer les soins vétérinaires et l'avenir des animaux sans voix.
            </p>
            
            {/* Statistiques - design minimaliste et flottant */}
            <div className="flex flex-col sm:flex-row gap-8 pt-8">
              <div className="flex items-start space-x-4 group">
                {/* Ligne verticale dorée subtile */}
                <div className="w-0.5 h-16 bg-gradient-to-b from-gold/60 to-gold/20 group-hover:from-gold group-hover:to-gold/40 transition-all duration-500"></div>
                <div className="space-y-2">
                  <span className="block text-5xl md:text-6xl font-black text-gold leading-none">15%</span>
                  <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Revenus reversés</span>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 group">
                {/* Ligne verticale dorée subtile */}
                <div className="w-0.5 h-16 bg-gradient-to-b from-gold/60 to-gold/20 group-hover:from-gold group-hover:to-gold/40 transition-all duration-500"></div>
                <div className="space-y-2">
                  <span className="block text-5xl md:text-6xl font-black text-gold leading-none">500+</span>
                  <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Vies sauvées</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Colonne image - côté droit */}
          <div className="flex-1 w-full lg:max-w-2xl">
            <div className="relative">
              {/* Image flottante sans cadre polaroid */}
              <img 
                src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800" 
                alt="Protection animale" 
                className="rounded-3xl w-full h-[500px] md:h-[600px] object-cover shadow-2xl shadow-gold/10 brightness-90 contrast-110"
              />
              
              {/* Citation flottante en bas de l'image */}
              <div className="absolute bottom-8 left-8 right-8 bg-anthracite/90 backdrop-blur-md rounded-2xl p-6 border border-anthracite-lighter/50 shadow-xl">
                <p className="text-slate-200 text-sm md:text-base italic font-medium leading-relaxed text-center">
                  "Chaque abonnement professionnel SmartBookLM permet d'assurer une semaine de soins complets pour un animal en refuge."
                </p>
                <div className="flex justify-center mt-4 space-x-2">
                  {[1, 2, 3].map(s => (
                    <div key={s} className="w-1.5 h-1.5 rounded-full bg-gold/50"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
