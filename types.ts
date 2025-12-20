export enum AppState {
  TEMPLATE_SELECT = 'TEMPLATE_SELECT', 
  UPLOAD = 'UPLOAD',
  CAMERA = 'CAMERA', 
  PROCESSING = 'PROCESSING',
  EDIT = 'EDIT',
  LAYOUT = 'LAYOUT'
}

export interface BackgroundPreset {
  id: string;
  name: string;
  value: string; 
  type: 'color' | 'gradient' | 'pattern';
}

export interface FramePreset {
  id: string;
  name: string;
  src: string; 
}

export interface LayoutTemplate {
  id: string;
  name: string;
  description: string;
  slots: number; 
  aspectRatio: number; 
}

export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  color: string;
  width: number;
  type: 'standard' | 'neon';
  points: Point[];
}

export interface StickerItem {
  id: string;
  type: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export interface DecorationState {
  strokes: Stroke[];
  stickers: StickerItem[];
  frameImage?: HTMLImageElement | null;
}

export interface ImageTransform {
    x: number;
    y: number;
    scale: number;
}

export interface RenderParams {
  canvas: HTMLCanvasElement;
  personImage: HTMLImageElement;
  backgroundImage?: BackgroundPreset;
  frameImage?: HTMLImageElement | null;
  lightingEnabled: boolean;
  noiseLevel: number;
  contrast: number; 
  decorations?: DecorationState;
  imageTransform?: ImageTransform;
  selectedStickerId?: string | null;
  isMoeMode?: boolean; 
  aspectRatio?: number;
  dateStampEnabled?: boolean;
  dateText?: string;
}