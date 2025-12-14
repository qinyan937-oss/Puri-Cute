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

interface RenderParams {
  canvas: HTMLCanvasElement;
  personImage: HTMLImageElement;
  backgroundImage?: BackgroundPreset;
  frameImage?: HTMLImageElement | null;
  lightingEnabled: boolean;
  noiseLevel?: number;
  decorations?: DecorationState;
  selectedStickerId?: string | null;
}

export const STICKER_BASE_SIZE = 150; // New base size for vector stickers

export const renderComposite = (params: RenderParams) => {
  const { canvas, personImage, backgroundImage, frameImage, lightingEnabled, noiseLevel, decorations, selectedStickerId } = params;
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
          ctx.scale(sticker.scale, sticker.scale);
          
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
             // Diagonal arrow
             const arrowSize = handleRadius * 0.5;
             ctx.moveTo(half - arrowSize, half - arrowSize);
             ctx.lineTo(half + arrowSize, half + arrowSize);
             // Arrowheads
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
  
  ctx.restore();

  // 5. Frame
  if (frameImage) {
    ctx.drawImage(frameImage, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);
  }
};
// ... (omitting layout generation code as it remains unchanged) ...
// Re-exporting necessary layout functions for App.tsx compatibility
const getSource = (sources: HTMLCanvasElement[], index: number) => {
    return sources[index % sources.length];
};

const drawStandardLayout = (ctx: CanvasRenderingContext2D, sourceCanvases: HTMLCanvasElement[], WIDTH: number, HEIGHT: number, location: string, date: string) => {
    // Grid Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.save();
    const minorGridSize = 25; 
    const majorGridSize = minorGridSize * 4; 
    ctx.beginPath(); ctx.lineWidth = 1; ctx.strokeStyle = '#e2e8f0'; 
    for (let x = 0; x <= WIDTH; x += minorGridSize) { ctx.moveTo(x, 0); ctx.lineTo(x, HEIGHT); }
    for (let y = 0; y <= HEIGHT; y += minorGridSize) { ctx.moveTo(0, y); ctx.lineTo(WIDTH, y); }
    ctx.stroke();
    ctx.beginPath(); ctx.lineWidth = 2; ctx.strokeStyle = '#94a3b8'; 
    for (let x = 0; x <= WIDTH; x += majorGridSize) { ctx.moveTo(x, 0); ctx.lineTo(x, HEIGHT); }
    for (let y = 0; y <= HEIGHT; y += majorGridSize) { ctx.moveTo(0, y); ctx.lineTo(WIDTH, y); }
    ctx.stroke();
    ctx.restore();

    const SIDEBAR_X = 1300; 
    const sidebarWidth = WIDTH - SIDEBAR_X;
    const M_WIDTH = 580; const M_HEIGHT = 720; const GAP = 40;
    const startMX = (SIDEBAR_X - (M_WIDTH * 2 + GAP)) / 2; const TOP_Y = 80;

    [0, 1].forEach(i => {
        const x = startMX + i * (M_WIDTH + GAP);
        const pad = 10;
        ctx.fillStyle = '#fff'; ctx.fillRect(x - pad, TOP_Y - pad, M_WIDTH + pad*2, M_HEIGHT + pad*2);
        const img = getSource(sourceCanvases, i);
        drawImageAspectFill(ctx, img, x, TOP_Y, M_WIDTH, M_HEIGHT, true);
        ctx.lineWidth = 1; ctx.strokeStyle = '#94a3b8'; ctx.strokeRect(x, TOP_Y, M_WIDTH, M_HEIGHT);
    });

    const S_WIDTH = 265; const S_HEIGHT = 340; const GAP_S = 30;
    const startSX = (SIDEBAR_X - (S_WIDTH * 4 + GAP_S * 3)) / 2; const BOTTOM_Y = 860; 

    for(let i=0; i<4; i++) {
        const x = startSX + i * (S_WIDTH + GAP_S);
        const pad = 5;
        ctx.fillStyle = '#fff'; ctx.fillRect(x - pad, BOTTOM_Y - pad, S_WIDTH + pad*2, S_HEIGHT + pad*2);
        const img = getSource(sourceCanvases, i + 2);
        drawImageAspectFill(ctx, img, x, BOTTOM_Y, S_WIDTH, S_HEIGHT, true);
        ctx.lineWidth = 1; ctx.strokeStyle = '#94a3b8'; ctx.strokeRect(x, BOTTOM_Y, S_WIDTH, S_HEIGHT);
    }

    const contentX = SIDEBAR_X + 40; const contentW = sidebarWidth - 80; const cardY = 80; const cardH = 500;
    ctx.save(); ctx.fillStyle = '#ffffff'; ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 15;
    ctx.fillRect(contentX, cardY, contentW, cardH); ctx.shadowBlur = 0;
    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 2; ctx.strokeRect(contentX, cardY, contentW, cardH);
    ctx.textAlign = 'center'; const cx = contentX + contentW / 2;
    ctx.fillStyle = '#1e293b'; ctx.font = 'bold 36px sans-serif'; ctx.fillText("ID PHOTO", cx, cardY + 60);
    ctx.beginPath(); ctx.moveTo(contentX + 20, cardY + 80); ctx.lineTo(contentX + contentW - 20, cardY + 80);
    ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1; ctx.stroke();
    const iconY = cardY + 140; ctx.fillStyle = '#3b82f6';
    ctx.beginPath(); ctx.roundRect(cx - 35, iconY - 25, 70, 50, 8); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx, iconY, 18, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#3b82f6'; ctx.beginPath(); ctx.arc(cx, iconY, 10, 0, Math.PI*2); ctx.fill();
    ctx.textAlign = 'left'; const textX = contentX + 30;
    ctx.fillStyle = '#64748b'; ctx.font = '12px sans-serif'; ctx.fillText("DATE", textX, cardY + 220);
    ctx.fillStyle = '#0f172a'; ctx.font = 'bold 24px monospace'; ctx.fillText(date, textX, cardY + 250);
    ctx.fillStyle = '#64748b'; ctx.font = '12px sans-serif'; ctx.fillText("LOCATION", textX, cardY + 300);
    ctx.fillStyle = '#0f172a'; ctx.font = 'bold 18px sans-serif';
    const locLines = location.toUpperCase().split(' '); let ly = cardY + 330;
    locLines.forEach((word, idx) => { if(idx > 2) return; ctx.fillText(word, textX, ly); ly += 25; });
    ctx.save(); ctx.translate(cx + 60, cardY + 420); ctx.rotate(-20 * Math.PI / 180);
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 40, 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle = '#ef4444'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center'; ctx.fillText("PERFECT", 0, 5);
    ctx.restore(); ctx.restore();

    const walletW = 220; const walletH = 300; const walletX = contentX + (contentW - walletW) / 2;
    const walletY = BOTTOM_Y + (S_HEIGHT - walletH);
    ctx.save(); ctx.strokeStyle = '#94a3b8'; ctx.setLineDash([5, 5]);
    ctx.strokeRect(walletX - 10, walletY - 10, walletW + 20, walletH + 20);
    ctx.fillStyle = '#64748b'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center'; ctx.fillText("WALLET SIZE", walletX + walletW/2, walletY - 15);
    ctx.fillStyle = '#fff'; ctx.fillRect(walletX, walletY, walletW, walletH);
    drawImageAspectFill(ctx, sourceCanvases[0], walletX, walletY, walletW, walletH, true);
    ctx.setLineDash([]); ctx.lineWidth = 1; ctx.strokeStyle = '#cbd5e1'; ctx.strokeRect(walletX, walletY, walletW, walletH);
    ctx.restore();
};

const drawMagazineLayout = (ctx: CanvasRenderingContext2D, sourceCanvases: HTMLCanvasElement[], WIDTH: number, HEIGHT: number, location: string, date: string) => {
    // 1. Gradient
    const grad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    grad.addColorStop(0, '#FFC3EB'); grad.addColorStop(0.5, '#FFFFE0'); grad.addColorStop(1, '#C3FBD8'); 
    ctx.fillStyle = grad; ctx.fillRect(0, 0, WIDTH, HEIGHT);
    // 2. Confetti logic (simplified to circles for brevity)
    for (let i = 0; i < 30; i++) {
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath(); ctx.arc(Math.random()*WIDTH, Math.random()*HEIGHT, Math.random()*20, 0, Math.PI*2); ctx.fill();
    }
    // 3. Text
    ctx.save(); ctx.translate(WIDTH / 2, 140); ctx.font = '900 85px "M PLUS Rounded 1c", sans-serif'; 
    ctx.textAlign = 'center'; ctx.fillStyle = '#FF69B4'; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 8;
    ctx.strokeText("MAGICAL TIME", 0, 0); ctx.fillText("MAGICAL TIME", 0, 0); ctx.restore();
    // 4. Photos
    const polaroidW = 380; const polaroidH = 480; const centerX = WIDTH / 2; const topYBase = 320; 
    const positions = [{ x: centerX - 480, y: topYBase + 40, rot: -8 * Math.PI / 180 }, { x: centerX, y: topYBase, rot: 2 * Math.PI / 180 }, { x: centerX + 480, y: topYBase + 40, rot: 8 * Math.PI / 180 }];
    positions.forEach((pos, i) => {
        ctx.save(); ctx.translate(pos.x, pos.y); ctx.rotate(pos.rot);
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-polaroidW / 2, -polaroidH / 2, polaroidW, polaroidH);
        const imgSize = 340; const imgYOffset = -polaroidH / 2 + 20;
        const img = getSource(sourceCanvases, i);
        drawImageAspectFill(ctx, img, -imgSize/2, imgYOffset, imgSize, imgSize, true);
        ctx.restore();
    });
    // 5. Hero
    const heroW = 700; const heroH = 500; const heroX = (WIDTH - heroW) / 2; const heroY = HEIGHT - heroH - 80;
    ctx.save(); ctx.lineWidth = 15; ctx.strokeStyle = '#FFFFFF';
    const heroImg = getSource(sourceCanvases, 3);
    drawImageAspectFill(ctx, heroImg, heroX, heroY, heroW, heroH, true);
    ctx.strokeRect(heroX, heroY, heroW, heroH);
    ctx.restore();
};

const drawCinemaLayout = (ctx: CanvasRenderingContext2D, sourceCanvases: HTMLCanvasElement[], WIDTH: number, HEIGHT: number) => {
    ctx.fillStyle = '#111111'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
    const stripWidth = 480; const gapBetweenStrips = 120; const totalGroupW = (stripWidth * 2) + gapBetweenStrips; const startX = (WIDTH - totalGroupW) / 2;
    const drawStrip = (baseX: number) => {
        const topMargin = 60; const footerSpace = 180; const photoGap = 20; const availableH = HEIGHT - topMargin - footerSpace; const photoH = (availableH - (photoGap * 3)) / 4; const sidePadding = 30; const photoW = stripWidth - (sidePadding * 2);
        for (let i = 0; i < 4; i++) {
            const y = topMargin + i * (photoH + photoGap); const x = baseX + sidePadding;
            const img = getSource(sourceCanvases, i);
            drawImageAspectFill(ctx, img, x, y, photoW, photoH, false, 0.25);
        }
        ctx.save(); ctx.fillStyle = '#FFFFFF'; ctx.globalAlpha = 0.6; 
        const leftHoleX = baseX + 8; const rightHoleX = baseX + stripWidth - 8 - 12;
        for (let y = 30; y < HEIGHT - 20; y += (20 + 30)) { ctx.beginPath(); ctx.roundRect(leftHoleX, y, 12, 20, 2); ctx.fill(); ctx.beginPath(); ctx.roundRect(rightHoleX, y, 12, 20, 2); ctx.fill(); }
        ctx.restore();
        ctx.save(); ctx.textAlign = 'center'; ctx.fillStyle = '#FFFFFF'; ctx.font = '700 20px sans-serif';
        const stripFooterY = HEIGHT - 80; ctx.fillText("LIFE4CUTS", baseX + stripWidth/2, stripFooterY);
        ctx.restore();
    };
    drawStrip(startX); drawStrip(startX + stripWidth + gapBetweenStrips);
};

const drawWantedLayout = (ctx: CanvasRenderingContext2D, sourceCanvases: HTMLCanvasElement[], WIDTH: number, HEIGHT: number) => {
    ctx.fillStyle = '#F4E4BC'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.lineWidth = 10; ctx.strokeStyle = '#8B4513'; ctx.strokeRect(60, 60, WIDTH - 120, HEIGHT - 120);
    ctx.fillStyle = '#000000'; ctx.textAlign = 'center'; ctx.font = '900 200px serif'; ctx.fillText("WANTED", WIDTH/2, 280);
    const photoW = 900; const photoH = 750; const photoX = (WIDTH - photoW) / 2; const photoY = 400;
    drawImageAspectFill(ctx, sourceCanvases[0], photoX, photoY, photoW, photoH, true);
    ctx.lineWidth = 8; ctx.strokeStyle = '#3E2723'; ctx.strokeRect(photoX, photoY, photoW, photoH);
};

export const generateLayoutSheet = (sourceCanvases: HTMLCanvasElement[], templateId: string, locationText: string = "TOKYO STATION", dateText: string = ""): string => {
  if (sourceCanvases.length === 0) return '';
  const MASTER_WIDTH = 1748; const MASTER_HEIGHT = 1181;
  const virtualCanvas = document.createElement('canvas'); virtualCanvas.width = MASTER_WIDTH; virtualCanvas.height = MASTER_HEIGHT;
  const vCtx = virtualCanvas.getContext('2d');
  if (!vCtx) return '';
  const date = dateText || new Date().toISOString().split('T')[0].replace(/-/g, '.');
  switch (templateId) {
      case 'magazine': drawMagazineLayout(vCtx, sourceCanvases, MASTER_WIDTH, MASTER_HEIGHT, locationText, date); break;
      case 'cinema': drawCinemaLayout(vCtx, sourceCanvases, MASTER_WIDTH, MASTER_HEIGHT); break;
      case 'wanted': drawWantedLayout(vCtx, sourceCanvases, MASTER_WIDTH, MASTER_HEIGHT); break;
      default: drawStandardLayout(vCtx, sourceCanvases, MASTER_WIDTH, MASTER_HEIGHT, locationText, date); break;
  }
  const TARGET_WIDTH = 1500; const TARGET_HEIGHT = 1050;
  const finalCanvas = document.createElement('canvas'); finalCanvas.width = TARGET_WIDTH; finalCanvas.height = TARGET_HEIGHT;
  const ctx = finalCanvas.getContext('2d');
  if (!ctx) return '';
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
  const scale = Math.min(TARGET_WIDTH / MASTER_WIDTH, TARGET_HEIGHT / MASTER_HEIGHT);
  const drawW = MASTER_WIDTH * scale; const drawH = MASTER_HEIGHT * scale;
  const drawX = (TARGET_WIDTH - drawW) / 2; const drawY = (TARGET_HEIGHT - drawH) / 2;
  ctx.drawImage(virtualCanvas, drawX, drawY, drawW, drawH);
  return finalCanvas.toDataURL('image/png', 1.0);
};
