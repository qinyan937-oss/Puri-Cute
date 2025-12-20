
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

const createSVGFrame = (inner: string) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1333" viewBox="0 0 1000 1333">${inner}</svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

// Helper components for SVG drawing
const drawFlower = (x: number, y: number, color: string) => `
  <circle cx="${x}" cy="${y}" r="15" fill="#fde047" />
  <circle cx="${x}" cy="${y-20}" r="12" fill="${color}" />
  <circle cx="${x+18}" cy="${y-8}" r="12" fill="${color}" />
  <circle cx="${x+12}" cy="${y+15}" r="12" fill="${color}" />
  <circle cx="${x-12}" cy="${y+15}" r="12" fill="${color}" />
  <circle cx="${x-18}" cy="${y-8}" r="12" fill="${color}" />
`;

const drawStrawberry = (x: number, y: number) => `
  <path d="M${x},${y+20} Q${x-25},${y+20} ${x-20},${y-15} Q${x},${y-35} ${x+20},${y-15} Q${x+25},${y+20} ${x},${y+20}" fill="#f87171" />
  <circle cx="${x-5}" cy="${y-5}" r="2" fill="white" opacity="0.6"/>
  <circle cx="${x+8}" cy="${y+5}" r="2" fill="white" opacity="0.6"/>
  <path d="M${x-15},${y-22} Q${x},${y-40} ${x+15},${y-22} L${x},${y-25} Z" fill="#4ade80" />
`;

export const FRAME_PRESETS: FramePreset[] = [
  { id: 'none', name: 'No Frame', src: '' },
  { 
    id: 'tea_party', 
    name: 'Tea Party', 
    src: createSVGFrame(`
      <path d="M0,0 H1000 V1333 H0 Z M120,120 V1213 H880 V120 Z" fill="#fce7f3" fill-rule="evenodd" />
      <g stroke="#db2777" stroke-width="4" fill="none">
        <path d="M50,110 Q20,110 20,80 Q20,50 50,50 H120 Q150,50 150,80 Q150,110 120,110" fill="#fff" />
        <path d="M80,50 V40 M100,50 V40" stroke-linecap="round"/>
        <circle cx="85" cy="80" r="10" fill="#f472b6" stroke="none"/>
      </g>
      <g transform="translate(850, 80)">
        <path d="M0,40 Q40,40 40,20 Q40,0 20,0 H-20 Q-40,0 -40,20 Q-40,40 0,40" fill="#f9fafb" stroke="#374151" stroke-width="3"/>
        <path d="M40,20 Q55,20 55,10 Q55,0 40,0" stroke="#374151" stroke-width="3"/>
        <path d="M0,15 L0,5" stroke="#92400e" stroke-width="8"/>
      </g>
      ${drawStrawberry(500, 70)}
      ${drawStrawberry(500, 1260)}
      ${drawFlower(60, 400, "#c084fc")}
      ${drawFlower(940, 400, "#c084fc")}
      ${drawFlower(60, 900, "#60a5fa")}
      ${drawFlower(940, 900, "#60a5fa")}
    `) 
  },
  { 
    id: 'cute_gingham', 
    name: 'Cute Gingham', 
    src: createSVGFrame(`
      <defs>
        <pattern id="gingham" width="80" height="80" patternUnits="userSpaceOnUse">
          <rect width="80" height="80" fill="#fff" />
          <rect width="80" height="40" fill="#fbcfe8" opacity="0.4" />
          <rect width="40" height="80" fill="#ccfbf1" opacity="0.4" />
        </pattern>
      </defs>
      <path d="M0,0 H1000 V1333 H0 Z M120,120 V1213 H880 V120 Z" fill="url(#gingham)" fill-rule="evenodd" />
      <g transform="translate(500, 1260)">
        <text text-anchor="middle" font-family="serif" font-weight="900" fill="#ec4899" font-size="80">Cute!</text>
      </g>
      <path d="M60,60 Q80,20 100,60 Q120,100 80,100 Q40,100 60,60" fill="#f472b6" />
      <path d="M880,60 Q900,20 920,60 Q940,100 900,100 Q860,100 880,60" fill="#a78bfa" />
      <path d="M60,1200 L100,1200 L80,1240 Z" fill="#fde047" />
      <circle cx="900" cy="1220" r="25" fill="#fb7185" />
      <path d="M870,1220 H930" stroke="white" stroke-width="4" stroke-linecap="round"/>
    `) 
  },
  { 
    id: 'magic_vibes', 
    name: 'Magic Vibes', 
    src: createSVGFrame(`
      <path d="M0,0 H1000 V1333 H0 Z M100,100 V1050 H900 V100 Z" fill="#d1fae5" fill-rule="evenodd" />
      <g transform="translate(500, 1200)">
        <text text-anchor="middle" font-family="serif" font-weight="900" fill="#059669" font-size="80">Magic Vibes</text>
      </g>
      <g transform="translate(80, 80)">
        <path d="M0,30 V0 H20 V30 Q20,50 0,50 Q-20,50 -20,30 Z" fill="#a78bfa" />
        <rect x="-5" y="-10" width="30" height="10" fill="#78350f" />
      </g>
      <g transform="translate(900, 1180)">
        <path d="M-40,40 Q-60,0 0,-20 Q60,0 40,40" fill="#4ade80" />
        <circle cx="-15" cy="5" r="4" fill="#166534" />
        <path d="M40,0 L60,-20" stroke="#166534" stroke-width="4" />
      </g>
      <path d="M50,1250 L150,1150" stroke="#b45309" stroke-width="8" stroke-linecap="round"/>
      <path d="M150,1150 L170,1130 L190,1150 L170,1170 Z" fill="#fde047" />
    `) 
  },
  { 
    id: 'mermaid_vibes', 
    name: 'Mermaid Vibes', 
    src: createSVGFrame(`
      <path d="M0,0 H1000 V1333 H0 Z M120,100 V1050 H880 V100 Z" fill="#e0f2fe" fill-rule="evenodd" />
      <g transform="translate(500, 1220)">
        <text text-anchor="middle" font-family="serif" font-weight="900" fill="#0369a1" font-size="80">Mermaid Vibes</text>
      </g>
      <g transform="translate(850, 150)">
        <path d="M0,0 Q30,-40 60,0 Q60,60 0,100 Q-60,60 -60,0 Q-30,-40 0,0" fill="#f472b6" opacity="0.8"/>
        <path d="M0,40 Q-20,80 -40,120 M0,40 Q20,80 40,120" stroke="#ec4899" stroke-width="3" fill="none"/>
      </g>
      <g transform="translate(80, 1150)">
        <path d="M0,0 Q-30,-40 -60,0 Q-60,60 0,100 Q60,60 60,0 Q30,-40 0,0" fill="#60a5fa" opacity="0.8"/>
      </g>
      <circle cx="200" cy="50" r="8" fill="white" opacity="0.5"/>
      <circle cx="800" cy="60" r="12" fill="white" opacity="0.5"/>
      <path d="M50,80 L70,100 L50,120 L30,100 Z" fill="#fde047" />
    `) 
  },
  { 
    id: 'frog_mush', 
    name: 'Froggy Forest', 
    src: createSVGFrame(`
      <path d="M0,0 H1000 V1333 H0 Z M120,120 V1070 H880 V120 Z" fill="#ecfdf5" fill-rule="evenodd" />
      <g transform="translate(80, 100)">
        <ellipse cx="0" cy="0" rx="40" ry="30" fill="#4ade80" />
        <circle cx="-20" cy="-25" r="15" fill="#4ade80" />
        <circle cx="20" cy="-25" r="15" fill="#4ade80" />
        <circle cx="-20" cy="-25" r="5" fill="black" />
        <circle cx="20" cy="-25" r="5" fill="black" />
      </g>
      <g transform="translate(880, 150)">
        <path d="M-30,40 V0 Q-30,-40 0,-40 Q30,-40 30,0 V40" fill="#f87171" />
        <rect x="-10" y="40" width="20" height="30" fill="#fef3c7" />
        <circle cx="-10" cy="-15" r="5" fill="white" />
        <circle cx="15" cy="5" r="5" fill="white" />
      </g>
      <g transform="translate(500, 1200)">
        <ellipse cx="0" cy="0" rx="30" ry="20" fill="#fed7aa" />
        <path d="M30,0 Q50,0 50,-20" stroke="#f97316" stroke-width="4" fill="none"/>
      </g>
      <path d="M300,60 Q320,40 340,60" stroke="#10b981" stroke-width="6" fill="none" stroke-linecap="round"/>
    `) 
  },
  { 
    id: 'love_struck', 
    name: 'Love Struck', 
    src: createSVGFrame(`
      <path d="M0,0 H1000 V1333 H0 Z M500,1100 C 100,750 150,250 500,250 C 850,250 900,750 500,1100 Z" fill="#fce7f3" fill-rule="evenodd" />
      <g transform="translate(500, 1220)">
        <text text-anchor="middle" font-family="serif" font-weight="900" fill="#be185d" font-size="80">Love Struck</text>
      </g>
      <g transform="translate(150, 150)">
        <circle cx="0" cy="0" r="40" fill="#fef3c7" />
        <path d="M-40,0 Q-80,-20 -60,-60 M40,0 Q80,-20 60,-60" stroke="#fff" stroke-width="10" fill="none" />
      </g>
      <path d="M800,100 L900,200 M850,100 L800,150" stroke="#be185d" stroke-width="5" />
      <path d="M100,1250 Q120,1220 100,1190 Q80,1220 100,1250" fill="#ef4444" />
    `) 
  },
  { 
    id: 'dreamy_life', 
    name: 'Dreamy Life', 
    src: createSVGFrame(`
      <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#bae6fd" />
        <stop offset="100%" stop-color="#ddd6fe" />
      </linearGradient>
      <path d="M0,0 H1000 V1333 H0 Z M120,120 V1020 H880 V120 Z" fill="url(#skyGrad)" fill-rule="evenodd" />
      <g transform="translate(500, 1200)">
        <text text-anchor="middle" font-family="serif" font-weight="900" fill="#6d28d9" font-size="90">Dreamy Life</text>
      </g>
      <path d="M850,100 Q800,100 800,150 Q800,200 850,200 Q820,150 850,100" fill="#fde047" />
      <g fill="white" opacity="0.9">
        <circle cx="100" cy="180" r="30" />
        <circle cx="140" cy="180" r="40" />
        <circle cx="180" cy="180" r="30" />
      </g>
      <circle cx="500" cy="60" r="5" fill="white" />
      <circle cx="200" cy="1100" r="5" fill="white" />
    `) 
  },
  { 
    id: 'star_gazer', 
    name: 'Star Gazer', 
    src: createSVGFrame(`
      <path d="M0,0 H1000 V1333 H0 Z M500,150 L600,450 L915,450 L660,635 L755,935 L500,750 L245,935 L340,635 L85,450 L400,450 Z" fill="#ddd6fe" fill-rule="evenodd" />
      <g transform="translate(500, 1220)">
        <text text-anchor="middle" font-family="serif" font-weight="900" fill="#4c1d95" font-size="80">Star Gazer</text>
      </g>
      <g transform="translate(100, 1100)">
        <circle cx="0" cy="0" r="40" fill="#fff" stroke="#3b82f6" stroke-width="4"/>
        <rect x="-20" y="-10" width="40" height="20" rx="5" fill="#3b82f6" />
      </g>
      <g transform="translate(850, 150)">
        <path d="M0,0 L20,40 L-20,40 Z" fill="#ef4444" />
        <rect x="-10" y="40" width="20" height="40" fill="#d1d5db" />
      </g>
      <circle cx="50" cy="100" r="30" fill="#fb923c" />
      <path d="M10,100 H90" stroke="#ea580c" stroke-width="4" opacity="0.6"/>
    `) 
  },
  { 
    id: 'dog_flowers', 
    name: 'Dog & Flowers', 
    src: createSVGFrame(`
      <path d="M0,0 H1000 V1333 H0 Z M120,120 V1020 H880 V120 Z" fill="#fefce8" fill-rule="evenodd" />
      <g transform="translate(850, 1200)">
        <circle cx="0" cy="0" r="40" fill="#d6d3d1" />
        <circle cx="-35" cy="-10" r="20" fill="#d6d3d1" />
        <circle cx="35" cy="-10" r="20" fill="#d6d3d1" />
        <circle cx="0" cy="45" r="10" fill="#d6d3d1" />
      </g>
      ${drawFlower(200, 1240, "#fbcfe8")}
      ${drawFlower(400, 1260, "#bfdbfe")}
      ${drawFlower(600, 1240, "#fef08a")}
      <path d="M50,100 Q80,70 110,100 Q80,130 50,100" fill="#fde047" opacity="0.7"/>
    `) 
  },
  { 
    id: 'dreamy_skies', 
    name: 'Dreamy Skies', 
    src: createSVGFrame(`
      <path d="M0,0 H1000 V1333 H0 Z M500,200 C300,200 200,400 200,600 C200,800 350,900 500,900 C650,900 800,800 800,600 C800,400 700,200 500,200 Z" fill="#fef9c3" fill-rule="evenodd" />
      <g transform="translate(500, 1220)">
        <text text-anchor="middle" font-family="serif" font-weight="900" fill="#a16207" font-size="80">Dreamy Skies</text>
      </g>
      <g transform="translate(100, 150)">
        <path d="M0,0 Q30,-20 60,0 L30,40 Z" fill="#60a5fa" />
        <circle cx="10" cy="5" r="2" fill="black" />
      </g>
      <path d="M750,100 Q800,50 850,100" stroke="#f87171" stroke-width="8" fill="none" />
      <path d="M750,120 Q800,70 850,120" stroke="#fbbf24" stroke-width="8" fill="none" />
      <path d="M750,140 Q800,90 850,140" stroke="#60a5fa" stroke-width="8" fill="none" />
    `) 
  },
  { 
    id: 'bestie_vibes', 
    name: 'Bestie Vibes', 
    src: createSVGFrame(`
      <linearGradient id="rainbowGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fecaca" />
        <stop offset="50%" stop-color="#bfdbfe" />
        <stop offset="100%" stop-color="#fef08a" />
      </linearGradient>
      <path d="M0,0 H1000 V1333 H0 Z M120,120 V1020 H880 V120 Z" fill="url(#rainbowGrad)" fill-rule="evenodd" />
      <g transform="translate(500, 1200)">
        <text text-anchor="middle" font-family="serif" font-weight="900" fill="#db2777" font-size="80">Bestie Vibes</text>
      </g>
      <g transform="translate(100, 1150)">
        <rect x="-5" y="0" width="10" height="100" fill="#b45309" rx="5" />
        <path d="M-20,0 L0,-30 L20,0 L0,30 Z" fill="#fde047" />
      </g>
      <g fill="white" opacity="0.8">
        <circle cx="850" cy="150" r="30" />
        <circle cx="900" cy="150" r="25" />
        <circle cx="100" cy="1000" r="25" />
      </g>
    `) 
  },
  { 
    id: 'constellations', 
    name: 'Star Bear', 
    src: createSVGFrame(`
      <path d="M0,0 H1000 V1333 H0 Z M120,120 V1020 H880 V120 Z" fill="#e0e7ff" fill-rule="evenodd" />
      <g transform="translate(850, 1200)">
        <circle cx="0" cy="0" r="60" fill="#a8a29e" />
        <circle cx="-50" cy="-40" r="25" fill="#a8a29e" />
        <circle cx="50" cy="-40" r="25" fill="#a8a29e" />
        <path d="M-15,-10 Q0,-5 15,-10" stroke="white" stroke-width="3" fill="none" />
      </g>
      <path d="M100,100 L200,150 L150,250 L50,200 Z" stroke="#818cf8" stroke-width="2" fill="none" stroke-dasharray="5,5" />
      <circle cx="100" cy="100" r="4" fill="#818cf8" />
      <circle cx="200" cy="150" r="4" fill="#818cf8" />
      <circle cx="150" cy="250" r="4" fill="#818cf8" />
      <circle cx="50" cy="200" r="4" fill="#818cf8" />
      <path d="M850,100 Q820,100 820,130 Q820,160 850,160 Q835,130 850,100" fill="#fde047" />
    `) 
  }
];

export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  { id: 'cinema', name: 'Life4Cuts', description: 'Double Strip (White/Pink)', slots: 4, aspectRatio: 1.25 }, 
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
