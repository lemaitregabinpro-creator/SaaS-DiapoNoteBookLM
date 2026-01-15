
import React, { useState } from 'react';
import { User, PlanType } from '../types';

interface PricingProps {
  user: User | null;
  onUpgrade: () => void;
}

const PlanFeature = ({ text }: { text: string }) => (
  <li className="flex items-start space-x-3 text-slate-400 text-sm font-medium">
    <svg className="w-5 h-5 text-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
    <span>{text}</span>
  </li>
);

export const Pricing: React.FC<PricingProps> = ({ user, onUpgrade }) => {
  const [isAnnual, setIsAnnual] = useState(false);

  const prices = {
    essentiel: isAnnual ? { monthly: '4.15', total: '50' } : { monthly: '5', total: '5' },
    pro: isAnnual ? { monthly: '10', total: '120' } : { monthly: '12', total: '12' },
    lifetime: '49'
  };

  const isCurrentPlan = (plan: PlanType) => user?.plan === plan;

  return (
    <section id="pricing" className="py-12 md:py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
          Un investissement pour votre <span className="text-gold">élégance</span>
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
          Une expérience sans filigrane, tout en soutenant activement la protection animale.
        </p>
      </div>

      <div className="flex justify-center items-center space-x-6 mb-16">
        <span className={`text-[12px] font-black uppercase tracking-widest ${!isAnnual ? 'text-gold' : 'text-slate-500'}`}>Mensuel</span>
        <button 
          onClick={() => setIsAnnual(!isAnnual)}
          className="relative w-16 h-8 bg-anthracite-lighter rounded-full p-1.5 transition-colors border border-anthracite-lighter"
        >
          <div className={`w-5 h-5 bg-gold rounded-full shadow-lg transform transition-all duration-500 ${isAnnual ? 'translate-x-8' : 'translate-x-0'}`} />
        </button>
        <div className="flex items-center space-x-3">
          <span className={`text-[12px] font-black uppercase tracking-widest ${isAnnual ? 'text-gold' : 'text-slate-500'}`}>Annuel</span>
          <span className="bg-gold/10 text-gold text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] border border-gold/20">
            Économisez 20%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 items-stretch max-w-7xl mx-auto px-4">
        {/* Essentiel */}
        <div className={`bg-anthracite-light p-10 rounded-[2.5rem] border transition-all duration-500 flex flex-col group ${isCurrentPlan(PlanType.ESSENTIAL) ? 'border-gold' : 'border-anthracite-lighter hover:border-gold/20'}`}>
          <div className="mb-10">
            <h3 className="text-lg font-black text-white uppercase tracking-widest mb-2">Essentiel</h3>
            <div className="flex items-baseline">
              <span className="text-5xl font-black text-white tracking-tighter">{prices.essentiel.monthly}€</span>
              <span className="text-slate-500 font-bold text-sm ml-2">/mois</span>
            </div>
          </div>
          <ul className="space-y-5 mb-12 flex-grow">
            <PlanFeature text="20 nettoyages / mois" />
            <PlanFeature text="Algorithme standard" />
            <PlanFeature text="Export Images 150 DPI" />
            <PlanFeature text="Soutien cause animale" />
          </ul>
          <button 
            disabled={isCurrentPlan(PlanType.ESSENTIAL)}
            onClick={onUpgrade}
            className={`w-full py-4 px-4 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all ${isCurrentPlan(PlanType.ESSENTIAL) ? 'bg-gold/10 text-gold cursor-default' : 'bg-anthracite-lighter text-gold border border-gold/10 hover:bg-gold hover:text-anthracite'}`}
          >
            {isCurrentPlan(PlanType.ESSENTIAL) ? 'Plan actuel' : 'Choisir Essentiel'}
          </button>
        </div>

        {/* Pro */}
        <div className={`bg-anthracite-light p-10 rounded-[2.5rem] border-2 shadow-2xl relative flex flex-col md:scale-105 z-10 ${isCurrentPlan(PlanType.PRO) ? 'border-gold shadow-gold/10' : 'border-gold shadow-gold/5'}`}>
          <div className="absolute top-0 right-0 bg-gold text-anthracite text-[9px] font-black px-6 py-2 rounded-bl-3xl uppercase tracking-[0.2em]">
            Le plus exclusif
          </div>
          <div className="mb-10">
            <h3 className="text-lg font-black text-white uppercase tracking-widest mb-2">Professionnel</h3>
            <div className="flex items-baseline">
              <span className="text-5xl font-black text-white tracking-tighter">{prices.pro.monthly}€</span>
              <span className="text-slate-500 font-bold text-sm ml-2">/mois</span>
            </div>
          </div>
          <ul className="space-y-5 mb-12 flex-grow">
            <PlanFeature text="Nettoyages illimités" />
            <PlanFeature text="Outils secrets exclusifs" />
            <PlanFeature text="Images Ultra-HD (300 DPI)" />
            <PlanFeature text="Support VIP 24/7" />
            <PlanFeature text="Donateur Premium certifié" />
          </ul>
          <button 
            disabled={isCurrentPlan(PlanType.PRO)}
            onClick={onUpgrade}
            className={`w-full py-5 px-4 rounded-2xl font-black uppercase tracking-widest text-[12px] transition-all shadow-xl ${isCurrentPlan(PlanType.PRO) ? 'bg-gold/10 text-gold cursor-default' : 'bg-gold text-anthracite hover:bg-gold-light shadow-gold/20'}`}
          >
            {isCurrentPlan(PlanType.PRO) ? 'Plan actuel' : 'Passer au niveau Pro'}
          </button>
        </div>

        {/* À Vie */}
        <div className={`bg-anthracite-lighter p-10 rounded-[2.5rem] border transition-all duration-500 flex flex-col relative group overflow-hidden ${isCurrentPlan(PlanType.LIFETIME) ? 'border-gold' : 'border-anthracite-lighter hover:border-amber-500/30'}`}>
          <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-black px-6 py-2 rounded-bl-3xl uppercase tracking-[0.2em]">
            Offre Rare
          </div>
          <div className="mb-10">
            <h3 className="text-lg font-black text-white uppercase tracking-widest mb-2">À Vie</h3>
            <div className="flex items-baseline">
              <span className="text-5xl font-black text-white tracking-tighter">{prices.lifetime}€</span>
              <span className="text-slate-500 font-bold text-xs ml-3 uppercase">Unique</span>
            </div>
          </div>
          <ul className="space-y-5 mb-12 flex-grow">
            <PlanFeature text="Tous les avantages du plan Pro" />
            <PlanFeature text="Accès permanent garanti" />
            <PlanFeature text="Aucun frais récurrent" />
            <PlanFeature text="Toutes mises à jour futures" />
            <PlanFeature text="Membre du cercle d'or" />
          </ul>
          <button 
            disabled={isCurrentPlan(PlanType.LIFETIME)}
            onClick={onUpgrade}
            className={`w-full py-4 px-4 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all ${isCurrentPlan(PlanType.LIFETIME) ? 'bg-gold/10 text-gold cursor-default' : 'bg-white text-anthracite hover:bg-slate-100'}`}
          >
            {isCurrentPlan(PlanType.LIFETIME) ? 'Membre à vie' : 'Posséder à vie'}
          </button>
          
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-gold/5 rounded-full blur-3xl group-hover:bg-gold/10 transition-all"></div>
        </div>
      </div>
    </section>
  );
};
