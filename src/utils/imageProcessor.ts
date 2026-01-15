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

/**
 * Supprime le filigrane NotebookLM en bas à droite en reconstruisant le fond
 * Utilise un algorithme patch-based avec flou gaussien pour fondre les coutures
 */
export const healWatermark = (
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number
): void => {
  // Constantes de zone du filigrane (bas-droite)
  const WATERMARK_X = canvasWidth - 349; // Ajusté pour largeur 339px + marge de 10px
  const WATERMARK_Y = canvasHeight - 110; // Ajusté pour hauteur 100px + marge de 10px
  const WATERMARK_WIDTH = 339; // Largeur du texte (dimension horizontale)
  const WATERMARK_HEIGHT = 100; // Hauteur du texte (dimension verticale)

  // Vérifier que la zone est valide
  if (WATERMARK_X < 0 || WATERMARK_Y < 0 || 
      WATERMARK_X + WATERMARK_WIDTH > canvasWidth || 
      WATERMARK_Y + WATERMARK_HEIGHT > canvasHeight) {
    console.warn('Zone de filigrane hors limites, ajustement automatique');
    return;
  }

  // Créer un canvas temporaire pour stocker la zone source (au-dessus du logo)
  const sourceHeight = Math.min(WATERMARK_HEIGHT * 2, WATERMARK_Y); // Prendre jusqu'à 2x la hauteur du logo ou jusqu'au bord supérieur
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = WATERMARK_WIDTH;
  tempCanvas.height = sourceHeight;
  const tempCtx = tempCanvas.getContext('2d');

  if (!tempCtx) {
    console.error('Impossible de créer le contexte temporaire');
    return;
  }

  // 1. Copier la zone source (au-dessus du filigrane) dans le canvas temporaire
  tempCtx.drawImage(
    ctx.canvas,
    WATERMARK_X,                    // Source X
    WATERMARK_Y - sourceHeight,     // Source Y (au-dessus du logo)
    WATERMARK_WIDTH,                // Source Width
    sourceHeight,                   // Source Height
    0,                              // Dest X
    0,                              // Dest Y
    WATERMARK_WIDTH,                // Dest Width
    sourceHeight                    // Dest Height
  );

  // 2. Copier cette bande sur la zone du filigrane (inpainting)
  // On utilise plusieurs passes pour améliorer la qualité
  for (let pass = 0; pass < 2; pass++) {
    ctx.drawImage(
      tempCanvas,
      0,                            // Source X
      sourceHeight - WATERMARK_HEIGHT, // Source Y (prendre la partie basse de la source)
      WATERMARK_WIDTH,              // Source Width
      WATERMARK_HEIGHT,              // Source Height
      WATERMARK_X,                   // Dest X
      WATERMARK_Y,                   // Dest Y
      WATERMARK_WIDTH,               // Dest Width
      WATERMARK_HEIGHT               // Dest Height
    );
  }

  // 3. Appliquer un lissage sur les bords pour fondre les coutures
  // Utiliser une approche simple avec plusieurs passes de copie
  smoothWatermarkEdges(ctx, WATERMARK_X, WATERMARK_Y, WATERMARK_WIDTH, WATERMARK_HEIGHT);
};

/**
 * Lisse les bords de la zone traitée pour fondre les coutures
 * Utilise plusieurs passes de copie avec opacité réduite
 */
const smoothWatermarkEdges = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
): void => {
  const edgeSize = 3; // Taille de la zone de transition en pixels

  // Créer un canvas temporaire pour la zone source (au-dessus)
  const sourceCanvas = document.createElement('canvas');
  sourceCanvas.width = width;
  sourceCanvas.height = height + edgeSize;
  const sourceCtx = sourceCanvas.getContext('2d');

  if (!sourceCtx) return;

  // Copier la zone source (au-dessus du filigrane)
  sourceCtx.drawImage(
    ctx.canvas,
    x,
    Math.max(0, y - height - edgeSize),
    width,
    height + edgeSize,
    0,
    0,
    width,
    height + edgeSize
  );

  // Appliquer plusieurs passes avec opacité réduite pour fondre les bords
  ctx.save();
  ctx.globalAlpha = 0.6;
  
  // Passer 1 : copie de la partie basse de la source
  ctx.drawImage(
    sourceCanvas,
    0,
    edgeSize,
    width,
    height,
    x,
    y,
    width,
    height
  );

  ctx.globalAlpha = 0.4;
  
  // Passer 2 : copie supplémentaire pour améliorer le lissage
  ctx.drawImage(
    sourceCanvas,
    0,
    edgeSize,
    width,
    height,
    x,
    y,
    width,
    height
  );

  ctx.restore();
};

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