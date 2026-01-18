import React, { useState, useEffect } from 'react';
import { User, PlanType, ImageFormat } from '../types';

interface AccountProps {
  user: User;
  onLogout: () => void;
}

type TabType = 'profile' | 'preferences';

export const Account: React.FC<AccountProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    bio: ''
  });
  const [hasProfileChanges, setHasProfileChanges] = useState(false);
  
  // Format par défaut avec localStorage
  const [defaultFormat, setDefaultFormat] = useState<ImageFormat>(() => {
    const saved = localStorage.getItem('smartbooklm_default_format');
    return (saved as ImageFormat) || 'JPEG';
  });

  // Sauvegarder le format dans localStorage quand il change
  useEffect(() => {
    localStorage.setItem('smartbooklm_default_format', defaultFormat);
  }, [defaultFormat]);

  const getPlanBadge = (plan: PlanType) => {
    switch (plan) {
      case PlanType.LIFETIME: return "Cercle d'Or";
      case PlanType.PRO: return "Professionnel";
      case PlanType.ESSENTIAL: return "Essentiel";
      case PlanType.FREE: return "Gratuit";
      default: return "Invité";
    }
  };

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'profile', label: 'Mon Profil', icon: '👤' },
    { id: 'preferences', label: 'Préférences', icon: '⚙️' }
  ];

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    setHasProfileChanges(true);
  };

  const handleSaveProfile = () => {
    // Ici, on pourrait appeler une API pour sauvegarder
    setHasProfileChanges(false);
    // Feedback visuel
  };

  return (
    <section id="account" className="py-8 md:py-12 min-h-screen">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header Global */}
        <div className="mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-anthracite-lighter">
          <div className="flex items-center space-x-6">
            <div className="relative group">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 border-gold/30 shadow-xl bg-anthracite transform transition-transform duration-500 group-hover:scale-105">
                <img 
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                  alt="Profil" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">{user.name}</h2>
              <div className="inline-flex items-center px-4 py-1.5 bg-gold/10 border border-gold/30 rounded-full">
                <span className="text-[10px] text-gold font-black uppercase tracking-widest">{getPlanBadge(user.plan)}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="px-6 py-3 text-[11px] font-black text-slate-400 hover:text-red-400 uppercase tracking-widest border border-anthracite-lighter hover:border-red-400/50 rounded-xl transition-all duration-300"
          >
            Déconnexion
          </button>
        </div>

        {/* Split View Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="space-y-2 bg-anthracite-light/50 backdrop-blur-sm rounded-2xl p-2 border border-white/5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gold/10 border border-gold/30 text-gold'
                      : 'text-slate-400 hover:text-white hover:bg-anthracite/50 border border-transparent'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="text-sm font-bold uppercase tracking-wider">{tab.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            <div className="bg-anthracite-light/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-white/5 shadow-2xl">
              
              {/* Onglet: Mon Profil */}
              {activeTab === 'profile' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right duration-300">
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2">Informations Personnelles</h3>
                    <p className="text-sm text-slate-400">Gérez vos informations de profil</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                        Nom complet
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => handleProfileChange('name', e.target.value)}
                        className="w-full px-4 py-3 bg-anthracite border border-anthracite-lighter rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-300"
                        placeholder="Votre nom"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleProfileChange('email', e.target.value)}
                        className="w-full px-4 py-3 bg-anthracite border border-anthracite-lighter rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-300"
                        placeholder="votre@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                        Bio
                      </label>
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => handleProfileChange('bio', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-anthracite border border-anthracite-lighter rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-300 resize-none"
                        placeholder="Parlez-nous de vous..."
                      />
                    </div>

                    <button
                      onClick={handleSaveProfile}
                      disabled={!hasProfileChanges}
                      className={`px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300 ${
                        hasProfileChanges
                          ? 'bg-gold text-anthracite hover:bg-gold-light shadow-lg shadow-gold/20 cursor-pointer'
                          : 'bg-anthracite-lighter text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      Sauvegarder les modifications
                    </button>
                  </div>

                  {/* Zone de Danger */}
                  <div className="mt-12 pt-8 border-t border-red-500/20">
                    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
                      <h4 className="text-lg font-black text-red-400 mb-2">Zone de Danger</h4>
                      <p className="text-sm text-slate-400 mb-4">La suppression de votre compte est irréversible.</p>
                      <button className="px-6 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-red-500/20 transition-all duration-300">
                        Supprimer mon compte
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Onglet: Préférences */}
              {activeTab === 'preferences' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right duration-300">
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2">Préférences</h3>
                    <p className="text-sm text-slate-400">Personnalisez votre expérience SmartBookLM</p>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-anthracite rounded-xl p-6 border border-anthracite-lighter">
                      <h4 className="text-lg font-black text-white mb-4">Langue</h4>
                      <select 
                        disabled
                        className="w-full px-4 py-3 bg-anthracite-light border border-anthracite-lighter rounded-xl text-white opacity-60 cursor-not-allowed transition-all duration-300"
                      >
                        <option value="fr">Français</option>
                      </select>
                      <p className="text-xs text-slate-500 mt-2">Seul le français est disponible pour le moment</p>
                    </div>

                    <div className="bg-anthracite rounded-xl p-6 border border-anthracite-lighter">
                      <h4 className="text-lg font-black text-white mb-4">Format par défaut</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {(['JPEG', 'PNG', 'WEBP'] as ImageFormat[]).map((format) => (
                          <button
                            key={format}
                            onClick={() => setDefaultFormat(format)}
                            className={`px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 min-h-[44px] ${
                              defaultFormat === format
                                ? 'bg-gold text-anthracite border border-gold shadow-lg shadow-gold/20'
                                : 'bg-anthracite-light border border-anthracite-lighter text-white hover:border-gold hover:bg-gold/10'
                            }`}
                          >
                            {format}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 mt-3">Le format sélectionné sera utilisé par défaut dans l'éditeur</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </main>
        </div>
      </div>
    </section>
  );
};
