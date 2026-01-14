
import React from 'react';

export const Mission: React.FC = () => {
  return (
    <section id="mission" className="py-12 md:py-24 bg-anthracite-light rounded-[3rem] overflow-hidden relative border border-anthracite-lighter">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,0 Q50,100 100,0" stroke="#C5A059" strokeWidth="0.1" fill="none" />
          <path d="M0,100 Q50,0 100,100" stroke="#C5A059" strokeWidth="0.1" fill="none" />
        </svg>
      </div>
      
      <div className="relative z-10 px-8 md:px-20 py-8 md:py-16 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
        <div className="flex-1 space-y-10 text-center lg:text-left">
          <div className="inline-block px-5 py-2 bg-gold/5 rounded-full border border-gold/10 text-gold text-[10px] font-black uppercase tracking-[0.3em]">
            SmartUnityIA
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white leading-[1.05] tracking-tight">
            Nettoyer pour <br />
            <span className="text-gold italic">Protéger.</span>
          </h2>
          <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
            Le luxe ne réside pas seulement dans l'apparence, mais dans l'impact. Avec SmartBookLM, nous reversons 15% de nos revenus pour financer les soins vétérinaires et l'avenir des animaux sans voix.
          </p>
          <div className="flex flex-wrap gap-6 pt-6 justify-center lg:justify-start">
            <div className="bg-anthracite p-6 rounded-3xl border border-anthracite-lighter text-white min-w-[160px] shadow-2xl">
              <span className="block text-4xl font-black text-gold mb-1">15%</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Revenus reversés</span>
            </div>
            <div className="bg-anthracite p-6 rounded-3xl border border-anthracite-lighter text-white min-w-[160px] shadow-2xl">
              <span className="block text-4xl font-black text-gold mb-1">500+</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Vies sauvées</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 w-full max-w-2xl">
          <div className="relative group">
            <div className="absolute -inset-4 bg-gold/10 rounded-[3rem] blur-2xl group-hover:bg-gold/20 transition duration-1000"></div>
            <div className="relative bg-anthracite p-5 rounded-[3rem] shadow-3xl border border-anthracite-lighter transform lg:-rotate-1 group-hover:rotate-0 transition-all duration-700">
              <img 
                src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800" 
                alt="Protection animale" 
                className="rounded-[2rem] w-full h-[450px] object-cover mb-8 brightness-90 contrast-110"
              />
              <div className="px-6 pb-4">
                <p className="text-slate-300 text-sm italic text-center font-medium leading-relaxed">
                  "Chaque abonnement professionnel SmartBookLM permet d'assurer une semaine de soins complets pour un animal en refuge."
                </p>
                <div className="flex justify-center mt-6 space-x-2">
                  {[1,2,3].map(s => <div key={s} className="w-1.5 h-1.5 rounded-full bg-gold/40"></div>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
