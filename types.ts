
export enum AppState {
  TEMPLATE_SELECT = 'TEMPLATE_SELECT', 
  UPLOAD = 'UPLOAD',
  CAMERA = 'CAMERA', // New Camera State
  PROCESSING = 'PROCESSING',
  EDIT = 'EDIT',
  LAYOUT = 'LAYOUT'
}

export interface BackgroundPreset {
  id: string;
  name: string;
  value: string; // CSS color or gradient string
  type: 'color' | 'gradient';
}

export interface FramePreset {
  id: string;
  name: string;
  src: string; // URL
  isCustom?: boolean;
}

export interface ProcessingOptions {
  lighting: boolean;
  brightness: number;
  contrast: number;
  saturation: number;
}

export interface LayoutTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  slots: number; // Number of photo slots in this template
}

// --- Decoration Types ---

export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  color: string;
  width: number;
  points: Point[];
}

export interface StickerItem {
  id: string;
  content: string; // Emoji char or text
  x: number;
  y: number;
  scale: number;
  rotation: number;
  isFlipped?: boolean; // New: Support mirroring
}

export interface DecorationState {
  strokes: Stroke[];
  stickers: StickerItem[];
}
