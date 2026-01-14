
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { FileUploader } from './components/FileUploader';
import { Results } from './components/Results';
import { Pricing } from './components/Pricing';
import { Mission } from './components/Mission';
import { Account } from './components/Account';
import { AuthModal } from './components/AuthModal';
import { MagicEditor } from './components/MagicEditor';
import { FloatingBackgroundElements } from './components/FloatingBackgroundElements';
import { AppStatus, UploadedFile, User, PlanType, View } from './types';
import { convertPdfToImages } from './utils/pdfConverter';

function App() {
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [slides, setSlides] = useState<string[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('sc_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [guestUsage, setGuestUsage] = useState<number>(() => {
    return parseInt(localStorage.getItem('sc_guest_usage') || '0');
  });

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('sc_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sc_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('sc_guest_usage', guestUsage.toString());
  }, [guestUsage]);

  const checkLimits = (): boolean => {
    if (!user) {
      if (guestUsage >= 2) {
        setLimitReached(true);
        setShowAuthModal(true);
        return false;
      }
      return true;
    }

    const limits: Record<PlanType, number> = {
      [PlanType.GUEST]: 2,
      [PlanType.FREE]: 5,
      [PlanType.ESSENTIAL]: 20,
      [PlanType.PRO]: Infinity,
      [PlanType.LIFETIME]: Infinity
    };

    if (user.usageCount >= limits[user.plan]) {
      setLimitReached(true);
      setCurrentView(View.PRICING);
      return false;
    }

    return true;
  };

  const handleFileUpload = async (uploadedFile: File) => {
    if (!checkLimits()) return;
    
    // Vérifier que c'est un PDF (pour l'instant, on gère seulement PDF)
    if (!uploadedFile.name.endsWith('.pdf')) {
      alert("Seuls les fichiers PDF sont supportés pour le moment.");
      return;
    }

    setIsConverting(true);
    setFile({
      name: uploadedFile.name,
      size: uploadedFile.size,
      type: uploadedFile.type
    });

    try {
      // Convertir le PDF en images
      const images = await convertPdfToImages(uploadedFile);
      setSlides(images);
      setStatus(AppStatus.EDITING);
    } catch (error) {
      console.error("Erreur lors de la conversion PDF:", error);
      alert("Erreur lors de la conversion du PDF. Veuillez réessayer.");
      setFile(null);
    } finally {
      setIsConverting(false);
    }
  };

  const handleApplyClean = (slideIndex: number, originalImage: string, maskImage: string) => {
    // Ici, on pourrait traiter chaque slide individuellement
    // Pour l'instant, on simule le traitement de toutes les slides
    setStatus(AppStatus.PROCESSING);
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 20;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        
        if (user) {
          setUser(prev => prev ? { ...prev, usageCount: prev.usageCount + 1 } : null);
        } else {
          setGuestUsage(prev => prev + 1);
        }

        setTimeout(() => {
          setStatus(AppStatus.COMPLETE);
        }, 500);
      }
      setProgress(currentProgress);
    }, 150);
  };

  const handleReset = () => {
    setStatus(AppStatus.IDLE);
    setProgress(0);
    setFile(null);
    setSlides([]);
  };

  const login = (userData: User) => {
    setUser(userData);
    setShowAuthModal(false);
    setCurrentView(View.HOME);
  };

  const logout = () => {
    setUser(null);
    setCurrentView(View.HOME);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case View.PRICING:
        return <Pricing user={user} onUpgrade={() => setShowAuthModal(true)} />;
      case View.ACCOUNT:
        return user ? <Account user={user} onLogout={logout} /> : null;
      case View.MISSION:
        return <Mission />;
      default:
        return (
          <div className="space-y-12">
            {status === AppStatus.IDLE && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
                <Hero />
                <div className="max-w-3xl mx-auto">
                  <FileUploader onFileSelect={handleFileUpload} />
                  {!user && (
                    <p className="text-center mt-6 text-slate-500 text-xs font-bold uppercase tracking-widest">
                      Essai gratuit : {2 - guestUsage} restants sans compte
                    </p>
                  )}
                </div>
              </div>
            )}

            {isConverting && (
              <div className="bg-anthracite-light rounded-[2.5rem] border border-anthracite-lighter p-16 text-center space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 border-4 border-gold/20 border-t-gold rounded-full animate-spin mx-auto"></div>
                <div className="max-w-md mx-auto space-y-4">
                  <h3 className="text-2xl font-black text-white uppercase tracking-widest">Conversion en cours</h3>
                  <p className="text-slate-400 text-sm font-medium">Extraction des slides du PDF...</p>
                </div>
              </div>
            )}

            {status === AppStatus.EDITING && slides.length > 0 && (
              <MagicEditor 
                slides={slides}
                onApply={handleApplyClean} 
                onCancel={handleReset}
              />
            )}

            {status === AppStatus.PROCESSING && (
              <div className="bg-anthracite-light rounded-[2.5rem] border border-anthracite-lighter p-16 text-center space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 border-4 border-gold/20 border-t-gold rounded-full animate-spin mx-auto"></div>
                <div className="max-w-md mx-auto space-y-4">
                  <h3 className="text-2xl font-black text-white uppercase tracking-widest">IA en action</h3>
                  <p className="text-slate-400 text-sm font-medium">Reconstruction des pixels sous le masque... {Math.round(progress)}%</p>
                  <div className="w-full bg-anthracite h-1.5 rounded-full overflow-hidden border border-anthracite-lighter">
                    <div className="bg-gold h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              </div>
            )}

            {status === AppStatus.COMPLETE && (
              <Results fileName={file?.name || 'Slides'} slides={slides} onReset={handleReset} />
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-anthracite selection:bg-gold selection:text-anthracite">
      <FloatingBackgroundElements />
      <Header 
        user={user} 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        onAuthClick={() => setShowAuthModal(true)} 
      />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16 max-w-7xl">
        {renderCurrentView()}
      </main>
      <footer className="py-16 bg-anthracite border-t border-anthracite-lighter">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView(View.HOME)}>
            <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
              <span className="text-[12px] text-anthracite font-black">SB</span>
            </div>
            <span className="text-lg font-black text-slate-100 tracking-tight">SmartBook<span className="text-gold font-medium">LM</span></span>
          </div>
          <p className="text-slate-500 text-sm font-medium">
            &copy; {new Date().getFullYear()} SmartUnityIA. L'élégance technologique au service de la cause animale.
          </p>
          <div className="flex space-x-8">
            <button onClick={() => setCurrentView(View.MISSION)} className="text-slate-400 hover:text-gold text-xs font-bold uppercase tracking-widest transition-colors">Notre Mission</button>
            <a href="#" className="text-slate-400 hover:text-gold text-xs font-bold uppercase tracking-widest transition-colors">CGV</a>
          </div>
        </div>
      </footer>
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => { setShowAuthModal(false); setLimitReached(false); }} 
          onLogin={login}
          limitReached={limitReached}
        />
      )}
    </div>
  );
}

export default App;
