
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
  MISSION = 'MISSION'
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
