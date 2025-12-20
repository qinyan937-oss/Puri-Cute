import React, { useState, useRef, useEffect } from 'react';
import { AppState, BackgroundPreset, FramePreset, LayoutTemplate, DecorationState, Stroke, ImageTransform, StickerItem } from './types';
import { BACKGROUND_PRESETS, FRAME_PRESETS, LAYOUT_TEMPLATES, PEN_COLORS, STICKER_CATEGORIES } from './constants';
import { loadImage, renderComposite, generateLayoutSheetAsync, drawStickerAsset } from './services/processor';
import { playSound } from './services/audio';
import Button from './components/Button';

const TRANSLATIONS = {
  en: { appTitle: "KIRA", appSubtitle: "Record Sparkle", shots: "shots", tpl_cinema: "Life4Cuts", tpl_polaroid: "Polaroid", tpl_standard: "ID Photo", tpl_driver_license: "License", start_camera: "Camera", upload_photos: "Album", tab_adjust: "Edit", tab_draw: "Draw", tab_frame: "Frame", tab_sticker: "Stickers", beauty_filter: "Beauty", moe_magic: "Moe!", finish: "Finish", ready_msg: "✨ All Ready! ✨", save_btn: "Save 📥", back: "Back", loading: "Casting...", undo: "Undo", delete: "Delete", scale: "Size", rotation: "Rotate", brush_standard: "Standard", brush_neon: "Neon", how_to_shoot: "How to shoot?", select_hint: "Select", zoom: "Zoom", date_stamp: "Date Stamp", contrast: "Contrast", custom_frame: "Custom", tab_bg: "Background" },
  zh: { appTitle: "KIRA 闪闪", appSubtitle: "记录闪耀时刻", shots: "张", tpl_cinema: "人生四格", tpl_polaroid: "蓝彩拍立得", tpl_standard: "日系证件照", tpl_driver_license: "美国驾照", start_camera: "拍照", upload_photos: "相册", tab_adjust: "调节", tab_draw: "涂鸦", tab_frame: "相框", tab_sticker: "贴纸", beauty_filter: "美颜", moe_magic: "萌化", finish: "完成", ready_msg: "✨ 制作完成！✨", save_btn: "保存图片 📥", back: "返回", loading: "施法中...", undo: "撤销", delete: "删除", scale: "大小", rotation: "旋转", brush_standard: "普通笔", brush_neon: "荧光笔", how_to_shoot: "想怎么拍？", select_hint: "选择", zoom: "画面缩放", date_stamp: "日期水印", contrast: "对比度调整", custom_frame: "自定义", tab_bg: "背景更换" }
};

const Icons = {
    Cinema: () => (
        <div className="flex items-center gap-4 drop-shadow-[0_0_12px_rgba(244,114,182,0.5)]">
            <div className="w-14 h-24 bg-gradient-to-b from-pink-300 to-pink-500 rounded-xl p-2 border-2 border-white/60 flex flex-col gap-2 shadow-inner">
                <div className="flex-1 bg-white rounded-md shadow-sm" />
                <div className="flex-1 bg-white rounded-md shadow-sm" />
                <div className="flex-1 bg-white rounded-md shadow-sm" />
            </div>
            <div className="flex flex-col gap-2.5">
                {[...Array(4)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-pink-400" />)}
            </div>
        </div>
    ),
    Polaroid: () => (
        <div className="w-20 h-20 bg-gradient-to-br from-blue-300 to-blue-500 rounded-2xl p-3 border-2 border-white/60 relative shadow-lg drop-shadow-[0_0_12px_rgba(59,130,246,0.3)] flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-xl relative overflow-hidden shadow-inner">
                <div className="absolute top-1.5 right-1.5 w-3 h-3 bg-pink-400 rounded-full shadow-sm" />
            </div>
        </div>
    ),
    Standard: () => (
        <div className="w-24 h-14 bg-gradient-to-b from-sky-300 to-sky-500 rounded-2xl p-2.5 border-2 border-white/60 flex items-center gap-3 shadow-lg drop-shadow-[0_0_12px_rgba(125,211,252,0.4)]">
            <div className="h-full aspect-[3/4] bg-white rounded-lg shadow-sm" />
            <div className="flex-1 flex flex-col gap-2">
                <div className="w-full h-1.5 bg-white rounded-full opacity-90" />
                <div className="w-3/4 h-1.5 bg-white rounded-full opacity-90" />
                <div className="w-1/2 h-1.5 bg-white rounded-full opacity-90" />
            </div>
        </div>
    ),
    License: () => (
        <div className="w-24 h-16 bg-gradient-to-br from-pink-300 to-pink-500 rounded-2xl p-3 border-2 border-white/60 flex items-center gap-3 shadow-lg relative drop-shadow-[0_0_12px_rgba(244,114,182,0.4)]">
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm" />
            <div className="flex-1 flex flex-col gap-2">
                <div className="w-full h-2 bg-white rounded-full opacity-90" />
                <div className="w-3/4 h-2 bg-white rounded-full opacity-90" />
                <div className="w-1/2 h-2 bg-white rounded-full opacity-90" />
            </div>
            <div className="absolute bottom-1.5 right-1.5 text-xs text-pink-200 animate-pulse">★</div>
        </div>
    ),
    Adjust: () => <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/></svg>,
    Frame: () => <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/><path d="M17 12h-2v2h2v-2zm-4 4h-2v2h2v-2zm8-12H3v16h18V4z"/></svg>,
    Brush: () => <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34a.996.996 0 0 0-1.41 0L9 12.25 11.75 15l8.96-8.96a.996.996 0 0 0 0-1.41z"/></svg>,
    Sticker: () => <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><circle cx="15.5" cy="9.5" r="1.5"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M12 18c2.28 0 4.22-1.66 5-4H7c.78 2.34 2.72 4 5 4z"/></svg>
};

const StickerPreview = ({ id }: { id: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) { 
            ctx.clearRect(0,0,100,100); 
            ctx.save(); 
            ctx.translate(50,50); 
            drawStickerAsset(ctx, id, 35); 
            ctx.restore(); 
        }
    }, [id]);
    return <canvas ref={canvasRef} width={100} height={100} className="w-12 h-12 md:w-16 md:h-16" />;
};

const App = () => {
  const [lang, setLang] = useState<'en' | 'zh'>('zh');
  const t = TRANSLATIONS[lang];

  const [appState, setAppState] = useState<AppState>(AppState.TEMPLATE_SELECT);
  const [selectedTemplate, setSelectedTemplate] = useState<LayoutTemplate>(LAYOUT_TEMPLATES[0]);
  const [uploadedImages, setUploadedImages] = useState<HTMLImageElement[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [activeTab, setActiveTab] = useState<'adjust' | 'frame' | 'draw' | 'sticker'>('adjust');
  const [stickerCategory, setStickerCategory] = useState(STICKER_CATEGORIES[0].id);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  const [brushType, setBrushType] = useState<'standard' | 'neon'>('neon');
  const [lightingEnabled, setLightingEnabled] = useState(true); 
  const [isMoeMode, setIsMoeMode] = useState(true);
  const [dateStampEnabled, setDateStampEnabled] = useState(true);
  const [noiseLevel, setNoiseLevel] = useState(0.08);
  const [contrast, setContrast] = useState(1.0);
  const [brushSize, setBrushSize] = useState(25);
  const [currentPenColor, setCurrentPenColor] = useState(PEN_COLORS[2]);
  const [currentBg, setCurrentBg] = useState<BackgroundPreset>(BACKGROUND_PRESETS[0]);
  const [customName, setCustomName] = useState("KIRA USER");
  const [customLocation, setCustomLocation] = useState("SHANGHAI");

  const [decorations, setDecorations] = useState<DecorationState[]>(Array.from({ length: 4 }, () => ({ strokes: [], stickers: [] })));
  const [imageTransforms, setImageTransforms] = useState<ImageTransform[]>(Array.from({ length: 4 }, () => ({ x: 0, y: 0, scale: 1 })));
  
  const interactionMode = useRef<'none' | 'draw' | 'pan' | 'sticker_drag'>('none');
  const startPos = useRef({ x: 0, y: 0, sx: 0, sy: 0 });
  const startSticker = useRef<{x: number, y: number} | null>(null);

  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const frameUploadRef = useRef<HTMLInputElement>(null);
  const [finalLayoutUrls, setFinalLayoutUrls] = useState<string[]>([]);

  useEffect(() => {
    const handleGlobalUp = () => { 
        interactionMode.current = 'none'; 
    };
    window.addEventListener('pointerup', handleGlobalUp);
    return () => window.removeEventListener('pointerup', handleGlobalUp);
  }, []);

  useEffect(() => {
    if (appState === AppState.EDIT && uploadedImages.length > 0) {
       uploadedImages.forEach((img, idx) => {
           const canvas = canvasRefs.current[idx];
           if (canvas) renderComposite({ 
               canvas, 
               personImage: img, 
               backgroundImage: currentBg, 
               frameImage: decorations[idx].frameImage, 
               lightingEnabled, 
               noiseLevel, 
               contrast, 
               decorations: decorations[idx], 
               imageTransform: imageTransforms[idx], 
               selectedStickerId: idx === activeImageIndex ? selectedStickerId : null,
               isMoeMode, 
               aspectRatio: selectedTemplate.aspectRatio,
               dateStampEnabled,
               dateText: ""
           });
       });
    }
  }, [appState, uploadedImages, currentBg, lightingEnabled, noiseLevel, contrast, isMoeMode, decorations, imageTransforms, activeImageIndex, dateStampEnabled, selectedStickerId]);

  const handleTemplateSelect = (tpl: LayoutTemplate) => { 
    setSelectedTemplate(tpl); 
    setUploadedImages([]);
    setDecorations(Array.from({ length: 4 }, () => ({ strokes: [], stickers: [] })));
    setImageTransforms(Array.from({ length: 4 }, () => ({ x: 0, y: 0, scale: 1 })));
    setAppState(AppState.UPLOAD); 
    playSound('pop'); 
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setAppState(AppState.CAMERA);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 100);
      playSound('pop');
    } catch (e) { alert("Camera failed"); }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
        const c = document.createElement('canvas');
        c.width = videoRef.current.videoWidth; c.height = videoRef.current.videoHeight;
        const ctx = c.getContext('2d');
        if (ctx) {
            ctx.translate(c.width, 0); ctx.scale(-1, 1); ctx.drawImage(videoRef.current, 0, 0);
            loadImage(c.toDataURL()).then(img => {
                const newList = [...uploadedImages, img]; setUploadedImages(newList);
                playSound('shutter');
                if (newList.length >= selectedTemplate.slots) {
                    const tracks = (videoRef.current?.srcObject as MediaStream)?.getTracks();
                    tracks?.forEach(t => t.stop()); setAppState(AppState.EDIT);
                }
            }).catch(e => console.error("Image load failed", e));
        }
    }
  };

  const handlePointerDown = (e: React.PointerEvent, idx: number) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setActiveImageIndex(idx);
    const canvas = canvasRefs.current[idx]!; 
    const rect = canvas.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (1000 / rect.width);
    const py = (e.clientY - rect.top) * (canvas.height / rect.height);
    startPos.current = { x: px, y: py, sx: e.clientX, sy: e.clientY };

    const stickers = decorations[idx].stickers || [];
    let hitSticker = null;
    for (let i = stickers.length - 1; i >= 0; i--) {
        const s = stickers[i];
        if (px > s.x - 90 * s.scale && px < s.x + 90 * s.scale && py > s.y - 90 * s.scale && py < s.y + 90 * s.scale) {
            hitSticker = s;
            break;
        }
    }

    if (hitSticker) {
        setSelectedStickerId(hitSticker.id);
        interactionMode.current = 'sticker_drag';
        startSticker.current = { x: hitSticker.x, y: hitSticker.y };
        if (activeTab !== 'sticker') setActiveTab('sticker');
    } else if (activeTab === 'draw') {
        setSelectedStickerId(null);
        interactionMode.current = 'draw';
        setDecorations(prev => prev.map((dec, i) => i === idx ? {
            ...dec,
            strokes: [...dec.strokes, { color: currentPenColor, width: brushSize, type: brushType, points: [{ x: px, y: py }] }]
        } : dec));
    } else {
        setSelectedStickerId(null);
        interactionMode.current = 'pan'; 
    }
  };

  const handlePointerMove = (e: React.PointerEvent, idx: number) => {
    if (interactionMode.current === 'none') return;
    const canvas = canvasRefs.current[idx]!; 
    const rect = canvas.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (1000 / rect.width);
    const py = (e.clientY - rect.top) * (canvas.height / rect.height);

    if (interactionMode.current === 'draw') {
        setDecorations(prev => prev.map((dec, i) => i === idx ? {
            ...dec,
            strokes: dec.strokes.map((stroke, si) => si === dec.strokes.length - 1 ? {
                ...stroke,
                points: [...stroke.points, { x: px, y: py }]
            } : stroke)
        } : dec));
    } else if (interactionMode.current === 'sticker_drag' && selectedStickerId) {
        setDecorations(prev => prev.map((dec, i) => i === idx ? {
            ...dec,
            stickers: (dec.stickers || []).map(s => s.id === selectedStickerId ? {
                ...s,
                x: startSticker.current!.x + (px - startPos.current.x),
                y: startSticker.current!.y + (py - startPos.current.y)
            } : s)
        } : dec));
    } else if (interactionMode.current === 'pan') {
        const dx = (e.clientX - startPos.current.sx) * 1.5;
        const dy = (e.clientY - startPos.current.sy) * 1.5;
        setImageTransforms(prev => prev.map((tr, i) => i === idx ? { ...tr, x: tr.x + dx, y: tr.y + dy } : tr));
        startPos.current.sx = e.clientX; startPos.current.sy = e.clientY;
    }
  };

  const addSticker = (type: string) => {
    const newSticker: StickerItem = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        x: 500,
        y: 666,
        scale: 1,
        rotation: 0
    };
    setDecorations(prev => prev.map((dec, i) => i === activeImageIndex ? {
        ...dec,
        stickers: [...(dec.stickers || []), newSticker]
    } : dec));
    setSelectedStickerId(newSticker.id);
    playSound('pop');
  };

  const generateFinal = async () => {
      setSelectedStickerId(null);
      await new Promise(r => setTimeout(r, 60)); 
      const dataUrls = canvasRefs.current.filter(c => !!c).map(c => c!.toDataURL('image/png'));
      setAppState(AppState.PROCESSING);
      await new Promise(r => setTimeout(r, 1000));
      try {
        const urls = await generateLayoutSheetAsync(dataUrls, selectedTemplate.id, customLocation, customName, new Date().toLocaleDateString());
        setFinalLayoutUrls(urls);
        setAppState(AppState.LAYOUT); playSound('success');
      } catch (e) {
        console.error("Layout generation failed", e);
        setAppState(AppState.EDIT);
      }
  };

  const handleFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const url = URL.createObjectURL(file);
          loadImage(url).then(img => {
              setDecorations(prev => prev.map((dec, i) => i === activeImageIndex ? {
                  ...dec,
                  frameImage: img
              } : dec));
              playSound('success');
          }).catch(e => console.error("Custom frame load failed", e));
      }
  };

  if (appState === AppState.TEMPLATE_SELECT) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-10 px-4 md:px-12 relative overflow-hidden">
        <div className="z-10 text-center mb-10 md:mb-14">
            <h1 className="text-6xl md:text-8xl font-black mb-3 tracking-tight text-3d animate-pulse">{t.appTitle}</h1>
            <p className="text-3xl md:text-5xl font-black text-jelly animate-float">{t.appSubtitle}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 z-10 w-full max-w-7xl px-4">
          {LAYOUT_TEMPLATES.map(tpl => (
            <button 
                key={tpl.id} 
                onClick={() => handleTemplateSelect(tpl)} 
                className="bg-white rounded-[3rem] p-8 md:p-10 shadow-2xl hover:-translate-y-3 transition-all duration-500 flex flex-col items-center group relative overflow-hidden active:scale-95 text-center border-4 border-white/50"
            >
              <div className="mb-8 md:mb-10 transform group-hover:scale-110 transition-transform h-32 md:h-36 flex items-center justify-center w-full">
                {tpl.id === 'cinema' ? <Icons.Cinema /> : tpl.id === 'polaroid' ? <Icons.Polaroid /> : tpl.id === 'standard' ? <Icons.Standard /> : <Icons.License />}
              </div>
              <h3 className="font-black text-slate-800 text-2xl md:text-3xl mb-2">{t[`tpl_${tpl.id}` as keyof typeof t]}</h3>
              <p className="text-sm md:text-base text-slate-400 font-medium mb-8 leading-relaxed px-4">{tpl.description}</p>
              <div className="mt-auto bg-pink-100/50 shadow-inner px-6 py-2 rounded-full text-pink-500 font-black text-sm uppercase tracking-widest border border-white">
                {tpl.slots} {t.shots}
              </div>
            </button>
          ))}
        </div>
        <div className="mt-12 md:mt-20 flex gap-4 z-10 font-black text-lg md:text-xl">
            <button onClick={() => setLang('en')} className={`px-4 py-2 transition-all ${lang==='en'?'text-pink-500':'text-slate-400 opacity-60'}`}>English</button>
            <button onClick={() => setLang('zh')} className={`px-6 py-2 rounded-xl transition-all ${lang==='zh'?'bg-pink-400 text-white shadow-lg':'text-slate-400 opacity-60'}`}>中文</button>
        </div>
      </div>
    );
  }

  if (appState === AppState.UPLOAD) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
          <div className="z-10 text-center mb-8">
            <h2 className="text-4xl md:text-6xl text-jelly animate-float">{t.how_to_shoot}</h2>
          </div>
          <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl w-full max-w-md flex flex-col items-center gap-8 relative">
              <button 
                onClick={startCamera} 
                className="w-full h-24 bg-pink-500 hover:bg-pink-400 border-b-8 border-pink-700 active:border-b-0 active:translate-y-1 transition-all rounded-[2rem] flex flex-col items-center justify-center text-white shadow-xl group"
              >
                <svg className="w-8 h-8 mb-1 group-active:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                </svg>
                <span className="font-black text-2xl uppercase tracking-widest">{t.start_camera}</span>
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-10 rounded-[2.5rem] border-[4px] border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center group"
              >
                  <div className="w-20 h-20 bg-blue-400/10 rounded-full flex items-center justify-center mb-4 shadow-inner border-2 border-white">
                    <svg className="w-10 h-10 text-blue-500 group-hover:scale-125 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                  <span className="font-black text-3xl text-slate-700 uppercase tracking-widest">{t.upload_photos}</span>
                  <span className="text-slate-400 font-bold mt-2">{t.select_hint} {selectedTemplate.slots} {t.shots}</span>
              </button>
              <button 
                onClick={() => setAppState(AppState.TEMPLATE_SELECT)} 
                className="w-full h-16 bg-sky-400 hover:bg-sky-300 border-b-6 border-sky-600 active:border-b-0 active:translate-y-1 transition-all rounded-2xl flex items-center justify-center text-white text-xl font-black uppercase tracking-widest mt-4"
              >
                ← {t.back}
              </button>
          </div>
          <input type="file" multiple ref={fileInputRef} className="hidden" onChange={(e) => {
              if (e.target.files) {
                  const files = Array.from(e.target.files).slice(0, selectedTemplate.slots);
                  Promise.all(files.map((f: File) => loadImage(URL.createObjectURL(f)).catch(err => null))).then(imgs => {
                      const validImgs = imgs.filter(img => img !== null) as HTMLImageElement[];
                      if (validImgs.length > 0) {
                        setUploadedImages(validImgs); 
                        setAppState(AppState.EDIT); 
                        playSound('success');
                      }
                  });
              }
          }} />
      </div>
    );
  }

  if (appState === AppState.CAMERA) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
          <div className="absolute top-10 text-white font-black text-5xl drop-shadow-2xl">{uploadedImages.length} / {selectedTemplate.slots}</div>
          <div className="absolute bottom-16 flex flex-col items-center gap-12">
              <button onClick={capturePhoto} className="w-32 h-32 rounded-full border-[12px] border-white/50 bg-white shadow-2xl active:scale-90 transition-transform flex items-center justify-center group">
                  <div className="w-16 h-16 rounded-full bg-pink-400 animate-pulse group-active:scale-150 transition-transform"></div>
              </button>
              <Button variant="ghost" onClick={() => {
                   const tracks = (videoRef.current?.srcObject as MediaStream)?.getTracks();
                   tracks?.forEach(t => t.stop()); setAppState(AppState.UPLOAD);
              }} className="text-white text-3xl font-black uppercase">{t.back}</Button>
          </div>
      </div>
    );
  }

  if (appState === AppState.EDIT) {
      return (
          <div className="fixed inset-0 flex flex-col md:flex-row bg-[#fff0f5] overflow-hidden select-none touch-none">
              <div className="flex-1 relative flex items-center justify-center p-4 md:p-8 overflow-hidden bg-slate-100/30">
                  <div className={`grid gap-4 md:gap-8 w-full max-h-[90vh] flex items-center justify-center ${selectedTemplate.slots === 1 ? 'max-w-4xl px-8 md:px-24' : 'max-w-6xl'}`} style={{ gridTemplateColumns: selectedTemplate.slots > 1 ? '1fr 1fr' : '1fr' }}>
                      {uploadedImages.map((_, idx) => (
                          <div key={idx} className={`relative rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border-[8px] md:border-[12px] transition-all flex items-center justify-center bg-white ${activeImageIndex === idx ? 'border-pink-400 scale-[1.02] z-10' : 'border-white opacity-90'}`} style={{ aspectRatio: selectedTemplate.aspectRatio }}>
                              <canvas 
                                ref={el => { canvasRefs.current[idx] = el; }} 
                                className="w-full h-full object-contain touch-none bg-white cursor-crosshair" 
                                onPointerDown={e => handlePointerDown(e, idx)} 
                                onPointerMove={e => handlePointerMove(e, idx)}
                              />
                          </div>
                      ))}
                  </div>
              </div>

              <div className="w-full md:w-[450px] bg-white/95 backdrop-blur-3xl flex flex-col shadow-[-10px_0_40px_rgba(0,0,0,0.08)] z-30 h-[45vh] md:h-full border-t md:border-t-0 md:border-l border-white/50">
                  <div className="flex-none p-4 md:p-6 pb-0">
                      <div className="flex justify-between bg-slate-100/80 p-1.5 rounded-[2.5rem] border border-slate-200/50">
                          {[
                            {id:'adjust',icon:<Icons.Adjust/>, label: t.tab_adjust},
                            {id:'frame',icon:<Icons.Frame/>, label: t.tab_frame},
                            {id:'draw',icon:<Icons.Brush/>, label: t.tab_draw},
                            {id:'sticker',icon:<Icons.Sticker/>, label: t.tab_sticker}
                          ].map(tab => (
                              <button 
                                key={tab.id} 
                                onClick={() => { setActiveTab(tab.id as any); playSound('pop'); }} 
                                className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-[2rem] transition-all ${activeTab === tab.id ? 'bg-white text-pink-500 shadow-lg scale-105' : 'text-slate-400 hover:text-pink-300'}`}
                              >
                                <div className="mb-0.5">{tab.icon}</div>
                                <span className="text-[10px] font-black uppercase">{tab.label}</span>
                              </button>
                          ))}
                      </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide pb-24 md:pb-6">
                      {activeTab === 'adjust' && (
                          <div className="space-y-6 animate-fade-in">
                              <div className="grid grid-cols-2 gap-4">
                                  <Button variant={lightingEnabled ? 'primary':'outline'} onClick={()=>setLightingEnabled(!lightingEnabled)} className="h-12 rounded-2xl text-base">{t.beauty_filter}</Button>
                                  <Button variant={isMoeMode ? 'secondary':'outline'} onClick={()=>setIsMoeMode(!isMoeMode)} className="h-12 rounded-2xl text-base">{t.moe_magic}</Button>
                              </div>
                              
                              <div className="space-y-3">
                                  <span className="font-black text-slate-500 text-xs uppercase tracking-widest">{t.tab_bg}</span>
                                  <div className="grid grid-cols-5 gap-2">
                                      {BACKGROUND_PRESETS.map(bg => (
                                          <button 
                                              key={bg.id} 
                                              onClick={() => { setCurrentBg(bg); playSound('pop'); }}
                                              className={`aspect-square rounded-full border-2 transition-all ${currentBg.id === bg.id ? 'border-pink-400 scale-110 shadow-md' : 'border-white'}`}
                                              style={{ background: bg.value, backgroundSize: 'cover' }}
                                          />
                                      ))}
                                  </div>
                              </div>

                              <div className="space-y-4">
                                  <div className="flex justify-between font-black text-slate-500 text-sm"><span>胶片颗粒</span><span>{Math.round(noiseLevel*100)}%</span></div>
                                  <input type="range" min="0" max="0.5" step="0.01" value={noiseLevel} onChange={e=>setNoiseLevel(parseFloat(e.target.value))} />
                                  <div className="flex justify-between font-black text-slate-500 text-sm"><span>{t.contrast}</span><span>{Math.round(contrast * 100)}%</span></div>
                                  <input type="range" min="0.5" max="2.0" step="0.05" value={contrast} onChange={e=>setContrast(parseFloat(e.target.value))} />
                                  <div className="flex justify-between font-black text-slate-500 text-sm"><span>{t.zoom}</span><span>{Math.round(imageTransforms[activeImageIndex].scale * 100)}%</span></div>
                                  <input type="range" min="0.5" max="3" step="0.05" value={imageTransforms[activeImageIndex].scale} onChange={e => {
                                      const trs = [...imageTransforms];
                                      trs[activeImageIndex] = { ...trs[activeImageIndex], scale: parseFloat(e.target.value) };
                                      setImageTransforms(trs);
                                  }} />
                              </div>

                              <div className="space-y-4 pt-2 border-t border-slate-100">
                                  <div className="space-y-2">
                                      <label className="font-black text-slate-500 text-xs uppercase tracking-widest block">{lang === 'zh' ? '姓名 (用于驾照/证件照)' : 'NAME (FOR LICENSE/ID)'}</label>
                                      <input 
                                          type="text" 
                                          value={customName} 
                                          onChange={e => setCustomName(e.target.value)} 
                                          className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-pink-300 outline-none font-black text-slate-700 bg-slate-50/50"
                                          placeholder="KIRA USER"
                                      />
                                  </div>
                                  <div className="space-y-2">
                                      <label className="font-black text-slate-500 text-xs uppercase tracking-widest block">{lang === 'zh' ? '地点 (用于证件照)' : 'LOCATION (FOR ID)'}</label>
                                      <input 
                                          type="text" 
                                          value={customLocation} 
                                          onChange={e => setCustomLocation(e.target.value)} 
                                          className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-pink-300 outline-none font-black text-slate-700 bg-slate-50/50"
                                          placeholder="SHANGHAI"
                                      />
                                  </div>
                              </div>

                              <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                                  <span className="font-black text-slate-600 text-sm uppercase">{t.date_stamp}</span>
                                  <button onClick={() => setDateStampEnabled(!dateStampEnabled)} className={`w-14 h-8 rounded-full transition-colors relative ${dateStampEnabled ? 'bg-pink-400' : 'bg-slate-200'}`}>
                                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${dateStampEnabled ? 'translate-x-7' : 'translate-x-1'}`}></div>
                                  </button>
                              </div>
                          </div>
                      )}
                      {activeTab === 'frame' && (
                          <div className="grid grid-cols-2 gap-4 animate-fade-in pb-10">
                              {FRAME_PRESETS.map(f => (
                                <button key={f.id} onClick={async ()=> { 
                                    const img = f.src ? await loadImage(f.src) : null; 
                                    setDecorations(prev => prev.map((dec, i) => i === activeImageIndex ? {
                                        ...dec,
                                        frameImage: img
                                    } : dec));
                                    playSound('pop'); 
                                }} className={`aspect-[3/4] bg-white rounded-2xl overflow-hidden border-4 transition-all hover:scale-105 ${decorations[activeImageIndex].frameImage?.src === f.src ? 'border-pink-400 shadow-xl' : 'border-slate-100'}`}>
                                    {f.src ? <img src={f.src} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center font-black text-slate-300">NONE</div>}
                                </button>
                              ))}
                              <button 
                                onClick={() => frameUploadRef.current?.click()}
                                className="aspect-[3/4] bg-pink-50 rounded-2xl border-4 border-dashed border-pink-200 flex flex-col items-center justify-center text-pink-300 hover:text-pink-400 hover:border-pink-300 transition-all"
                              >
                                  <svg className="w-8 h-8 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                  <span className="font-black text-xs uppercase">{t.custom_frame}</span>
                              </button>
                              <input type="file" ref={frameUploadRef} className="hidden" accept="image/*" onChange={handleFrameUpload} />
                          </div>
                      )}
                      {activeTab === 'draw' && (
                          <div className="space-y-8 animate-fade-in pb-10">
                              <div className="flex gap-3 p-1.5 bg-slate-100 rounded-[2rem]">
                                  <button onClick={()=>setBrushType('standard')} className={`flex-1 py-3 rounded-2xl font-black text-base transition-all ${brushType==='standard'?'bg-white shadow-md text-pink-500':'text-slate-400'}`}>{t.brush_standard}</button>
                                  <button onClick={()=>setBrushType('neon')} className={`flex-1 py-3 rounded-2xl font-black text-base transition-all ${brushType==='neon'?'bg-white shadow-md text-pink-500':'text-slate-400'}`}>{t.brush_neon}</button>
                              </div>
                              <div className="grid grid-cols-4 gap-4 justify-items-center">
                                  {PEN_COLORS.map(c => <button key={c} onClick={()=>setCurrentPenColor(c)} className={`w-10 h-10 rounded-full border-4 transition-transform ${currentPenColor===c?'border-slate-700 scale-110 shadow-lg':'border-white hover:scale-105'}`} style={{backgroundColor:c}}/>)}
                              </div>
                              <div className="space-y-4">
                                <div className="flex justify-between font-black text-slate-500 text-sm"><span>笔头大小</span><span>{brushSize}px</span></div>
                                <input type="range" min="8" max="100" value={brushSize} onChange={e=>setBrushSize(parseInt(e.target.value))} />
                              </div>
                              <Button fullWidth variant="outline" onClick={()=>{
                                setDecorations(prev => prev.map((dec, i) => i === activeImageIndex ? {
                                  ...dec,
                                  strokes: dec.strokes.slice(0, -1)
                                } : dec));
                              }} className="h-14 rounded-2xl text-xl font-black">✨ {t.undo}</Button>
                          </div>
                      )}
                      {activeTab === 'sticker' && (
                          <div className="space-y-6 animate-fade-in pb-10">
                              <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                                {STICKER_CATEGORIES.map(cat => (
                                    <button 
                                      key={cat.id} 
                                      onClick={() => { setStickerCategory(cat.id); playSound('pop'); }}
                                      className={`px-4 py-2 rounded-full font-black text-xs whitespace-nowrap transition-all border-2 ${stickerCategory === cat.id ? 'bg-pink-400 text-white border-pink-500 shadow-md scale-105' : 'bg-slate-100 text-slate-400 border-transparent hover:bg-slate-200'}`}
                                    >
                                      {cat.name}
                                    </button>
                                ))}
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                {STICKER_CATEGORIES.find(c => c.id === stickerCategory)?.stickers.map(s => (
                                    <button key={s} onClick={() => addSticker(s)} className="aspect-square bg-slate-50 rounded-2xl border-2 border-slate-200 hover:border-pink-300 hover:scale-105 transition-all p-2 flex items-center justify-center">
                                      <StickerPreview id={s} />
                                    </button>
                                ))}
                              </div>
                              {selectedStickerId && (
                                <div className="bg-pink-50 p-4 rounded-3xl space-y-4 border-2 border-pink-100 animate-fade-in shadow-inner">
                                   <div className="flex justify-between items-center text-sm font-black text-pink-500">
                                      <span>{t.scale}</span>
                                      <span>{Math.round((decorations[activeImageIndex].stickers.find(s => s.id === selectedStickerId)?.scale || 1) * 100)}%</span>
                                   </div>
                                   <input 
                                     type="range" 
                                     min="0.2" 
                                     max="4" 
                                     step="0.05" 
                                     value={decorations[activeImageIndex].stickers.find(s => s.id === selectedStickerId)?.scale || 1} 
                                     onChange={(e) => {
                                        const s = parseFloat(e.target.value);
                                        setDecorations(prev => prev.map((dec, i) => i === activeImageIndex ? {
                                          ...dec,
                                          stickers: (dec.stickers || []).map(st => st.id === selectedStickerId ? { ...st, scale: s } : st)
                                        } : dec));
                                     }}
                                   />
                                   <div className="flex justify-between items-center text-sm font-black text-pink-500">
                                      <span>{t.rotation}</span>
                                      <span>{Math.round((decorations[activeImageIndex].stickers.find(s => s.id === selectedStickerId)?.rotation || 0) * (180/Math.PI))}°</span>
                                   </div>
                                   <input 
                                     type="range" 
                                     min="-3.14159" 
                                     max="3.14159" 
                                     step="0.1" 
                                     value={decorations[activeImageIndex].stickers.find(s => s.id === selectedStickerId)?.rotation || 0} 
                                     onChange={(e) => {
                                        const r = parseFloat(e.target.value);
                                        setDecorations(prev => prev.map((dec, i) => i === activeImageIndex ? {
                                          ...dec,
                                          stickers: (dec.stickers || []).map(st => st.id === selectedStickerId ? { ...st, rotation: r } : st)
                                        } : dec));
                                     }}
                                   />
                                   <Button variant="danger" fullWidth className="h-12 rounded-2xl" onClick={() => {
                                      setDecorations(prev => prev.map((dec, i) => i === activeImageIndex ? {
                                        ...dec,
                                        stickers: (dec.stickers || []).filter(st => st.id !== selectedStickerId)
                                      } : dec));
                                      setSelectedStickerId(null);
                                      playSound('cancel');
                                   }}>{t.delete}</Button>
                                </div>
                              )}
                          </div>
                      )}
                  </div>
                  <div className="flex-none p-6 pt-2 bg-white/80 border-t border-slate-100 flex gap-4">
                      <button 
                        onClick={() => { setUploadedImages([]); setAppState(AppState.UPLOAD); playSound('cancel'); }}
                        className="w-16 h-16 bg-sky-400 hover:bg-sky-300 border-b-6 border-sky-600 active:border-b-0 active:translate-y-1 transition-all rounded-2xl flex flex-col items-center justify-center text-white shrink-0 shadow-lg"
                      >
                         <span className="text-xl font-black">←</span>
                      </button>
                      <button 
                        onClick={generateFinal}
                        className="flex-1 h-16 bg-pink-500 hover:bg-pink-400 border-b-6 border-pink-700 active:border-b-0 active:translate-y-1 transition-all rounded-[1.5rem] flex items-center justify-center text-white text-2xl font-black shadow-lg"
                      >
                         {t.finish}
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  if (appState === AppState.LAYOUT) {
      return (
          <div className="min-h-screen bg-slate-950 flex flex-col items-center p-8 md:p-10 overflow-y-auto pb-64 relative">
              {/* Fixed Header with Global message */}
              <div className="fixed top-0 left-0 right-0 h-24 bg-slate-900/90 backdrop-blur-xl border-b border-white/5 flex items-center justify-center px-8 md:px-12 z-[200] shadow-2xl">
                 <h2 className="text-pink-400 font-black text-2xl md:text-3xl animate-pulse tracking-tight">{t.ready_msg}</h2>
              </div>

              <div className="flex flex-row flex-wrap items-start justify-center gap-8 md:gap-16 mt-36 w-full max-w-7xl">
                  {finalLayoutUrls.map((url, i) => (
                      <div key={i} className="flex flex-col items-center gap-10">
                        {/* Image Frame */}
                        <div className="bg-white p-4 md:p-6 rounded-[2rem] md:rounded-[3rem] shadow-[0_60px_120px_rgba(0,0,0,0.85)] transform hover:scale-[1.01] transition-all duration-700 border-2 border-white/20">
                            <img src={url} className="max-h-[85vh] w-auto rounded-xl md:rounded-2xl" alt={`Result ${i}`} />
                        </div>

                        {/* Save Button */}
                        <div className="z-[50] relative pb-4">
                            <Button 
                                className="h-16 bg-pink-500 border-pink-700 hover:bg-pink-400 rounded-full text-2xl font-black px-24 shadow-[0_15px_40px_rgba(236,72,153,0.6)]"
                                onClick={() => {
                                    const a = document.createElement('a'); a.href = url; a.download = `KIRA_${i}_${Date.now()}.png`; a.click();
                                }}
                            >
                                {t.save_btn}
                            </Button>
                        </div>
                      </div>
                  ))}

                  {/* Back Button - Positioned alongside Save buttons at the bottom of scroll, styled rectangularly */}
                  <div className="mt-4 mb-20 w-full flex justify-center">
                    <Button 
                        onClick={() => { setAppState(AppState.EDIT); playSound('pop'); }}
                        className="h-16 bg-sky-400 hover:bg-sky-300 border-sky-600 rounded-full text-2xl font-black px-32 shadow-[0_15px_40px_rgba(56,189,248,0.4)]"
                    >
                        ← {t.back}
                    </Button>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fff0f5]">
        <div className="relative">
            <div className="w-24 h-24 md:w-32 md:h-32 border-[12px] md:border-[16px] border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-4xl md:text-5xl animate-bounce">💖</div>
        </div>
        <p className="font-black text-pink-500 text-3xl md:text-5xl mt-12 md:mt-16 animate-pulse tracking-[0.2em] md:tracking-[0.3em] uppercase">{t.loading}</p>
    </div>
  );
};

export default App;