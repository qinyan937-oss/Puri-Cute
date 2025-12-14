
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
  { id: 'standard', name: 'ID Photo', description: 'Standard Grid', icon: '📋', slots: 1 },
  { id: 'wanted', name: 'Wanted', description: 'Single Poster', icon: '🤠', slots: 1 },
];

export const PEN_COLORS = [
  '#FFFFFF', // White
  '#000000', // Black
  '#FF69B4', // Hot Pink
  '#87CEFA', // Sky Blue
  '#FFD700', // Gold
  '#98FB98', // Pale Green
  '#DDA0DD', // Plum
];

// New Sticker Categories
export const STICKER_CATEGORIES = {
  Y2K: [
    { id: 'y2k_star_silver', label: 'Silver Star' },
    { id: 'y2k_star_holo', label: 'Holo Star' },
    { id: 'y2k_moon_silver', label: 'Silver Moon' },
    { id: 'y2k_moon_holo', label: 'Holo Moon' },
    { id: 'y2k_cross_silver', label: 'Silver Cross' },
  ],
  RIBBON: [
    { id: 'ribbon_red_satin', label: 'Red Satin' },
    { id: 'ribbon_pink_satin', label: 'Pink Satin' },
    { id: 'ribbon_blue_check', label: 'Blue Gingham' },
    { id: 'ribbon_pink_check', label: 'Pink Gingham' },
  ],
  DOODLE: [
    { id: 'doodle_sparkle', label: 'Sparkles' },
    { id: 'doodle_heart', label: 'Hearts' },
    { id: 'doodle_wings', label: 'Wings' },
    { id: 'doodle_whiskers', label: 'Whiskers' },
    { id: 'doodle_crown', label: 'Crown' },
  ],
  RETRO: [
    { id: 'retro_bauble', label: 'Bauble' },
    { id: 'retro_holly', label: 'Holly' },
    { id: 'retro_light', label: 'Xmas Light' },
    { id: 'retro_stocking', label: 'Stocking' },
    { id: 'retro_tree', label: 'Xmas Tree' },
  ],
  CYBER: [
    { id: 'cyber_bear', label: 'Chrome Bear' },
    { id: 'cyber_bunny', label: 'Holo Bunny' },
    { id: 'cyber_kitty', label: 'Cyber Kitty' },
    { id: 'cyber_puppy', label: 'Chrome Puppy' },
    { id: 'cyber_bird', label: 'Gold Bird' },
  ]
};

// Flattened list for type checking
export const ALL_STICKER_IDS = [
  ...STICKER_CATEGORIES.Y2K.map(s => s.id),
  ...STICKER_CATEGORIES.RIBBON.map(s => s.id),
  ...STICKER_CATEGORIES.DOODLE.map(s => s.id),
  ...STICKER_CATEGORIES.RETRO.map(s => s.id),
  ...STICKER_CATEGORIES.CYBER.map(s => s.id),
];
