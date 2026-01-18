import * as pdfjsLib from 'pdfjs-dist';

// Configuration du worker PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

/**
 * Convertit un fichier PDF en tableau d'images (data URLs)
 * @param pdfFile - Le fichier PDF à convertir
 * @returns Promise<string[]> - Tableau de data URLs représentant chaque page du PDF
 */
export const convertPdfToImages = async (pdfFile: File): Promise<string[]> => {
  try {
    // 1. Lire le fichier PDF en tant qu'ArrayBuffer
    const arrayBuffer = await pdfFile.arrayBuffer();
    
    // 2. Charger le document PDF
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    const images: string[] = [];
    const numPages = pdf.numPages;
    
    // 3. Parcourir chaque page du PDF
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      
      // 4. Calculer le viewport avec une résolution appropriée (2x pour une meilleure qualité)
      const viewport = page.getViewport({ scale: 2.0 });
      
      // 5. Créer un canvas pour rendre la page
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Impossible de créer le contexte canvas');
      }
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // 6. Rendre la page PDF sur le canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      };
      
      await page.render(renderContext).promise;
      
      // 7. Convertir le canvas en data URL (format PNG pour préserver la qualité)
      const dataUrl = canvas.toDataURL('image/png');
      images.push(dataUrl);
    }
    
    return images;
  } catch (error) {
    console.error('Erreur lors de la conversion PDF en images:', error);
    throw new Error(`Échec de la conversion du PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

/**
 * Algorithme "Smart Patch" : Reconstruit le fond intelligemment
 * Scanne la colonne au-dessus du filigrane pour trouver le bloc qui s'aligne le mieux (continuité des motifs)
 */
export const healWatermark = (
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number
): void => {
  // 1. Définition de la zone précise du logo NoteBookLM (bas-droite)
  // On élargit légèrement pour être sûr de tout couvrir
  const WATERMARK_WIDTH = 360; 
  const WATERMARK_HEIGHT = 120;
  
  const targetX = canvasWidth - WATERMARK_WIDTH;
  const targetY = canvasHeight - WATERMARK_HEIGHT;

  // Sécurité
  if (targetX < 0 || targetY < 0) return;

  try {
    // 2. Récupérer la "Ligne de Référence" (C'est la frontière juste au-dessus du logo)
    // C'est notre guide : on cherche un morceau d'image qui se termine par des pixels similaires à ceux-ci.
    const borderY = targetY - 1;
    const borderData = ctx.getImageData(targetX, borderY, WATERMARK_WIDTH, 1).data;

    // 3. Scanner vers le haut pour trouver le "Meilleur Candidat"
    // On cherche un bloc de hauteur WATERMARK_HEIGHT situé plus haut dans l'image
    // dont le bas ressemble le plus possible à notre bordure.
    
    let bestScore = Infinity;
    let bestY = targetY - WATERMARK_HEIGHT - 5; // On commence à chercher au-dessus de la zone cible

    // On limite la recherche pour la performance (on remonte jusqu'à 2x la hauteur ou le haut de l'image)
    const searchLimit = Math.max(0, targetY - (WATERMARK_HEIGHT * 4));

    // Pas de scan (tous les 2 pixels pour aller plus vite sans perdre trop de qualité)
    for (let y = bestY; y >= searchLimit; y -= 2) {
      // On regarde la ligne qui serait en contact avec notre bordure si on copiait ce bloc
      // C'est la ligne du bas du bloc candidat
      const candidateBottomY = y + WATERMARK_HEIGHT - 1;
      const candidateData = ctx.getImageData(targetX, candidateBottomY, WATERMARK_WIDTH, 1).data;

      // Calcul de la différence (Score de similarité)
      let score = 0;
      // On compare 1 pixel sur 4 pour la performance (suffisant pour l'œil)
      for (let i = 0; i < candidateData.length; i += 16) { 
        const rDiff = candidateData[i] - borderData[i];
        const gDiff = candidateData[i+1] - borderData[i+1];
        const bDiff = candidateData[i+2] - borderData[i+2];
        score += Math.abs(rDiff) + Math.abs(gDiff) + Math.abs(bDiff);
        
        // Optimisation : si le score est déjà mauvais, on arrête de tester cette ligne
        if (score > bestScore) break;
      }

      if (score < bestScore) {
        bestScore = score;
        bestY = y;
      }
    }

    // 4. Appliquer le "Meilleur Patch" trouvé
    // On copie le bloc gagnant dans la zone du filigrane
    ctx.drawImage(
      ctx.canvas,
      targetX,      // Source X (même colonne)
      bestY,        // Source Y (le meilleur Y trouvé)
      WATERMARK_WIDTH, 
      WATERMARK_HEIGHT,
      targetX,      // Dest X
      targetY,      // Dest Y
      WATERMARK_WIDTH,
      WATERMARK_HEIGHT
    );

    // 5. Fusion Ultime (Seam Blending)
    // Même avec le meilleur patch, il peut y avoir une légère coupure.
    // On applique un flou dégradé uniquement sur la jonction (top) pour la rendre invisible.
    
    const blendHeight = 20; // Hauteur de la zone de fusion
    
    // Créer un dégradé de transparence pour masquer la coupure
    const gradient = ctx.createLinearGradient(0, targetY, 0, targetY + blendHeight);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)"); // Masque total au début (invisible car mode destination-out ?)
    // Non, on va utiliser une méthode plus simple : le flou localisé.
    
    // On prend la zone de jonction
    const jointData = ctx.getImageData(targetX, targetY - 2, WATERMARK_WIDTH, 5);
    // On pourrait flouter, mais le plus simple en canvas est de redessiner la ligne de jonction avec une légère transparence
    
    ctx.save();
    ctx.globalAlpha = 0.5; // Semi-transparent
    // On redessine la ligne de frontière par dessus pour mélanger
    ctx.drawImage(
        ctx.canvas,
        targetX, bestY + WATERMARK_HEIGHT - 2, WATERMARK_WIDTH, 4, // Source (jonction source)
        targetX, targetY - 2, WATERMARK_WIDTH, 4 // Dest (jonction dest)
    );
    ctx.restore();

  } catch (e) {
    console.error("Erreur smart inpainting:", e);
    // Fallback : on fait le stretch si l'inpainting échoue (ex: image trop petite)
    try {
        ctx.drawImage(ctx.canvas, targetX - 1, targetY, 1, WATERMARK_HEIGHT, targetX, targetY, WATERMARK_WIDTH, WATERMARK_HEIGHT);
    } catch(e2) {}
  }
};