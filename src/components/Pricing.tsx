import React from 'react';

export const Pricing: React.FC = () => {
  return (
    <section id="ecosystem" className="py-12 md:py-24 relative overflow-hidden">
      {/* Fond atmosphérique */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gold/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="text-center mb-16 relative z-10 px-4">
        <div className="inline-flex items-center space-x-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-gold animate-pulse"></span>
          <span className="text-[10px] font-black uppercase tracking-widest text-gold">
            Financez le gratuit par l'excellence
          </span>
        </div>
        
        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
          Cet outil est <span className="text-gold">100% Gratuit.</span>
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
          Je ne vends pas de crédits PDF. Je conçois des infrastructures d'intelligence artificielle souveraines pour les entreprises exigeantes.
        </p>
      </div>

      {/* Showcase IA Ingénieur - Style "Carte Premium" */}
      <div className="max-w-5xl mx-auto px-4 relative z-10">
        <div className="bg-gradient-to-br from-anthracite-light to-anthracite border border-anthracite-lighter hover:border-gold/30 p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative group overflow-hidden transition-all duration-500">
          
          {/* Effet de brillance au survol */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* Colonne Gauche : Le Pitch */}
            <div className="space-y-8">
              <div>
                <h3 className="text-gold font-black uppercase tracking-widest text-sm mb-2">SmartUnityIA • Studio d'Ingénierie</h3>
                <h4 className="text-3xl md:text-4xl font-black text-white leading-tight">
                  Solutions IA <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-amber-300">Local First & Souveraines</span>
                </h4>
              </div>

              <p className="text-slate-400 text-sm leading-relaxed font-medium">
                Déployez des agents IA autonomes et des systèmes RAG sécurisés directement sur votre infrastructure. Vos données ne partent jamais dans le cloud.
              </p>

              <ul className="space-y-3">
                {[
                  "Architecture Local First (Mistral / Llama)",
                  "Zéro fuite de données (Finance / Santé / Juridique)",
                  "Installation hardware Mac Mini dédiée",
                  "API Françaises & Conformité RGPD"
                ].map((item, i) => (
                  <li key={i} className="flex items-center space-x-3 text-sm font-bold text-slate-300">
                    <svg className="w-5 h-5 text-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <a 
                  href="https://smartunityia.fr" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gold text-anthracite font-black uppercase tracking-widest text-xs rounded-xl hover:bg-white hover:scale-105 transition-all shadow-lg shadow-gold/20"
                >
                  Visiter le Studio
                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center justify-center">
                  Pour les pros & entreprises
                </span>
              </div>
            </div>

            {/* Colonne Droite : Visuel "Tech" abstrait */}
            <div className="relative h-full min-h-[300px] bg-slate-900 rounded-2xl border border-slate-800 p-6 overflow-hidden flex flex-col justify-center">
              
              {/* Terminal simulé */}
              <div className="font-mono text-[10px] md:text-xs text-slate-400 space-y-2 z-10">
                <div className="flex space-x-2 border-b border-slate-800 pb-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                </div>
                
                <div className="animate-pulse space-y-1">
                  <p><span className="text-green-500">➜</span> <span className="text-blue-400">~</span> init_local_infrastructure --secure</p>
                  <p className="text-slate-500">[INFO] Vérification de l'environnement...</p>
                  <p className="text-slate-500">[INFO] Détection GPU: Mac Mini M4 Pro</p>
                  <p className="text-slate-300">[OK] Modèle Mistral-7B chargé en mémoire locale</p>
                  <p className="text-slate-300">[OK] Base de données vectorielle chiffrée</p>
                  <p><span className="text-green-500">➜</span> <span className="text-blue-400">~</span> <span className="text-gold animate-pulse">Ready for deployment_</span></p>
                </div>
              </div>

              {/* Background Glow derrière le terminal */}
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none"></div>
            </div>

          </div>
        </div>
      </div>
      
      <div className="text-center mt-12">
         <p className="text-slate-500 text-xs font-bold uppercase tracking-widest opacity-60">
            Développé par Gabin Lemaitre • Hyères, France
         </p>
      </div>
    </section>
  );
};