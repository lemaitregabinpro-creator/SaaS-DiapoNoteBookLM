import React, { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface ResultsProps {
  fileName: string;
  slides: string[]; // Les images (Data URLs)
  onReset: () => void;
}

export const Results: React.FC<ResultsProps> = ({ fileName, slides, onReset }) => {
  const [isZipping, setIsZipping] = useState(false);

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

  const handleDownloadZip = async () => {
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
      // On retire l'en-tête "data:image/jpeg;base64," pour avoir le binaire pur
      const base64Data = slideDataUrl.split(',')[1];
      if (folder) {
        // On nomme les fichiers slide_1.jpg, slide_2.jpg, etc.
        folder.file(`slide_${index + 1}.jpg`, base64Data, { base64: true });
      }
    });

    try {
      // Génération et téléchargement
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${fileName.replace(/\.[^/.]+$/, "")}_SmartClean.zip`);
    } catch (error) {
      console.error("Erreur lors de la création du zip", error);
      alert("Une erreur est survenue lors de la création de l'archive.");
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
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
            onClick={handleDownloadZip}
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
                Exporter l'Archive (ZIP)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grille des slides réelles */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {slides.map((slide, i) => (
          <div key={i} className="group relative aspect-[16/10] bg-anthracite rounded-3xl overflow-hidden border border-anthracite-lighter transition-all duration-500 hover:border-gold/50 hover:scale-[1.05] cursor-pointer shadow-xl">
            {/* Image réelle */}
            <img 
              src={slide} 
              alt={`Slide ${i + 1}`}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            
            {/* Numéro de slide */}
            <div className="absolute top-2 left-2 px-2 py-1 bg-anthracite/80 backdrop-blur text-white rounded-lg text-[8px] font-black uppercase tracking-widest border border-white/10">
              #{i + 1}
            </div>

            {/* Overlay au survol */}
            <div className="absolute inset-0 bg-anthracite/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="text-gold font-black text-xs uppercase tracking-widest transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                Aperçu HD
              </span>
            </div>
            
            {/* Badge Purifié */}
            <div className="absolute top-2 right-2 px-2 py-1 bg-gold text-anthracite rounded-lg text-[8px] font-black uppercase tracking-widest shadow-xl">
              Clean
            </div>
            
            <div className="absolute inset-0 border-2 border-gold/0 group-hover:border-gold/20 rounded-3xl transition-all pointer-events-none"></div>
          </div>
        ))}
      </div>

      <div className="bg-gold/5 border border-gold/10 rounded-3xl p-8 flex items-start space-x-6">
        <div className="p-3 bg-gold text-anthracite rounded-xl shadow-lg shrink-0">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="space-y-1">
          <h4 className="text-white font-black text-sm uppercase tracking-widest">Note Technique</h4>
          <p className="text-sm text-slate-400 leading-relaxed font-medium">
            Toutes les slides ont été traitées. L'archive ZIP contient vos images en format JPEG haute qualité, prêtes à être réinsérées dans PowerPoint ou Keynote.
          </p>
        </div>
      </div>
    </div>
  );
};