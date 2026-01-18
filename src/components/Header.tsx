
import React, { useState } from 'react';
import { User, View } from '../types';

interface HeaderProps {
  user: User | null;
  currentView: View;
  onNavigate: (view: View) => void;
  onAuthClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, currentView, onNavigate, onAuthClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: 'L\'Outil', view: View.HOME },
    { label: 'Mon Studio', view: View.PRICING },
    { label: 'Roadmap', view: View.FEED },
  ];

  if (user) {
    navItems.push({ label: 'Compte', view: View.ACCOUNT });
  }

  const handleNavigate = (view: View) => {
    onNavigate(view);
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-anthracite/90 backdrop-blur-xl sticky top-0 z-50 border-b border-anthracite-lighter">
      <div className="container mx-auto px-4 md:px-6 py-3 md:py-0 md:h-24 flex items-center justify-between">
        {/* Logo - Toujours visible */}
        <div 
          className="flex items-center space-x-2 md:space-x-3 cursor-pointer group" 
          onClick={() => handleNavigate(View.HOME)}
        >
          <div className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center group-hover:scale-105 group-hover:rotate-3 transition-all duration-500">
            <img 
              src="/icon128.png" 
              alt="SmartBookLM Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-xl md:text-2xl font-black text-white tracking-tighter">SmartBook<span className="text-gold">LM</span></span>
          <span className="px-2 py-0.5 bg-gold/20 border border-gold/30 rounded-md text-[8px] md:text-[9px] font-black uppercase tracking-widest text-gold">
            BETA
          </span>
        </div>
        
        {/* Desktop Navigation - Cachée sur mobile */}
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <button 
              key={item.view}
              onClick={() => handleNavigate(item.view)} 
              className={`text-[13px] font-bold uppercase tracking-[0.1em] transition-all py-2 relative group min-h-[44px] flex items-center ${currentView === item.view ? 'text-gold' : 'text-slate-400 hover:text-gold'}`}
            >
              {item.label}
              {currentView === item.view && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gold rounded-full animate-in fade-in slide-in-from-left-2"></span>
              )}
            </button>
          ))}
          
          <div className="w-px h-6 bg-anthracite-lighter mx-2"></div>
          
          {user ? (
            <div 
              onClick={() => handleNavigate(View.ACCOUNT)}
              className={`flex items-center space-x-3 p-1.5 pr-4 rounded-xl border transition-all cursor-pointer min-h-[44px] ${currentView === View.ACCOUNT ? 'bg-gold/10 border-gold/30' : 'bg-anthracite-lighter border-anthracite-lighter hover:border-gold/20'}`}
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
              className="bg-gold text-anthracite px-6 py-3 rounded-xl text-[13px] font-black uppercase tracking-widest hover:bg-gold-light hover:shadow-lg hover:shadow-gold/10 transition-all active:scale-95 min-h-[44px]"
            >
              Connexion
            </button>
          )}
        </div>

        {/* Mobile: Bouton Auth/Avatar + Menu Hamburger */}
        <div className="flex md:hidden items-center space-x-3 relative">
          {user ? (
            <div 
              onClick={() => handleNavigate(View.ACCOUNT)}
              className={`flex items-center space-x-2 p-2 rounded-lg border transition-all cursor-pointer min-h-[44px] min-w-[44px] justify-center ${currentView === View.ACCOUNT ? 'bg-gold/10 border-gold/30' : 'bg-anthracite-lighter border-anthracite-lighter'}`}
            >
              <img 
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                alt="Avatar" 
                className="w-8 h-8 rounded-lg bg-anthracite shadow-inner"
              />
            </div>
          ) : (
            <button 
              onClick={onAuthClick}
              className="bg-gold text-anthracite px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-gold-light transition-all active:scale-95 min-h-[44px]"
            >
              Connexion
            </button>
          )}

          {/* Menu Hamburger */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-11 h-11 flex flex-col items-center justify-center space-y-1.5 rounded-lg bg-anthracite-lighter border border-anthracite-lighter hover:border-gold/20 transition-all min-h-[44px] min-w-[44px]"
              aria-label="Menu"
            >
              <span className={`w-5 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`w-5 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`w-5 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </button>

            {/* Dropdown Menu - Petit menu sous le bouton */}
            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-anthracite-light border border-anthracite-lighter rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="py-2">
                  {navItems.map((item) => (
                    <button 
                      key={item.view}
                      onClick={() => handleNavigate(item.view)} 
                      className={`w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-all min-h-[44px] flex items-center ${
                        currentView === item.view 
                          ? 'bg-gold/10 text-gold' 
                          : 'text-slate-400 hover:text-white hover:bg-anthracite'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
