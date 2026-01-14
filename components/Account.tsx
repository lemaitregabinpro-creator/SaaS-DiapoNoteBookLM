import React, { useState } from 'react';
import { User, PlanType } from '../types';

interface AccountProps {
  user: User;
  onLogout: () => void;
}

type TabType = 'profile' | 'subscription' | 'security' | 'preferences' | 'notifications';

export const Account: React.FC<AccountProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    bio: ''
  });
  const [hasProfileChanges, setHasProfileChanges] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false
  });

  const getPlanBadge = (plan: PlanType) => {
    switch (plan) {
      case PlanType.LIFETIME: return "Cercle d'Or";
      case PlanType.PRO: return "Professionnel";
      case PlanType.ESSENTIAL: return "Essentiel";
      case PlanType.FREE: return "Gratuit";
      default: return "Invité";
    }
  };

  const getPlanLimit = (plan: PlanType): number => {
    switch (plan) {
      case PlanType.FREE: return 5;
      case PlanType.ESSENTIAL: return 20;
      case PlanType.PRO: return Infinity;
      case PlanType.LIFETIME: return Infinity;
      default: return 2;
    }
  };

  const usagePercentage = user.plan === PlanType.PRO || user.plan === PlanType.LIFETIME 
    ? 0 
    : (user.usageCount / getPlanLimit(user.plan)) * 100;

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'profile', label: 'Mon Profil', icon: '👤' },
    { id: 'subscription', label: 'Abonnement & Facturation', icon: '💳' },
    { id: 'security', label: 'Sécurité', icon: '🔒' },
    { id: 'preferences', label: 'Préférences', icon: '⚙️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' }
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

  // Composant Toggle personnalisé
  const Toggle: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void; label: string }> = ({ 
    enabled, 
    onChange, 
    label 
  }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-slate-300">{label}</span>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
          enabled ? 'bg-gold' : 'bg-anthracite-lighter'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <section id="account" className="py-12 md:py-20 min-h-screen">
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

              {/* Onglet: Abonnement & Facturation */}
              {activeTab === 'subscription' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right duration-300">
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2">Abonnement & Facturation</h3>
                    <p className="text-sm text-slate-400">Gérez votre plan et consultez vos factures</p>
                  </div>

                  {/* Carte de Crédit Virtuelle */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 p-8 shadow-xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-sm font-black text-gold uppercase tracking-widest">{getPlanBadge(user.plan)}</span>
                        <span className="text-2xl font-black text-white">•••• •••• •••• 4242</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Titulaire</p>
                          <p className="text-lg font-bold text-white">{user.name.toUpperCase()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Expire</p>
                          <p className="text-lg font-bold text-white">12/25</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Barre de progression d'utilisation */}
                  <div className="bg-anthracite rounded-xl p-6 border border-anthracite-lighter">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-white">Utilisation du mois</span>
                      <span className="text-sm font-black text-gold">
                        {user.usageCount} / {getPlanLimit(user.plan) === Infinity ? '∞' : getPlanLimit(user.plan)}
                      </span>
                    </div>
                    <div className="w-full bg-anthracite-lighter rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-gold to-gold-light transition-all duration-500"
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Nettoyages effectués ce mois</p>
                  </div>

                  {/* Liste des factures */}
                  <div>
                    <h4 className="text-lg font-black text-white mb-4">Historique des factures</h4>
                    <div className="space-y-3">
                      {[
                        { id: '1', date: '15 Jan 2024', amount: '29.99€', status: 'payé' },
                        { id: '2', date: '15 Déc 2023', amount: '29.99€', status: 'payé' },
                        { id: '3', date: '15 Nov 2023', amount: '29.99€', status: 'payé' }
                      ].map((invoice) => (
                        <div key={invoice.id} className="flex items-center justify-between p-4 bg-anthracite rounded-xl border border-anthracite-lighter hover:border-gold/30 transition-all duration-300">
                          <div>
                            <p className="text-sm font-bold text-white">{invoice.date}</p>
                            <p className="text-xs text-slate-400">Abonnement {getPlanBadge(user.plan)}</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm font-black text-white">{invoice.amount}</span>
                            <span className="px-3 py-1 bg-gold/10 border border-gold/30 rounded-full text-[10px] font-black text-gold uppercase tracking-widest">
                              {invoice.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Onglet: Sécurité */}
              {activeTab === 'security' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right duration-300">
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2">Sécurité</h3>
                    <p className="text-sm text-slate-400">Protégez votre compte avec des paramètres de sécurité avancés</p>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-anthracite rounded-xl p-6 border border-anthracite-lighter">
                      <h4 className="text-lg font-black text-white mb-4">Changer le mot de passe</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                            Mot de passe actuel
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 bg-anthracite-light border border-anthracite-lighter rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-300"
                            placeholder="••••••••"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                            Nouveau mot de passe
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 bg-anthracite-light border border-anthracite-lighter rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-300"
                            placeholder="••••••••"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                            Confirmer le nouveau mot de passe
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 bg-anthracite-light border border-anthracite-lighter rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-300"
                            placeholder="••••••••"
                          />
                        </div>
                        <button className="px-6 py-3 bg-gold text-anthracite rounded-xl text-sm font-black uppercase tracking-widest hover:bg-gold-light transition-all duration-300">
                          Mettre à jour le mot de passe
                        </button>
                      </div>
                    </div>

                    <div className="bg-anthracite rounded-xl p-6 border border-anthracite-lighter">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-black text-white mb-1">Authentification à deux facteurs (2FA)</h4>
                          <p className="text-sm text-slate-400">Ajoutez une couche de sécurité supplémentaire à votre compte</p>
                        </div>
                        <Toggle 
                          enabled={twoFactorEnabled} 
                          onChange={setTwoFactorEnabled}
                          label=""
                        />
                      </div>
                    </div>
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
                      <select className="w-full px-4 py-3 bg-anthracite-light border border-anthracite-lighter rounded-xl text-white focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-300">
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                      </select>
                    </div>

                    <div className="bg-anthracite rounded-xl p-6 border border-anthracite-lighter">
                      <h4 className="text-lg font-black text-white mb-4">Format par défaut</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {['JPEG', 'PNG', 'WEBP'].map((format) => (
                          <button
                            key={format}
                            className="px-4 py-3 bg-anthracite-light border border-anthracite-lighter rounded-xl text-sm font-bold text-white hover:border-gold hover:bg-gold/10 transition-all duration-300"
                          >
                            {format}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Onglet: Notifications */}
              {activeTab === 'notifications' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right duration-300">
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2">Notifications</h3>
                    <p className="text-sm text-slate-400">Contrôlez comment et quand vous recevez des notifications</p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-anthracite rounded-xl p-6 border border-anthracite-lighter">
                      <Toggle 
                        enabled={notifications.email} 
                        onChange={(enabled) => setNotifications(prev => ({ ...prev, email: enabled }))}
                        label="Notifications par email"
                      />
                    </div>
                    <div className="bg-anthracite rounded-xl p-6 border border-anthracite-lighter">
                      <Toggle 
                        enabled={notifications.push} 
                        onChange={(enabled) => setNotifications(prev => ({ ...prev, push: enabled }))}
                        label="Notifications push"
                      />
                    </div>
                    <div className="bg-anthracite rounded-xl p-6 border border-anthracite-lighter">
                      <Toggle 
                        enabled={notifications.marketing} 
                        onChange={(enabled) => setNotifications(prev => ({ ...prev, marketing: enabled }))}
                        label="Emails marketing"
                      />
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
