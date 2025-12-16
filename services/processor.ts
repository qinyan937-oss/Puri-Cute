import { BackgroundPreset, FramePreset, LayoutTemplate, DecorationState, ImageTransform } from "../types";

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
  img: HTMLImageElement | HTMLCanvasElement | undefined,
  x: number,
  y: number,
  w: number,
  h: number,
  alignTop: boolean = false,
  focusY?: number
) => {
  if (!img) return;
  
  // Safe width/height access
  const imgW = (img instanceof HTMLImageElement) ? img.naturalWidth : img.width;
  const imgH = (img instanceof HTMLImageElement) ? img.naturalHeight : img.height;
  
  if (!imgW || !imgH) return;

  const scale = Math.max(w / imgW, h / imgH);
  const nw = imgW * scale;
  const nh = imgH * scale;
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
  imageTransform?: ImageTransform;
  isMoeMode?: boolean; // New Flag for Moe Magic
  aspectRatio?: number;
}

export const STICKER_BASE_SIZE = 150; // New base size for vector stickers
export const STICKER_HANDLE_RADIUS = 24; // Exposed for hit testing

export const renderComposite = (params: RenderParams) => {
  const { canvas, personImage, backgroundImage, frameImage, lightingEnabled, noiseLevel, showDate, decorations, selectedStickerId, imageTransform, isMoeMode, aspectRatio } = params;
  const ctx = canvas.getContext('2d');
  
  // Guard: Context must exist
  if (!ctx) return;
  
  // Determine Dimensions based on Aspect Ratio
  // Base is Portrait 1000x1400 (aspect 0.71)
  // If landscape aspect (>1), flip dimensions
  let TARGET_WIDTH = 1000;
  let TARGET_HEIGHT = 1400;

  if (aspectRatio && aspectRatio > 1) {
     TARGET_WIDTH = 1400;
     TARGET_HEIGHT = 1000;
  }

  // IMPORTANT: Set dimensions first so we have a valid canvas even if image is missing/loading
  canvas.width = TARGET_WIDTH;
  canvas.height = TARGET_HEIGHT;

  ctx.clearRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

  // 1. Background
  ctx.save();
  if (backgroundImage) {
    if (backgroundImage.type === 'color' || backgroundImage.type === 'gradient' || backgroundImage.type === 'pattern') {
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
             ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
        } else if (backgroundImage.type === 'pattern') {
             // Create pattern canvas
             if (backgroundImage.id === 'bg-dots-pink') {
                 // Manual polka dot pattern drawing
                 ctx.fillStyle = '#ffffff';
                 ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
                 ctx.fillStyle = '#fbcfe8'; // pink-200
                 const spacing = 40;
                 const radius = 8;
                 for(let y=0; y<TARGET_HEIGHT; y+=spacing) {
                     for(let x=0; x<TARGET_WIDTH; x+=spacing) {
                         // Offset every other row
                         const offsetX = (y/spacing) % 2 === 0 ? 0 : spacing/2;
                         ctx.beginPath();
                         ctx.arc(x + offsetX, y, radius, 0, Math.PI*2);
                         ctx.fill();
                     }
                 }
             } else {
                 ctx.fillStyle = '#ffffff';
                 ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
             }
        } else {
            ctx.fillStyle = backgroundImage.value;
            ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
        }
    }
  } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
  }
  ctx.restore();

  // 2. Person Image (Only if valid)
  if (personImage && (personImage.width > 0 || personImage.naturalWidth > 0)) {
    ctx.save();
    if (lightingEnabled) {
       ctx.filter = "brightness(1.15) contrast(0.95) saturate(1.05)";
    }
    
    // Custom Manual Transform Logic
    // Calculate Base Aspect Fill
    const imgW = personImage.naturalWidth || personImage.width;
    const imgH = personImage.naturalHeight || personImage.height;
    const scaleCover = Math.max(TARGET_WIDTH / imgW, TARGET_HEIGHT / imgH);
    
    // Apply User Transform
    // If transform exists, use it, else default 1.0 scale
    const userScale = imageTransform?.scale ?? 1.0;
    const userX = imageTransform?.x ?? 0;
    const userY = imageTransform?.y ?? 0;
    
    const finalScale = scaleCover * userScale;
    const drawW = imgW * finalScale;
    const drawH = imgH * finalScale;
    
    // Center by default + user offset
    const centerX = (TARGET_WIDTH - drawW) / 2;
    const centerY = (TARGET_HEIGHT - drawH) / 2;
    
    // Draw Base Image
    ctx.drawImage(personImage, centerX + userX, centerY + userY, drawW, drawH);

    // === MOE MAGIC EFFECT ===
    if (isMoeMode) {
        // 1. Bloom Layer (Soft Glow)
        // Draw a blurred version on top using 'screen' blend mode
        ctx.save();
        ctx.filter = "blur(15px) brightness(1.2)";
        ctx.globalCompositeOperation = "screen"; 
        ctx.globalAlpha = 0.6; // Adjust intensity
        ctx.drawImage(personImage, centerX + userX, centerY + userY, drawW, drawH);
        ctx.restore();

        // 2. Rosy Tint (Skin tone enhancement)
        // Add a subtle pink overlay
        ctx.save();
        ctx.globalCompositeOperation = "soft-light"; 
        ctx.fillStyle = "rgba(255, 192, 203, 0.25)"; // Soft pink, low opacity
        ctx.fillRect(centerX + userX, centerY + userY, drawW, drawH);
        ctx.restore();
    }

    ctx.restore();
  }
  
  // 3. Decorations
  if (decorations) {
      // 3.1 Strokes
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      decorations.strokes.forEach(stroke => {
          ctx.beginPath();
          if (stroke.points.length > 0) {
               ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
               for (let i = 1; i < stroke.points.length; i++) {
                   ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
               }
          }

          if (stroke.isNeon) {
              // Neon Style: Glow + White Core
              ctx.save();
              // Outer Glow
              ctx.shadowBlur = 15;
              ctx.shadowColor = stroke.color;
              ctx.strokeStyle = stroke.color;
              ctx.lineWidth = stroke.width; 
              ctx.stroke();
              
              // White/Bright Core
              ctx.shadowBlur = 0;
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = stroke.width * 0.4;
              ctx.stroke();
              ctx.restore();
          } else {
              // Standard Marker Style
              ctx.save();
              ctx.strokeStyle = stroke.color;
              ctx.lineWidth = stroke.width;
              ctx.globalAlpha = 0.9;
              ctx.stroke();
              ctx.restore();
          }
      });

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
             
             // Scale factor for handles to keep them consistent size regardless of sticker scale
             const handleScale = 1 / sticker.scale;
             const handleRadius = STICKER_HANDLE_RADIUS * handleScale;

             // RESIZE HANDLE (Bottom Right)
             ctx.setLineDash([]);
             ctx.fillStyle = '#3b82f6'; 
             ctx.beginPath();
             ctx.arc(half, half, handleRadius, 0, Math.PI*2);
             ctx.fill();
             // Draw Arrows
             ctx.strokeStyle = '#fff';
             ctx.lineWidth = 2 * handleScale;
             ctx.beginPath();
             const arrowSize = handleRadius * 0.5;
             ctx.moveTo(half - arrowSize, half - arrowSize);
             ctx.lineTo(half + arrowSize, half + arrowSize);
             ctx.moveTo(half - arrowSize + (5*handleScale), half - arrowSize); ctx.lineTo(half - arrowSize, half - arrowSize); ctx.lineTo(half - arrowSize, half - arrowSize + (5*handleScale));
             ctx.moveTo(half + arrowSize - (5*handleScale), half + arrowSize); ctx.lineTo(half + arrowSize, half + arrowSize); ctx.lineTo(half + arrowSize, half + arrowSize - (5*handleScale));
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
  canvases: HTMLCanvasElement[],
  layoutId: string,
  locationText: string = "TOKYO",
  customName: string = "KIRA USER",
  customDateText: string = "" // NEW PARAMETER
): string | null => {
  const sheet = document.createElement('canvas');
  const ctx = sheet.getContext('2d');
  if (!ctx || canvases.length === 0) return null;

  // Use current date if not provided
  const displayDate = customDateText || new Date().toISOString().split('T')[0];

  if (layoutId === 'cinema') {
     // === LIFE4CUTS CLASSIC STRIP STYLE ===
     // Vertical Black Strip, 4 Frames, White Borders
     const photoW = canvases[0].width;
     const photoH = canvases[0].height;
     
     // Sizing config to look like standard photobooth strip
     const margin = 40; // Outer margin
     const gap = 30;    // Between photos
     const headerH = 60; // Top padding
     const footerH = 300; // Bottom space for logo/date
     
     const sheetW = photoW + (margin * 2);
     const sheetH = headerH + (photoH * 4) + (gap * 3) + footerH + margin;
     
     sheet.width = sheetW;
     sheet.height = sheetH;
     
     // Black Background (Classic)
     ctx.fillStyle = '#111'; // Not pure black, soft dark
     ctx.fillRect(0, 0, sheetW, sheetH);
     
     // Draw Frames with white border logic or just placed on black?
     // Reference implies simple placement on black strip.
     
     let y = headerH;
     canvases.forEach((c) => {
         // Draw Photo
         ctx.drawImage(c, margin, y, photoW, photoH);
         y += photoH + gap;
     });
     
     // Footer Info
     const footerCenterY = sheetH - (footerH / 2) - margin;
     
     // Logo Text
     ctx.fillStyle = '#FFFFFF';
     ctx.font = 'bold 70px "Courier New", monospace'; // Monospace for retro feel
     ctx.textAlign = 'center';
     ctx.textBaseline = 'middle';
     ctx.fillText("LIFE4CUTS", sheetW/2, footerCenterY - 40);
     
     // Date Text
     ctx.font = '30px "Courier New", monospace';
     ctx.fillStyle = '#AAAAAA';
     ctx.fillText(displayDate.replace(/\//g, '.'), sheetW/2, footerCenterY + 40);
     
  } else if (layoutId === 'magazine') {
      const photoW = canvases[0].width;
      const photoH = canvases[0].height;
      const gap = 30;
      const margin = 50;
      const headerH = 150; 
      const cols = 2;
      const rows = Math.ceil(canvases.length / cols);
      const sheetW = (photoW * cols) + gap + (margin * 2);
      const sheetH = headerH + (photoH * rows) + gap + (margin * 2);
      
      sheet.width = sheetW;
      sheet.height = sheetH;
      
      ctx.fillStyle = '#fce7f3'; 
      ctx.fillRect(0, 0, sheetW, sheetH);
      
      ctx.fillStyle = '#ec4899'; 
      ctx.font = 'bold italic 100px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("KIRA MAG", sheetW/2, 110);
      
      ctx.fillStyle = '#000';
      ctx.font = '24px sans-serif';
      ctx.fillText(`ISSUE No. ${new Date().getMonth()+1} - ${locationText}`, sheetW/2, 140);
      
      canvases.forEach((c, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const x = margin + (col * (photoW + gap));
          const y = headerH + (row * (photoH + gap));
          
          ctx.fillStyle = 'white';
          ctx.fillRect(x - 10, y - 10, photoW + 20, photoH + 20);
          ctx.drawImage(c, x, y, photoW, photoH);
      });
      
  } else if (layoutId === 'standard') {
      // === STANDARD ID PHOTO (PROFESSIONAL CUTTING MAT STYLE) ===
      // Reference: 
      // Background: Grid (Large squares containing 4x4 small squares)
      // Layout: 2 Large (Top), 4 Small (Bottom), 1 Independent (Bottom Right)
      // Sidebar: All text info + independent photo enclosed in a unified frame.
      
      // Canvas Size: 1500 x 1050 (Approx Landscape Postcard @ 250dpi)
      const sheetW = 1500;
      const sheetH = 1050;
      
      sheet.width = sheetW;
      sheet.height = sheetH;
      
      // --- 1. Draw Professional Cutting Mat Grid ---
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, sheetW, sheetH);
      
      // Grid Config
      // Large Grid Size = 80px
      // Small Grid Size = 20px (4x4 subdivision)
      const bigGrid = 80;
      const smallGrid = 20;
      
      // Draw Small Grid (Lighter)
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#e2e8f0'; // slate-200
      
      for (let x = 0; x <= sheetW; x += smallGrid) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, sheetH); ctx.stroke();
      }
      for (let y = 0; y <= sheetH; y += smallGrid) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(sheetW, y); ctx.stroke();
      }
      
      // Draw Big Grid (Darker/Blue)
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#93c5fd'; // blue-300
      
      for (let x = 0; x <= sheetW; x += bigGrid) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, sheetH); ctx.stroke();
      }
      for (let y = 0; y <= sheetH; y += bigGrid) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(sheetW, y); ctx.stroke();
      }

      // --- 2. Photo Layout ---
      const startX = 60;
      const startY = 60;
      
      // SIZES based on approx scaling to fit sheet
      const largeW = 360;
      const largeH = 480;
      const smallW = 240;
      const smallH = 320;
      
      const gapLarge = 40;
      const gapSmall = 26;
      
      // ROW 1: 2 Large Photos
      for(let i=0; i<2; i++) {
          const x = startX + (i * (largeW + gapLarge));
          const y = startY;
          drawCuttablePhoto(ctx, canvases[0], x, y, largeW, largeH);
      }
      
      // ROW 2: 4 Small Photos
      // Calculate Y position to perfectly align bottom elements
      const row2Y = startY + largeH + 60; 
      for(let i=0; i<4; i++) {
          const x = startX + (i * (smallW + gapSmall));
          const y = row2Y;
          drawCuttablePhoto(ctx, canvases[0], x, y, smallW, smallH);
      }
      
      // Total height of the main photo area = largeH + 60 + smallH = 480 + 60 + 320 = 860
      const contentBottomY = row2Y + smallH; // should be 920

      // --- 3. Sidebar (Right Side - Unified Frame) ---
      const sidebarX = 1130; 
      const sidebarW = 310;
      const sidebarH = 860; // Exact same height as left content (480 + 60 + 320)
      
      // Draw The Container Frame
      ctx.strokeStyle = '#1e293b'; // Slate-800
      ctx.lineWidth = 2;
      ctx.strokeRect(sidebarX, startY, sidebarW, sidebarH);
      
      // A. Independent Photo (At the BOTTOM of the frame)
      const indepW = 240;
      const indepH = 300;
      const indepX = sidebarX + (sidebarW - indepW) / 2;
      // Position: Align bottom of photo with bottom of frame, with padding
      const indepY = startY + sidebarH - indepH - 30;
      
      drawCuttablePhoto(ctx, canvases[0], indepX, indepY, indepW, indepH);
      
      // B. Top Header
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(sidebarX, startY, sidebarW, 80);
      
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 36px serif';
      ctx.textAlign = 'center';
      ctx.fillText("証明写真", sidebarX + sidebarW/2, startY + 55);
      
      // C. Info Section (Middle)
      const infoStartY = startY + 120;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#0f172a';
      
      // Icon
      const iconSize = 40;
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(sidebarX + 30, infoStartY, 50, 35);
      ctx.beginPath(); ctx.arc(sidebarX + 55, infoStartY + 17, 12, 0, Math.PI*2); ctx.fillStyle = '#fff'; ctx.fill();
      ctx.beginPath(); ctx.arc(sidebarX + 55, infoStartY + 17, 6, 0, Math.PI*2); ctx.fillStyle = '#3b82f6'; ctx.fill();
      
      // "Perfect Quality" Label
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText("PERFECT*", sidebarX + 90, infoStartY + 25);
      
      // Line
      ctx.beginPath();
      ctx.moveTo(sidebarX + 30, infoStartY + 60);
      ctx.lineTo(sidebarX + sidebarW - 30, infoStartY + 60);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Metadata Fields
      let metaY = infoStartY + 100;
      const labelX = sidebarX + 30;
      const valueX = sidebarX + 30;
      
      const drawField = (label: string, value: string) => {
          ctx.fillStyle = '#64748b';
          ctx.font = 'bold 14px sans-serif';
          ctx.fillText(label, labelX, metaY);
          
          metaY += 25;
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 20px monospace';
          // Truncate if too long
          const displayVal = value.length > 14 ? value.substring(0, 14) + '..' : value;
          ctx.fillText(displayVal, valueX, metaY);
          metaY += 40;
      };
      
      drawField("NAME", customName);
      drawField("DATE", displayDate);
      drawField("LOCATION", locationText);
      
      // Bottom ID Number
      metaY += 20;
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'italic 16px serif';
      ctx.textAlign = 'right';
      ctx.fillText("NO. 001-A4", sidebarX + sidebarW - 30, metaY);

      // --- 4. Layout Size Indicators (Outside Frames) ---
      ctx.textAlign = 'left';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#64748b'; 
      
      // Text for Large Photos
      ctx.save();
      ctx.translate(startX - 25, startY + largeH/2);
      ctx.rotate(-Math.PI/2);
      ctx.textAlign = 'center';
      ctx.fillText("中型 (4.5x3.5)", 0, 0);
      ctx.restore();
      
      // Text for Small Photos
      ctx.save();
      ctx.translate(startX - 25, row2Y + smallH/2);
      ctx.rotate(-Math.PI/2);
      ctx.textAlign = 'center';
      ctx.fillText("免許 (3.0x2.4)", 0, 0);
      ctx.restore();

  } else if (layoutId === 'driver_license') {
      // Mock License Card (Restored to the requested style)
      const cardW = 1000;
      const cardH = 600;
      
      sheet.width = cardW;
      sheet.height = cardH;
      
      // Background Gradient
      const grad = ctx.createLinearGradient(0, 0, cardW, cardH);
      grad.addColorStop(0, '#eef2ff');
      grad.addColorStop(1, '#e0e7ff');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, cardW, cardH);
      
      // Header
      ctx.fillStyle = '#3b82f6'; // blue-500
      ctx.fillRect(0, 0, cardW, 100);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 50px sans-serif';
      ctx.fillText("DRIVER LICENSE", 40, 70);
      ctx.font = '30px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText("KIRA STATE", cardW - 40, 70);
      
      // Photo (Left side)
      const photo = canvases[0];
      const targetPhotoW = 250;
      const targetPhotoH = targetPhotoW * (photo.height / photo.width);
      
      const photoX = 50;
      const photoY = 150;
      
      ctx.shadowColor = 'rgba(0,0,0,0.2)';
      ctx.shadowBlur = 10;
      ctx.drawImage(photo, photoX, photoY, targetPhotoW, targetPhotoH);
      ctx.shadowBlur = 0;
      
      // Text Data
      ctx.fillStyle = '#1e293b'; 
      ctx.textAlign = 'left';
      const textX = 350;
      let textY = 200;
      
      ctx.font = 'bold 24px sans-serif';
      ctx.fillStyle = '#64748b'; 
      ctx.fillText("NAME", textX, textY);
      ctx.fillStyle = '#000'; 
      ctx.font = 'bold 40px sans-serif';
      ctx.fillText(customName.toUpperCase(), textX, textY + 40);
      
      textY += 100;
      ctx.font = 'bold 24px sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText("DOB", textX, textY);
      ctx.fillStyle = '#000'; 
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText("01-01-2000", textX, textY + 40);
      
      // Signature
      ctx.font = 'italic 50px serif';
      ctx.fillStyle = '#000';
      ctx.fillText(customName, textX, 500);
      
      // Hologram overlay effect
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.beginPath();
      ctx.arc(800, 300, 150, 0, Math.PI*2);
      ctx.fill();
      ctx.fillText("KIRA", 750, 300);
  }

  return sheet.toDataURL('image/png', 1.0);
};

// Helper for drawing cut marks (Triangles as per reference)
const drawCuttablePhoto = (ctx: CanvasRenderingContext2D, img: HTMLCanvasElement, x: number, y: number, w: number, h: number) => {
    // 1. Draw Photo
    ctx.drawImage(img, x, y, w, h);
    
    // 2. Border (Very thin faint line for cutting guide)
    ctx.strokeStyle = '#cbd5e1'; // slate-300
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
    
    // 3. Triangle Cut Marks
    ctx.fillStyle = '#334155'; // Dark slate
    const tSize = 6;
    
    // Top Edge Triangles (Pointing Down)
    // Left
    ctx.beginPath(); ctx.moveTo(x + (w*0.2), y - 2); ctx.lineTo(x + (w*0.2) + tSize, y - 2 - tSize); ctx.lineTo(x + (w*0.2) - tSize, y - 2 - tSize); ctx.fill();
    // Right
    ctx.beginPath(); ctx.moveTo(x + (w*0.8), y - 2); ctx.lineTo(x + (w*0.8) + tSize, y - 2 - tSize); ctx.lineTo(x + (w*0.8) - tSize, y - 2 - tSize); ctx.fill();

    // Bottom Edge Triangles (Pointing Up)
    // Left
    ctx.beginPath(); ctx.moveTo(x + (w*0.2), y + h + 2); ctx.lineTo(x + (w*0.2) + tSize, y + h + 2 + tSize); ctx.lineTo(x + (w*0.2) - tSize, y + h + 2 + tSize); ctx.fill();
    // Right
    ctx.beginPath(); ctx.moveTo(x + (w*0.8), y + h + 2); ctx.lineTo(x + (w*0.8) + tSize, y + h + 2 + tSize); ctx.lineTo(x + (w*0.8) - tSize, y + h + 2 + tSize); ctx.fill();
};
