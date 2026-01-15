
export enum AppStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  EDITING = 'EDITING',
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE'
}

export enum View {
  HOME = 'HOME',
  PRICING = 'PRICING',
  ACCOUNT = 'ACCOUNT',
  MISSION = 'MISSION',
  FEED = 'FEED'
}

export enum PlanType {
  GUEST = 'GUEST',
  FREE = 'FREE',
  ESSENTIAL = 'ESSENTIAL',
  PRO = 'PRO',
  LIFETIME = 'LIFETIME'
}

export interface User {
  id: string;
  name: string;
  email: string;
  plan: PlanType;
  usageCount: number;
  avatar?: string;
}

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
}

// Types pour le traitement d'images
export interface CropOptions {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export type ImageFormat = 'JPEG' | 'PNG' | 'WEBP';

export interface ProcessOptions {
  crop: CropOptions;
  format: ImageFormat;
  removeWatermark?: boolean;
}

// Types pour la Roadmap Communautaire
export interface FeatureRequest {
  id: string;
  user_id: string;
  title: string;
  description: string;
  votes_count: number;
  status: 'pending' | 'planned' | 'completed';
  created_at: string;
  updated_at?: string;
  has_voted?: boolean; // Champ optionnel pour le frontend
}
