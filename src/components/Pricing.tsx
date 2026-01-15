import React from 'react';
import { User, PlanType } from '../types';

interface PricingProps {
  user: User | null;
  onUpgrade: () => void;
}

const PlanFeature = ({ text, highlight = false }: { text: string; highlight?: boolean }) => (
  <li className="flex items-start space-x-3">
    <svg className={`w-5 h-5 shrink-0 ${highlight ? 'text-gold' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
    <span className={`text-sm font-medium ${highlight ? 'text-white' : 'text-slate-400'}`}>{text}</span>
  </li>
);

export const Pricing: React.FC<PricingProps> = ({ user, onUpgrade }) => {
  const isCurrentPlan = (plan: PlanType) => user?.plan === plan;

  return (
    <section id="pricing" className="py-8 md:py-12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="text-center mb-16 relative z-10 px-4">
        <div className="inline-flex items-center space-x-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-1.5 mb-6 animate-in fade-in slide-in-from-bottom-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-gold">
            Karma Positif : 10% reversés aux animaux
          </span>
        </div>
        
        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
          Investissez dans votre <span className="text-gold">Temps</span>
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
          Ne perdez plus jamais une heure à rogner des slides. <br className="hidden md:block"/>
          Choisissez l'outil des professionnels exigeants.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch max-w-7xl mx-auto px-4 relative z-10">
        
        {/* GRATUIT - L'Appât */}
        <div className={`bg-anthracite-light/50 backdrop-blur-sm p-8 rounded-[2rem] border transition-all duration-300 flex flex-col hover:bg-anthracite-light ${isCurrentPlan(PlanType.FREE) ? 'border-slate-600' : 'border-anthracite-lighter hover:border-slate-600'}`}>
          <div className="mb-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Découverte</h3>
            <div className="flex items-baseline mb-2">
              <span className="text-4xl font-black text-white tracking-tighter">0€</span>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wide">Sans engagement</p>
          </div>
          
          <ul className="space-y-4 mb-8 flex-grow">
            <PlanFeature text="Suppression logo NoteBookLM" highlight />
            <PlanFeature text="5 Crédits offerts /mois" highlight />
            <PlanFeature text="Export JPEG uniquement" />
            <PlanFeature text="Export Haute Qualité" />
          </ul>

          <button 
            disabled={isCurrentPlan(PlanType.FREE)}
            onClick={onUpgrade}
            className={`w-full py-4 px-4 rounded-xl font-black uppercase tracking-widest text-[11px] transition-all border ${isCurrentPlan(PlanType.FREE) ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-default' : 'bg-transparent border-slate-700 text-white hover:bg-slate-800'}`}
          >
            {isCurrentPlan(PlanType.FREE) ? 'Votre Plan' : 'Tester Gratuitement'}
          </button>
        </div>

        {/* ESSENTIEL - L'Ancrage Rationnel */}
        <div className={`bg-anthracite-light p-8 rounded-[2rem] border transition-all duration-300 flex flex-col group ${isCurrentPlan(PlanType.ESSENTIAL) ? 'border-white' : 'border-anthracite-lighter hover:border-slate-500'}`}>
          <div className="mb-6">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Essentiel</h3>
            <div className="flex items-baseline mb-2">
              <span className="text-4xl font-black text-white tracking-tighter">9€</span>
              <span className="text-slate-500 font-bold text-sm ml-1">/mois</span>
            </div>
            <p className="text-slate-400 text-xs font-medium">Idéal pour les étudiants & freelances</p>
          </div>

          <ul className="space-y-4 mb-8 flex-grow">
          <PlanFeature text="Suppression logo NoteBookLM" highlight />
            <PlanFeature text="100 Crédits / mois" highlight />
            <PlanFeature text="Badge 'Donateur'" highlight />
            <PlanFeature text="Export Haute Qualité" />
            <PlanFeature text="Support par email" />
          </ul>

          <button 
            disabled={isCurrentPlan(PlanType.ESSENTIAL)}
            onClick={onUpgrade}
            className={`w-full py-4 px-4 rounded-xl font-black uppercase tracking-widest text-[11px] transition-all ${isCurrentPlan(PlanType.ESSENTIAL) ? 'bg-slate-700 text-white cursor-default' : 'bg-anthracite-lighter text-white border border-slate-700 hover:bg-white hover:text-anthracite'}`}
          >
            {isCurrentPlan(PlanType.ESSENTIAL) ? 'Plan Actuel' : 'Choisir Essentiel'}
          </button>
        </div>

        {/* PRO - La Star (Mise en avant visuelle) */}
        <div className={`bg-anthracite p-8 rounded-[2rem] border-2 shadow-2xl relative flex flex-col md:scale-110 z-20 ${isCurrentPlan(PlanType.PRO) ? 'border-gold shadow-gold/20' : 'border-gold shadow-gold/10'}`}>
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-gold to-amber-400 text-anthracite text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg whitespace-nowrap">
            Meilleur Choix
          </div>
          
          <div className="mb-6 pt-2">
            <h3 className="text-sm font-black text-gold uppercase tracking-widest mb-4">Professionnel</h3>
            <div className="flex items-baseline mb-2">
              <span className="text-5xl font-black text-white tracking-tighter">19€</span>
              <span className="text-slate-400 font-bold text-sm ml-1">/mois</span>
            </div>
            <p className="text-slate-400 text-xs font-medium">La puissance totale, sans contraintes.</p>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent mb-6"></div>

          <ul className="space-y-4 mb-8 flex-grow">
            <PlanFeature text="Suppression logo NoteBookLM" highlight />
            <PlanFeature text="Slides Illimitées ⚡" highlight />
            <PlanFeature text="Badge 'Donateur SmartUnityIA'" highlight />
            <PlanFeature text="Export Haute Qualité" />
            <PlanFeature text="Code Pomo pour chaque nouvelles outils" />
            <PlanFeature text="Accès aux avants premieres gratuites" />
            <PlanFeature text="Support par email" />
          </ul>

          <button 
            disabled={isCurrentPlan(PlanType.PRO)}
            onClick={onUpgrade}
            className={`w-full py-5 px-4 rounded-xl font-black uppercase tracking-widest text-[12px] transition-all shadow-lg hover:shadow-gold/25 active:scale-95 ${isCurrentPlan(PlanType.PRO) ? 'bg-gold/20 text-gold cursor-default' : 'bg-gold text-anthracite hover:bg-white'}`}
          >
            {isCurrentPlan(PlanType.PRO) ? 'Votre Plan Actuel' : 'Devenir Pro - 19€'}
          </button>
          
          <p className="text-center mt-4 text-[10px] text-slate-500 font-medium">
            Annulable à tout moment. Satisfait ou remboursé.
          </p>
        </div>

        {/* LIFETIME - L'Urgence */}
        <div className={`bg-gradient-to-b from-anthracite-light to-anthracite p-8 rounded-[2rem] border transition-all duration-300 flex flex-col relative group overflow-hidden ${isCurrentPlan(PlanType.LIFETIME) ? 'border-amber-500' : 'border-anthracite-lighter hover:border-amber-500/50'}`}>
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest">Lifetime</h3>
              <span className="bg-amber-500/10 text-amber-500 text-[9px] font-black px-2 py-1 rounded border border-amber-500/20">
                -85% vs 2 ans
              </span>
            </div>
            <div className="flex items-baseline mb-2">
              <span className="text-4xl font-black text-white tracking-tighter">199€</span>
              <span className="text-slate-500 font-bold text-xs ml-1 uppercase">Une fois</span>
            </div>
            
            {/* Scarcity Bar */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                <span className="text-slate-400">Places restantes</span>
                <span className="text-amber-500">7 / 50</span>
              </div>
              <div className="w-full h-1.5 bg-anthracite-lighter rounded-full overflow-hidden">
                <div className="w-[86%] h-full bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
              </div>
            </div>
          </div>

          <ul className="space-y-4 mb-8 flex-grow">
            <PlanFeature text="Tous les avantages PRO" />
            <PlanFeature text="Accès à Vie Garanti" highlight />
            <PlanFeature text="Mises à jour futures incluses" />
            <PlanFeature text="Statut 'Invéstisseur SmartUnityIA'" />
          </ul>

          <button 
            disabled={isCurrentPlan(PlanType.LIFETIME)}
            onClick={onUpgrade}
            className={`w-full py-4 px-4 rounded-xl font-black uppercase tracking-widest text-[11px] transition-all ${isCurrentPlan(PlanType.LIFETIME) ? 'bg-amber-500/20 text-amber-500 cursor-default' : 'bg-white text-anthracite border border-white hover:bg-amber-500 hover:text-white hover:border-amber-500'}`}
          >
            {isCurrentPlan(PlanType.LIFETIME) ? 'Membre à Vie' : 'Sécuriser ma place'}
          </button>
        </div>
      </div>
      
      {/* Reassurance Footer */}
      <div className="text-center mt-16 max-w-2xl mx-auto px-4 animate-in fade-in slide-in-from-bottom-8 delay-150">
        <p className="text-slate-500 text-xs font-medium leading-relaxed">
          Paiement sécurisé par Stripe & Lemon Squeezy. <br/>
          Une partie de vos 19€ finance directement des refuges animaliers certifiés.
        </p>
      </div>
    </section>
  );
};