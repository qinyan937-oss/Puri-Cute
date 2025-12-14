export enum AppState {
  TEMPLATE_SELECT = 'TEMPLATE_SELECT', // New initial state
  UPLOAD = 'UPLOAD',
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