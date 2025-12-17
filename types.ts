
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
  type: 'color' | 'gradient' | 'pattern';
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
  aspectRatio: number; // width / height (e.g. 0.75 for 3:4 portrait, 1.5 for 3:2 landscape)
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
  isNeon?: boolean; // New: Supports Neon/Fluorescent style
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

// New: Image Transform State
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
  noiseLevel?: number;
  filmLookStrength?: number; // New: Film look intensity (0-1)
  showDate?: boolean;
  decorations?: DecorationState;
  selectedStickerId?: string | null;
  imageTransform?: ImageTransform;
  isMoeMode?: boolean; 
  aspectRatio?: number;
  isImageFit?: boolean; // New: Fit vs Fill mode
}
