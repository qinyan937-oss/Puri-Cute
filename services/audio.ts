
// Simple synthesizer for Cute UI sounds using Web Audio API
// No external files required!

let audioCtx: AudioContext | null = null;

const getContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

const createOscillator = (ctx: AudioContext, type: OscillatorType, freq: number, duration: number, startTime: number) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  
  gain.gain.setValueAtTime(0.1, startTime);
  gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
};

export const playSound = (type: 'pop' | 'success' | 'shutter' | 'cancel') => {
  try {
    const ctx = getContext();
    const t = ctx.currentTime;

    switch (type) {
      case 'pop':
        // A cute high-pitched bubble pop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(400, t + 0.1);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.1);
        break;

      case 'success':
        // A magical ascending arpeggio (C6, E6, G6, C7)
        createOscillator(ctx, 'sine', 1046.50, 0.1, t);       // C6
        createOscillator(ctx, 'sine', 1318.51, 0.1, t + 0.08); // E6
        createOscillator(ctx, 'sine', 1567.98, 0.2, t + 0.16); // G6
        createOscillator(ctx, 'sine', 2093.00, 0.4, t + 0.24); // C7
        break;

      case 'shutter':
        // White noise burst simulating a shutter click
        const bufferSize = ctx.sampleRate * 0.1; // 0.1 seconds
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.2, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        noise.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(t);
        
        // Add a high beep for "focus" feel
        createOscillator(ctx, 'sine', 1500, 0.1, t + 0.05);
        break;
        
      case 'cancel':
        // Low descending tone
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(300, t);
        osc2.frequency.linearRampToValueAtTime(100, t + 0.15);
        gain2.gain.setValueAtTime(0.1, t);
        gain2.gain.linearRampToValueAtTime(0.01, t + 0.15);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(t);
        osc2.stop(t + 0.15);
        break;
    }
  } catch (e) {
    console.warn("Audio play failed", e);
  }
};
