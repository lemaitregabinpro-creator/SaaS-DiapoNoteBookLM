
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
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';
import { AppStatus, UploadedFile, User, PlanType, View } from './types';
import { convertPdfToImages, healWatermark } from './utils/imageProcessor';
import { useAuth } from './contexts/AuthContext';

// Les interfaces CropOptions et ProcessOptions sont maintenant importées depuis types.ts

// Utilitaire pour appliquer le rognage et convertir le format
const processSlideWithCrop = async (originalSrc: string, options: ProcessOptions): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.src = originalSrc;
    img.onload = () => {
      if (!ctx) {
        reject(new Error('Impossible de créer le contexte canvas'));
        return;
      }

      // 1. Configurer le canvas avec les dimensions originales de l'image
      canvas.width = img.width;
      canvas.height = img.height;

      // 2. Dessiner l'image complète sur le canvas
      ctx.drawImage(img, 0, 0);

      // 3. Si l'option removeWatermark est activée, appliquer l'inpainting AVANT le rognage
      if (options.removeWatermark) {
        healWatermark(ctx, img.width, img.height);
      }

      // 4. Calculer les dimensions après rognage
      const cropWidth = img.width - options.crop.left - options.crop.right;
      const cropHeight = img.height - options.crop.top - options.crop.bottom;

      // 5. Vérifier que les dimensions sont valides
      if (cropWidth <= 0 || cropHeight <= 0) {
        reject(new Error('Les valeurs de rognage sont invalides'));
        return;
      }

      // 6. Créer un nouveau canvas pour l'image rognée
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = cropWidth;
      croppedCanvas.height = cropHeight;
      const croppedCtx = croppedCanvas.getContext('2d');

      if (!croppedCtx) {
        reject(new Error('Impossible de créer le contexte canvas pour le rognage'));
        return;
      }

      // 7. Dessiner la partie rognée de l'image (qui a déjà été traitée pour le filigrane)
      croppedCtx.drawImage(
        canvas,
        options.crop.left,      // Source X
        options.crop.top,        // Source Y
        cropWidth,               // Source Width
        cropHeight,              // Source Height
        0,                       // Destination X
        0,                       // Destination Y
        cropWidth,               // Destination Width
        cropHeight               // Destination Height
      );

      // 8. Convertir selon le format demandé (utiliser le canvas rogné)
      let mimeType: string;
      let quality: number | undefined;

      switch (options.format) {
        case 'JPEG':
          mimeType = 'image/jpeg';
          quality = 0.9;
          break;
        case 'PNG':
          mimeType = 'image/png';
          quality = undefined; // PNG n'utilise pas de qualité
          break;
        case 'WEBP':
          mimeType = 'image/webp';
          quality = 0.9;
          break;
        default:
          mimeType = 'image/jpeg';
          quality = 0.9;
      }

      // Gérer les erreurs de conversion (WEBP peut ne pas être supporté)
      try {
        const dataUrl = quality !== undefined 
          ? croppedCanvas.toDataURL(mimeType, quality)
          : croppedCanvas.toDataURL(mimeType);
        
        // Vérifier que la conversion a réussi
        if (!dataUrl || dataUrl === 'data:,') {
          throw new Error(`Échec de la conversion en ${options.format}`);
        }
        
        resolve(dataUrl);
      } catch (error) {
        // Fallback sur JPEG si le format demandé échoue (ex: WEBP non supporté)
        console.warn(`Format ${options.format} non supporté, fallback sur JPEG:`, error);
        try {
          const fallbackDataUrl = croppedCanvas.toDataURL('image/jpeg', 0.9);
          resolve(fallbackDataUrl);
        } catch (fallbackError) {
          reject(new Error(`Impossible de convertir l'image: ${fallbackError}`));
        }
      }
    };
    
    img.onerror = () => {
      reject(new Error('Erreur lors du chargement de l\'image'));
    };
  });
};

// Fonction utilitaire pour convertir UserProfile (Supabase) en User (types locaux)
const convertUserProfileToUser = (userProfile: any, session: any): User | null => {
  if (!userProfile || !session) return null;
  
  // Mapper le plan de Supabase vers PlanType
  const planMap: Record<string, PlanType> = {
    'guest': PlanType.GUEST,
    'free': PlanType.FREE,
    'essential': PlanType.ESSENTIAL,
    'pro': PlanType.PRO,
    'lifetime': PlanType.LIFETIME,
  };

  return {
    id: userProfile.id || session.user.id,
    name: userProfile.full_name || session.user.email?.split('@')[0] || 'Utilisateur',
    email: userProfile.email || session.user.email || '',
    plan: planMap[userProfile.plan] || PlanType.FREE,
    usageCount: userProfile.credits || 0,
    avatar: userProfile.avatar_url || undefined,
  };
};

function App() {
  // Utiliser le contexte d'authentification Supabase
  const { session, userProfile, loading: authLoading, signInWithGoogle, signOut } = useAuth();
  
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [originalSlides, setOriginalSlides] = useState<string[]>([]); // Slides originales du PDF
  const [processedSlides, setProcessedSlides] = useState<string[]>([]); // Slides traitées avec masques
  const [isConverting, setIsConverting] = useState(false);
  
  // Convertir userProfile en User pour la compatibilité
  const user = convertUserProfileToUser(userProfile, session);
  
  // Garder guestUsage pour les utilisateurs non connectés
  const [guestUsage, setGuestUsage] = useState<number>(() => {
    return parseInt(localStorage.getItem('sc_guest_usage') || '0');
  });

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  // Sauvegarder guestUsage dans localStorage
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
      setOriginalSlides(images);
      setProcessedSlides([]); // Réinitialiser les slides traitées
      setStatus(AppStatus.EDITING);
    } catch (error) {
      console.error("Erreur lors de la conversion PDF:", error);
      alert("Erreur lors de la conversion du PDF. Veuillez réessayer.");
      setFile(null);
    } finally {
      setIsConverting(false);
    }
  };

  // Gestionnaire pour traiter UNE SEULE slide
  const handleApplySingle = async (index: number, options: ProcessOptions) => {
    if (!checkLimits()) return;
    
    setStatus(AppStatus.PROCESSING);
    setProgress(0);
    
    try {
      // Traiter uniquement cette slide avec rognage et conversion
      const processedImage = await processSlideWithCrop(originalSlides[index], options);
      
      // Mettre à jour le compteur d'utilisation
      // Note: Dans une vraie app, on mettrait à jour le profil dans Supabase ici
      if (!user) {
        setGuestUsage(prev => prev + 1);
      }
      
      // Passer à la vue résultat avec UNE SEULE image dans le tableau
      setProcessedSlides([processedImage]);
      setStatus(AppStatus.COMPLETE);
    } catch (error) {
      console.error("Erreur lors du traitement de la slide:", error);
      alert("Une erreur est survenue lors du traitement. Veuillez réessayer.");
      setStatus(AppStatus.EDITING);
    }
  };

  // Gestionnaire pour traiter TOUTES les slides
  const handleApplyAll = async (options: ProcessOptions) => {
    if (!checkLimits()) return;
    
    setStatus(AppStatus.PROCESSING);
    setProgress(0);
    
    try {
      // Traiter toutes les slides en parallèle avec les mêmes options de rognage et format
      const newSlides = await Promise.all(
        originalSlides.map((slide) => 
          processSlideWithCrop(slide, options)
        )
      );
      
      // Mettre à jour le compteur d'utilisation
      // Note: Dans une vraie app, on mettrait à jour le profil dans Supabase ici
      if (!user) {
        setGuestUsage(prev => prev + 1);
      }
      
      setProcessedSlides(newSlides);
      setStatus(AppStatus.COMPLETE);
    } catch (error) {
      console.error("Erreur lors du traitement des slides:", error);
      alert("Une erreur est survenue lors du traitement. Veuillez réessayer.");
      setStatus(AppStatus.EDITING);
    }
  };

  const handleReset = () => {
    setStatus(AppStatus.IDLE);
    setProgress(0);
    setFile(null);
    setOriginalSlides([]);
    setProcessedSlides([]);
  };

  const handleLogin = async () => {
    await signInWithGoogle();
    setShowAuthModal(false);
  };

  const handleLogout = async () => {
    await signOut();
    setCurrentView(View.HOME);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case View.PRICING:
        return <Pricing user={user} onUpgrade={() => setShowAuthModal(true)} />;
      case View.ACCOUNT:
        return user ? <Account user={user} onLogout={handleLogout} /> : null;
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

            {status === AppStatus.EDITING && originalSlides.length > 0 && (
              <MagicEditor 
                slides={originalSlides}
                onApplySingle={handleApplySingle}
                onApplyAll={handleApplyAll}
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
              <Results fileName={file?.name || 'Slides'} slides={processedSlides} onReset={handleReset} />
            )}
          </div>
        );
    }
  };

  // Afficher un écran de chargement pendant la vérification de l'authentification
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-anthracite">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-gold/20 border-t-gold rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-sm font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

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
        {/* Ajouter la FAQ ici pour qu'elle soit visible sur la home */}
        {currentView === View.HOME && status === AppStatus.IDLE && <FAQ />}
      </main>
      <Footer />
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => { setShowAuthModal(false); setLimitReached(false); }} 
          onLogin={handleLogin}
          limitReached={limitReached}
        />
      )}
    </div>
  );
}

export default App;
