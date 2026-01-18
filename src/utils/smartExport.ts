import { saveAs } from 'file-saver';

/**
 * Détecte si l'appareil est mobile/tactile
 * @returns true si l'appareil est mobile, false sinon
 */
const isMobileDevice = (): boolean => {
  // Détection multiple pour plus de fiabilité
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  const isSmallScreen = window.innerWidth <= 768;
  
  return hasTouchScreen && (isMobileUserAgent || isSmallScreen);
};

/**
 * Vérifie si l'API Web Share avec fichiers est disponible
 * @returns true si l'API est disponible, false sinon
 */
const canShareFiles = (): boolean => {
  return (
    typeof navigator !== 'undefined' &&
    'share' in navigator &&
    'canShare' in navigator &&
    navigator.canShare !== undefined
  );
};

/**
 * Convertit un Blob en File
 * @param blob - Le Blob à convertir
 * @param filename - Le nom du fichier
 * @returns Un objet File
 */
const blobToFile = (blob: Blob, filename: string): File => {
  return new File([blob], filename, { type: blob.type });
};

/**
 * Exporte intelligemment un fichier unique
 * Utilise l'API Web Share sur mobile, fallback sur file-saver sur desktop
 * @param blob - Le Blob du fichier à exporter
 * @param filename - Le nom du fichier
 * @returns Promise qui se résout quand l'export est terminé
 */
export const handleSmartExport = async (blob: Blob, filename: string): Promise<void> => {
  const isMobile = isMobileDevice();
  const canShare = canShareFiles();

  // Sur mobile avec support de l'API Share
  if (isMobile && canShare) {
    try {
      const file = blobToFile(blob, filename);
      
      // Vérifier si on peut partager ce fichier
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: filename,
          text: `Export SmartBookLM: ${filename}`
        });
        return; // Succès, on sort
      }
    } catch (error: any) {
      // Si l'utilisateur annule le partage, on ne fait rien (pas d'erreur)
      if (error.name === 'AbortError') {
        console.log('Partage annulé par l\'utilisateur');
        return;
      }
      
      // Autre erreur, on log et on fait le fallback
      console.warn('Erreur lors du partage, fallback sur téléchargement:', error);
    }
  }

  // Fallback : téléchargement direct (desktop ou échec du partage)
  try {
    saveAs(blob, filename);
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    throw new Error('Impossible d\'exporter le fichier');
  }
};

/**
 * Exporte intelligemment plusieurs fichiers dans un ZIP
 * Sur mobile, essaie de partager le ZIP, sinon télécharge
 * @param zipBlob - Le Blob du fichier ZIP
 * @param filename - Le nom du fichier ZIP
 * @returns Promise qui se résout quand l'export est terminé
 */
export const handleSmartExportZip = async (zipBlob: Blob, filename: string): Promise<void> => {
  const isMobile = isMobileDevice();
  const canShare = canShareFiles();

  // Sur mobile avec support de l'API Share
  if (isMobile && canShare) {
    try {
      const file = blobToFile(zipBlob, filename);
      
      // Vérifier si on peut partager ce fichier
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: filename,
          text: `Archive SmartBookLM: ${filename}`
        });
        return; // Succès, on sort
      }
    } catch (error: any) {
      // Si l'utilisateur annule le partage, on ne fait rien (pas d'erreur)
      if (error.name === 'AbortError') {
        console.log('Partage annulé par l\'utilisateur');
        return;
      }
      
      // Autre erreur, on log et on fait le fallback
      console.warn('Erreur lors du partage du ZIP, fallback sur téléchargement:', error);
    }
  }

  // Fallback : téléchargement direct (desktop ou échec du partage)
  try {
    saveAs(zipBlob, filename);
  } catch (error) {
    console.error('Erreur lors du téléchargement du ZIP:', error);
    throw new Error('Impossible d\'exporter l\'archive');
  }
};
