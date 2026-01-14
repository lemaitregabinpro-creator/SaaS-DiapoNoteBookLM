import * as pdfjsLib from 'pdfjs-dist';

// Configuration du worker pour Vite
// Le worker est copié dans public/ pour être accessible directement
// Cette approche évite les problèmes de CORS et de chargement depuis CDN
if (typeof window !== 'undefined') {
  // Utiliser le worker depuis le dossier public (accessible via /pdf.worker.min.mjs)
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

export const convertPdfToImages = async (file: File): Promise<string[]> => {
  // 1. Lire le fichier comme un ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();

  // 2. Charger le document PDF
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  const images: string[] = [];
  const totalPages = pdf.numPages;

  // 3. Boucler sur chaque page (ex: tes 8 pages)
  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    
    // On définit une échelle élevée (scale 2 ou 3) pour avoir une image HD
    // C'est crucial pour que le texte "NotebookLM" soit net avant effacement
    const scale = 3; 
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (context) {
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        canvas: canvas, // Propriété requise par TypeScript pour RenderParameters
      };

      await page.render(renderContext).promise;
      
      // Conversion en image JPEG (plus léger que PNG pour les photos)
      images.push(canvas.toDataURL('image/jpeg', 0.9));
    }
  }

  return images;
};