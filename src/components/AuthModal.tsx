import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => Promise<void>;
  limitReached?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, limitReached }) => {
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
      await onLogin();
    } catch (error) {
      console.error('Erreur lors de la connexion Google:', error);
      setError('Erreur lors de la connexion avec Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEmailLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          setError('Le nom complet est requis');
          setIsEmailLoading(false);
          return;
        }
        await signUpWithEmail(email, password, fullName);
        onClose();
      } else {
        await signInWithEmail(email, password);
        onClose();
      }
    } catch (error: any) {
      console.error('Erreur authentification email:', error);
      
      // Gestion des erreurs spécifiques Supabase
      if (error.message?.includes('Invalid login credentials') || error.message?.includes('Invalid email or password')) {
        setError('Email ou mot de passe incorrect');
      } else if (error.message?.includes('User already registered') || error.message?.includes('already registered')) {
        setError('Cet email est déjà utilisé. Connectez-vous plutôt.');
        setIsSignUp(false);
      } else if (error.message?.includes('Password should be at least')) {
        setError('Le mot de passe doit contenir au moins 6 caractères');
      } else if (error.message?.includes('Email rate limit exceeded')) {
        setError('Trop de tentatives. Veuillez réessayer plus tard.');
      } else if (error.message?.includes('Email not confirmed')) {
        setError('Veuillez confirmer votre email avant de vous connecter');
      } else {
        setError(error.message || 'Une erreur est survenue');
      }
    } finally {
      setIsEmailLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setEmail('');
    setPassword('');
    setFullName('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div 
        className="absolute inset-0 bg-anthracite/80 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md h-auto max-h-[85vh] overflow-y-auto bg-anthracite-light border-[0.5px] border-anthracite-lighter rounded-2xl shadow-2xl shadow-black/40 overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-5 md:p-7">
          {/* Header */}
          <div className="text-center space-y-2 mb-4">
            {limitReached ? (
              <div className="inline-block px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-500 text-[9px] font-black uppercase tracking-widest mb-1">
                Limite atteinte
              </div>
            ) : (
              <div className="w-10 h-10 bg-gold/10 border border-gold/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            )}
            <h3 className="text-lg font-bold text-white tracking-tight">
              {limitReached ? 'Passez au niveau supérieur' : 'Bienvenue sur SmartBookLM'}
            </h3>
            <p className="text-slate-400 text-xs font-medium">
              {limitReached 
                ? "Créez un compte gratuit pour obtenir 5 analyses supplémentaires ou abonnez-vous." 
                : "Connectez-vous pour accéder à vos outils premium et sauver des vies."}
            </p>
          </div>

          <div className="space-y-3">
            {/* Bouton Google */}
            <button 
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isEmailLoading}
              className="w-full bg-white text-anthracite py-3 rounded-lg font-black uppercase tracking-widest text-[11px] hover:bg-slate-100 transition-all shadow-lg shadow-white/10 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Connexion en cours...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continuer avec Google</span>
                </>
              )}
            </button>

            {/* Séparateur OU */}
            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-anthracite-lighter/50"></div>
              <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">OU</span>
              <div className="flex-grow border-t border-anthracite-lighter/50"></div>
            </div>

            {/* Formulaire Email/Password */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              {/* Champ Nom complet (uniquement en mode inscription) */}
              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    Nom complet
                  </label>
                  <input 
                    type="text" 
                    required={isSignUp}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jean Dupont"
                    className="w-full bg-anthracite border border-anthracite-lighter rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/40 transition-all placeholder:text-slate-700"
                  />
                </div>
              )}

              {/* Champ Email */}
              <div className="space-y-1.5">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Adresse Email
                </label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jean@exemple.com"
                  className="w-full bg-anthracite border border-anthracite-lighter rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/40 transition-all placeholder:text-slate-700"
                />
              </div>

              {/* Champ Mot de passe */}
              <div className="space-y-1.5">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Mot de passe
                </label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full bg-anthracite border border-anthracite-lighter rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/40 transition-all placeholder:text-slate-700"
                />
              </div>

              {/* Message d'erreur */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2.5">
                  <p className="text-red-400 text-xs font-medium text-center">{error}</p>
                </div>
              )}

              {/* Bouton de soumission */}
              <button 
                type="submit"
                disabled={isEmailLoading || isGoogleLoading}
                className="w-full bg-gold text-anthracite py-3 rounded-lg font-black uppercase tracking-widest text-[11px] hover:bg-gold-light transition-all shadow-lg shadow-gold/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isEmailLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{isSignUp ? 'Inscription...' : 'Connexion...'}</span>
                  </>
                ) : (
                  <span>{isSignUp ? 'S\'inscrire' : 'Se connecter'}</span>
                )}
              </button>
            </form>

            {/* Lien pour changer de mode */}
            <div className="text-center pt-1">
              <button 
                type="button"
                onClick={toggleMode}
                className="text-[10px] font-bold text-slate-500 hover:text-gold uppercase tracking-widest transition-colors"
              >
                {isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas encore de compte ? Créer un compte'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
