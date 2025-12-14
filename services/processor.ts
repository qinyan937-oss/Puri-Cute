import { BackgroundPreset, FramePreset, LayoutTemplate, DecorationState } from "../types";

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
  const nx = x - (nw - w) / 2; 
  
  let ny;
  
  if (focusY !== undefined) {
      const overflowH = nh - h;
      ny = y - (overflowH * focusY);
  } else if (alignTop && nh > h) {
      ny = y;
  } else {
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
 * DECORATION: Draw Y2K Metallic/Holo Sticker
 */
const drawY2KSticker = (ctx: CanvasRenderingContext2D, id: string) => {
    const isHolo = id.includes('holo');
    const isMoon = id.includes('moon');
    const isCross = id.includes('cross');
    
    // Gradient definitions
    let grad;
    if (isHolo) {
        // Holographic: Pink -> Cyan -> White
        grad = ctx.createLinearGradient(-50, -50, 50, 50);
        grad.addColorStop(0, '#FFC3EB');
        grad.addColorStop(0.5, '#C3FBD8');
        grad.addColorStop(1, '#ACE0F9');
    } else {
        // Silver Metallic: Grey -> White -> Grey
        grad = ctx.createLinearGradient(-50, -50, 50, 50);
        grad.addColorStop(0, '#E0E0E0');
        grad.addColorStop(0.4, '#FFFFFF');
        grad.addColorStop(0.6, '#FFFFFF');
        grad.addColorStop(1, '#A0A0A0');
    }

    // Glow Effect
    ctx.shadowBlur = 15;
    ctx.shadowColor = isHolo ? '#FF69B4' : '#ACE0F9';

    ctx.fillStyle = grad;
    ctx.beginPath();

    if (isMoon) {
        // Crescent Moon using arc
        ctx.arc(0, 0, 50, 2.0, 5.5, false); // Outer
        ctx.bezierCurveTo(20, -30, 20, 30, -21, 35); // Inner curve
        ctx.closePath();
    } else if (isCross) {
        // Y2K Cross/Sparkle (Sharp)
        ctx.moveTo(0, -60);
        ctx.quadraticCurveTo(5, -10, 60, 0);
        ctx.quadraticCurveTo(5, 10, 0, 60);
        ctx.quadraticCurveTo(-5, 10, -60, 0);
        ctx.quadraticCurveTo(-5, -10, 0, -60);
    } else {
        // 5-Point Star
        const spikes = 5;
        const outerRadius = 55;
        const innerRadius = 25;
        let rot = Math.PI / 2 * 3;
        let x = 0;
        let y = 0;
        let step = Math.PI / spikes;
        
        ctx.moveTo(0, 0 - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = 0 + Math.cos(rot) * outerRadius;
            y = 0 + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = 0 + Math.cos(rot) * innerRadius;
            y = 0 + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(0, 0 - outerRadius);
    }
    
    ctx.fill();

    // High Gloss Bevel (White Highlight)
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.stroke();

    // Reset Shadow
    ctx.shadowBlur = 0;
};

/**
 * DECORATION: Draw Coquette Ribbon
 */
const drawRibbonSticker = (ctx: CanvasRenderingContext2D, id: string) => {
    const isPink = id.includes('pink');
    const isBlue = id.includes('blue');
    const isCheck = id.includes('check');

    const baseColor = isPink ? '#FFC0CB' : (isBlue ? '#87CEFA' : '#D22B2B');
    const darkColor = isPink ? '#FF69B4' : (isBlue ? '#4682B4' : '#8B0000');

    // Draw Function for the Bow Shape
    const drawBowShape = (context: CanvasRenderingContext2D) => {
        context.beginPath();
        // Left Loop
        context.moveTo(0, 0);
        context.bezierCurveTo(-40, -40, -80, -20, -40, 20);
        context.lineTo(0, 0);
        // Right Loop
        context.bezierCurveTo(40, -40, 80, -20, 40, 20);
        context.lineTo(0, 0);
        // Tails
        context.moveTo(0, 0);
        context.quadraticCurveTo(-20, 50, -50, 60);
        context.lineTo(-30, 60); // Tail notch width
        context.quadraticCurveTo(-15, 50, 0, 10);

        context.moveTo(0, 0);
        context.quadraticCurveTo(20, 50, 50, 60);
        context.lineTo(30, 60);
        context.quadraticCurveTo(15, 50, 0, 10);
    };

    // 1. Fill
    ctx.save();
    drawBowShape(ctx);
    
    if (isCheck) {
        // Gingham Pattern
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.clip(); // Clip to bow shape

        // Draw Stripes
        ctx.beginPath();
        ctx.lineWidth = 4;
        ctx.strokeStyle = baseColor;
        for(let i=-100; i<100; i+=8) {
             ctx.moveTo(i, -100); ctx.lineTo(i, 100); // Vertical
             ctx.moveTo(-100, i); ctx.lineTo(100, i); // Horizontal
        }
        ctx.stroke();
    } else {
        // Satin Gradient
        const grad = ctx.createLinearGradient(-40, -40, 40, 40);
        grad.addColorStop(0, baseColor);
        grad.addColorStop(0.5, 'white'); // Satin sheen
        grad.addColorStop(1, baseColor);
        ctx.fillStyle = grad;
        ctx.fill();
    }
    ctx.restore();

    // 2. Outline & Shadow Definition
    ctx.lineWidth = 1;
    ctx.strokeStyle = darkColor;
    drawBowShape(ctx);
    ctx.stroke();

    // 3. Knot
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fillStyle = isCheck ? baseColor : darkColor;
    ctx.fill();
};

/**
 * DECORATION: Draw Purikura Doodle
 */
const drawDoodleSticker = (ctx: CanvasRenderingContext2D, id: string) => {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Style: White line with Pink glow/outline
    const drawStroke = (pathFn: () => void) => {
        // Outline/Shadow
        ctx.beginPath();
        pathFn();
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#FF69B4'; // Hot Pink outline
        ctx.stroke();

        // Main White Line
        ctx.beginPath();
        pathFn();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();
    };

    if (id.includes('sparkle')) {
        drawStroke(() => {
            ctx.moveTo(0, -30); ctx.lineTo(0, 30);
            ctx.moveTo(-20, 0); ctx.lineTo(20, 0);
            // Little corner sparkles
            ctx.moveTo(15, -15); ctx.lineTo(18, -18);
        });
    } else if (id.includes('heart')) {
        drawStroke(() => {
            ctx.moveTo(0, 15);
            ctx.bezierCurveTo(-20, -10, -40, 10, 0, 40);
            ctx.bezierCurveTo(40, 10, 20, -10, 0, 15);
            // Scribble fill effect
            ctx.moveTo(-10, 20); ctx.lineTo(10, 20);
        });
    } else if (id.includes('wings')) {
        drawStroke(() => {
            // Left Wing
            ctx.moveTo(-10, 0); 
            ctx.quadraticCurveTo(-40, -30, -70, -10);
            ctx.quadraticCurveTo(-60, 10, -50, 10);
            ctx.quadraticCurveTo(-40, 20, -10, 10);
            
            // Right Wing
            ctx.moveTo(10, 0);
            ctx.quadraticCurveTo(40, -30, 70, -10);
            ctx.quadraticCurveTo(60, 10, 50, 10);
            ctx.quadraticCurveTo(40, 20, 10, 10);
        });
    } else if (id.includes('whiskers')) {
        drawStroke(() => {
            // Left
            ctx.moveTo(-60, -10); ctx.lineTo(-100, -20);
            ctx.moveTo(-60, 10); ctx.lineTo(-100, 10);
            ctx.moveTo(-60, 30); ctx.lineTo(-100, 40);
            // Right
            ctx.moveTo(60, -10); ctx.lineTo(100, -20);
            ctx.moveTo(60, 10); ctx.lineTo(100, 10);
            ctx.moveTo(60, 30); ctx.lineTo(100, 40);
        });
    } else if (id.includes('crown')) {
        drawStroke(() => {
            ctx.moveTo(-30, 20);
            ctx.lineTo(-30, -10); ctx.lineTo(-15, 10);
            ctx.lineTo(0, -20); ctx.lineTo(15, 10);
            ctx.lineTo(30, -10); ctx.lineTo(30, 20);
            ctx.closePath();
            // Jewels
            ctx.moveTo(0, -25); ctx.arc(0, -25, 2, 0, Math.PI*2);
        });
    }
};

/**
 * DECORATION: Draw Retro Xmas (1950s-60s)
 */
const drawRetroXmas = (ctx: CanvasRenderingContext2D, id: string) => {
    // Palette
    const RED = '#C4423F';
    const GREEN = '#2E5E4E';
    const GOLD = '#D4AF37';
    const CREAM = '#F2E8C9';
    const STROKE = '#4A3328';
    
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    const applyRetroStroke = () => {
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = STROKE;
        ctx.stroke();
    };

    if (id.includes('bauble')) {
        // 1. Classic Bauble
        ctx.beginPath();
        ctx.arc(0, 10, 45, 0, Math.PI * 2);
        ctx.fillStyle = RED;
        ctx.fill();
        
        // Stripe
        ctx.save();
        ctx.beginPath(); ctx.arc(0, 10, 45, 0, Math.PI*2); ctx.clip();
        ctx.fillStyle = CREAM;
        ctx.fillRect(-50, 0, 100, 20);
        // Dots on stripe
        ctx.fillStyle = GREEN;
        ctx.beginPath(); ctx.arc(-25, 10, 4, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(0, 10, 4, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(25, 10, 4, 0, Math.PI*2); ctx.fill();
        ctx.restore();
        
        // Main Stroke
        ctx.beginPath(); ctx.arc(0, 10, 45, 0, Math.PI * 2);
        applyRetroStroke();

        // Cap
        ctx.fillStyle = GOLD;
        ctx.fillRect(-10, -40, 20, 10);
        ctx.strokeRect(-10, -40, 20, 10);
        ctx.beginPath(); ctx.arc(0, -45, 5, 0, Math.PI*2); 
        ctx.stroke();
        
    } else if (id.includes('holly')) {
        // 2. Holly & Berries
        const drawLeaf = (angle: number) => {
            ctx.save();
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(15, -10, 30, 0); // Side 1 part 1
            ctx.quadraticCurveTo(45, -10, 60, 0); // Tip
            ctx.quadraticCurveTo(45, 10, 30, 0);
            ctx.quadraticCurveTo(15, 10, 0, 0);
            ctx.fillStyle = GREEN;
            ctx.fill();
            applyRetroStroke();
            // Veins
            ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(55,0);
            ctx.strokeStyle = CREAM; ctx.lineWidth = 1; ctx.stroke();
            ctx.restore();
        };

        drawLeaf(-0.5);
        drawLeaf(0.5);

        // Berries
        const drawBerry = (bx: number, by: number) => {
            ctx.beginPath(); ctx.arc(bx, by, 8, 0, Math.PI*2);
            ctx.fillStyle = RED; ctx.fill();
            applyRetroStroke();
            ctx.fillStyle = 'white';
            ctx.beginPath(); ctx.arc(bx - 2, by - 2, 2, 0, Math.PI*2); ctx.fill();
        };
        drawBerry(-5, -5);
        drawBerry(8, 0);
        drawBerry(0, 8);

    } else if (id.includes('light')) {
        // 3. Vintage C9 Light
        ctx.save();
        ctx.shadowColor = GOLD;
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.moveTo(0, -40);
        ctx.bezierCurveTo(30, -10, 30, 30, 0, 50);
        ctx.bezierCurveTo(-30, 30, -30, -10, 0, -40);
        ctx.fillStyle = GOLD;
        ctx.fill();
        ctx.restore(); 

        ctx.beginPath();
        ctx.moveTo(0, -40);
        ctx.bezierCurveTo(30, -10, 30, 30, 0, 50);
        ctx.bezierCurveTo(-30, 30, -30, -10, 0, -40);
        applyRetroStroke();

        ctx.fillStyle = '#C0C0C0'; 
        ctx.fillRect(-12, -55, 24, 15);
        ctx.strokeRect(-12, -55, 24, 15);
        ctx.beginPath();
        ctx.moveTo(-12, -50); ctx.lineTo(12, -50);
        ctx.moveTo(-12, -45); ctx.lineTo(12, -45);
        ctx.lineWidth = 1;
        ctx.strokeStyle = STROKE;
        ctx.stroke();

    } else if (id.includes('stocking')) {
        // 4. Retro Stocking (Boot)
        ctx.beginPath();
        ctx.moveTo(-15, -50); // Top left
        ctx.lineTo(15, -50);  // Top right
        ctx.lineTo(15, 0);    // Ankle right
        ctx.bezierCurveTo(15, 30, 20, 35, 35, 40); // Heel curve to toe top
        ctx.lineTo(35, 55);   // Toe bottom
        ctx.bezierCurveTo(0, 55, -20, 45, -25, 35); // Heel
        ctx.lineTo(-25, 0); // Back of leg
        ctx.lineTo(-15, -50);
        ctx.closePath();
        
        ctx.fillStyle = RED;
        ctx.fill();
        applyRetroStroke();

        // Cuff
        ctx.fillStyle = CREAM;
        ctx.fillRect(-20, -50, 40, 15);
        ctx.strokeRect(-20, -50, 40, 15);

        // Patches
        ctx.fillStyle = GREEN;
        // Toe patch
        ctx.beginPath(); ctx.moveTo(35, 40); ctx.lineTo(35, 55); ctx.lineTo(20, 50); ctx.fill();
        // Heel patch
        ctx.beginPath(); ctx.moveTo(-25, 35); ctx.lineTo(-15, 30); ctx.lineTo(-15, 45); ctx.fill();

    } else if (id.includes('tree')) {
        // 5. Retro Tree
        // Trunk
        ctx.fillStyle = '#5C4033'; // Brown
        ctx.fillRect(-10, 35, 20, 25);
        ctx.strokeRect(-10, 35, 20, 25);

        // Layers
        ctx.fillStyle = GREEN;
        const drawLayer = (yOff: number, width: number, height: number) => {
            ctx.beginPath();
            ctx.moveTo(0, yOff - height);
            ctx.lineTo(width, yOff);
            ctx.lineTo(-width, yOff);
            ctx.closePath();
            ctx.fill();
            applyRetroStroke();
        };
        
        drawLayer(40, 45, 40); // Bottom
        drawLayer(15, 35, 35); // Middle
        drawLayer(-10, 25, 30); // Top

        // Ornaments (Dots)
        ctx.fillStyle = RED;
        ctx.beginPath(); ctx.arc(-15, 30, 4, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(10, 5, 4, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = CREAM;
        ctx.beginPath(); ctx.arc(15, 30, 4, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(-5, -5, 4, 0, Math.PI*2); ctx.fill();

        // Star
        ctx.fillStyle = GOLD;
        ctx.beginPath();
        ctx.moveTo(0, -45); ctx.lineTo(5, -35); ctx.lineTo(15, -35);
        ctx.lineTo(7, -25); ctx.lineTo(10, -15); ctx.lineTo(0, -20);
        ctx.lineTo(-10, -15); ctx.lineTo(-7, -25); ctx.lineTo(-15, -35);
        ctx.lineTo(-5, -35);
        ctx.closePath();
        ctx.fill();
        applyRetroStroke();
    }
};

/**
 * DECORATION: Draw Cyber Pets (Y2K Liquid Metal)
 */
const drawCyberPet = (ctx: CanvasRenderingContext2D, id: string) => {
    
    // Helper for radial metal gradient
    const fillMetalGradient = (x: number, y: number, r: number, type: 'silver' | 'holo' | 'titanium' | 'gold') => {
        const grad = ctx.createRadialGradient(x - r/3, y - r/3, 0, x, y, r);
        if (type === 'silver') {
            grad.addColorStop(0, '#FFFFFF'); // Highlight
            grad.addColorStop(0.3, '#E0E0E0');
            grad.addColorStop(0.8, '#808080'); // Mid
            grad.addColorStop(1, '#404040'); // Shadow
        } else if (type === 'holo') {
            grad.addColorStop(0, '#FFE0F0'); // Pale Pink
            grad.addColorStop(0.5, '#DDA0DD'); // Plum
            grad.addColorStop(1, '#8A2BE2'); // Purple Metal
        } else if (type === 'titanium') {
             grad.addColorStop(0, '#A0A0A0'); 
             grad.addColorStop(0.5, '#505050');
             grad.addColorStop(1, '#1A1A1A'); // Dark
        } else if (type === 'gold') {
             grad.addColorStop(0, '#FFFFE0'); // Light Yellow
             grad.addColorStop(0.4, '#FFD700'); // Gold
             grad.addColorStop(1, '#B8860B'); // Dark Gold
        }
        ctx.fillStyle = grad;
        ctx.fill();
    };

    if (id.includes('bear')) {
        // 1. Chrome Bear
        ctx.beginPath(); ctx.arc(-35, -35, 18, 0, Math.PI*2);
        fillMetalGradient(-35, -35, 18, 'silver');
        ctx.beginPath(); ctx.arc(35, -35, 18, 0, Math.PI*2);
        fillMetalGradient(35, -35, 18, 'silver');
        
        ctx.beginPath(); ctx.arc(0, 0, 50, 0, Math.PI*2);
        fillMetalGradient(0, 0, 50, 'silver');
        
        ctx.beginPath(); ctx.ellipse(-20, -20, 15, 8, -Math.PI/4, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fill();

        ctx.fillStyle = 'black';
        ctx.beginPath(); ctx.arc(-15, 0, 4, 0, Math.PI*2); ctx.fill(); 
        ctx.beginPath(); ctx.arc(15, 0, 4, 0, Math.PI*2); ctx.fill(); 
        ctx.beginPath(); ctx.ellipse(0, 10, 8, 5, 0, 0, Math.PI*2); ctx.fill(); 

    } else if (id.includes('bunny')) {
        // 2. Holo Bunny
        ctx.shadowColor = '#00FFFF'; // Cyan glow
        ctx.shadowBlur = 15;
        
        ctx.beginPath(); ctx.ellipse(-25, -50, 15, 40, -0.2, 0, Math.PI*2);
        fillMetalGradient(-25, -50, 40, 'holo');
        ctx.beginPath(); ctx.ellipse(25, -50, 15, 40, 0.2, 0, Math.PI*2);
        fillMetalGradient(25, -50, 40, 'holo');
        
        ctx.shadowBlur = 0; 

        ctx.beginPath(); ctx.arc(0, 0, 45, 0, Math.PI*2);
        fillMetalGradient(0, 0, 45, 'holo');
        
        ctx.fillStyle = '#FFF';
        ctx.beginPath(); ctx.arc(-15, -5, 3, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(15, -5, 3, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-5, 10); ctx.lineTo(5, 10); ctx.lineTo(0, 15); ctx.fill();

    } else if (id.includes('kitty')) {
        // 3. Cyber Kitty
        ctx.beginPath(); ctx.moveTo(-40, -20); ctx.lineTo(-55, -60); ctx.lineTo(-10, -35);
        fillMetalGradient(-35, -40, 25, 'titanium');
        ctx.beginPath(); ctx.moveTo(40, -20); ctx.lineTo(55, -60); ctx.lineTo(10, -35);
        fillMetalGradient(35, -40, 25, 'titanium');

        ctx.beginPath(); ctx.ellipse(0, 0, 55, 40, 0, 0, Math.PI*2);
        fillMetalGradient(0, 0, 55, 'titanium');

        ctx.shadowColor = '#00FF00'; ctx.shadowBlur = 10; ctx.fillStyle = '#00FF00';
        ctx.beginPath(); ctx.arc(-20, 0, 6, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(20, 0, 6, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = 'white'; ctx.lineWidth = 1;
        ctx.beginPath(); 
        ctx.moveTo(-40, 10); ctx.lineTo(-65, 10); ctx.moveTo(-40, 18); ctx.lineTo(-60, 22);
        ctx.moveTo(40, 10); ctx.lineTo(65, 10); ctx.moveTo(40, 18); ctx.lineTo(60, 22);
        ctx.stroke();

    } else if (id.includes('puppy')) {
        // 4. Chrome Puppy (Floppy Ears)
        // Ears (Droopy)
        ctx.beginPath(); ctx.ellipse(-45, -10, 15, 35, 0.4, 0, Math.PI*2);
        fillMetalGradient(-45, -10, 35, 'silver');
        ctx.beginPath(); ctx.ellipse(45, -10, 15, 35, -0.4, 0, Math.PI*2);
        fillMetalGradient(45, -10, 35, 'silver');

        // Head
        ctx.beginPath(); ctx.arc(0, 0, 48, 0, Math.PI*2);
        fillMetalGradient(0, 0, 48, 'silver');

        // Eyes (Big puppy eyes)
        ctx.fillStyle = '#111';
        ctx.beginPath(); ctx.arc(-18, -5, 6, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(18, -5, 6, 0, Math.PI*2); ctx.fill();
        // Shine
        ctx.fillStyle = '#FFF';
        ctx.beginPath(); ctx.arc(-20, -8, 2, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(16, -8, 2, 0, Math.PI*2); ctx.fill();

        // Snout
        ctx.beginPath(); ctx.ellipse(0, 15, 12, 8, 0, 0, Math.PI*2);
        ctx.fillStyle = '#333'; ctx.fill();

    } else if (id.includes('bird')) {
        // 5. Gold Bird
        ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 10;
        
        // Wings
        ctx.beginPath(); ctx.ellipse(-35, 10, 15, 8, -0.5, 0, Math.PI*2);
        fillMetalGradient(-35, 10, 15, 'gold');
        ctx.beginPath(); ctx.ellipse(35, 10, 15, 8, 0.5, 0, Math.PI*2);
        fillMetalGradient(35, 10, 15, 'gold');

        ctx.shadowBlur = 0;

        // Body
        ctx.beginPath(); ctx.arc(0, 0, 40, 0, Math.PI*2);
        fillMetalGradient(0, 0, 40, 'gold');

        // Eyes
        ctx.fillStyle = 'black';
        ctx.beginPath(); ctx.arc(-15, -10, 4, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(15, -10, 4, 0, Math.PI*2); ctx.fill();

        // Beak
        ctx.fillStyle = '#FF4500'; // OrangeRed
        ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(5, 0); ctx.lineTo(0, 8); ctx.fill();
        
        // Hair tuft
        ctx.strokeStyle = '#DAA520'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, -40); ctx.quadraticCurveTo(5, -55, 15, -50); ctx.stroke();
    }
};

/**
 * EFFECT: Draw Noise Overlay (Film Grain)
 */
const drawNoiseOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number, intensity: number = 0.35) => {
    const patternSize = 100;
    const pCanvas = document.createElement('canvas');
    pCanvas.width = patternSize;
    pCanvas.height = patternSize;
    const pCtx = pCanvas.getContext('2d');
    if (!pCtx) return;

    const imgData = pCtx.createImageData(patternSize, patternSize);
    const buffer = new Uint32Array(imgData.data.buffer);

    for (let i = 0; i < buffer.length; i++) {
        const val = Math.random() * 255;
        buffer[i] = (255 << 24) | (val << 16) | (val << 8) | val;
    }
    pCtx.putImageData(imgData, 0, 0);

    ctx.save();
    ctx.globalCompositeOperation = 'overlay'; 
    ctx.globalAlpha = intensity;
    
    const pattern = ctx.createPattern(pCanvas, 'repeat');
    if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, width, height);
    }
    ctx.restore();
};

/**
 * DECORATION: Draw Date Stamp
 */
const drawDateStamp = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const now = new Date();
    // '02 . 14 . 25' format
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const dateStr = `'${year} . ${month} . ${day}`;

    ctx.save();
    ctx.font = 'bold 32px "M PLUS Rounded 1c", sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    
    // Position: Bottom Right with padding
    const x = width - 30;
    const y = height - 30;

    // Glow Effect (Film halation)
    ctx.shadowColor = '#ff5e00'; // Orange/Red glow
    ctx.shadowBlur = 10;
    
    // Text Color
    ctx.fillStyle = '#ff9900'; // Retro Orange
    ctx.fillText(dateStr, x, y);
    
    // Slight brighter inner core
    ctx.shadowBlur = 2;
    ctx.fillStyle = '#ffcc80';
    ctx.fillText(dateStr, x, y);

    ctx.restore();
};

interface RenderParams {
  canvas: HTMLCanvasElement;
  personImage: HTMLImageElement;
  backgroundImage?: BackgroundPreset;
  frameImage?: HTMLImageElement | null;
  lightingEnabled: boolean;
  noiseLevel?: number;
  showDate?: boolean;
  decorations?: DecorationState;
  selectedStickerId?: string | null;
}

export const STICKER_BASE_SIZE = 150; // New base size for vector stickers

export const renderComposite = (params: RenderParams) => {
  const { canvas, personImage, backgroundImage, frameImage, lightingEnabled, noiseLevel, showDate, decorations, selectedStickerId } = params;
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

  // 2. Person Image
  ctx.save();
  if (lightingEnabled) {
     ctx.filter = "brightness(1.15) contrast(0.95) saturate(1.05)";
  }
  drawImageAspectFill(ctx, personImage, 0, 0, TARGET_WIDTH, TARGET_HEIGHT, false, 0.2);
  
  // 3. Decorations
  if (decorations) {
      // 3.1 Strokes
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      decorations.strokes.forEach(stroke => {
          ctx.beginPath();
          ctx.strokeStyle = stroke.color;
          ctx.lineWidth = stroke.width;
          ctx.globalAlpha = 0.9;
          if (stroke.points.length > 0) {
               ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
               for (let i = 1; i < stroke.points.length; i++) {
                   ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
               }
          }
          ctx.stroke();
      });
      ctx.globalAlpha = 1.0;

      // 3.2 Stickers (Updated Logic)
      decorations.stickers.forEach(sticker => {
          ctx.save();
          ctx.translate(sticker.x, sticker.y);
          ctx.rotate(sticker.rotation);
          
          // Handle Mirroring (Flipping)
          ctx.scale(sticker.scale * (sticker.isFlipped ? -1 : 1), sticker.scale);
          
          // Switch based on ID prefix or explicit checks
          if (sticker.content.startsWith('y2k')) {
              drawY2KSticker(ctx, sticker.content);
          } else if (sticker.content.startsWith('ribbon')) {
              drawRibbonSticker(ctx, sticker.content);
          } else if (sticker.content.startsWith('doodle')) {
              drawDoodleSticker(ctx, sticker.content);
          } else if (sticker.content.startsWith('retro')) {
              drawRetroXmas(ctx, sticker.content);
          } else if (sticker.content.startsWith('cyber')) {
              drawCyberPet(ctx, sticker.content);
          } else {
              // Fallback for old emoji stickers
              ctx.font = `${STICKER_BASE_SIZE}px sans-serif`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(sticker.content, 0, 0);
          }

          // SELECTION BOX
          // Note: Selection Box is drawn inside the transformed context (including flip)
          if (selectedStickerId === sticker.id) {
             const boxSize = STICKER_BASE_SIZE * 1.2;
             const half = boxSize / 2;
             
             ctx.lineWidth = 4 / sticker.scale; 
             ctx.strokeStyle = '#3b82f6';
             ctx.setLineDash([15, 10]);
             ctx.strokeRect(-half, -half, boxSize, boxSize);
             
             // DELETE HANDLE (Top Right)
             const handleRadius = 24 / sticker.scale;
             ctx.setLineDash([]);
             ctx.fillStyle = '#ef4444'; 
             ctx.beginPath();
             ctx.arc(half, -half, handleRadius, 0, Math.PI*2);
             ctx.fill();
             ctx.strokeStyle = '#fff';
             ctx.lineWidth = 3 / sticker.scale;
             ctx.beginPath();
             const xOff = handleRadius * 0.4;
             ctx.moveTo(half - xOff, -half - xOff);
             ctx.lineTo(half + xOff, -half + xOff);
             ctx.moveTo(half + xOff, -half - xOff);
             ctx.lineTo(half - xOff, -half + xOff);
             ctx.stroke();

             // RESIZE HANDLE (Bottom Right)
             ctx.fillStyle = '#3b82f6'; 
             ctx.beginPath();
             ctx.arc(half, half, handleRadius, 0, Math.PI*2);
             ctx.fill();
             // Draw Arrows
             ctx.strokeStyle = '#fff';
             ctx.lineWidth = 2 / sticker.scale;
             ctx.beginPath();
             const arrowSize = handleRadius * 0.5;
             ctx.moveTo(half - arrowSize, half - arrowSize);
             ctx.lineTo(half + arrowSize, half + arrowSize);
             ctx.moveTo(half - arrowSize + 5, half - arrowSize); ctx.lineTo(half - arrowSize, half - arrowSize); ctx.lineTo(half - arrowSize, half - arrowSize + 5);
             ctx.moveTo(half + arrowSize - 5, half + arrowSize); ctx.lineTo(half + arrowSize, half + arrowSize); ctx.lineTo(half + arrowSize, half + arrowSize - 5);
             ctx.stroke();
          }
          
          ctx.restore();
      });
  }

  // 4. Noise
  if (noiseLevel && noiseLevel > 0) {
      drawNoiseOverlay(ctx, TARGET_WIDTH, TARGET_HEIGHT, noiseLevel);
  }

  // 5. Date Stamp (New)
  if (showDate) {
      drawDateStamp(ctx, TARGET_WIDTH, TARGET_HEIGHT);
  }
  
  ctx.restore();

  // 6. Frame
  if (frameImage) {
    ctx.drawImage(frameImage, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);
  }
};

export const generateLayoutSheet = (
  sourceCanvases: HTMLCanvasElement[],
  templateId: string,
  locationText: string = "TOKYO"
): string => {
  const sheetCanvas = document.createElement('canvas');
  const ctx = sheetCanvas.getContext('2d');
  if (!ctx) return '';

  const PADDING = 40;
  
  if (templateId === 'cinema') {
    // Black Film Strip Style (Updated to match reference)
    const IMG_W = 400;
    const IMG_H = 560; // 5:7 ratio
    const GAP_Y = 20; // Gap between photos
    
    // Film strip styling
    const HOLE_W = 12;
    const HOLE_H = 8;
    const HOLE_GAP = 15;
    const SIDE_PADDING = 30; // Space for holes
    
    const TOP_MARGIN = 50;
    const BOTTOM_MARGIN = 100;
    
    const STRIP_W = IMG_W + (SIDE_PADDING * 2);
    const STRIP_H = TOP_MARGIN + (IMG_H * 4) + (GAP_Y * 3) + BOTTOM_MARGIN;
    
    const GAP_BETWEEN_STRIPS = 50;
    const OUTER_PADDING = 40; // White border around the black print
    
    sheetCanvas.width = (STRIP_W * 2) + GAP_BETWEEN_STRIPS + (OUTER_PADDING * 2);
    sheetCanvas.height = STRIP_H + (OUTER_PADDING * 2);
    
    // 1. White Paper Background (The border)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, sheetCanvas.width, sheetCanvas.height);
    
    // 2. Black Film Background
    ctx.fillStyle = '#111111';
    const innerX = OUTER_PADDING;
    const innerY = OUTER_PADDING;
    const innerW = sheetCanvas.width - (OUTER_PADDING * 2);
    const innerH = sheetCanvas.height - (OUTER_PADDING * 2);
    ctx.fillRect(innerX, innerY, innerW, innerH);
    
    const drawStrip = (offsetX: number) => {
        // Draw Sprocket Holes
        ctx.fillStyle = '#555555'; // Dark grey holes
        const holeStartX = offsetX + (SIDE_PADDING - HOLE_W) / 2;
        const holeEndX = offsetX + STRIP_W - (SIDE_PADDING + HOLE_W) / 2;
        
        for (let y = 0; y < STRIP_H; y += (HOLE_H + HOLE_GAP)) {
             // Left Holes
             ctx.fillRect(innerX + holeStartX, innerY + y, HOLE_W, HOLE_H);
             // Right Holes
             ctx.fillRect(innerX + holeEndX, innerY + y, HOLE_W, HOLE_H);
        }

        let y = innerY + TOP_MARGIN;
        
        sourceCanvases.slice(0, 4).forEach(canv => {
            // Draw Photo
            ctx.drawImage(canv, innerX + offsetX + SIDE_PADDING, y, IMG_W, IMG_H);
            y += IMG_H + GAP_Y;
        });
        
        // Footer Text
        y += 50;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px "M PLUS Rounded 1c", sans-serif'; 
        ctx.textAlign = 'center';
        ctx.fillText('LIFE4CUTS', innerX + offsetX + STRIP_W/2, y);
        
        ctx.font = '16px "M PLUS Rounded 1c", sans-serif';
        ctx.fillStyle = '#888888';
        const date = new Date().toLocaleDateString().replace(/\//g, '.');
        ctx.fillText(date, innerX + offsetX + STRIP_W/2, y + 25);
    };

    // Calculate offsets for two strips centered in the black area
    // Strip 1 starts at 0 (relative to inner box)
    drawStrip(0);
    // Strip 2 starts after Strip 1 width + Gap
    drawStrip(STRIP_W + GAP_BETWEEN_STRIPS);
    
  } else if (templateId === 'magazine') {
     // Collage 2x2
     const IMG_W = 600;
     const IMG_H = 840;
     const MARGIN = 60;
     
     sheetCanvas.width = (IMG_W * 2) + (MARGIN * 3);
     sheetCanvas.height = (IMG_H * 2) + (MARGIN * 3) + 200; // Header space
     
     // Kawaii BG
     const grad = ctx.createLinearGradient(0,0, sheetCanvas.width, sheetCanvas.height);
     grad.addColorStop(0, '#ff9a9e');
     grad.addColorStop(1, '#fecfef');
     ctx.fillStyle = grad;
     ctx.fillRect(0, 0, sheetCanvas.width, sheetCanvas.height);
     
     // Title
     ctx.fillStyle = '#fff';
     ctx.shadowColor = 'rgba(0,0,0,0.2)';
     ctx.shadowBlur = 10;
     ctx.font = 'italic bold 100px sans-serif';
     ctx.textAlign = 'center';
     ctx.fillText('Besties', sheetCanvas.width/2, 140);
     ctx.shadowBlur = 0;
     
     const coords = [
         { x: MARGIN, y: 200 },
         { x: MARGIN + IMG_W + MARGIN, y: 200 },
         { x: MARGIN, y: 200 + IMG_H + MARGIN },
         { x: MARGIN + IMG_W + MARGIN, y: 200 + IMG_H + MARGIN },
     ];
     
     sourceCanvases.slice(0, 4).forEach((canv, i) => {
         if(coords[i]) {
             // White container
             ctx.fillStyle = '#fff';
             ctx.fillRect(coords[i].x - 10, coords[i].y - 10, IMG_W + 20, IMG_H + 20);
             // Image
             ctx.drawImage(canv, coords[i].x, coords[i].y, IMG_W, IMG_H);
         }
     });

  } else if (templateId === 'wanted') {
      // Poster
      const IMG_W = 900;
      const IMG_H = 1260;
      sheetCanvas.width = 1200;
      sheetCanvas.height = 1800;
      
      ctx.fillStyle = '#e8dcb5'; // Paper
      ctx.fillRect(0, 0, sheetCanvas.width, sheetCanvas.height);
      
      // Grain
      ctx.globalAlpha = 0.1;
      // ... assume noise or just plain color for now
      ctx.globalAlpha = 1.0;
      
      ctx.font = 'bold 140px serif';
      ctx.fillStyle = '#3e2723';
      ctx.textAlign = 'center';
      ctx.fillText('WANTED', sheetCanvas.width/2, 180);
      
      const x = (sheetCanvas.width - IMG_W)/2;
      const y = 250;
      
      if (sourceCanvases[0]) {
          ctx.drawImage(sourceCanvases[0], x, y, IMG_W, IMG_H);
          ctx.lineWidth = 15;
          ctx.strokeStyle = '#3e2723';
          ctx.strokeRect(x, y, IMG_W, IMG_H);
      }
      
      ctx.font = 'bold 80px serif';
      ctx.fillText('REWARD', sheetCanvas.width/2, y + IMG_H + 100);
      ctx.font = 'bold 100px serif';
      ctx.fillStyle = '#d32f2f';
      ctx.fillText('$1,000,000', sheetCanvas.width/2, y + IMG_H + 220);

  } else {
      // Standard / Fallback (Just the image)
      if (sourceCanvases.length > 0) {
          const c = sourceCanvases[0];
          sheetCanvas.width = c.width;
          sheetCanvas.height = c.height;
          ctx.drawImage(c, 0, 0);
      }
  }

  return sheetCanvas.toDataURL('image/png', 0.95);
};