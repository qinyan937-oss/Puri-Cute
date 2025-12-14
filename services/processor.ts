import { BackgroundPreset, FramePreset, LayoutTemplate } from "../types";

// Helper to load image from URL/Blob
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};

/**
 * CORE UTILITY: Draw Image Aspect Fill (Cover)
 * Prevents stretching by cropping the image to fill the target area while maintaining aspect ratio.
 * 
 * @param alignTop - If true, aligns image to the top edge (cropping bottom).
 * @param focusY - Optional (0.0 to 1.0). 0=Top, 0.5=Center, 1=Bottom. Overrides alignTop if provided.
 */
const drawImageAspectFill = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | HTMLCanvasElement,
  x: number,
  y: number,
  w: number,
  h: number,
  alignTop: boolean = false,
  focusY?: number
) => {
  const scale = Math.max(w / img.width, h / img.height);
  const nw = img.width * scale;
  const nh = img.height * scale;
  const nx = x - (nw - w) / 2; // Always center horizontally
  
  // Calculate vertical position
  let ny;
  
  if (focusY !== undefined) {
      // Custom vertical focus (0.0 - 1.0)
      // focusY = 0 -> Top aligned (0 offset)
      // focusY = 0.5 -> Center ((nh-h)/2)
      // We essentially want to shift the image up by a percentage of the overflow
      const overflowH = nh - h;
      ny = y - (overflowH * focusY);
  } else if (alignTop && nh > h) {
      // Legacy alignTop support
      ny = y;
  } else {
      // Default: Center vertically
      ny = y - (nh - h) / 2;
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, nx, ny, nw, nh);
  ctx.restore();
};

/**
 * DECORATION: Draw Star
 */
const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number, color: string, filled: boolean = true) => {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    if (filled) {
        ctx.fillStyle = color;
        ctx.fill();
    } else {
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.stroke();
    }
    ctx.restore();
}

/**
 * DECORATION: Draw Heart
 */
const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) => {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  let topCurveHeight = h * 0.3;
  ctx.moveTo(x, y + topCurveHeight);
  ctx.bezierCurveTo(x, y, x - w / 2, y, x - w / 2, y + topCurveHeight);
  ctx.bezierCurveTo(x - w / 2, y + (h + topCurveHeight) / 2, x, y + (h + topCurveHeight) / 2, x, y + h);
  ctx.bezierCurveTo(x, y + (h + topCurveHeight) / 2, x + w / 2, y + (h + topCurveHeight) / 2, x + w / 2, y + topCurveHeight);
  ctx.bezierCurveTo(x + w / 2, y, x, y, x, y + topCurveHeight);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

/**
 * EFFECT: Draw Noise Overlay (Film Grain)
 */
const drawNoiseOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number, intensity: number = 0.35) => {
    // Create a small pattern canvas for performance
    const patternSize = 100;
    const pCanvas = document.createElement('canvas');
    pCanvas.width = patternSize;
    pCanvas.height = patternSize;
    const pCtx = pCanvas.getContext('2d');
    if (!pCtx) return;

    const imgData = pCtx.createImageData(patternSize, patternSize);
    const buffer = new Uint32Array(imgData.data.buffer);

    for (let i = 0; i < buffer.length; i++) {
        // Random grey value (0-255)
        const val = Math.random() * 255;
        // ABGR format (Little Endian): Alpha=255, B=val, G=val, R=val
        buffer[i] = (255 << 24) | (val << 16) | (val << 8) | val;
    }
    pCtx.putImageData(imgData, 0, 0);

    ctx.save();
    // 'overlay' blends the noise naturally: 
    // < 50% grey darkens the image, > 50% grey lightens it.
    ctx.globalCompositeOperation = 'overlay'; 
    ctx.globalAlpha = intensity;
    
    const pattern = ctx.createPattern(pCanvas, 'repeat');
    if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, width, height);
    }
    ctx.restore();
};

interface RenderParams {
  canvas: HTMLCanvasElement;
  personImage: HTMLImageElement;
  backgroundImage?: BackgroundPreset;
  frameImage?: HTMLImageElement | null;
  lightingEnabled: boolean;
  noiseLevel?: number; // 0.0 to 1.0 (Recommended max around 0.5)
}

// Renders a SINGLE processed image (with BG and Frame)
export const renderComposite = (params: RenderParams) => {
  const { canvas, personImage, backgroundImage, frameImage, lightingEnabled, noiseLevel } = params;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const TARGET_WIDTH = 1000;
  const TARGET_HEIGHT = 1400;

  canvas.width = TARGET_WIDTH;
  canvas.height = TARGET_HEIGHT;

  ctx.clearRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

  // 1. Background
  ctx.save();
  if (backgroundImage) {
    if (backgroundImage.type === 'color' || backgroundImage.type === 'gradient') {
        if (backgroundImage.type === 'gradient') {
             const grad = ctx.createLinearGradient(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
             if (backgroundImage.id.includes('grad-1')) {
                grad.addColorStop(0, '#fbc2eb');
                grad.addColorStop(1, '#a6c1ee');
             } else if (backgroundImage.id.includes('grad-2')) {
                grad.addColorStop(0, '#f6d365');
                grad.addColorStop(1, '#fda085');
             } else if (backgroundImage.id.includes('grad-3')) {
                grad.addColorStop(0, '#a18cd1');
                grad.addColorStop(1, '#fbc2eb');
             } else {
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(1, '#eeeeee');
             }
             ctx.fillStyle = grad;
        } else {
            ctx.fillStyle = backgroundImage.value;
        }
        ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
    }
  } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
  }
  ctx.restore();

  // 2. Person Image (Aspect Fill / Cover)
  ctx.save();
  // Beauty Filters (Updated to requirements: Brightness +15%, Contrast -5%, Saturation +5%)
  if (lightingEnabled) {
     ctx.filter = "brightness(1.15) contrast(0.95) saturate(1.05)";
  }
  
  // Use the aspect fill helper to ensure the image covers the ENTIRE canvas
  // Editor view: Use focusY=0.2 (20% from top) to frame face nicely without cutting forehead or chin
  drawImageAspectFill(ctx, personImage, 0, 0, TARGET_WIDTH, TARGET_HEIGHT, false, 0.2);
  
  // 2.1 Apply Noise (Grain) if enabled
  // Applied AFTER the image is drawn but BEFORE the frame overlay
  if (noiseLevel && noiseLevel > 0) {
      drawNoiseOverlay(ctx, TARGET_WIDTH, TARGET_HEIGHT, noiseLevel);
  }
  
  ctx.restore();

  // 3. Frame
  if (frameImage) {
    ctx.drawImage(frameImage, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);
  }
};

// ==========================================
//          TEMPLATE DRAWING LOGIC
// ==========================================

// Helper to cycle through multiple source images
const getSource = (sources: HTMLCanvasElement[], index: number) => {
    return sources[index % sources.length];
};

const drawStandardLayout = (
    ctx: CanvasRenderingContext2D, 
    sourceCanvases: HTMLCanvasElement[], 
    WIDTH: number, 
    HEIGHT: number, 
    location: string, 
    date: string
) => {
    // 1. Grid Background (Covers EVERYTHING)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.save();
    
    // Grid settings
    const minorGridSize = 25; 
    const majorGridSize = minorGridSize * 4; 
    
    // 1.1 Draw Minor Grid
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#e2e8f0'; 
    for (let x = 0; x <= WIDTH; x += minorGridSize) {
        ctx.moveTo(x, 0); ctx.lineTo(x, HEIGHT);
    }
    for (let y = 0; y <= HEIGHT; y += minorGridSize) {
        ctx.moveTo(0, y); ctx.lineTo(WIDTH, y);
    }
    ctx.stroke();

    // 1.2 Draw Major Grid
    ctx.beginPath();
    ctx.lineWidth = 2; 
    ctx.strokeStyle = '#94a3b8'; 
    for (let x = 0; x <= WIDTH; x += majorGridSize) {
        ctx.moveTo(x, 0); ctx.lineTo(x, HEIGHT);
    }
    for (let y = 0; y <= HEIGHT; y += majorGridSize) {
        ctx.moveTo(0, y); ctx.lineTo(WIDTH, y);
    }
    ctx.stroke();
    
    // 1.3 Add "Cut Marks"
    ctx.fillStyle = '#475569';
    for (let x = 0; x <= WIDTH; x += majorGridSize * 2) {
         ctx.beginPath(); ctx.moveTo(x - 6, 0); ctx.lineTo(x + 6, 0); ctx.lineTo(x, 12); ctx.fill();
         ctx.beginPath(); ctx.moveTo(x - 6, HEIGHT); ctx.lineTo(x + 6, HEIGHT); ctx.lineTo(x, HEIGHT - 12); ctx.fill();
    }
    ctx.restore();

    // Define Areas
    const SIDEBAR_X = 1300; 
    const sidebarWidth = WIDTH - SIDEBAR_X;

    // 2. Main Area Photos
    const M_WIDTH = 580;
    const M_HEIGHT = 720;
    const GAP = 40;
    const startMX = (SIDEBAR_X - (M_WIDTH * 2 + GAP)) / 2;
    const TOP_Y = 80;

    [0, 1].forEach(i => {
        const x = startMX + i * (M_WIDTH + GAP);
        const pad = 10;
        ctx.fillStyle = '#fff';
        ctx.fillRect(x - pad, TOP_Y - pad, M_WIDTH + pad*2, M_HEIGHT + pad*2);
        
        // Use cycled source
        const img = getSource(sourceCanvases, i);
        drawImageAspectFill(ctx, img, x, TOP_Y, M_WIDTH, M_HEIGHT, true);
        
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#94a3b8';
        ctx.strokeRect(x, TOP_Y, M_WIDTH, M_HEIGHT);
    });

    // Bottom Row: 4 Small Photos
    const S_WIDTH = 265;
    const S_HEIGHT = 340;
    const GAP_S = 30;
    const startSX = (SIDEBAR_X - (S_WIDTH * 4 + GAP_S * 3)) / 2;
    const BOTTOM_Y = 860; 

    for(let i=0; i<4; i++) {
        const x = startSX + i * (S_WIDTH + GAP_S);
        const pad = 5;
        ctx.fillStyle = '#fff';
        ctx.fillRect(x - pad, BOTTOM_Y - pad, S_WIDTH + pad*2, S_HEIGHT + pad*2);
        
        // Use cycled source (offset by 2 to continue sequence if using multiple)
        const img = getSource(sourceCanvases, i + 2);
        drawImageAspectFill(ctx, img, x, BOTTOM_Y, S_WIDTH, S_HEIGHT, true);
        
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#94a3b8';
        ctx.strokeRect(x, BOTTOM_Y, S_WIDTH, S_HEIGHT);
    }

    // 3. Sidebar (Info + Wallet Photo)
    const contentX = SIDEBAR_X + 40;
    const contentW = sidebarWidth - 80;
    
    // Info Card
    const cardY = 80;
    const cardH = 500;
    
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowBlur = 15;
    ctx.fillRect(contentX, cardY, contentW, cardH);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.strokeRect(contentX, cardY, contentW, cardH);
    
    ctx.textAlign = 'center';
    const cx = contentX + contentW / 2;
    
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText("ID PHOTO", cx, cardY + 60);
    
    ctx.beginPath(); 
    ctx.moveTo(contentX + 20, cardY + 80); 
    ctx.lineTo(contentX + contentW - 20, cardY + 80);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Camera Icon
    const iconY = cardY + 140;
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath(); ctx.roundRect(cx - 35, iconY - 25, 70, 50, 8); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(cx, iconY, 18, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath(); ctx.arc(cx, iconY, 10, 0, Math.PI*2); ctx.fill();

    ctx.textAlign = 'left';
    const textX = contentX + 30;
    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.fillText("DATE", textX, cardY + 220);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(date, textX, cardY + 250);

    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.fillText("LOCATION", textX, cardY + 300);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 18px sans-serif';
    const locLines = location.toUpperCase().split(' ');
    let ly = cardY + 330;
    locLines.forEach((word, idx) => {
         if(idx > 2) return;
         ctx.fillText(word, textX, ly);
         ly += 25;
    });

    ctx.save();
    ctx.translate(cx + 60, cardY + 420);
    ctx.rotate(-20 * Math.PI / 180);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(0, 0, 40, 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("PERFECT", 0, 5);
    ctx.restore();
    ctx.restore();

    // Wallet Photo
    const walletW = 220;
    const walletH = 300;
    const walletX = contentX + (contentW - walletW) / 2;
    const walletY = BOTTOM_Y + (S_HEIGHT - walletH);

    ctx.save();
    ctx.strokeStyle = '#94a3b8';
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(walletX - 10, walletY - 10, walletW + 20, walletH + 20);
    
    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("WALLET SIZE", walletX + walletW/2, walletY - 15);
    
    ctx.fillStyle = '#fff';
    ctx.fillRect(walletX, walletY, walletW, walletH);
    // !! Align Top = true to crop from bottom
    // Use first image for wallet usually
    drawImageAspectFill(ctx, sourceCanvases[0], walletX, walletY, walletW, walletH, true);
    ctx.setLineDash([]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#cbd5e1';
    ctx.strokeRect(walletX, walletY, walletW, walletH);
    ctx.restore();
};

/**
 * TEMPLATE A: Kawaii Magazine
 */
const drawMagazineLayout = (
    ctx: CanvasRenderingContext2D, 
    sourceCanvases: HTMLCanvasElement[], 
    WIDTH: number, 
    HEIGHT: number,
    location: string,
    date: string
) => {
    // 1. Dreamy Vertical Gradient Background
    const grad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    grad.addColorStop(0, '#FFC3EB'); 
    grad.addColorStop(0.5, '#FFFFE0'); 
    grad.addColorStop(1, '#C3FBD8'); 
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // 2. Confetti
    const colors = ['#ffffff', '#FF69B4', '#87CEFA', '#FFFFE0', '#DDA0DD'];
    for (let i = 0; i < 50; i++) {
        const cx = Math.random() * WIDTH;
        const cy = Math.random() * HEIGHT;
        const type = Math.floor(Math.random() * 3);
        const size = 5 + Math.random() * 15;
        const color = colors[Math.floor(Math.random() * colors.length)];

        ctx.save();
        ctx.globalAlpha = 0.6 + Math.random() * 0.4;
        
        if (type === 0) {
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath(); ctx.arc(cx, cy, size / 2, 0, Math.PI * 2); ctx.fill();
        } else if (type === 1) {
            drawStar(ctx, cx, cy, 5, size, size/2, '#FFFacd', false); 
        } else {
            drawHeart(ctx, cx, cy, size * 2, size * 2, '#FFB6C1');
        }
        ctx.restore();
    }

    // 5. Text
    ctx.save();
    ctx.translate(WIDTH / 2, 140);
    ctx.font = '900 85px "M PLUS Rounded 1c", sans-serif'; 
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FF69B4'; 
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 8;
    ctx.strokeText("MAGICAL TIME", 0, 0);
    ctx.fillText("MAGICAL TIME", 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(WIDTH - 250, HEIGHT - 150);
    ctx.rotate(-15 * Math.PI / 180);
    ctx.fillStyle = '#FFD700';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 5;
    ctx.font = '900 60px sans-serif';
    ctx.strokeText("BESTIE VIBES", 0, 0);
    ctx.fillText("BESTIE VIBES", 0, 0);
    ctx.restore();

    // 3. Layout: Top Polaroids (Rotated)
    const polaroidW = 380; 
    const polaroidH = 480; 
    const centerX = WIDTH / 2;
    const topYBase = 320; 

    const positions = [
        { x: centerX - 480, y: topYBase + 40, rot: -8 * Math.PI / 180 },
        { x: centerX,       y: topYBase,      rot: 2 * Math.PI / 180 },
        { x: centerX + 480, y: topYBase + 40, rot: 8 * Math.PI / 180 }
    ];

    positions.forEach((pos, i) => {
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(pos.rot);
        
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 10;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-polaroidW / 2, -polaroidH / 2, polaroidW, polaroidH);
        
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        const imgSize = 340;
        const imgYOffset = -polaroidH / 2 + 20;
        
        // Cycle images for polaroids (Indices 0, 1, 2)
        const img = getSource(sourceCanvases, i);
        drawImageAspectFill(ctx, img, -imgSize/2, imgYOffset, imgSize, imgSize, true);

        ctx.fillStyle = '#333';
        ctx.font = 'bold 20px "Comic Sans MS", cursive, sans-serif';
        ctx.textAlign = 'center';
        const randomTexts = ["Cute!", "Love", "XOXO", "Date", "Smile"];
        const txt = randomTexts[Math.floor(Math.random() * randomTexts.length)];
        ctx.fillText(txt, 0, polaroidH / 2 - 30);

        ctx.restore();
    });

    // 4. Layout: Main Hero Photo (Bottom Center)
    const heroW = 700;
    const heroH = 500;
    const heroX = (WIDTH - heroW) / 2;
    const heroY = HEIGHT - heroH - 80;

    ctx.save();
    ctx.lineWidth = 15;
    ctx.strokeStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 10;
    
    // Cycle image for main (Index 3 or recycle 0)
    const heroImg = getSource(sourceCanvases, 3);
    drawImageAspectFill(ctx, heroImg, heroX, heroY, heroW, heroH, true);
    
    ctx.strokeRect(heroX, heroY, heroW, heroH);

    ctx.fillStyle = 'rgba(255, 182, 193, 0.8)';
    ctx.fillRect(heroX - 20, heroY - 10, 80, 25);
    ctx.fillRect(heroX + heroW - 60, heroY + heroH - 15, 80, 25);
    ctx.restore();
};

/**
 * TEMPLATE B: Cinema -> "Life4Cuts"
 */
const drawCinemaLayout = (
    ctx: CanvasRenderingContext2D, 
    sourceCanvases: HTMLCanvasElement[], 
    WIDTH: number, 
    HEIGHT: number
) => {
    // 1. Black Background
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // 2. Define Strip Logic
    const stripWidth = 480; 
    const gapBetweenStrips = 120;
    
    const totalGroupW = (stripWidth * 2) + gapBetweenStrips;
    const startX = (WIDTH - totalGroupW) / 2;

    const drawStrip = (baseX: number) => {
        const topMargin = 60;
        const footerSpace = 180; 
        const photoGap = 20; 
        
        const availableH = HEIGHT - topMargin - footerSpace;
        const photoH = (availableH - (photoGap * 3)) / 4; 
        
        const sidePadding = 30; 
        const photoW = stripWidth - (sidePadding * 2);

        // Draw 4 Photos
        for (let i = 0; i < 4; i++) {
            const y = topMargin + i * (photoH + photoGap);
            const x = baseX + sidePadding;
            
            // Cycle 0, 1, 2, 3
            const img = getSource(sourceCanvases, i);
            drawImageAspectFill(ctx, img, x, y, photoW, photoH, false, 0.25);
        }

        // Sprocket Holes
        const holeW = 12;
        const holeH = 20;
        const holeGap = 30;
        
        ctx.save();
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 0.6; 
        
        const leftHoleX = baseX + 8;
        const rightHoleX = baseX + stripWidth - 8 - holeW;

        for (let y = 30; y < HEIGHT - 20; y += (holeH + holeGap)) {
            ctx.beginPath(); ctx.roundRect(leftHoleX, y, holeW, holeH, 2); ctx.fill();
            ctx.beginPath(); ctx.roundRect(rightHoleX, y, holeW, holeH, 2); ctx.fill();
        }
        ctx.restore();

        // Footer
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '700 20px "Helvetica Neue", sans-serif';
        const stripFooterY = HEIGHT - 80;
        ctx.fillText("LIFE4CUTS", baseX + stripWidth/2, stripFooterY);
        ctx.font = '400 12px "Helvetica Neue", sans-serif';
        ctx.globalAlpha = 0.7;
        const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '.');
        ctx.fillText(dateStr, baseX + stripWidth/2, stripFooterY + 25);
        ctx.restore();
    };

    // Draw Left Strip
    drawStrip(startX);
    // Draw Right Strip (Duplicate)
    drawStrip(startX + stripWidth + gapBetweenStrips);
};

/**
 * TEMPLATE C: Wanted Poster
 */
const drawWantedLayout = (
    ctx: CanvasRenderingContext2D, 
    sourceCanvases: HTMLCanvasElement[], 
    WIDTH: number, 
    HEIGHT: number
) => {
    // 1. Background
    ctx.fillStyle = '#F4E4BC';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#8B4513'; 
    ctx.strokeRect(60, 60, WIDTH - 120, HEIGHT - 120);

    ctx.fillStyle = '#808080';
    const nailOffset = 80;
    [nailOffset, WIDTH-nailOffset].forEach(x => {
        [nailOffset, HEIGHT-nailOffset].forEach(y => {
            ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#DDD';
            ctx.beginPath(); ctx.arc(x-3, y-3, 4, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#808080';
        });
    });

    // 2. Titles
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.font = '900 200px serif';
    ctx.fillText("WANTED", WIDTH/2, 280);
    ctx.font = 'bold 60px serif';
    ctx.fillText("BOUNTY: $100,000,000", WIDTH/2, 360);

    // 3. Photo
    const photoW = 900;
    const photoH = 750;
    const photoX = (WIDTH - photoW) / 2;
    const photoY = 400;
    
    // Use First Image
    drawImageAspectFill(ctx, sourceCanvases[0], photoX, photoY, photoW, photoH, true);
    
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#3E2723';
    ctx.strokeRect(photoX, photoY, photoW, photoH);

    // 4. Stamped Text
    ctx.save();
    ctx.translate(photoX + photoW - 120, photoY + photoH - 80);
    ctx.rotate(-15 * Math.PI / 180);
    
    const stampColor = 'rgba(210, 43, 43, 0.8)';
    ctx.strokeStyle = stampColor;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.roundRect(-150, -50, 300, 100, 15);
    ctx.stroke();
    
    ctx.fillStyle = stampColor;
    ctx.font = '900 50px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("TOO CUTE", 0, 18);
    ctx.restore();

    // 5. Random Status
    const reward = "EXTREMELY DANGEROUS";
    ctx.save();
    ctx.translate(WIDTH/2, photoY + photoH + 150);
    ctx.rotate(-2 * Math.PI / 180);
    ctx.fillStyle = '#D22B2B'; 
    ctx.font = '900 70px serif'; 
    ctx.textAlign = 'center';
    ctx.fillText(reward, 0, 0);
    ctx.restore();
};

export const generateLayoutSheet = (
  sourceCanvases: HTMLCanvasElement[], 
  templateId: string,
  locationText: string = "TOKYO STATION", 
  dateText: string = ""
): string => {
  if (sourceCanvases.length === 0) return '';

  // 1. Render to High-Res Virtual Canvas (Master Layout)
  const MASTER_WIDTH = 1748; 
  const MASTER_HEIGHT = 1181;
  
  const virtualCanvas = document.createElement('canvas');
  virtualCanvas.width = MASTER_WIDTH;
  virtualCanvas.height = MASTER_HEIGHT;
  const vCtx = virtualCanvas.getContext('2d');
  
  if (!vCtx) return '';

  const date = dateText || new Date().toISOString().split('T')[0].replace(/-/g, '.');

  switch (templateId) {
      case 'magazine':
          drawMagazineLayout(vCtx, sourceCanvases, MASTER_WIDTH, MASTER_HEIGHT, locationText, date);
          break;
      case 'cinema':
          drawCinemaLayout(vCtx, sourceCanvases, MASTER_WIDTH, MASTER_HEIGHT);
          break;
      case 'wanted':
          drawWantedLayout(vCtx, sourceCanvases, MASTER_WIDTH, MASTER_HEIGHT);
          break;
      case 'standard':
      default:
          drawStandardLayout(vCtx, sourceCanvases, MASTER_WIDTH, MASTER_HEIGHT, locationText, date);
          break;
  }

  // 2. Output Canvas - L Size (89mm x 127mm) @ 300 DPI
  const TARGET_WIDTH = 1500;
  const TARGET_HEIGHT = 1050;

  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = TARGET_WIDTH;
  finalCanvas.height = TARGET_HEIGHT;
  const ctx = finalCanvas.getContext('2d');
  
  if (!ctx) return '';

  // Fill white (for the letterboxing bars)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

  // 3. Draw Virtual Canvas into Final Canvas (Scale to FIT / CONTAIN)
  const scale = Math.min(TARGET_WIDTH / MASTER_WIDTH, TARGET_HEIGHT / MASTER_HEIGHT);
  
  const drawW = MASTER_WIDTH * scale;
  const drawH = MASTER_HEIGHT * scale;
  const drawX = (TARGET_WIDTH - drawW) / 2;
  const drawY = (TARGET_HEIGHT - drawH) / 2;

  ctx.drawImage(virtualCanvas, drawX, drawY, drawW, drawH);

  return finalCanvas.toDataURL('image/png', 1.0);
};