
import React, { useRef, useState, useEffect } from 'react';

interface MagicEditorProps {
  imageUrl: string;
  onApply: () => void;
  onCancel: () => void;
}

export const MagicEditor: React.FC<MagicEditorProps> = ({ imageUrl, onApply, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Fix: Changed CanvasRenderingContext2Array to CanvasRenderingContext2D
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(40);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Ajuster la taille du canvas à son conteneur
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const context = canvas.getContext('2d');
    if (context) {
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = 'rgba(197, 160, 89, 0.4)'; // Couleur Gold avec opacité
      context.lineWidth = brushSize;
      contextRef.current = context;
    }
  }, []);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.lineWidth = brushSize;
    }
  }, [brushSize]);

  const startDrawing = ({ nativeEvent }: React.MouseEvent) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(offsetX, offsetY);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = ({ nativeEvent }: React.MouseEvent) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current?.lineTo(offsetX, offsetY);
    contextRef.current?.stroke();
  };

  const stopDrawing = () => {
    contextRef.current?.closePath();
    setIsDrawing(false);
  };

  const clearMask = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
    }
  };

  return (
    <div className="bg-anthracite-light rounded-[2.5rem] border border-anthracite-lighter overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Header Éditeur */}
      <div className="px-8 py-6 bg-anthracite/50 border-b border-anthracite-lighter flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-black uppercase tracking-widest text-sm">Pinceau Magique IA</h3>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Surlignez les filigranes à supprimer</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3 bg-anthracite p-2 px-4 rounded-xl border border-anthracite-lighter">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Taille</span>
            <input 
              type="range" 
              min="10" 
              max="100" 
              value={brushSize} 
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="accent-gold w-24"
            />
          </div>
          <button 
            onClick={clearMask}
            className="text-[10px] font-black text-slate-400 hover:text-gold uppercase tracking-widest transition-colors"
          >
            Effacer
          </button>
        </div>
      </div>

      {/* Zone Canva */}
      <div className="relative aspect-video bg-anthracite overflow-hidden group">
        <img 
          src={imageUrl} 
          alt="Slide Editor" 
          className="w-full h-full object-contain select-none"
        />
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="absolute inset-0 z-10 cursor-crosshair"
        />
        
        {/* Cursor Preview Tooltip */}
        {!isDrawing && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="bg-gold text-anthracite text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-2xl">
              Peignez sur les filigranes
            </p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-8 py-8 bg-anthracite/30 flex justify-between items-center">
        <button 
          onClick={onCancel}
          className="px-8 py-4 text-[11px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
        >
          Annuler
        </button>
        
        <button 
          onClick={onApply}
          disabled={!hasDrawn}
          className={`
            px-12 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all shadow-2xl
            ${hasDrawn 
              ? 'bg-gold text-anthracite hover:bg-gold-light shadow-gold/20 scale-105' 
              : 'bg-anthracite-lighter text-slate-600 cursor-not-allowed opacity-50'}
          `}
        >
          Appliquer le nettoyage
        </button>
      </div>
    </div>
  );
};
