import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppState, BackgroundPreset, FramePreset, LayoutTemplate } from './types';
import { BACKGROUND_PRESETS, FRAME_PRESETS, LAYOUT_TEMPLATES } from './constants';
import { loadImage, renderComposite, generateLayoutSheet } from './services/processor';
import { playSound } from './services/audio';
import Button from './components/Button';

// --- SVG Icons ---
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
  
  const [selectedBg, setSelectedBg] = useState<BackgroundPreset>(BACKGROUND_PRESETS[1]);
  const [selectedFrame, setSelectedFrame] = useState<FramePreset>(FRAME_PRESETS[0]);
  const [selectedTemplate, setSelectedTemplate] = useState<LayoutTemplate>(LAYOUT_TEMPLATES[0]);
  
  const [customFrames, setCustomFrames] = useState<FramePreset[]>([]);
  const [lightingEnabled, setLightingEnabled] = useState<boolean>(true);
  const [noiseLevel, setNoiseLevel] = useState<number>(0);
  const [layoutImageSrc, setLayoutImageSrc] = useState<string | null>(null);
  const [customLocation, setCustomLocation] = useState<string>("Tokyo Station");

  // UX States
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);

  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const frameInputRef = useRef<HTMLInputElement>(null);

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
                  noiseLevel: noiseLevel
               });
           }
        });
      }
    };
    updateCanvases();
  }, [appState, uploadedImages, selectedBg, selectedFrame, lightingEnabled, noiseLevel]);

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

  const handleGenerateLayout = async () => {
    if (uploadedImages.length === 0) return;
    
    // Trigger Effects
    play('shutter');
    triggerFlash();

    const sourceCanvases = canvasRefs.current.filter(c => c !== null) as HTMLCanvasElement[];
    if (sourceCanvases.length === 0) return;

    setTimeout(() => {
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

  const toggleMute = () => {
      setIsMuted(!isMuted);
  };

  // Reusable Header Component
  const TopHeader = ({ 
    leftAction, 
    rightAction 
  }: { 
    leftAction?: React.ReactNode, 
    rightAction?: React.ReactNode 
  }) => (
    <div className="w-full flex justify-between items-center p-4 z-50">
        <div>{leftAction}</div>
        <div>{rightAction}</div>
    </div>
  );

  // Common Header Actions
  const VolumeButton = () => (
      <Button variant="icon" onClick={toggleMute} title={isMuted ? "Unmute" : "Mute"} className="!bg-white/90 !shadow-sm">
          <VolumeIcon muted={isMuted} />
      </Button>
  );

  // --- Render Steps ---

  const renderTemplateSelection = () => (
      <div className="flex flex-col min-h-screen animate-fade-in">
          {/* Safe Header - No absolute positioning */}
          <TopHeader 
            rightAction={<VolumeButton />}
          />

          <div className="flex-grow flex flex-col items-center justify-center p-6 -mt-10">
            <div className="max-w-md w-full bg-white/80 backdrop-blur-md p-8 rounded-[3rem] border-4 border-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] animate-[float_6s_ease-in-out_infinite]">
                <h1 className="text-4xl font-extrabold text-pink-500 mb-2 tracking-wide flex items-center justify-center drop-shadow-sm">
                    <SparklesIcon /> Puri-Cute
                </h1>
                <p className="text-slate-500 mb-8 font-medium text-center">✨ Create your kawaii sticker sheet! ✨</p>

                <div className="mb-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-dashed border-pink-200 rounded-3xl">
                    <p className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-2 text-center">💡 Pro Tip</p>
                    <a 
                    href="https://www.photoroom.com/tools/background-remover" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-purple-600 font-bold bg-white py-3 px-4 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md hover:scale-105 transition-all"
                    >
                    <span className="text-xl">✂️</span> 
                    <span>Remove Backgrounds</span>
                    </a>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {LAYOUT_TEMPLATES.map(template => (
                        <button
                            key={template.id}
                            onClick={() => {
                                play('pop');
                                setSelectedTemplate(template);
                                setAppState(AppState.UPLOAD);
                            }}
                            className="bg-white p-4 rounded-[2rem] border-2 border-slate-100 shadow-sm hover:border-pink-300 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center group active:scale-95 duration-200"
                        >
                            <div className="text-5xl mb-3 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">{template.icon}</div>
                            <div className="font-bold text-slate-700">{template.name}</div>
                            <div className="text-xs text-slate-400 mb-2">{template.description}</div>
                            <span className="text-[10px] bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full font-bold border border-blue-100">
                                {template.slots} Slot{template.slots > 1 ? 's' : ''}
                            </span>
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
        leftAction={
            <Button variant="icon" onClick={() => { play('cancel'); setAppState(AppState.TEMPLATE_SELECT); }}>
                <BackIcon />
            </Button>
        }
        rightAction={<VolumeButton />}
      />

      <div className="flex-grow flex flex-col items-center justify-center p-6 -mt-10">
        <div className="bg-white/90 backdrop-blur-md p-8 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-4 border-white max-w-sm w-full animate-[float_7s_ease-in-out_infinite]">
            <div className="text-center">
                <div className="text-pink-400 mb-2 font-bold text-3xl tracking-wide drop-shadow-sm flex justify-center items-center gap-2">
                    {selectedTemplate.icon} {selectedTemplate.name}
                </div>
                <p className="text-slate-500 mb-8 text-sm font-medium">
                    Upload 1 to {selectedTemplate.slots} photos.<br/>
                    <span className="text-xs opacity-70 bg-pink-50 px-2 py-0.5 rounded-full text-pink-400 mt-2 inline-block">
                        1 photo will fill all frames automatically!
                    </span>
                </p>
            </div>
            
            <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-dashed border-[3px] border-blue-200 rounded-[2rem] p-10 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all group active:scale-[0.98] duration-150 bg-blue-50/30 text-center"
            >
            <div className="group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300 text-blue-300 inline-block">
                <UploadIcon />
            </div>
            <p className="text-blue-400 font-extrabold text-lg mt-2">Tap to Upload</p>
            <p className="text-blue-300 text-xs mt-1 font-medium">Select up to {selectedTemplate.slots} images</p>
            </div>
            <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            multiple
            onChange={handleFileUpload}
            />
        </div>
      </div>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <div className="relative animate-bounce">
         <div className="w-24 h-24 border-8 border-pink-100 border-t-pink-400 rounded-full animate-spin"></div>
         <div className="absolute inset-0 flex items-center justify-center">
           <span className="text-4xl">💖</span>
         </div>
      </div>
      <h3 className="mt-8 text-2xl font-bold text-slate-700 tracking-wide animate-pulse">Making Magic...</h3>
    </div>
  );

  const renderEditorStep = () => (
    <div className="flex flex-col h-[100dvh] w-full max-w-lg mx-auto bg-white shadow-2xl relative overflow-hidden">
      {/* Cute Header */}
      <div className="flex-none bg-white/80 backdrop-blur-md border-b border-pink-100 p-3 px-4 flex justify-between items-center z-20 shadow-sm">
        <h1 className="text-lg font-bold text-pink-500 flex items-center bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
            <SparklesIcon /> Edit Photo
        </h1>
        <div className="flex gap-2 items-center">
            <VolumeButton />
            <Button variant="outline" onClick={() => { play('cancel'); setAppState(AppState.UPLOAD); }} className="!py-1.5 !px-3 text-xs !rounded-full">
            Re-Upload
            </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 min-h-0 bg-[#f8fafc] overflow-y-auto p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
          <div className={`w-full mx-auto h-full ${uploadedImages.length === 1 ? 'flex items-center justify-center py-4' : 'grid grid-cols-2 gap-4 auto-rows-min content-start'}`}>
              {uploadedImages.map((_, index) => (
                  <div key={index} className={`relative group ${uploadedImages.length === 1 ? 'w-auto h-auto max-w-[85%] max-h-[85%]' : 'w-full aspect-[5/7]'}`}>
                      <canvas 
                        ref={(el) => (canvasRefs.current[index] = el)}
                        className={`shadow-[0_10px_40px_rgba(0,0,0,0.15)] rounded-2xl border-[6px] border-white object-contain bg-white transition-transform duration-300 ${uploadedImages.length === 1 ? 'max-h-[55vh] w-auto' : 'w-full h-full'}`}
                      />
                      {uploadedImages.length > 1 && (
                          <div className="absolute -top-2 -left-2 bg-pink-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-white z-10">
                              {index + 1}
                          </div>
                      )}
                  </div>
              ))}
          </div>
      </div>

      {/* Controls Container - Floating Card Look */}
      <div className="flex-none bg-white rounded-t-[2.5rem] shadow-[0_-10px_60px_rgba(0,0,0,0.08)] z-10 border-t border-slate-50">
        <div className="p-6 space-y-6 max-h-[50vh] overflow-y-auto custom-scrollbar">
            
            {/* Toggles Row */}
            <div className="grid grid-cols-2 gap-3">
                {/* Beauty Filter Toggle */}
                <div className="flex flex-col items-center justify-center bg-pink-50 p-3 rounded-2xl border border-pink-100 h-24">
                    <span className="text-xs font-bold text-slate-600 flex items-center mb-2">
                        <span className="text-lg mr-1">✨</span> Beauty
                    </span>
                    <button 
                      onClick={() => { play('pop'); setLightingEnabled(!lightingEnabled); }}
                      className={`relative w-12 h-7 rounded-full transition-colors duration-300 ease-in-out border-2 ${lightingEnabled ? 'bg-pink-400 border-pink-400' : 'bg-slate-200 border-slate-200'}`}
                    >
                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${lightingEnabled ? 'translate-x-5' : 'translate-x-0'}`}>
                        </div>
                    </button>
                </div>

                {/* Noise/Grain Slider */}
                <div className="flex flex-col items-center justify-center bg-blue-50 p-3 rounded-2xl border border-blue-100 h-24">
                    <div className="flex justify-between w-full mb-2 px-1">
                        <span className="text-xs font-bold text-slate-600 flex items-center">
                            <span className="text-lg mr-1">🎞️</span> Grain
                        </span>
                        <span className="text-[10px] font-bold text-blue-400 bg-white px-1.5 py-0.5 rounded-md border border-blue-100 min-w-[30px] text-center">
                            {Math.round((noiseLevel / 0.5) * 100)}%
                        </span>
                    </div>
                    <div className="w-full px-1">
                        <input
                            type="range"
                            min="0"
                            max="0.5"
                            step="0.05"
                            value={noiseLevel}
                            onChange={(e) => setNoiseLevel(parseFloat(e.target.value))}
                            className="w-full accent-blue-400 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer hover:bg-blue-300 transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Backgrounds */}
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Choose Background</p>
                <div className="flex gap-3 overflow-x-auto pb-4 px-1 scrollbar-hide">
                    {BACKGROUND_PRESETS.map(bg => (
                        <button
                            key={bg.id}
                            onClick={() => { play('pop'); setSelectedBg(bg); }}
                            className={`flex-shrink-0 w-12 h-12 rounded-full border-4 shadow-sm transition-all active:scale-90 ${selectedBg.id === bg.id ? 'border-pink-500 scale-110 shadow-md' : 'border-white'}`}
                            style={{ background: bg.value }}
                            title={bg.name}
                        >
                             {selectedBg.id === bg.id && <span className="text-white drop-shadow-md">✓</span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Frames */}
            <div>
                <div className="flex justify-between items-center mb-2 px-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Choose Frame</p>
                    <button 
                        onClick={() => frameInputRef.current?.click()}
                        className="text-[10px] bg-blue-50 text-blue-500 px-2 py-1 rounded-lg font-bold hover:bg-blue-100 transition-colors"
                    >
                        + Upload Custom
                    </button>
                    <input type="file" ref={frameInputRef} className="hidden" accept="image/png" onChange={handleFrameUpload} />
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-hide">
                    {[...FRAME_PRESETS, ...customFrames].map(frame => (
                        <button
                            key={frame.id}
                            onClick={() => { play('pop'); setSelectedFrame(frame); }}
                            className={`flex-shrink-0 w-16 h-16 rounded-2xl border-4 overflow-hidden relative shadow-sm transition-all active:scale-95 ${selectedFrame.id === frame.id ? 'border-pink-500 ring-2 ring-pink-200 scale-105' : 'border-slate-100'}`}
                        >
                            {frame.src ? (
                                <img src={frame.src} alt={frame.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-slate-50 flex items-center justify-center text-xs text-slate-400 font-medium">None</div>
                            )}
                            {frame.isCustom && <div className="absolute top-0 right-0 w-5 h-5 bg-blue-400 rounded-bl-xl text-[10px] text-white flex items-center justify-center">★</div>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Location Input (Only for Standard) */}
            {selectedTemplate.id === 'standard' && (
                <div className="bg-blue-50/50 p-4 rounded-3xl border-2 border-blue-100">
                    <label className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-1 pl-1">Print Location Label</label>
                    <input 
                    type="text" 
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    className="w-full bg-white border border-blue-200 rounded-2xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 font-bold placeholder-blue-200"
                    placeholder="E.g. Shibuya Station"
                    />
                </div>
            )}

            {/* Actions */}
            <div className="pt-2 pb-6">
                <Button fullWidth onClick={handleGenerateLayout} className="text-lg shadow-pink-300/50 shadow-xl rounded-2xl">
                    <div className="flex items-center justify-center">
                       <PrintIcon /> Generate Layout
                    </div>
                </Button>
            </div>
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
                <button onClick={() => { play('cancel'); setAppState(AppState.EDIT); }} className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors active:scale-90 font-bold">Close</button>
            </div>
        </div>
        
        <div className="flex-grow flex items-center justify-center p-6 overflow-auto bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
            {layoutImageSrc && (
                <img 
                    src={layoutImageSrc} 
                    alt="Print Layout" 
                    className="w-full h-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-sm border-8 border-white animate-fade-in-up transform hover:scale-[1.01] transition-transform"
                />
            )}
        </div>

        <div className="p-6 bg-slate-800 border-t border-slate-700 z-10 safe-area-pb">
             <div className="bg-slate-700/50 p-4 rounded-3xl mb-4 border border-slate-600">
                <p className="text-pink-300 text-sm text-center font-bold mb-1">
                    🎉 Ready to Print!
                </p>
                <p className="text-slate-400 text-xs text-center">
                    Save to photos and print on 4x6" (10x15cm) paper.
                </p>
             </div>
             <Button fullWidth onClick={handleDownloadSheet} className="text-lg shadow-pink-500/50 shadow-lg rounded-2xl">
                Save to Camera Roll 📥
            </Button>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full font-sans selection:bg-pink-200 relative text-slate-800" style={{ backgroundColor: '#fff0f5', backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffcce6' fill-opacity='0.4' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")` }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
      
      {/* Camera Flash Effect */}
      <div className={`fixed inset-0 bg-white z-[100] pointer-events-none transition-opacity duration-200 ease-out ${isFlashing ? 'opacity-100' : 'opacity-0'}`} />

      {appState === AppState.TEMPLATE_SELECT && renderTemplateSelection()}
      {appState === AppState.UPLOAD && renderUploadStep()}
      {appState === AppState.PROCESSING && renderProcessingStep()}
      {appState === AppState.EDIT && renderEditorStep()}
      {appState === AppState.LAYOUT && renderLayoutStep()}
    </div>
  );
}