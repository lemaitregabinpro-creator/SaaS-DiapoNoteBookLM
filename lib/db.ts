import Dexie, { Table } from 'dexie';

// Définition de l'interface pour un projet local
export interface LocalProject {
  id?: number;
  name: string;
  date: Date;
  originalFileBlob: Blob; // Le PDF original
  processedImages: string[]; // Les URLs ou Base64 des images traitées
  thumbnail?: string;
}

class SmartBookDB extends Dexie {
  projects!: Table<LocalProject>;

  constructor() {
    super('SmartBookLM_Database');
    
    // Définition du schéma (id auto-incrémenté)
    this.version(1).stores({
      projects: '++id, name, date' 
    });
  }
}

export const db = new SmartBookDB();