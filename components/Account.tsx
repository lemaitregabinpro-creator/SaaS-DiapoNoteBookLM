
import React from 'react';
import { User, PlanType } from '../types';

interface AccountProps {
  user: User;
  onLogout: () => void;
}

export const Account: React.FC<AccountProps> = ({ user, onLogout }) => {
  const getPlanBadge = (plan: PlanType) => {
    switch (plan) {
      case PlanType.LIFETIME: return "Cercle d'Or";
      case PlanType.PRO: return "Professionnel";
      case PlanType.ESSENTIAL: return "Essentiel";
      default: return "Gratuit";
    }
  };

  const getImpact = (count: number) => {
    return (count * 0.15).toFixed(2);
  };

  return (
    <section id="account" className="py-12 md:py-20">
      <div className="bg-anthracite-light rounded-[3rem] p-8 md:p-16 border border-anthracite-lighter shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">Espace Personnel</h2>
          <button 
            onClick={onLogout}
            className="text-[10px] font-black text-slate-500 hover:text-red-400 uppercase tracking-widest border border-anthracite-lighter px-4 py-2 rounded-xl transition-all"
          >
            Déconnexion
          </button>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-16">
          <div className="flex flex-col items-center lg:items-start space-y-6 lg:w-1/3">
            <div className="relative group">
              <div className="w-40 h-40 md:w-52 md:h-52 rounded-[3rem] overflow-hidden border-4 border-anthracite-lighter shadow-2xl bg-anthracite transform transition-transform duration-500 group-hover:scale-105">
                <img 
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                  alt="Profil" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="text-center lg:text-left space-y-1">
              <h3 className="font-black text-2xl text-white">{user.name}</h3>
              <p className="text-[11px] text-gold font-black uppercase tracking-[0.3em]">{getPlanBadge(user.plan)}</p>
            </div>
          </div>

          <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Email</label>
              <div className="p-4 bg-anthracite rounded-2xl border border-anthracite-lighter text-slate-300 font-medium text-sm">
                {user.email}
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Statut du Compte</label>
              <div className="p-4 bg-anthracite rounded-2xl border border-anthracite-lighter text-gold font-bold text-sm">
                Actif • Premium
              </div>
            </div>
            <div className="md:col-span-2 space-y-4 pt-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Tableau de Bord</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 bg-anthracite rounded-3xl border border-anthracite-lighter">
                  <span className="block text-4xl font-black text-gold mb-1">{user.usageCount}</span>
                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Analyses</span>
                </div>
                <div className="p-6 bg-anthracite rounded-3xl border border-anthracite-lighter">
                  <span className="block text-4xl font-black text-white mb-1">HD+</span>
                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Format Actif</span>
                </div>
                <div className="p-6 bg-gold/5 rounded-3xl border border-gold/10">
                  <span className="block text-4xl font-black text-gold mb-1">{getImpact(user.usageCount)}€</span>
                  <span className="text-[9px] text-gold/60 font-black uppercase tracking-widest">Dons cumulés</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
