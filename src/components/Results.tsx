import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { handleSmartExport, handleSmartExportZip } from '../utils/smartExport';

interface ResultsProps {
  fileName: string;
  slides: string[]; // Les images (Data URLs)
  onReset: () => void;
}

/**
 * Extrait l'extension de fichier depuis une DataURL en analysant le mime type
 * @param dataUrl - La DataURL de l'image (ex: "data:image/png;base64,...")
 * @returns L'extension de fichier correspondante (.jpg, .png, .webp)
 */
const getExtensionFromDataUrl = (dataUrl: string): string => {
  // Extraire le mime type depuis la DataURL
  // Format: "data:image/png;base64,..." ou "data:image/jpeg;base64,..."
  const mimeMatch = dataUrl.match(/data:image\/([^;]+);/);
  
  if (!mimeMatch) {
    // Par défaut, retourner .jpg si le mime type n'est pas trouvé
    return '.jpg';
  }
  
  const mimeType = mimeMatch[1].toLowerCase();
  
  // Mapper le mime type à l'extension
  switch (mimeType) {
    case 'jpeg':
    case 'jpg':
      return '.jpg';
    case 'png':
      return '.png';
    case 'webp':
      return '.webp';
    default:
      return '.jpg';
  }
};

/**
 * Détecte le format principal utilisé dans les slides
 * @param slides - Tableau de DataURLs
 * @returns Le format détecté ('JPEG', 'PNG', ou 'WEBP')
 */
const detectFormat = (slides: string[]): 'JPEG' | 'PNG' | 'WEBP' => {
  if (!slides || slides.length === 0) return 'JPEG';
  
  // Analyser le premier slide (ou tous si on veut être plus précis)
  const firstSlide = slides[0];
  const mimeMatch = firstSlide.match(/data:image\/([^;]+);/);
  
  if (!mimeMatch) return 'JPEG';
  
  const mimeType = mimeMatch[1].toLowerCase();
  
  switch (mimeType) {
    case 'png':
      return 'PNG';
    case 'webp':
      return 'WEBP';
    case 'jpeg':
    case 'jpg':
    default:
      return 'JPEG';
  }
};

/**
 * Génère le texte descriptif selon le format
 * @param format - Le format détecté
 * @param isSingle - Si c'est une seule slide ou plusieurs
 * @returns Le texte descriptif adapté
 */
const getFormatDescription = (format: 'JPEG' | 'PNG' | 'WEBP', isSingle: boolean): string => {
  const formatNames: Record<'JPEG' | 'PNG' | 'WEBP', string> = {
    JPEG: 'JPEG',
    PNG: 'PNG',
    WEBP: 'WEBP'
  };
  
  const formatDescriptions: Record<'JPEG' | 'PNG' | 'WEBP', { single: string; multiple: string }> = {
    JPEG: {
      single: "Votre slide a été traitée. L'image est en format JPEG haute qualité, prête à être réinsérée dans PowerPoint ou Keynote.",
      multiple: "Toutes les slides ont été traitées. L'archive ZIP contient vos images en format JPEG haute qualité, prêtes à être réinsérées dans PowerPoint ou Keynote."
    },
    PNG: {
      single: "Votre slide a été traitée. L'image est en format PNG sans perte, idéale pour l'édition et la réinsertion dans PowerPoint ou Keynote.",
      multiple: "Toutes les slides ont été traitées. L'archive ZIP contient vos images en format PNG sans perte, idéales pour l'édition et la réinsertion dans PowerPoint ou Keynote."
    },
    WEBP: {
      single: "Votre slide a été traitée. L'image est en format WEBP optimisé, prête à être réinsérée dans PowerPoint ou Keynote.",
      multiple: "Toutes les slides ont été traitées. L'archive ZIP contient vos images en format WEBP optimisé, prêtes à être réinsérées dans PowerPoint ou Keynote."
    }
  };
  
  return formatDescriptions[format][isSingle ? 'single' : 'multiple'];
};

export const Results: React.FC<ResultsProps> = ({ fileName, slides, onReset }) => {
  const [isZipping, setIsZipping] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const [validatedImages, setValidatedImages] = useState<Set<number>>(new Set());
  const [validatingImages, setValidatingImages] = useState<Set<number>>(new Set());
  const isSingle = slides.length === 1;
  
  // Détecter le format utilisé
  const detectedFormat = detectFormat(slides);

  // Valider qu'une data URL est valide (format)
  const isValidDataUrl = (dataUrl: string): boolean => {
    if (!dataUrl || typeof dataUrl !== 'string') return false;
    // Vérifier le format de base d'une data URL
    const dataUrlPattern = /^data:image\/(png|jpeg|jpg|webp);base64,/i;
    if (!dataUrlPattern.test(dataUrl)) return false;
    // Vérifier que la partie base64 existe et n'est pas vide
    const base64Part = dataUrl.split(',')[1];
    return base64Part && base64Part.length > 100; // Minimum 100 caractères pour une vraie image
  };

  // Valider qu'une image peut être chargée et a des dimensions valides
  const validateImage = async (index: number, dataUrl: string): Promise<boolean> => {
    return new Promise((resolve) => {
      // Si déjà validée ou en cours de validation, ne pas re-valider
      if (validatedImages.has(index) || validatingImages.has(index)) {
        resolve(validatedImages.has(index));
        return;
      }

      setValidatingImages(prev => new Set(prev).add(index));

      const img = new Image();
      let resolved = false;

      const cleanup = () => {
        if (!resolved) {
          resolved = true;
          img.onload = null;
          img.onerror = null;
        }
      };

      img.onload = () => {
        cleanup();
        // Vérifier que l'image a des dimensions valides (au moins 10x10 pixels)
        if (img.width > 10 && img.height > 10 && img.naturalWidth > 10 && img.naturalHeight > 10) {
          setValidatedImages(prev => new Set(prev).add(index));
          setValidatingImages(prev => {
            const next = new Set(prev);
            next.delete(index);
            return next;
          });
          resolve(true);
        } else {
          console.error(`Image ${index + 1} a des dimensions invalides: ${img.width}x${img.height}`);
          setFailedImages(prev => new Set(prev).add(index));
          setValidatingImages(prev => {
            const next = new Set(prev);
            next.delete(index);
            return next;
          });
          resolve(false);
        }
      };

      img.onerror = () => {
        cleanup();
        console.error(`Erreur de chargement de l'image ${index + 1}`);
        setFailedImages(prev => new Set(prev).add(index));
        setValidatingImages(prev => {
          const next = new Set(prev);
          next.delete(index);
          return next;
        });
        resolve(false);
      };

      // Timeout après 5 secondes
      setTimeout(() => {
        if (!resolved) {
          cleanup();
          console.error(`Timeout lors de la validation de l'image ${index + 1}`);
          setFailedImages(prev => new Set(prev).add(index));
          setValidatingImages(prev => {
            const next = new Set(prev);
            next.delete(index);
            return next;
          });
          resolve(false);
        }
      }, 5000);

      img.src = dataUrl;
    });
  };

  // Valider toutes les images au montage du composant et quand les slides changent
  useEffect(() => {
    // Réinitialiser les états de validation quand les slides changent
    setValidatedImages(new Set());
    setFailedImages(new Set());
    setValidatingImages(new Set());

    // Valider chaque slide
    slides.forEach((slide, index) => {
      if (isValidDataUrl(slide)) {
        validateImage(index, slide);
      } else {
        setFailedImages(prev => new Set(prev).add(index));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length]);

  // Gestionnaire d'erreur pour les images
  const handleImageError = (index: number) => {
    console.error(`Erreur de chargement de l'image ${index + 1}`);
    setFailedImages(prev => new Set(prev).add(index));
    setValidatedImages(prev => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
    // Fermer la lightbox si l'image actuelle échoue
    if (lightboxOpen && lightboxIndex === index) {
      setLightboxOpen(false);
    }
  };

  // Ouvrir la lightbox avec l'index de la slide cliquée
  const openLightbox = async (index: number) => {
    // Vérifier que l'image est valide avant d'ouvrir la lightbox
    if (!slides[index] || !isValidDataUrl(slides[index]) || failedImages.has(index)) {
      console.error(`Impossible d'ouvrir la slide ${index + 1}: image invalide ou corrompue`);
      alert(`La slide ${index + 1} est corrompue et ne peut pas être affichée.`);
      return;
    }

    // S'assurer que l'image est validée avant d'ouvrir
    if (!validatedImages.has(index)) {
      const isValid = await validateImage(index, slides[index]);
      if (!isValid) {
        alert(`La slide ${index + 1} est corrompue et ne peut pas être affichée.`);
        return;
      }
    }

    // Nettoyer tout filtre résiduel avant d'ouvrir
    document.body.style.filter = '';
    
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Fermer la lightbox
  const closeLightbox = () => {
    setLightboxOpen(false);
    // Forcer la suppression de tout overlay résiduel
    document.body.style.overflow = '';
    document.body.style.filter = '';
  };

  // Navigation dans la lightbox
  const goToPrevious = () => {
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
  };

  const goToNext = () => {
    setLightboxIndex((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
  };

  // Gestion des raccourcis clavier
  useEffect(() => {
    if (!lightboxOpen) {
      // Nettoyer les styles au cas où la lightbox serait fermée autrement
      document.body.style.overflow = '';
      document.body.style.filter = '';
      return;
    }

    // Empêcher le scroll du body quand la lightbox est ouverte
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // Nettoyer les styles à la fermeture
      document.body.style.overflow = '';
      document.body.style.filter = '';
    };
  }, [lightboxOpen, slides.length]);

  // Protection contre les slides undefined ou vides
  if (!slides || slides.length === 0) {
    return (
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="bg-anthracite-light rounded-[2.5rem] border border-anthracite-lighter p-16 text-center space-y-8">
          <div className="w-24 h-24 border-4 border-gold/20 rounded-full mx-auto flex items-center justify-center">
            <svg className="w-12 h-12 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-white uppercase tracking-widest">Aucune slide disponible</h3>
            <p className="text-slate-400 text-sm font-medium">Il n'y a pas de slides à afficher.</p>
            <button 
              onClick={onReset}
              className="px-8 py-4 bg-gold text-anthracite rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-gold-light transition-all"
            >
              Nouvelle analyse
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleDownload = async () => {
    if (isSingle) {
      // Export intelligent d'une image unique (partage sur mobile, téléchargement sur desktop)
      try {
        // Convertir le data URL en blob
        const response = await fetch(slides[0]);
        const blob = await response.blob();
        
        // Détecter l'extension depuis la DataURL
        const extension = getExtensionFromDataUrl(slides[0]);
        const filename = `Slide_Cleaned${extension}`;
        
        // Utiliser l'export intelligent (partage sur mobile, téléchargement sur desktop)
        await handleSmartExport(blob, filename);
      } catch (error) {
        console.error("Erreur lors de l'export de l'image", error);
        alert("Une erreur est survenue lors de l'export.");
      }
    } else {
      // Export intelligent ZIP pour plusieurs slides
      setIsZipping(true);
      const zip = new JSZip();
      
      // Création du dossier dans le zip
      const folder = zip.folder("SmartBookLM_Cleaned");

      // Ajout de chaque image au zip
      if (!slides || slides.length === 0) {
        alert("Aucune slide à exporter.");
        setIsZipping(false);
        return;
      }

      slides.forEach((slideDataUrl, index) => {
        // On retire l'en-tête "data:image/xxx;base64," pour avoir le binaire pur
        const base64Data = slideDataUrl.split(',')[1];
        
        // Détecter l'extension depuis la DataURL pour chaque slide
        const extension = getExtensionFromDataUrl(slideDataUrl);
        
        if (folder) {
          // On nomme les fichiers avec la bonne extension (slide_1.jpg, slide_2.png, etc.)
          folder.file(`slide_${index + 1}${extension}`, base64Data, { base64: true });
        }
      });

      try {
        // Génération du ZIP
        const content = await zip.generateAsync({ type: "blob" });
        const filename = `${fileName.replace(/\.[^/.]+$/, "")}_SmartClean.zip`;
        
        // Utiliser l'export intelligent (partage sur mobile, téléchargement sur desktop)
        await handleSmartExportZip(content, filename);
      } catch (error) {
        console.error("Erreur lors de la création du zip", error);
        alert("Une erreur est survenue lors de la création de l'archive.");
      } finally {
        setIsZipping(false);
      }
    }
  };

  return (
    <div 
      className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000"
          style={{
            filter: 'none',
            mixBlendMode: 'normal',
            isolation: 'isolate',
            position: 'relative',
            zIndex: 1
          } as React.CSSProperties}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-anthracite-lighter pb-12">
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-white truncate max-w-md tracking-tight">
            {fileName}
          </h3>
          <p className="text-[11px] text-gold font-black uppercase tracking-[0.2em] flex items-center">
            <span className="w-2 h-2 bg-gold rounded-full mr-2 shadow-[0_0_8px_#C5A059]"></span>
            Prêt à l'export
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={onReset}
            className="px-8 py-4 text-[11px] font-black text-slate-400 hover:text-white uppercase tracking-widest rounded-2xl transition-all hover:bg-anthracite"
          >
            Nouvelle analyse
          </button>
          
          <button 
            onClick={handleDownload}
            disabled={isZipping}
            className={`flex items-center justify-center px-10 py-4 bg-gold text-anthracite rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-gold-light transition-all shadow-2xl shadow-gold/20 active:scale-95 ${isZipping ? 'opacity-70 cursor-wait' : ''}`}
          >
            {isZipping ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-anthracite" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Compression...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {isSingle ? "Télécharger l'Image" : "Exporter l'Archive (ZIP)"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Affichage des slides : grille pour plusieurs, grande image pour une seule */}
      {isSingle ? (
        <div className="flex justify-center">
          <div 
            className="max-w-4xl w-full group relative bg-anthracite rounded-3xl overflow-hidden border border-anthracite-lighter shadow-2xl"
            style={{
              filter: 'none',
              mixBlendMode: 'normal',
              isolation: 'isolate'
            } as React.CSSProperties}
          >
            {slides[0] && isValidDataUrl(slides[0]) && !failedImages.has(0) && validatedImages.has(0) ? (
              <img 
                src={slides[0]} 
                alt="Slide nettoyée"
                className="w-full h-auto object-contain"
                style={{
                  filter: 'none',
                  mixBlendMode: 'normal',
                  isolation: 'isolate',
                  imageRendering: 'auto'
                } as React.CSSProperties}
                onError={() => handleImageError(0)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-16 min-h-[400px]">
                {validatingImages.has(0) ? (
                  <>
                    <div className="w-16 h-16 border-4 border-gold/20 border-t-gold rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400 text-sm font-medium">Validation de l'image...</p>
                  </>
                ) : (
                  <>
                    <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-slate-400 text-sm font-medium">Image corrompue ou invalide</p>
                    {failedImages.has(0) && (
                      <p className="text-red-400 text-xs font-medium mt-2">Erreur de chargement de l'image</p>
                    )}
                  </>
                )}
              </div>
            )}
            <div className="absolute top-4 right-4 px-3 py-1.5 bg-gold text-anthracite rounded-lg text-[10px] font-black uppercase tracking-widest shadow-xl">
              Clean
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {slides.map((slide, i) => {
            const isValid = isValidDataUrl(slide) && !failedImages.has(i) && validatedImages.has(i);
            const isValidating = validatingImages.has(i);
            return (
            <div 
              key={i} 
              onClick={() => isValid && openLightbox(i)}
              className={`group relative aspect-[16/10] bg-anthracite rounded-3xl overflow-hidden border border-anthracite-lighter transition-all duration-500 hover:border-gold/50 hover:scale-[1.05] shadow-xl ${isValid ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
            >
              {/* Image réelle - contrainte dans la card */}
              {isValid ? (
                <img 
                  src={slide} 
                  alt={`Slide ${i + 1}`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  style={{
                    filter: 'none',
                    mixBlendMode: 'normal',
                    isolation: 'isolate',
                    imageRendering: 'auto'
                  } as React.CSSProperties}
                  onError={() => handleImageError(i)}
                />
              ) : isValidating ? (
                <div className="absolute inset-0 flex items-center justify-center bg-anthracite/50">
                  <div className="text-center p-4">
                    <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-slate-500 text-xs font-medium">Validation...</p>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-anthracite/50">
                  <div className="text-center p-4">
                    <svg className="w-12 h-12 text-slate-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-slate-500 text-xs font-medium">Image corrompue</p>
                  </div>
                </div>
              )}
              
              {/* Numéro de slide */}
              <div className="absolute top-2 left-2 px-2 py-1 bg-anthracite/80 backdrop-blur text-white rounded-lg text-[8px] font-black uppercase tracking-widest border border-white/10 z-10">
                #{i + 1}
              </div>

              {/* Overlay au survol */}
              <div 
                className="absolute inset-0 bg-anthracite/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10 pointer-events-none"
                style={{
                  filter: 'none',
                  mixBlendMode: 'normal'
                } as React.CSSProperties}
              >
                <span className="text-gold font-black text-xs uppercase tracking-widest transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  Cliquer pour agrandir
                </span>
              </div>
              
              {/* Badge Purifié */}
              <div className="absolute top-2 right-2 px-2 py-1 bg-gold text-anthracite rounded-lg text-[8px] font-black uppercase tracking-widest shadow-xl z-10">
                Clean
              </div>
              
              <div 
                className="absolute inset-0 border-2 border-gold/0 group-hover:border-gold/20 rounded-3xl transition-all pointer-events-none"
                style={{
                  filter: 'none',
                  mixBlendMode: 'normal'
                } as React.CSSProperties}
              ></div>
            </div>
          );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center bg-anthracite/95 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={closeLightbox}
          style={{ 
            backgroundColor: 'rgba(18, 20, 23, 0.95)',
            backdropFilter: 'blur(8px)'
          } as React.CSSProperties}
        >
          {/* Bouton fermer */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 w-12 h-12 bg-anthracite-light border border-anthracite-lighter rounded-xl flex items-center justify-center text-white hover:bg-gold hover:text-anthracite hover:border-gold transition-all duration-300 z-30"
            aria-label="Fermer"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Conteneur de l'image - empêche la fermeture au clic sur l'image */}
          <div 
            className="relative flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '90vh' }}
          >
            {/* Flèche précédente */}
            {slides.length > 1 && (
              <button
                onClick={goToPrevious}
                className="absolute left-4 md:left-8 w-12 h-12 bg-anthracite-light border border-anthracite-lighter rounded-xl flex items-center justify-center text-white hover:bg-gold hover:text-anthracite hover:border-gold transition-all duration-300 z-30 shadow-2xl"
                aria-label="Slide précédente"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Image principale */}
            <div 
              className="relative bg-anthracite rounded-3xl overflow-hidden border border-anthracite-lighter shadow-2xl inline-block max-w-full max-h-[85vh]"
              style={{
                filter: 'none',
                mixBlendMode: 'normal',
                isolation: 'isolate'
              } as React.CSSProperties}
            >
              {slides[lightboxIndex] && 
               isValidDataUrl(slides[lightboxIndex]) && 
               !failedImages.has(lightboxIndex) && 
               validatedImages.has(lightboxIndex) ? (
                <img 
                  src={slides[lightboxIndex]} 
                  alt={`Slide ${lightboxIndex + 1}`}
                  className="block w-auto h-auto max-w-full max-h-[85vh]"
                  style={{ 
                    imageRendering: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                    filter: 'none',
                    mixBlendMode: 'normal',
                    isolation: 'isolate',
                    zIndex: 1,
                    position: 'relative'
                  } as React.CSSProperties}
                  draggable={false}
                  loading="eager"
                  onError={() => handleImageError(lightboxIndex)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-16 min-w-[400px] min-h-[300px]">
                  {validatingImages.has(lightboxIndex) ? (
                    <>
                      <div className="w-16 h-16 border-4 border-gold/20 border-t-gold rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-slate-400 text-sm font-medium">Validation de l'image...</p>
                    </>
                  ) : (
                    <>
                      <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="text-slate-400 text-sm font-medium">Image corrompue ou invalide</p>
                      <button
                        onClick={closeLightbox}
                        className="mt-4 px-6 py-2 bg-gold text-anthracite rounded-lg text-xs font-black uppercase tracking-widest hover:bg-gold-light transition-all"
                      >
                        Fermer
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Flèche suivante */}
            {slides.length > 1 && (
              <button
                onClick={goToNext}
                className="absolute right-4 md:right-8 w-12 h-12 bg-anthracite-light border border-anthracite-lighter rounded-xl flex items-center justify-center text-white hover:bg-gold hover:text-anthracite hover:border-gold transition-all duration-300 z-30 shadow-2xl"
                aria-label="Slide suivante"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      <div className="bg-gold/5 border border-gold/10 rounded-3xl p-8 flex items-start space-x-6">
        <div className="p-3 bg-gold text-anthracite rounded-xl shadow-lg shrink-0">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="space-y-1">
          <h4 className="text-white font-black text-sm uppercase tracking-widest">Note Technique</h4>
          <p className="text-sm text-slate-400 leading-relaxed font-medium">
            {getFormatDescription(detectedFormat, isSingle)}
          </p>
        </div>
      </div>
    </div>
  );
};