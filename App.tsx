import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppState, BackgroundPreset, FramePreset, LayoutTemplate, DecorationState, Stroke, StickerItem } from './types';
import { BACKGROUND_PRESETS, FRAME_PRESETS, LAYOUT_TEMPLATES, STICKER_CATEGORIES, PEN_COLORS } from './constants';
import { loadImage, renderComposite, generateLayoutSheet, STICKER_BASE_SIZE } from './services/processor';
import { playSound } from './services/audio';
import Button from './components/Button';

// --- SVG Icons ---
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
  </svg>
);

const PrintIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
  </svg>
);

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const VolumeIcon = ({ muted }: { muted: boolean }) => (
    muted ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.414 0A5.972 5.972 0 0115 10a5.972 5.972 0 01-1.757 4.243 1 1 0 01-1.414-1.414A3.971 3.971 0 0013 10a3.971 3.971 0 00-1.172-2.828 1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
    )
);

// --- MAIN APP ---

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.TEMPLATE_SELECT);
  const [uploadedImages, setUploadedImages] = useState<HTMLImageElement[]>([]);
  
  // Customization State
  const [selectedBg, setSelectedBg] = useState<BackgroundPreset>(BACKGROUND_PRESETS[1]);
  const [selectedFrame, setSelectedFrame] = useState<FramePreset>(FRAME_PRESETS[0]);
  const [selectedTemplate, setSelectedTemplate] = useState<LayoutTemplate>(LAYOUT_TEMPLATES[0]);
  const [customFrames, setCustomFrames] = useState<FramePreset[]>([]);
  const [lightingEnabled, setLightingEnabled] = useState<boolean>(true);
  const [noiseLevel, setNoiseLevel] = useState<number>(0);
  const [customLocation, setCustomLocation] = useState<string>("Tokyo Station");

  // Decoration State
  const [editTab, setEditTab] = useState<'adjust' | 'draw' | 'sticker'>('adjust');
  // Sub-tab for stickers
  const [stickerCategory, setStickerCategory] = useState<'Y2K' | 'RIBBON' | 'DOODLE' | 'RETRO' | 'CYBER'>('Y2K');
  const [decorations, setDecorations] = useState<DecorationState[]>([]);
  const [penColor, setPenColor] = useState<string>(PEN_COLORS[0]);
  
  // Interaction State (Drawing & Stickers)
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [isDraggingSticker, setIsDraggingSticker] = useState(false);
  const [isResizingSticker, setIsResizingSticker] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [initialResizeState, setInitialResizeState] = useState<{dist: number, scale: number} | null>(null);

  // Camera State
  const [countdown, setCountdown] = useState<number | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Output
  const [layoutImageSrc, setLayoutImageSrc] = useState<string | null>(null);

  // UX States
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);

  // Refs
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const frameInputRef = useRef<HTMLInputElement>(null);
  const currentStrokeRef = useRef<Stroke | null>(null);

  // Sound Wrapper
  const play = useCallback((type: 'pop' | 'success' | 'shutter' | 'cancel') => {
      if (!isMuted) {
          playSound(type);
      }
  }, [isMuted]);

  // Flash Effect Trigger
  const triggerFlash = () => {
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 200);
  };

  // --- COMPOSITE RENDERING ---
  useEffect(() => {
    const updateCanvases = async () => {
      if (appState === AppState.EDIT && uploadedImages.length > 0) {
        let frameImg: HTMLImageElement | null = null;
        if (selectedFrame.src) {
           frameImg = await loadImage(selectedFrame.src);
        }
        uploadedImages.forEach((img, index) => {
           const canvas = canvasRefs.current[index];
           if (canvas) {
               renderComposite({
                  canvas,
                  personImage: img,
                  backgroundImage: selectedBg,
                  frameImage: frameImg,
                  lightingEnabled: lightingEnabled,
                  noiseLevel: noiseLevel,
                  decorations: decorations[index] || { strokes: [], stickers: [] },
                  selectedStickerId: selectedStickerId // Pass selection to renderer
               });
           }
        });
      }
    };
    updateCanvases();
  }, [appState, uploadedImages, selectedBg, selectedFrame, lightingEnabled, noiseLevel, decorations, selectedStickerId]);

  // --- EVENT HANDLERS ---

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      play('pop');
      setAppState(AppState.PROCESSING);
      const files = Array.from(e.target.files) as File[];
      const maxSlots = selectedTemplate.slots;
      const filesToLoad = files.slice(0, maxSlots);

      try {
        const loadedImages = await Promise.all(filesToLoad.map(async (file) => {
            const imgUrl = URL.createObjectURL(file);
            return await loadImage(imgUrl);
        }));

        setUploadedImages(loadedImages);
        // Init decorations
        setDecorations(new Array(loadedImages.length).fill(null).map(() => ({ strokes: [], stickers: [] })));
        
        canvasRefs.current = [];
        play('success');
        setAppState(AppState.EDIT);
      } catch (error) {
        console.error(error);
        alert('Could not load images.');
        setAppState(AppState.UPLOAD);
      }
    }
  };

  const startCamera = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
              video: { facingMode: "user", width: { ideal: 1080 }, height: { ideal: 1920 } }, 
              audio: false 
          });
          setCameraStream(stream);
          setAppState(AppState.CAMERA);
          // Wait for video element to mount
          setTimeout(() => {
              if (videoRef.current) {
                  videoRef.current.srcObject = stream;
                  videoRef.current.play();
              }
          }, 100);
      } catch (e) {
          console.error(e);
          alert("Unable to access camera. Please use file upload.");
      }
  };

  const stopCamera = () => {
      if (cameraStream) {
          cameraStream.getTracks().forEach(track => track.stop());
          setCameraStream(null);
      }
  };

  const handleBurstCapture = async () => {
      if (!videoRef.current) return;
      
      const shots = selectedTemplate.slots;
      const captured: HTMLImageElement[] = [];

      // Create a temporary canvas for capturing
      const capCanvas = document.createElement('canvas');
      capCanvas.width = videoRef.current.videoWidth;
      capCanvas.height = videoRef.current.videoHeight;
      const ctx = capCanvas.getContext('2d');
      if(!ctx) return;

      // Capture Loop
      for (let i = 0; i < shots; i++) {
          // Countdown
          for (let c = 3; c > 0; c--) {
              setCountdown(c);
              play('pop');
              await new Promise(r => setTimeout(r, 800));
          }
          setCountdown(0); // "Smile!" or Flash
          
          // Flash & Capture
          play('shutter');
          triggerFlash();
          
          // Flip horizontally for mirror effect natural feel
          ctx.save();
          ctx.translate(capCanvas.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(videoRef.current, 0, 0);
          ctx.restore();

          const url = capCanvas.toDataURL('image/jpeg', 0.9);
          const img = await loadImage(url);
          captured.push(img);

          await new Promise(r => setTimeout(r, 500)); // Small delay between shots
      }

      setCountdown(null);
      stopCamera();
      setUploadedImages(captured);
      setDecorations(new Array(captured.length).fill(null).map(() => ({ strokes: [], stickers: [] })));
      canvasRefs.current = [];
      setAppState(AppState.EDIT);
  };

  const handleFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files[0]) {
       play('pop');
       const file = e.target.files[0];
       const url = URL.createObjectURL(file);
       const newFrame: FramePreset = {
         id: `custom-${Date.now()}`,
         name: 'Custom',
         src: url,
         isCustom: true
       };
       setCustomFrames(prev => [...prev, newFrame]);
       setSelectedFrame(newFrame);
     }
  };

  // --- DRAWING & STICKER INTERACTION LOGIC ---
  const getCanvasCoords = (e: React.PointerEvent, canvas: HTMLCanvasElement) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
          x: (e.clientX - rect.left) * scaleX,
          y: (e.clientY - rect.top) * scaleY
      };
  };

  const handlePointerDown = (e: React.PointerEvent, index: number) => {
      const canvas = canvasRefs.current[index];
      if (!canvas) return;
      const coords = getCanvasCoords(e, canvas);

      // --- MODE: DRAW ---
      if (editTab === 'draw') {
         setIsDrawing(true);
         setSelectedStickerId(null); // Deselect sticker when drawing
         currentStrokeRef.current = {
             color: penColor,
             width: 15,
             points: [coords]
         };
         return;
      }

      // --- MODE: STICKER / ADJUST ---
      const currentDecorations = decorations[index];
      if (!currentDecorations) return;
      
      // 1. Check Delete/Resize Handle of SELECTED sticker first
      if (selectedStickerId) {
          const selectedSticker = currentDecorations.stickers.find(s => s.id === selectedStickerId);
          if (selectedSticker) {
              const halfSize = (STICKER_BASE_SIZE * 1.2 * selectedSticker.scale) / 2;
              
              // DELETE Handle (Top Right)
              const delX = selectedSticker.x + halfSize;
              const delY = selectedSticker.y - halfSize;
              const distDel = Math.sqrt(Math.pow(coords.x - delX, 2) + Math.pow(coords.y - delY, 2));
              
              if (distDel < 40) { 
                  play('cancel');
                  setDecorations(prev => {
                      const next = [...prev];
                      next[index] = {
                          ...next[index],
                          stickers: next[index].stickers.filter(s => s.id !== selectedStickerId)
                      };
                      return next;
                  });
                  setSelectedStickerId(null);
                  return; 
              }

              // RESIZE Handle (Bottom Right)
              const resX = selectedSticker.x + halfSize;
              const resY = selectedSticker.y + halfSize;
              const distRes = Math.sqrt(Math.pow(coords.x - resX, 2) + Math.pow(coords.y - resY, 2));

              if (distRes < 40) {
                  setIsResizingSticker(true);
                  const distFromCenter = Math.sqrt(Math.pow(coords.x - selectedSticker.x, 2) + Math.pow(coords.y - selectedSticker.y, 2));
                  setInitialResizeState({
                      dist: distFromCenter,
                      scale: selectedSticker.scale
                  });
                  return;
              }
          }
      }
      
      // 2. Normal Sticker Hit Test (Selection)
      let hitStickerId: string | null = null;

      // Hit Test Stickers (Top-most first)
      for (let i = currentDecorations.stickers.length - 1; i >= 0; i--) {
          const s = currentDecorations.stickers[i];
          const halfSize = (STICKER_BASE_SIZE * 1.2 * s.scale) / 2;
          
          if (
              coords.x >= s.x - halfSize && 
              coords.x <= s.x + halfSize &&
              coords.y >= s.y - halfSize &&
              coords.y <= s.y + halfSize
          ) {
              hitStickerId = s.id;
              break;
          }
      }

      if (hitStickerId) {
          setSelectedStickerId(hitStickerId);
          const s = currentDecorations.stickers.find(st => st.id === hitStickerId);
          if (s) {
              setIsDraggingSticker(true);
              setDragOffset({ x: coords.x - s.x, y: coords.y - s.y });
          }
      } else {
          // Deselect if clicked empty space
          setSelectedStickerId(null);
      }
  };

  const handlePointerMove = (e: React.PointerEvent, index: number) => {
      const canvas = canvasRefs.current[index];
      if (!canvas) return;
      const coords = getCanvasCoords(e, canvas);

      if (isDrawing && editTab === 'draw' && currentStrokeRef.current) {
          currentStrokeRef.current.points.push(coords);
          const ctx = canvas.getContext('2d');
          if (ctx) {
              ctx.lineCap = 'round';
              ctx.lineJoin = 'round';
              ctx.strokeStyle = currentStrokeRef.current.color;
              ctx.lineWidth = currentStrokeRef.current.width;
              ctx.beginPath();
              const len = currentStrokeRef.current.points.length;
              if (len >= 2) {
                  const p1 = currentStrokeRef.current.points[len - 2];
                  const p2 = currentStrokeRef.current.points[len - 1];
                  ctx.moveTo(p1.x, p1.y);
                  ctx.lineTo(p2.x, p2.y);
                  ctx.stroke();
              }
          }
          return;
      }

      if (isResizingSticker && selectedStickerId && initialResizeState) {
          setDecorations(prev => {
              const next = [...prev];
              const stickers = [...next[index].stickers];
              const sIdx = stickers.findIndex(s => s.id === selectedStickerId);
              if (sIdx > -1) {
                  const s = stickers[sIdx];
                  const currentDist = Math.sqrt(Math.pow(coords.x - s.x, 2) + Math.pow(coords.y - s.y, 2));
                  const scaleRatio = currentDist / initialResizeState.dist;
                  // Limit min/max scale
                  const newScale = Math.max(0.3, Math.min(3.0, initialResizeState.scale * scaleRatio));
                  
                  stickers[sIdx] = {
                      ...s,
                      scale: newScale
                  };
                  next[index] = { ...next[index], stickers };
              }
              return next;
          });
          return;
      }

      if (isDraggingSticker && selectedStickerId) {
          setDecorations(prev => {
              const next = [...prev];
              const stickers = [...next[index].stickers];
              const sIdx = stickers.findIndex(s => s.id === selectedStickerId);
              if (sIdx > -1) {
                  stickers[sIdx] = {
                      ...stickers[sIdx],
                      x: coords.x - dragOffset.x,
                      y: coords.y - dragOffset.y
                  };
                  next[index] = { ...next[index], stickers };
              }
              return next;
          });
      }
  };

  const handlePointerUp = (index: number) => {
      if (isDrawing && currentStrokeRef.current) {
          const newStroke = currentStrokeRef.current;
          setDecorations(prev => {
              const next = [...prev];
              next[index] = {
                  ...next[index],
                  strokes: [...next[index].strokes, newStroke]
              };
              return next;
          });
          currentStrokeRef.current = null;
      }
      setIsDrawing(false);
      setIsDraggingSticker(false);
      setIsResizingSticker(false);
      setInitialResizeState(null);
  };

  const addSticker = (stickerContent: string) => {
      play('pop');
      setDecorations(prev => prev.map(dec => {
          const id = `sticker-${Date.now()}-${Math.random()}`;
          return {
              ...dec,
              stickers: [...dec.stickers, {
                  id: id,
                  content: stickerContent,
                  x: 500, // Center
                  y: 700, // Center
                  scale: 1,
                  rotation: (Math.random() - 0.5) * 0.5
              }]
          };
      }));
  };

  const clearDecorations = (index: number) => {
      setDecorations(prev => {
          const next = [...prev];
          next[index] = { strokes: [], stickers: [] };
          return next;
      });
      play('cancel');
  };

  // --- FINAL GENERATION ---

  const handleGenerateLayout = async () => {
    if (uploadedImages.length === 0) return;
    play('shutter');
    triggerFlash();
    
    setSelectedStickerId(null);

    setTimeout(() => {
        const sourceCanvases = canvasRefs.current.filter(c => c !== null) as HTMLCanvasElement[];
        if (sourceCanvases.length === 0) return;
        const layoutSrc = generateLayoutSheet(sourceCanvases, selectedTemplate.id, customLocation);
        setLayoutImageSrc(layoutSrc);
        play('success');
        setAppState(AppState.LAYOUT);
    }, 100);
  };

  const handleDownloadSheet = async () => {
    play('pop');
    if (layoutImageSrc) {
      const link = document.createElement('a');
      link.download = `puri-print-sheet-${Date.now()}.png`;
      try {
        const response = await fetch(layoutImageSrc);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
      } catch (err) {
        link.href = layoutImageSrc;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  const toggleMute = () => { setIsMuted(!isMuted); };

  // --- RENDER HELPERS ---
  const VolumeButton = () => (
      <Button variant="icon" onClick={toggleMute} title={isMuted ? "Unmute" : "Mute"} className="!bg-white/90 !shadow-sm">
          <VolumeIcon muted={isMuted} />
      </Button>
  );

  const TopHeader = ({ leftAction, rightAction }: { leftAction?: React.ReactNode, rightAction?: React.ReactNode }) => (
    <div className="w-full flex justify-between items-center p-4 z-50">
        <div>{leftAction}</div>
        <div>{rightAction}</div>
    </div>
  );

  // --- VIEWS ---

  const renderTemplateSelection = () => (
      <div className="flex flex-col min-h-screen animate-fade-in pb-10">
          <TopHeader rightAction={<VolumeButton />} />
          <div className="flex-grow flex flex-col items-center justify-center p-6 -mt-10">
            <div className="max-w-md w-full bg-white/80 backdrop-blur-md p-8 rounded-[3rem] border-4 border-white shadow-xl animate-[float_6s_ease-in-out_infinite]">
                <h1 className="text-4xl font-extrabold text-pink-500 mb-2 tracking-wide flex items-center justify-center drop-shadow-sm">
                    <SparklesIcon /> Puri-Cute
                </h1>
                <p className="text-slate-500 mb-8 font-medium text-center">✨ Photo Booth & Sticker Maker ✨</p>

                <div className="grid grid-cols-2 gap-4">
                    {LAYOUT_TEMPLATES.map(template => (
                        <button
                            key={template.id}
                            onClick={() => { play('pop'); setSelectedTemplate(template); setAppState(AppState.UPLOAD); }}
                            className="bg-white p-4 rounded-[2rem] border-2 border-slate-100 shadow-sm hover:border-pink-300 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center group active:scale-95 duration-200"
                        >
                            <div className="text-5xl mb-3 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">{template.icon}</div>
                            <div className="font-bold text-slate-700">{template.name}</div>
                            <div className="text-xs text-slate-400 mb-2">{template.description}</div>
                            <span className="text-[10px] bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full font-bold border border-blue-100">{template.slots} Shot{template.slots > 1 ? 's' : ''}</span>
                        </button>
                    ))}
                </div>
            </div>
          </div>
      </div>
  );

  const renderUploadStep = () => (
    <div className="flex flex-col min-h-screen animate-fade-in">
      <TopHeader 
        leftAction={<Button variant="icon" onClick={() => { play('cancel'); setAppState(AppState.TEMPLATE_SELECT); }}><BackIcon /></Button>}
        rightAction={<VolumeButton />}
      />

      <div className="flex-grow flex flex-col items-center justify-center p-6 -mt-10 gap-6">
        <div className="bg-white/90 backdrop-blur-md p-8 rounded-[3rem] shadow-xl border-4 border-white max-w-sm w-full">
            <div className="text-center mb-6">
                <div className="text-pink-400 mb-2 font-bold text-3xl flex justify-center items-center gap-2">
                    {selectedTemplate.icon} {selectedTemplate.name}
                </div>
                <p className="text-slate-500 text-sm font-medium">Choose how to create your purikura!</p>
            </div>
            
            <div className="bg-yellow-50/80 border border-yellow-200 rounded-2xl p-3 mb-6 text-xs text-yellow-800 flex gap-2 items-start">
               <span className="text-lg">💡</span>
               <div>
                 <span className="font-bold">Pro Tip:</span> To see the cute backgrounds, please use photos with <span className="font-bold">transparent backgrounds</span>.
                 <a href="https://www.photoroom.com/tools/background-remover" target="_blank" rel="noreferrer" className="block mt-1 text-yellow-600 underline font-bold hover:text-yellow-500">
                    Remove background here first &rarr;
                 </a>
               </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {/* Camera Option */}
                <button 
                  onClick={() => { play('pop'); startCamera(); }}
                  className="bg-pink-400 text-white rounded-2xl p-6 shadow-lg shadow-pink-200 hover:bg-pink-500 active:scale-95 transition-all flex flex-col items-center"
                >
                   <CameraIcon />
                   <span className="font-bold text-lg">Start Camera</span>
                   <span className="text-xs opacity-80 mt-1">Countdown Burst Mode</span>
                </button>

                {/* File Option */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-dashed border-[3px] border-blue-200 rounded-2xl p-6 cursor-pointer hover:bg-blue-50 transition-all active:scale-95 bg-blue-50/30 flex flex-col items-center"
                >
                  <div className="text-blue-300 mb-2"><UploadIcon /></div>
                  <span className="text-blue-400 font-bold text-lg">Upload Photos</span>
                  <span className="text-blue-300 text-xs mt-1">Pick up to {selectedTemplate.slots} images</span>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileUpload} />
            </div>
        </div>
      </div>
    </div>
  );

  const renderCameraStep = () => (
      <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
          <video ref={videoRef} className="absolute w-full h-full object-cover opacity-80" autoPlay playsInline muted />
          
          {/* Overlay UI */}
          <div className="relative z-10 flex flex-col items-center justify-between h-full w-full py-10">
              <div className="bg-black/50 px-6 py-2 rounded-full text-white font-bold backdrop-blur-sm">
                  {selectedTemplate.slots} Shots Burst Mode
              </div>

              {countdown !== null ? (
                  <div className="text-9xl font-black text-white drop-shadow-[0_0_10px_rgba(255,105,180,0.8)] animate-pulse scale-150 transition-all">
                      {countdown === 0 ? "📸" : countdown}
                  </div>
              ) : (
                  <button 
                    onClick={handleBurstCapture}
                    className="w-24 h-24 bg-white rounded-full border-8 border-pink-200 shadow-[0_0_30px_rgba(255,255,255,0.5)] active:scale-90 transition-transform flex items-center justify-center"
                  >
                      <div className="w-20 h-20 bg-pink-500 rounded-full border-4 border-white"></div>
                  </button>
              )}
              
              <Button variant="outline" onClick={() => { stopCamera(); setAppState(AppState.UPLOAD); }} className="!bg-white/20 !text-white !border-white/50 backdrop-blur-md">
                  Cancel
              </Button>
          </div>
      </div>
  );

  const renderEditorStep = () => (
    <div className="flex flex-col h-[100dvh] w-full max-w-lg mx-auto bg-white shadow-2xl relative overflow-hidden">
      {/* Canvas Area */}
      <div className="flex-1 min-h-0 bg-[#f8fafc] overflow-y-auto p-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] relative">
          <div className={`w-full mx-auto h-full ${uploadedImages.length === 1 ? 'flex items-center justify-center py-4' : 'grid grid-cols-2 gap-4 auto-rows-min content-start'}`}>
              {uploadedImages.map((_, index) => (
                  <div key={index} className={`relative group ${uploadedImages.length === 1 ? 'w-auto h-auto max-w-[85%] max-h-[85%]' : 'w-full aspect-[5/7]'}`}>
                      <div 
                        className="relative w-full h-full touch-none"
                        onPointerDown={(e) => handlePointerDown(e, index)}
                        onPointerMove={(e) => handlePointerMove(e, index)}
                        onPointerUp={() => handlePointerUp(index)}
                        onPointerLeave={() => handlePointerUp(index)}
                      >
                          <canvas 
                            ref={(el) => (canvasRefs.current[index] = el)}
                            className={`shadow-lg rounded-2xl border-[4px] border-white object-contain bg-white w-full h-full`}
                          />
                          {uploadedImages.length > 1 && (
                              <div className="absolute top-2 left-2 bg-pink-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-white pointer-events-none">
                                  {index + 1}
                              </div>
                          )}
                          {/* Clear Button per photo */}
                          <button 
                             onClick={(e) => { e.stopPropagation(); clearDecorations(index); }}
                             className="absolute top-2 right-2 bg-slate-800/50 text-white text-[10px] px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                              Reset
                          </button>
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* Editor Controls */}
      <div className="flex-none bg-white rounded-t-[2rem] shadow-[0_-5px_30px_rgba(0,0,0,0.1)] z-20">
        {/* Tabs */}
        <div className="flex justify-around border-b border-slate-100">
            {[
                { id: 'adjust', label: 'Adjust', icon: '✨' },
                { id: 'draw', label: 'Graffiti', icon: '🖊️' },
                { id: 'sticker', label: 'Stickers', icon: '🧸' }
            ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => { play('pop'); setEditTab(tab.id as any); setSelectedStickerId(null); }}
                    className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${editTab === tab.id ? 'text-pink-500 border-b-2 border-pink-500 bg-pink-50/50' : 'text-slate-400'}`}
                >
                    <span>{tab.icon}</span> {tab.label}
                </button>
            ))}
        </div>

        {/* Tab Content */}
        <div className="p-5 h-56 overflow-y-auto custom-scrollbar">
            {editTab === 'adjust' && (
                <div className="space-y-4">
                     <div className="flex gap-4">
                        <div className="flex-1 bg-pink-50 p-3 rounded-2xl border border-pink-100 flex flex-col items-center justify-center">
                            <span className="text-xs font-bold text-slate-500 mb-1">Beauty Filter</span>
                            <button 
                              onClick={() => setLightingEnabled(!lightingEnabled)}
                              className={`w-10 h-6 rounded-full border-2 relative transition-colors ${lightingEnabled ? 'bg-pink-400 border-pink-400' : 'bg-slate-200 border-slate-200'}`}
                            >
                                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${lightingEnabled ? 'translate-x-4' : ''}`} />
                            </button>
                        </div>
                        <div className="flex-1 bg-blue-50 p-3 rounded-2xl border border-blue-100 flex flex-col items-center justify-center">
                            <span className="text-xs font-bold text-slate-500 mb-1">Retro Grain</span>
                            <input 
                              type="range" min="0" max="0.5" step="0.05" 
                              value={noiseLevel} onChange={(e) => setNoiseLevel(parseFloat(e.target.value))}
                              className="w-full h-2 bg-blue-200 rounded-lg accent-blue-400"
                            />
                        </div>
                     </div>
                     <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                         {BACKGROUND_PRESETS.map(bg => (
                             <button key={bg.id} onClick={() => setSelectedBg(bg)} className={`w-10 h-10 rounded-full border-2 flex-shrink-0 ${selectedBg.id === bg.id ? 'border-pink-500 scale-110' : 'border-white shadow-sm'}`} style={{background: bg.value}} />
                         ))}
                     </div>
                </div>
            )}

            {editTab === 'draw' && (
                <div className="space-y-2">
                    <p className="text-xs text-center text-slate-400 mb-2">Draw directly on the photos!</p>
                    <div className="flex justify-center gap-3 flex-wrap">
                        {PEN_COLORS.map(c => (
                            <button 
                              key={c}
                              onClick={() => { play('pop'); setPenColor(c); }}
                              className={`w-10 h-10 rounded-full border-4 shadow-sm transition-transform ${penColor === c ? 'scale-125 border-slate-300' : 'border-white hover:scale-110'}`}
                              style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {editTab === 'sticker' && (
                <div>
                  {/* Category Filter */}
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                    {(['Y2K', 'RIBBON', 'DOODLE', 'RETRO', 'CYBER'] as const).map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setStickerCategory(cat)}
                        className={`text-xs font-bold px-3 py-1 rounded-full transition-all border whitespace-nowrap ${stickerCategory === cat ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-400 border-slate-200 hover:border-pink-300'}`}
                      >
                         {cat === 'Y2K' && '✨ Y2K'}
                         {cat === 'RIBBON' && '🎀 Ribbon'}
                         {cat === 'DOODLE' && '🖍️ Doodle'}
                         {cat === 'RETRO' && '🎄 Retro Xmas'}
                         {cat === 'CYBER' && '🤖 Cyber Pets'}
                      </button>
                    ))}
                  </div>

                  {/* Sticker Grid */}
                  <div className="grid grid-cols-3 gap-3">
                      {STICKER_CATEGORIES[stickerCategory].map((s) => (
                          <button 
                            key={s.id} 
                            onClick={() => addSticker(s.id)}
                            className="bg-slate-50 border border-slate-100 rounded-xl p-2 text-xs text-slate-500 hover:bg-pink-50 hover:border-pink-200 hover:text-pink-500 active:scale-95 transition-all"
                          >
                             {s.label}
                          </button>
                      ))}
                  </div>
                </div>
            )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
             <Button variant="outline" onClick={() => { play('cancel'); setAppState(AppState.UPLOAD); }} className="!w-auto !rounded-2xl">
                 <BackIcon />
             </Button>
             <Button fullWidth onClick={handleGenerateLayout} className="rounded-2xl shadow-pink-300 shadow-lg">
                 Finish & Print ✨
             </Button>
        </div>
      </div>
    </div>
  );

  const renderLayoutStep = () => (
    <div className="flex flex-col h-full w-full max-w-lg mx-auto bg-slate-900 min-h-screen relative animate-fade-in">
        <div className="p-4 flex justify-between items-center text-white z-10 bg-slate-900/50 backdrop-blur-md sticky top-0">
            <h2 className="text-lg font-bold flex items-center"><span className="text-2xl mr-2">🖨️</span> Print Preview</h2>
            <div className="flex gap-2 items-center">
                <Button variant="icon" onClick={toggleMute} className="!bg-white/10 !text-white !border-transparent hover:!bg-white/20">
                    <VolumeIcon muted={isMuted} />
                </Button>
                <button onClick={() => { play('cancel'); setAppState(AppState.EDIT); }} className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors active:scale-90 font-bold">Back</button>
            </div>
        </div>
        
        <div className="flex-grow flex items-center justify-center p-6 overflow-auto bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
            {layoutImageSrc && (
                <img src={layoutImageSrc} alt="Print Layout" className="w-full h-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-sm border-8 border-white animate-fade-in-up" />
            )}
        </div>

        <div className="p-6 bg-slate-800 border-t border-slate-700 z-10 safe-area-pb">
             <div className="bg-slate-700/50 p-4 rounded-3xl mb-4 border border-slate-600 text-center">
                <p className="text-pink-300 text-sm font-bold mb-1">🎉 Ready to Print!</p>
                <p className="text-slate-400 text-xs">Save image to your gallery.</p>
             </div>
             <Button fullWidth onClick={handleDownloadSheet} className="text-lg shadow-pink-500/50 shadow-lg rounded-2xl">
                Save Image 📥
            </Button>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full font-sans selection:bg-pink-200 relative text-slate-800" style={{ backgroundColor: '#fff0f5', backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffcce6' fill-opacity='0.4' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")` }}>
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      `}</style>
      
      <div className={`fixed inset-0 bg-white z-[100] pointer-events-none transition-opacity duration-200 ease-out ${isFlashing ? 'opacity-100' : 'opacity-0'}`} />

      {appState === AppState.TEMPLATE_SELECT && renderTemplateSelection()}
      {appState === AppState.UPLOAD && renderUploadStep()}
      {appState === AppState.CAMERA && renderCameraStep()}
      {appState === AppState.PROCESSING && <div className="flex h-screen items-center justify-center"><div className="animate-spin text-4xl">💖</div></div>}
      {appState === AppState.EDIT && renderEditorStep()}
      {appState === AppState.LAYOUT && renderLayoutStep()}
    </div>
  );
}