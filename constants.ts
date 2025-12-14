import { BackgroundPreset, FramePreset, LayoutTemplate } from './types';

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  { id: 'bg-white', name: 'Pure White', value: '#ffffff', type: 'color' },
  { id: 'bg-blue', name: 'Sky Blue', value: '#e0f2fe', type: 'color' }, // bg-sky-100
  { id: 'bg-pink', name: 'Sakura', value: '#fce7f3', type: 'color' }, // bg-pink-100
  { id: 'bg-green', name: 'Mint', value: '#dcfce7', type: 'color' }, // bg-green-100
  { id: 'bg-purple', name: 'Lavender', value: '#f3e8ff', type: 'color' }, // bg-purple-100
  { id: 'bg-grad-1', name: 'Sunset', value: 'linear-gradient(to top left, #fbc2eb 0%, #a6c1ee 100%)', type: 'gradient' },
  { id: 'bg-grad-2', name: 'Peach', value: 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)', type: 'gradient' },
  { id: 'bg-grad-3', name: 'Ocean', value: 'linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)', type: 'gradient' },
];

// Updated to 5:7 Aspect Ratio (500x700 viewBox) to match standard 1-inch photo size
export const FRAME_PRESETS: FramePreset[] = [
  { id: 'none', name: 'No Frame', src: '' },
  { id: 'simple-white', name: 'Polaroid', src: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iNzAwIiB2aWV3Qm94PSIwIDAgNTAwIDcwMCI+PHJlY3Qgd2lkdGg9IjUwMCIgaGVpZ2h0PSI3MDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNDAiLz48L3N2Zz4=' },
  { id: 'simple-pink', name: 'Pink Line', src: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iNzAwIiB2aWV3Qm94PSIwIDAgNTAwIDcwMCI+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iNDgwIiBoZWlnaHQ9IjY4MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZjQ3MmI2IiBzdHJva2Utd2lkdGg9IjE1IiByeD0iMjAiIHJ5PSIyMCIvPjwvc3ZnPg==' },
  { id: 'cute-dots', name: 'Dotted', src: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iNzAwIiB2aWV3Qm94PSIwIDAgNTAwIDcwMCI+PHJlY3QgeD0iMTUiIHk9IjE1IiB3aWR0aD0iNDcwIiBoZWlnaHQ9IjY3MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNjBiYWM2IiBzdHJva2Utd2lkdGg9IjEwIiBzdHJva2UtZGFzaGFycmF5PSIyMCAyMCIgcng9IjMwIiByeT0iMzAiLz48L3N2Zz4=' },
];

export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  { id: 'cinema', name: 'Life4Cuts', description: '4-Frame Strip', icon: '🎞️', slots: 4 },
  { id: 'magazine', name: 'Magazine', description: 'Kawaii Collage', icon: '💖', slots: 4 },
  { id: 'standard', name: 'ID Photo', description: 'Standard Grid', icon: '📋', slots: 1 }, // Usually ID photos are 1 face repeated
  { id: 'wanted', name: 'Wanted', description: 'Single Poster', icon: '🤠', slots: 1 },
];