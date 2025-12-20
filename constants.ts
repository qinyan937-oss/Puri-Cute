import { BackgroundPreset, FramePreset, LayoutTemplate } from './types';

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  { id: 'bg-white', name: 'White', value: '#ffffff', type: 'color' },
  { id: 'bg-pink', name: 'Sakura', value: '#fce7f3', type: 'color' },
  { id: 'bg-blue', name: 'Sky', value: '#e0f2fe', type: 'color' },
  { id: 'bg-green', name: 'Mint', value: '#f0fdf4', type: 'color' },
  { id: 'bg-cream', name: 'Cream', value: '#fffbeb', type: 'color' },
  { id: 'bg-grad-pink', name: 'Sunset', value: 'linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)', type: 'gradient' },
  { id: 'bg-grad-blue', name: 'Ocean', value: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)', type: 'gradient' },
  { id: 'bg-grad-lavender', name: 'Dream', value: 'linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)', type: 'gradient' },
  { id: 'bg-grad-aurora', name: 'Aurora', value: 'linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)', type: 'gradient' },
];

const createSVGFrame = (inner: string) => `data:image/svg+xml;base64,${btoa(`
<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1333" viewBox="0 0 1000 1333">
  ${inner}
</svg>`)}`;

export const FRAME_PRESETS: FramePreset[] = [
  { id: 'none', name: 'No Frame', src: '' },
  { 
    id: 'sweet', 
    name: 'Soft Ribbon', 
    src: createSVGFrame(`
      <rect width="1000" height="1333" fill="none" stroke="#f472b6" stroke-width="60" />
      <circle cx="60" cy="60" r="30" fill="white" />
      <circle cx="940" cy="60" r="30" fill="white" />
      <circle cx="60" cy="1273" r="30" fill="white" />
      <circle cx="940" cy="1273" r="30" fill="white" />
      <rect x="200" y="20" width="600" height="80" rx="40" fill="#f472b6" />
      <text x="500" y="75" text-anchor="middle" font-family="sans-serif" font-weight="900" fill="white" font-size="40">LOVELY KIRA</text>
    `) 
  },
  { 
    id: 'cyber', 
    name: 'Liquid Metal', 
    src: createSVGFrame(`
      <rect width="1000" height="1333" fill="none" stroke="#cbd5e1" stroke-width="40" />
      <path d="M0 0 L300 0 L250 80 L0 80 Z" fill="#94a3b8" />
      <path d="M1000 1333 L700 1333 L750 1253 L1000 1253 Z" fill="#94a3b8" />
      <circle cx="40" cy="40" r="15" fill="#00ffff" />
      <circle cx="960" cy="1293" r="15" fill="#ff00ff" />
      <rect x="800" y="100" width="150" height="10" fill="#94a3b8" />
      <rect x="850" y="120" width="100" height="10" fill="#94a3b8" />
    `) 
  },
  {
    id: 'cherry',
    name: 'Sakura Petal',
    src: createSVGFrame(`
      <rect width="1000" height="1333" fill="none" stroke="#fbcfe8" stroke-width="50" />
      <circle cx="100" cy="100" r="40" fill="#fce7f3" />
      <circle cx="900" cy="1150" r="60" fill="#fdf2f8" />
      <text x="500" y="1280" text-anchor="middle" font-family="sans-serif" font-weight="900" fill="#ec4899" font-size="40">SAKURA MOOD</text>
    `)
  },
  {
    id: 'star_cat',
    name: 'Midnight Cat',
    src: createSVGFrame(`
      <rect width="1000" height="1333" fill="none" stroke="#1e293b" stroke-width="60" />
      <path d="M50 50 L100 20 L150 50 Z" fill="#334155" />
      <path d="M850 50 L900 20 L950 50 Z" fill="#334155" />
      <circle cx="900" cy="100" r="20" fill="#fcd34d" />
      <text x="500" y="1280" text-anchor="middle" font-family="sans-serif" font-weight="900" fill="#64748b" font-size="35">STARRY NIGHT</text>
    `)
  },
  {
    id: 'strawberry',
    name: 'Berry Gingham',
    src: createSVGFrame(`
      <rect width="1000" height="1333" fill="none" stroke="#ef4444" stroke-width="50" />
      <rect x="0" y="0" width="1000" height="1333" fill="none" stroke="#fee2e2" stroke-width="20" stroke-dasharray="20,20" />
      <text x="500" y="80" text-anchor="middle" font-family="sans-serif" font-weight="900" fill="#ef4444" font-size="40">SWEET STRAWBERRY</text>
    `)
  }
];

export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  { id: 'cinema', name: 'Life4Cuts', description: 'Double Strip (White/Pink)', slots: 1, aspectRatio: 1.25 }, 
  { id: 'polaroid', name: 'Polaroid', description: 'Blue Gradient', slots: 1, aspectRatio: 1 }, 
  { id: 'standard', name: 'ID Photo', description: 'Blue Grid', slots: 1, aspectRatio: 0.77 }, 
  { id: 'driver_license', name: 'License', description: 'Pink Card', slots: 1, aspectRatio: 0.77 }, 
];

export const PEN_COLORS = ['#FFFFFF', '#000000', '#FF69B4', '#87CEFA', '#FFD700', '#98FB98', '#FF4500'];

export const STICKER_CATEGORIES = [
  {
    id: 'y2k',
    name: 'Y2K Galactic',
    stickers: ['y2k_star_chrome', 'y2k_moon_chrome', 'y2k_star_hologram', 'y2k_planet_chrome', 'y2k_cross_star']
  },
  {
    id: 'coquette',
    name: 'Coquette',
    stickers: ['coq_bow_pink', 'coq_bow_blue', 'coq_heart_silk', 'coq_flower_silk', 'coq_ribbon_long']
  },
  {
    id: 'purikura',
    name: 'Doodles',
    stickers: ['puri_star_white', 'puri_heart_white', 'puri_cat_whisker', 'puri_sparkle', 'puri_halo']
  },
  {
    id: 'cyber',
    name: 'Cyber Pets',
    stickers: ['cyber_bear', 'cyber_bunny', 'cyber_cat', 'cyber_bird', 'cyber_fox']
  },
  {
    id: 'xmas',
    name: 'Xmas Party',
    stickers: ['xmas_hat', 'xmas_deer', 'xmas_tree', 'xmas_socks', 'xmas_gift']
  }
];