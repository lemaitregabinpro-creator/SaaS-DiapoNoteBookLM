import React, { useRef, useState, useEffect } from 'react';

interface MagicEditorProps {
  slides: string[]; // On reçoit maintenant un tableau d'images
  onApply: (slideIndex: number, originalImage: string, maskImage: string) => void;
  onCancel: () => void;
}

export const MagicEditor: React.FC<MagicEditorProps> = ({ slides, onApply, onCancel }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(40);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Reset du canvas quand on change de slide
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
        // On nettoie le masque précédent
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // On remplit de nouveau avec du noir (transparent pour l'IA)
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            setHasDrawn(false);
        }
    }
  }, [currentIndex]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = naturalWidth;
      canvas.height = naturalHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.strokeStyle = 'white';
        context.lineWidth = brushSize;
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvas.width, canvas.height);
        contextRef.current = context;
      }
    }
  };

  // ... (Garder les fonctions startDrawing, draw, stopDrawing identiques à avant) ...
  // Je les réécris brièvement pour la cohérence du contexte :
  
  useEffect(() => {
    if (contextRef.current) contextRef.current.lineWidth = brushSize;
  }, [brushSize]);

  const startDrawing = ({ nativeEvent }: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(nativeEvent.offsetX * scaleX, nativeEvent.offsetY * scaleY);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = ({ nativeEvent }: React.MouseEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    contextRef.current?.lineTo(nativeEvent.offsetX * scaleX, nativeEvent.offsetY * scaleY);
    contextRef.current?.stroke();
  };

  const stopDrawing = () => {
    contextRef.current?.closePath();
    setIsDrawing(false);
  };

  const handleApply = () => {
    if (canvasRef.current) {
      const maskData = canvasRef.current.toDataURL('image/png');
      onApply(currentIndex, slides[currentIndex], maskData);
    }
  };

  const nextSlide = () => {
    if (currentIndex < slides.length - 1) setCurrentIndex(c => c + 1);
  };

  const prevSlide = () => {
    if (currentIndex > 0) setCurrentIndex(c => c - 1);
  };

  return (
    <div className="bg-anthracite-light rounded-[2.5rem] border border-anthracite-lighter overflow-hidden shadow-2xl flex flex-col h-full">
      {/* Header Editeur avec Navigation */}
      <div className="px-8 py-6 border-b border-anthracite-lighter flex justify-between items-center bg-anthracite/50 backdrop-blur-md">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/20">
            <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <div>
            <h3 className="font-black text-white text-lg tracking-tight">Studio de Nettoyage</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              Slide {currentIndex + 1} / {slides.length}
            </p>
          </div>
        </div>

        {/* Contrôles de Navigation */}
        <div className="flex items-center space-x-2 bg-anthracite rounded-xl p-1 border border-anthracite-lighter">
          <button 
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="p-3 hover:bg-anthracite-light rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="w-px h-6 bg-anthracite-lighter"></div>
          <button 
            onClick={nextSlide}
            disabled={currentIndex === slides.length - 1}
            className="p-3 hover:bg-anthracite-light rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Zone Canva */}
      <div className="relative flex-grow bg-anthracite overflow-hidden group flex items-center justify-center p-8">
        <div className="relative shadow-2xl rounded-sm overflow-hidden border border-anthracite-lighter">
            <img 
            src={slides[currentIndex]} 
            onLoad={handleImageLoad}
            alt={`Slide ${currentIndex + 1}`} 
            className="max-h-[60vh] object-contain select-none pointer-events-none"
            />
            <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="absolute inset-0 z-10 cursor-crosshair w-full h-full opacity-60 mix-blend-screen"
            />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-8 py-6 bg-anthracite/30 flex justify-between items-center border-t border-anthracite-lighter">
        <div className="flex items-center space-x-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Taille du pinceau</label>
            <input 
                type="range" 
                min="10" 
                max="100" 
                value={brushSize} 
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-32 accent-gold h-1 bg-anthracite-lighter rounded-lg appearance-none cursor-pointer"
            />
        </div>
        
        <div className="flex space-x-4">
            <button onClick={onCancel} className="px-6 py-3 text-slate-500 uppercase font-black text-xs hover:text-white transition-colors">
            Fermer
            </button>
            <button 
            onClick={handleApply}
            disabled={!hasDrawn}
            className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg ${
                hasDrawn ? 'bg-gold text-anthracite hover:bg-gold-light shadow-gold/10' : 'bg-anthracite-lighter text-slate-600'
            }`}
            >
            {hasDrawn ? 'Nettoyer cette slide' : 'Dessinez pour nettoyer'}
            </button>
        </div>
      </div>
    </div>
  );
};