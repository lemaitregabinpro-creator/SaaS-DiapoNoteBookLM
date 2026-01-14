
import React, { useState } from 'react';
import { User, PlanType } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
  limitReached?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, limitReached }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulation d'authentification
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: name || 'Investisseur',
      email: email,
      plan: PlanType.FREE, // Plan par défaut à l'inscription
      usageCount: 0
    };
    onLogin(mockUser);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div 
        className="absolute inset-0 bg-anthracite/80 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-anthracite-light border border-anthracite-lighter rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-10">
          <div className="text-center space-y-4 mb-8">
            {limitReached ? (
              <div className="inline-block px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500 text-[10px] font-black uppercase tracking-widest mb-2">
                Limite atteinte
              </div>
            ) : (
              <div className="w-12 h-12 bg-gold/10 border border-gold/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            )}
            <h3 className="text-2xl font-black text-white tracking-tight">
              {limitReached ? 'Passez au niveau supérieur' : (isSignUp ? 'Rejoignez le Cercle' : 'Bienvenue à nouveau')}
            </h3>
            <p className="text-slate-400 text-sm font-medium">
              {limitReached 
                ? "Créez un compte gratuit pour obtenir 5 analyses supplémentaires ou abonnez-vous." 
                : (isSignUp ? "Accédez aux outils premium et sauvez des vies." : "Identifiez-vous pour gérer vos slides HD.")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nom complet</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jean Dupont"
                  className="w-full bg-anthracite border border-anthracite-lighter rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-gold/40 transition-all placeholder:text-slate-700"
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Adresse Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jean@exemple.com"
                className="w-full bg-anthracite border border-anthracite-lighter rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-gold/40 transition-all placeholder:text-slate-700"
              />
            </div>
            
            <button 
              type="submit"
              className="w-full bg-gold text-anthracite py-4 rounded-2xl font-black uppercase tracking-widest text-[12px] hover:bg-gold-light transition-all shadow-xl shadow-gold/10 mt-6"
            >
              {isSignUp ? 'Créer mon compte' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[11px] font-bold text-slate-500 hover:text-gold uppercase tracking-widest transition-colors"
            >
              {isSignUp ? 'Déjà membre ? Se connecter' : 'Nouveau ici ? Créer un compte'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
