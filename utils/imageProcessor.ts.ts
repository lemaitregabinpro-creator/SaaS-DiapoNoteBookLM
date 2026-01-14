// utils/imageProcessor.ts
import * as pdfjsLib from 'pdfjs-dist';

// Configuration du worker pour Vite
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

export interface CropOptions {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export type ImageFormat = 'JPEG' | 'PNG' | 'WEBP';

// Fonction pour convertir un PDF en images
export const convertPdfToImages = async (file: File): Promise<string[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const images: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 3.0 }); // Scale 3.0 pour une bonne qualité (HD)
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    if (context) {
      await page.render({ canvasContext: context, viewport: viewport, canvas: canvas }).promise;
      images.push(canvas.toDataURL('image/jpeg', 0.8));
    }
  }

  return images;
};

export const processSlide4Sides = async (
  imageSrc: string, 
  crop: CropOptions, 
  format: ImageFormat
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Important pour éviter les erreurs de sécurité
    img.src = imageSrc;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error("Impossible de créer le contexte canvas"));
        return;
      }

      // 1. Calculer les nouvelles dimensions
      // On s'assure de ne pas avoir de dimensions négatives
      const newWidth = Math.max(1, img.width - crop.left - crop.right);
      const newHeight = Math.max(1, img.height - crop.top - crop.bottom);

      // 2. Définir la taille du canvas final
      canvas.width = newWidth;
      canvas.height = newHeight;

      // 3. Dessiner uniquement la partie gardée
      // drawImage(source, sourceX, sourceY, sourceW, sourceH, destX, destY, destW, destH)
      ctx.drawImage(
        img, 
        crop.left,  // On commence à X pixels de la gauche
        crop.top,   // On commence à Y pixels du haut
        newWidth,   // On prend cette largeur dans l'image source
        newHeight,  // On prend cette hauteur dans l'image source
        0,          // On dessine à 0 sur le canvas
        0,          // On dessine à 0 sur le canvas
        newWidth,   // Largeur finale
        newHeight   // Hauteur finale
      );

      // 4. Conversion au format choisi
      let mimeType = 'image/jpeg';
      let quality = 0.92; // Qualité standard excellente

      switch (format) {
        case 'PNG':
          mimeType = 'image/png';
          quality = 1.0; // PNG est lossless, quality est ignoré mais bon pour la forme
          break;
        case 'WEBP':
          mimeType = 'image/webp';
          quality = 0.85; // WEBP compresse mieux, on peut baisser un peu
          break;
        case 'JPEG':
        default:
          mimeType = 'image/jpeg';
          break;
      }

      const finalDataUrl = canvas.toDataURL(mimeType, quality);
      resolve(finalDataUrl);
    };

    img.onerror = (err) => reject(err);
  });
};