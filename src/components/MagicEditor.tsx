import React, { useState, useRef, useEffect } from 'react';

interface CropOptions {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface ProcessOptions {
  crop: CropOptions;
  format: 'JPEG' | 'PNG' | 'WEBP';
  removeWatermark?: boolean;
}

interface MagicEditorProps {
  slides: string[];
  onApplySingle: (index: number, options: ProcessOptions) => void;
  onApplyAll: (options: ProcessOptions) => void;
  onCancel: () => void;
}

export const MagicEditor: React.FC<MagicEditorProps> = ({ slides, onApplySingle, onApplyAll, onCancel }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // États de rognage (en pixels)
  const [cropTop, setCropTop] = useState(0);
  const [cropBottom, setCropBottom] = useState(0);
  const [cropLeft, setCropLeft] = useState(0);
  const [cropRight, setCropRight] = useState(0);
  
  // État de format de sortie
  const [outputFormat, setOutputFormat] = useState<'JPEG' | 'PNG' | 'WEBP'>('JPEG');
  
  // État pour l'effaceur magique de filigrane
  const [isMagicRemovalEnabled, setIsMagicRemovalEnabled] = useState(false);
  
  // Référence pour obtenir les dimensions de l'image affichée
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0, displayWidth: 0, displayHeight: 0 });

  // Calculer les dimensions et le ratio d'échelle
  useEffect(() => {
    if (imageRef.current) {
      const img = imageRef.current;
      const displayWidth = img.clientWidth;
      const displayHeight = img.clientHeight;
      
      img.onload = () => {
        setImageDimensions({
          width: img.naturalWidth,
          height: img.naturalHeight,
          displayWidth: displayWidth,
          displayHeight: displayHeight
        });
      };
      
      // Si l'image est déjà chargée
      if (img.complete) {
        setImageDimensions({
          width: img.naturalWidth,
          height: img.naturalHeight,
          displayWidth: displayWidth,
          displayHeight: displayHeight
        });
      }
    }
  }, [currentIndex, slides]);

  // Réinitialiser les valeurs de rognage lors du changement de slide
  useEffect(() => {
    setCropTop(0);
    setCropBottom(0);
    setCropLeft(0);
    setCropRight(0);
  }, [currentIndex]);

  // Calculer les ratios pour convertir les pixels d'affichage en pixels réels
  const getScaleRatio = () => {
    if (imageDimensions.width === 0 || imageDimensions.displayWidth === 0) return 1;
    return imageDimensions.width / imageDimensions.displayWidth;
  };

  // Convertir les valeurs d'affichage en pixels réels
  const convertToRealPixels = (displayPixels: number) => {
    return Math.round(displayPixels * getScaleRatio());
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) setCurrentIndex(c => c + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(c => c - 1);
  };

  // Actions de traitement
  const handleSingleExport = () => {
    const options: ProcessOptions = {
      crop: {
        top: convertToRealPixels(cropTop),
        bottom: convertToRealPixels(cropBottom),
        left: convertToRealPixels(cropLeft),
        right: convertToRealPixels(cropRight)
      },
      format: outputFormat,
      removeWatermark: isMagicRemovalEnabled
    };
    onApplySingle(currentIndex, options);
  };

  const handleAllExport = () => {
    const options: ProcessOptions = {
      crop: {
        top: convertToRealPixels(cropTop),
        bottom: convertToRealPixels(cropBottom),
        left: convertToRealPixels(cropLeft),
        right: convertToRealPixels(cropRight)
      },
      format: outputFormat,
      removeWatermark: isMagicRemovalEnabled
    };
    onApplyAll(options);
  };

  // Calculer les positions des overlays en pourcentage
  const overlayTop = (cropTop / imageDimensions.displayHeight) * 100;
  const overlayBottom = (cropBottom / imageDimensions.displayHeight) * 100;
  const overlayLeft = (cropLeft / imageDimensions.displayWidth) * 100;
  const overlayRight = (cropRight / imageDimensions.displayWidth) * 100;

  return (
    <div className="bg-anthracite-light rounded-[2.5rem] border border-anthracite-lighter overflow-hidden shadow-2xl flex flex-col h-full">
      {/* Header */}
      <div className="px-8 py-6 border-b border-anthracite-lighter flex justify-between items-center bg-anthracite/50 backdrop-blur-md">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/20">
            <span className="font-black text-gold text-lg">{currentIndex + 1}</span>
          </div>
          <div>
            <h3 className="font-black text-white text-lg tracking-tight">Éditeur Crop & Convert</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              Slide {currentIndex + 1} sur {slides.length}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-anthracite rounded-xl p-1 border border-anthracite-lighter">
          <button 
            onClick={handlePrev} 
            disabled={currentIndex === 0} 
            className="p-3 hover:bg-anthracite-light rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white"
          >
            ←
          </button>
          <div className="w-px h-6 bg-anthracite-lighter"></div>
          <button 
            onClick={handleNext} 
            disabled={currentIndex === slides.length - 1} 
            className="p-3 hover:bg-anthracite-light rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white"
          >
            →
          </button>
        </div>
      </div>
      
      {/* Zone d'image avec overlays de rognage */}
      <div className="relative flex-grow bg-anthracite overflow-hidden flex items-center justify-center p-8">
        <div className="relative shadow-2xl border border-anthracite-lighter inline-block">
          {/* L'image principale */}
          <img 
            ref={imageRef}
            src={slides[currentIndex]} 
            alt="Slide" 
            className="max-h-[55vh] pointer-events-none select-none"
            onLoad={(e) => {
              const img = e.currentTarget;
              setImageDimensions({
                width: img.naturalWidth,
                height: img.naturalHeight,
                displayWidth: img.clientWidth,
                displayHeight: img.clientHeight
              });
            }}
          />
          
          {/* Overlays semi-transparents rouges pour visualiser les zones rognées */}
          {/* Overlay Haut */}
          {cropTop > 0 && (
            <div 
              className="absolute top-0 left-0 bg-red-500/40 pointer-events-none"
              style={{
                left: `${overlayLeft}%`,
                width: `${100 - overlayLeft - overlayRight}%`,
                height: `${overlayTop}%`
              }}
            />
          )}
          
          {/* Overlay Bas */}
          {cropBottom > 0 && (
            <div 
              className="absolute bottom-0 left-0 bg-red-500/40 pointer-events-none"
              style={{
                left: `${overlayLeft}%`,
                width: `${100 - overlayLeft - overlayRight}%`,
                height: `${overlayBottom}%`
              }}
            />
          )}
          
          {/* Overlay Gauche */}
          {cropLeft > 0 && (
            <div 
              className="absolute top-0 left-0 bg-red-500/40 pointer-events-none"
              style={{
                width: `${overlayLeft}%`,
                height: '100%'
              }}
            />
          )}
          
          {/* Overlay Droite */}
          {cropRight > 0 && (
            <div 
              className="absolute top-0 right-0 bg-red-500/40 pointer-events-none"
              style={{
                width: `${overlayRight}%`,
                height: '100%'
              }}
            />
          )}
        </div>
      </div>

      {/* Footer avec contrôles de rognage et format */}
      <div className="px-8 py-6 bg-anthracite/30 border-t border-anthracite-lighter space-y-6">
        {/* Section Intelligence Artificielle */}
        <div className="bg-anthracite-light border border-gold/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="magicRemoval"
              checked={isMagicRemovalEnabled}
              onChange={(e) => setIsMagicRemovalEnabled(e.target.checked)}
              className="w-4 h-4 accent-gold rounded cursor-pointer"
            />
            <label htmlFor="magicRemoval" className="text-white text-sm font-bold cursor-pointer">
              ✨ Effaceur Magique NotebookLM
            </label>
          </div>
          <p className="text-slate-400 text-xs ml-7">
            Reconstruit le fond derrière le logo automatiquement.
          </p>
        </div>

        {/* Contrôles de rognage */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Crop Top */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">
              Haut: {convertToRealPixels(cropTop)}px
            </label>
            <input 
              type="range" 
              min="0" 
              max={imageDimensions.displayHeight || 1000} 
              value={cropTop} 
              onChange={(e) => setCropTop(Number(e.target.value))}
              className="w-full accent-gold h-1 bg-anthracite-lighter rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          {/* Crop Bottom */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">
              Bas: {convertToRealPixels(cropBottom)}px
            </label>
            <input 
              type="range" 
              min="0" 
              max={imageDimensions.displayHeight || 1000} 
              value={cropBottom} 
              onChange={(e) => setCropBottom(Number(e.target.value))}
              className="w-full accent-gold h-1 bg-anthracite-lighter rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          {/* Crop Left */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">
              Gauche: {convertToRealPixels(cropLeft)}px
            </label>
            <input 
              type="range" 
              min="0" 
              max={imageDimensions.displayWidth || 1000} 
              value={cropLeft} 
              onChange={(e) => setCropLeft(Number(e.target.value))}
              className="w-full accent-gold h-1 bg-anthracite-lighter rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          {/* Crop Right */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">
              Droite: {convertToRealPixels(cropRight)}px
            </label>
            <input 
              type="range" 
              min="0" 
              max={imageDimensions.displayWidth || 1000} 
              value={cropRight} 
              onChange={(e) => setCropRight(Number(e.target.value))}
              className="w-full accent-gold h-1 bg-anthracite-lighter rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Sélecteur de format et boutons d'action */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
              Format:
            </label>
            <select 
              value={outputFormat} 
              onChange={(e) => setOutputFormat(e.target.value as 'JPEG' | 'PNG' | 'WEBP')}
              className="px-4 py-2 bg-anthracite border border-anthracite-lighter rounded-xl text-white text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-gold cursor-pointer"
            >
              <option value="JPEG">JPEG</option>
              <option value="PNG">PNG</option>
              <option value="WEBP">WEBP</option>
            </select>
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={onCancel}
              className="px-6 py-3 rounded-xl text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Annuler
            </button>
            <button 
              onClick={handleSingleExport}
              className="px-6 py-3 rounded-xl border border-gold/20 text-gold hover:bg-gold/10 text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Traiter cette slide
            </button>
            <button 
              onClick={handleAllExport}
              className="px-8 py-3 rounded-xl bg-gold text-anthracite hover:bg-gold-light shadow-lg shadow-gold/10 text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Tout Traiter (ZIP)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
