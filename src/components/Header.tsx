
import React from 'react';
import { User, View } from '../types';

interface HeaderProps {
  user: User | null;
  currentView: View;
  onNavigate: (view: View) => void;
  onAuthClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, currentView, onNavigate, onAuthClick }) => {
  const navItems = [
    { label: 'L\'Outil', view: View.HOME },
    { label: 'Mon Studio', view: View.PRICING },
    { label: 'Mission', view: View.MISSION },
    { label: 'Roadmap', view: View.FEED },
  ];

  if (user) {
    navItems.push({ label: 'Compte', view: View.ACCOUNT });
  }

  return (
    <nav className="bg-anthracite/90 backdrop-blur-xl sticky top-0 z-50 border-b border-anthracite-lighter">
      <div className="container mx-auto px-6 py-4 md:py-0 md:h-24 flex flex-col md:flex-row items-center justify-between gap-4">
        <div 
          className="flex items-center space-x-3 cursor-pointer group" 
          onClick={() => onNavigate(View.HOME)}
        >
          <div className="w-11 h-11 bg-gold rounded-2xl flex items-center justify-center shadow-2xl shadow-gold/20 group-hover:scale-105 group-hover:rotate-3 transition-all duration-500">
            <svg className="w-6 h-6 text-anthracite" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <span className="text-2xl font-black text-white tracking-tighter">SmartBook<span className="text-gold">LM</span></span>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-8">
          {navItems.map((item) => (
            <button 
              key={item.view}
              onClick={() => onNavigate(item.view)} 
              className={`text-[13px] font-bold uppercase tracking-[0.1em] transition-all py-2 relative group ${currentView === item.view ? 'text-gold' : 'text-slate-400 hover:text-gold'}`}
            >
              {item.label}
              {currentView === item.view && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gold rounded-full animate-in fade-in slide-in-from-left-2"></span>
              )}
            </button>
          ))}
          
          <div className="w-px h-6 bg-anthracite-lighter mx-2 hidden md:block"></div>
          
          {user ? (
            <div 
              onClick={() => onNavigate(View.ACCOUNT)}
              className={`flex items-center space-x-3 p-1.5 pr-4 rounded-xl border transition-all cursor-pointer ${currentView === View.ACCOUNT ? 'bg-gold/10 border-gold/30' : 'bg-anthracite-lighter border-anthracite-lighter hover:border-gold/20'}`}
            >
              <img 
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                alt="Avatar" 
                className="w-8 h-8 rounded-lg bg-anthracite shadow-inner"
              />
              <span className={`text-[11px] font-black uppercase tracking-widest ${currentView === View.ACCOUNT ? 'text-gold' : 'text-white'}`}>{user.name}</span>
            </div>
          ) : (
            <button 
              onClick={onAuthClick}
              className="bg-gold text-anthracite px-6 py-3 rounded-xl text-[13px] font-black uppercase tracking-widest hover:bg-gold-light hover:shadow-lg hover:shadow-gold/10 transition-all active:scale-95"
            >
              Connexion
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
