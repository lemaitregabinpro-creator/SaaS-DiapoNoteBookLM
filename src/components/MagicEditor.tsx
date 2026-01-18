import React, { useState, useRef, useEffect } from 'react';
import { ProcessOptions, ImageFormat } from '../types';

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
  
  // État de format de sortie - Récupère le format depuis localStorage ou utilise JPEG par défaut
  const [outputFormat, setOutputFormat] = useState<ImageFormat>(() => {
    const saved = localStorage.getItem('smartbooklm_default_format');
    return (saved as ImageFormat) || 'JPEG';
  });
  
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
    <div className="bg-anthracite-light rounded-2xl md:rounded-[2.5rem] border border-anthracite-lighter overflow-hidden shadow-2xl flex flex-col h-full">
      {/* Header */}
      <div className="px-4 md:px-8 py-4 md:py-6 border-b border-anthracite-lighter flex justify-between items-center bg-anthracite/50 backdrop-blur-md">
        <div className="flex items-center space-x-2 md:space-x-4 flex-1 min-w-0">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gold/10 flex items-center justify-center border border-gold/20 flex-shrink-0">
            <span className="font-black text-gold text-sm md:text-lg">{currentIndex + 1}</span>
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-white text-sm md:text-lg tracking-tight truncate">Éditeur Crop & Convert</h3>
            <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              Slide {currentIndex + 1} sur {slides.length}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1 md:space-x-2 bg-anthracite rounded-lg md:rounded-xl p-1 border border-anthracite-lighter flex-shrink-0">
          <button 
            onClick={handlePrev} 
            disabled={currentIndex === 0} 
            className="p-2 md:p-3 hover:bg-anthracite-light rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Slide précédente"
          >
            ←
          </button>
          <div className="w-px h-4 md:h-6 bg-anthracite-lighter"></div>
          <button 
            onClick={handleNext} 
            disabled={currentIndex === slides.length - 1} 
            className="p-2 md:p-3 hover:bg-anthracite-light rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Slide suivante"
          >
            →
          </button>
        </div>
      </div>
      
      {/* Zone d'image avec overlays de rognage */}
      <div className="relative flex-grow bg-anthracite overflow-hidden flex items-center justify-center p-4 md:p-8">
        <div className="relative shadow-2xl border border-anthracite-lighter inline-block w-full max-w-full">
          {/* L'image principale */}
          <img 
            ref={imageRef}
            src={slides[currentIndex]} 
            alt="Slide" 
            className="max-h-[40vh] md:max-h-[55vh] w-auto pointer-events-none select-none mx-auto"
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
      <div className="px-4 md:px-8 py-4 md:py-6 bg-anthracite/30 border-t border-anthracite-lighter space-y-4 md:space-y-6 overflow-y-auto">
        {/* Section Intelligence Artificielle - Version Magique */}
        <div 
          className={`border rounded-lg md:rounded-xl p-3 md:p-4 space-y-2 md:space-y-3 transition-all duration-500 ${
            isMagicRemovalEnabled 
              ? 'magic-active-border border-gold/60' 
              : 'bg-anthracite-light border-gold/30 hover:border-gold/50'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
              <div className="relative flex items-center justify-center flex-shrink-0">
                <input
                  type="checkbox"
                  id="magicRemoval"
                  checked={isMagicRemovalEnabled}
                  onChange={(e) => setIsMagicRemovalEnabled(e.target.checked)}
                  className="peer w-5 h-5 md:w-5 md:h-5 appearance-none border-2 border-slate-500 rounded bg-anthracite checked:bg-gold checked:border-gold transition-all cursor-pointer z-10 min-h-[44px] min-w-[44px] flex items-center justify-center"
                />
                {/* Checkmark SVG custom pour être sûr qu'il est visible */}
                <svg className="absolute w-3 h-3 text-anthracite pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <label 
                htmlFor="magicRemoval" 
                className={`text-xs md:text-sm font-black cursor-pointer transition-all flex-1 min-w-0 ${
                  isMagicRemovalEnabled ? 'magic-text text-sm md:text-lg' : 'text-white'
                }`}
              >
                {isMagicRemovalEnabled ? '✨ EFFACEUR MAGIQUE ACTIVÉ ✨' : '✨ Effaceur Magique NotebookLM'}
              </label>
            </div>
            
            {/* Petit indicateur visuel supplémentaire */}
            {isMagicRemovalEnabled && (
               <span className="flex h-3 w-3 relative flex-shrink-0">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-3 w-3 bg-gold"></span>
               </span>
            )}
          </div>
          
          <p className={`text-[10px] md:text-xs ml-7 md:ml-8 transition-colors ${isMagicRemovalEnabled ? 'text-gold/80' : 'text-slate-400'}`}>
            {isMagicRemovalEnabled 
              ? "L'IA va reconstruire le fond pixel par pixel pour un résultat invisible."
              : "Reconstruit le fond derrière le logo automatiquement."}
          </p>
        </div>

        {/* Contrôles de rognage */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {/* Crop Top */}
          <div className="space-y-1.5 md:space-y-2">
            <label className="text-[10px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest block">
              Haut: {convertToRealPixels(cropTop)}px
            </label>
            <input 
              type="range" 
              min="0" 
              max={imageDimensions.displayHeight || 1000} 
              value={cropTop} 
              onChange={(e) => setCropTop(Number(e.target.value))}
              className="w-full accent-gold h-2 md:h-1 bg-anthracite-lighter rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          {/* Crop Bottom */}
          <div className="space-y-1.5 md:space-y-2">
            <label className="text-[10px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest block">
              Bas: {convertToRealPixels(cropBottom)}px
            </label>
            <input 
              type="range" 
              min="0" 
              max={imageDimensions.displayHeight || 1000} 
              value={cropBottom} 
              onChange={(e) => setCropBottom(Number(e.target.value))}
              className="w-full accent-gold h-2 md:h-1 bg-anthracite-lighter rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          {/* Crop Left */}
          <div className="space-y-1.5 md:space-y-2">
            <label className="text-[10px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest block">
              Gauche: {convertToRealPixels(cropLeft)}px
            </label>
            <input 
              type="range" 
              min="0" 
              max={imageDimensions.displayWidth || 1000} 
              value={cropLeft} 
              onChange={(e) => setCropLeft(Number(e.target.value))}
              className="w-full accent-gold h-2 md:h-1 bg-anthracite-lighter rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          {/* Crop Right */}
          <div className="space-y-1.5 md:space-y-2">
            <label className="text-[10px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest block">
              Droite: {convertToRealPixels(cropRight)}px
            </label>
            <input 
              type="range" 
              min="0" 
              max={imageDimensions.displayWidth || 1000} 
              value={cropRight} 
              onChange={(e) => setCropRight(Number(e.target.value))}
              className="w-full accent-gold h-2 md:h-1 bg-anthracite-lighter rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Section Format de sortie */}
        <div className="bg-anthracite-light border border-gold/30 rounded-lg md:rounded-xl p-3 md:p-4 space-y-2 md:space-y-3">
          <label className="text-[10px] md:text-[9px] font-black text-gold uppercase tracking-widest block">
            Format de sortie
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {(['JPEG', 'PNG', 'WEBP'] as ImageFormat[]).map((format) => (
              <button
                key={format}
                onClick={() => {
                  setOutputFormat(format);
                  // Sauvegarder dans localStorage pour synchroniser avec Account
                  localStorage.setItem('smartbooklm_default_format', format);
                }}
                className={`flex items-center justify-center flex-1 px-3 md:px-4 py-2.5 md:py-3 rounded-lg text-[10px] md:text-[10px] font-black uppercase tracking-widest transition-all min-h-[44px] text-center ${
                  outputFormat === format
                    ? 'bg-gold text-anthracite shadow-lg shadow-gold/20 border border-gold'
                    : 'bg-anthracite text-slate-400 border border-anthracite-lighter hover:border-gold/50 hover:text-white'
                }`}
              >
                {format === 'JPEG' && '📷 JPEG'}
                {format === 'PNG' && '🎨 PNG'}
                {format === 'WEBP' && '⚡ WEBP'}
              </button>
            ))}
          </div>
          <div className="text-[9px] md:text-[9px] text-slate-500 font-medium space-y-1">
            {outputFormat === 'JPEG' && (
              <p>Standard, léger • Idéal pour le partage</p>
            )}
            {outputFormat === 'PNG' && (
              <p>Haute qualité, sans perte • Parfait pour l'édition</p>
            )}
            {outputFormat === 'WEBP' && (
              <p>Moderne, optimisé web • Meilleure compression</p>
            )}
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end items-center">
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2 sm:gap-3 sm:space-x-0">
            <button 
              onClick={onCancel}
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-slate-500 hover:text-white text-[10px] md:text-[10px] font-black uppercase tracking-widest transition-all min-h-[44px]"
            >
              Annuler
            </button>
            <button 
              onClick={handleSingleExport}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gold/20 text-gold hover:bg-gold/10 text-[10px] md:text-[10px] font-black uppercase tracking-widest transition-all min-h-[44px]"
            >
              Traiter cette slide
            </button>
            <button 
              onClick={handleAllExport}
              className="w-full sm:w-auto px-6 md:px-8 py-3 rounded-xl bg-gold text-anthracite hover:bg-gold-light shadow-lg shadow-gold/10 text-[10px] md:text-[10px] font-black uppercase tracking-widest transition-all min-h-[44px]"
            >
              Tout Traiter (ZIP)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
