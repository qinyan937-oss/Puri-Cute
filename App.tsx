import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppState, BackgroundPreset, FramePreset, LayoutTemplate } from './types';
import { BACKGROUND_PRESETS, FRAME_PRESETS, LAYOUT_TEMPLATES } from './constants';
import { loadImage, renderComposite, generateLayoutSheet } from './services/processor';
import Button from './components/Button';

// SVG Icons
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
  </svg>
);

const PrintIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
  </svg>
);

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.TEMPLATE_SELECT);
  // Store an array of images for multi-photo support
  const [uploadedImages, setUploadedImages] = useState<HTMLImageElement[]>([]);
  
  const [selectedBg, setSelectedBg] = useState<BackgroundPreset>(BACKGROUND_PRESETS[1]);
  const [selectedFrame, setSelectedFrame] = useState<FramePreset>(FRAME_PRESETS[0]);
  const [selectedTemplate, setSelectedTemplate] = useState<LayoutTemplate>(LAYOUT_TEMPLATES[0]);
  
  const [customFrames, setCustomFrames] = useState<FramePreset[]>([]);
  const [lightingEnabled, setLightingEnabled] = useState<boolean>(true);
  const [layoutImageSrc, setLayoutImageSrc] = useState<string | null>(null);
  
  // Metadata for print sheet
  const [customLocation, setCustomLocation] = useState<string>("Tokyo Station");

  // Use a ref array to manage multiple canvases for the editor grid
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const frameInputRef = useRef<HTMLInputElement>(null);

  // Initialize canvases when entering Edit mode or changing options
  useEffect(() => {
    const updateCanvases = async () => {
      if (appState === AppState.EDIT && uploadedImages.length > 0) {
        let frameImg: HTMLImageElement | null = null;
        if (selectedFrame.src) {
           frameImg = await loadImage(selectedFrame.src);
        }

        // Render each image onto its corresponding canvas
        uploadedImages.forEach((img, index) => {
           const canvas = canvasRefs.current[index];
           if (canvas) {
               renderComposite({
                  canvas,
                  personImage: img,
                  backgroundImage: selectedBg,
                  frameImage: frameImg,
                  lightingEnabled: lightingEnabled
               });
           }
        });
      }
    };
    updateCanvases();
  }, [appState, uploadedImages, selectedBg, selectedFrame, lightingEnabled]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAppState(AppState.PROCESSING);
      const files = Array.from(e.target.files) as File[];
      
      const maxSlots = selectedTemplate.slots;
      // If user selects more than slots, we take up to slots count. 
      const filesToLoad = files.slice(0, maxSlots);

      try {
        const loadedImages = await Promise.all(filesToLoad.map(async (file) => {
            const imgUrl = URL.createObjectURL(file);
            return await loadImage(imgUrl);
        }));

        setUploadedImages(loadedImages);
        // Reset canvas refs
        canvasRefs.current = [];
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
    
    // Filter out null refs
    const sourceCanvases = canvasRefs.current.filter(c => c !== null) as HTMLCanvasElement[];
    
    if (sourceCanvases.length === 0) return;

    const layoutSrc = generateLayoutSheet(sourceCanvases, selectedTemplate.id, customLocation);
    setLayoutImageSrc(layoutSrc);
    setAppState(AppState.LAYOUT);
  };

  const handleDownloadSheet = async () => {
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
        console.error("Blob download failed, falling back to base64", err);
        link.href = layoutImageSrc;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  // --- Render Steps ---

  const renderTemplateSelection = () => (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center animate-fade-in">
          <div className="max-w-md w-full">
            <h1 className="text-3xl font-bold text-pink-500 mb-2 tracking-wide flex items-center justify-center">
                <SparklesIcon /> Puri-Cute
            </h1>
            <p className="text-slate-500 mb-6">Select a layout style to start!</p>

            <div className="mb-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-pink-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">✨ Tip for best results</p>
                <a 
                  href="https://www.photoroom.com/tools/background-remover" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-purple-600 font-bold bg-white py-2 rounded-lg border border-purple-100 hover:bg-purple-50 transition-colors"
                >
                  <span className="text-lg">✂️</span> 
                  <span>Use <span className="underline decoration-2 underline-offset-2">PhotoRoom</span> to remove background</span>
                </a>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {LAYOUT_TEMPLATES.map(template => (
                    <button
                        key={template.id}
                        onClick={() => {
                            setSelectedTemplate(template);
                            setAppState(AppState.UPLOAD);
                        }}
                        className="bg-white p-4 rounded-2xl shadow-sm border-2 border-slate-100 hover:border-pink-300 hover:shadow-md transition-all flex flex-col items-center group"
                    >
                        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{template.icon}</div>
                        <div className="font-bold text-slate-700">{template.name}</div>
                        <div className="text-xs text-slate-400 mb-2">{template.description}</div>
                        <span className="text-[10px] bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full font-bold">
                            {template.slots} Slot{template.slots > 1 ? 's' : ''}
                        </span>
                    </button>
                ))}
            </div>
          </div>
      </div>
  );

  const renderUploadStep = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-fade-in">
      <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-pink-100 max-w-sm w-full relative">
        <button 
            onClick={() => setAppState(AppState.TEMPLATE_SELECT)}
            className="absolute top-4 left-4 text-slate-400 hover:text-slate-600"
        >
            <BackIcon />
        </button>

        <div className="text-pink-400 mb-2 font-bold text-2xl tracking-wide">{selectedTemplate.name}</div>
        <p className="text-slate-500 mb-6 text-sm">
            Upload 1 to {selectedTemplate.slots} photos.<br/>
            <span className="text-xs opacity-70">(1 photo will fill all frames)</span>
        </p>
        
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-dashed border-4 border-blue-200 rounded-2xl p-10 cursor-pointer hover:bg-blue-50 transition-colors group"
        >
          <div className="group-hover:scale-110 transition-transform duration-300 text-blue-300">
             <UploadIcon />
          </div>
          <p className="text-blue-400 font-bold">Tap to Upload</p>
          <p className="text-blue-300 text-xs mt-1">Select up to {selectedTemplate.slots} images</p>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          multiple // Enable multiple files
          onChange={handleFileUpload}
        />

        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
          <strong>Tip:</strong> Uploading fewer photos than frames? We'll repeat them automatically!
        </div>
      </div>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <div className="relative">
         <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
         <div className="absolute top-0 left-0 w-16 h-16 flex items-center justify-center">
           <span className="text-xl">✨</span>
         </div>
      </div>
      <h3 className="mt-6 text-xl font-bold text-slate-700">Processing Photos...</h3>
    </div>
  );

  const renderEditorStep = () => (
    <div className="flex flex-col h-[100dvh] w-full max-w-lg mx-auto bg-white shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex-none bg-white/95 backdrop-blur-sm border-b border-pink-100 p-4 flex justify-between items-center z-20">
        <h1 className="text-xl font-bold text-pink-500 flex items-center">
            <SparklesIcon /> Edit Photo
        </h1>
        <Button variant="outline" onClick={() => setAppState(AppState.UPLOAD)} className="!py-1 !px-3 text-xs">
          Re-Upload
        </Button>
      </div>

      {/* Canvas Area - Scrollable Grid */}
      <div className="flex-1 min-h-0 bg-slate-100 overflow-y-auto p-6 bg-grid-slate-200">
          {/* 
            Improvement: Constrain single image display to be more elegant.
            If single image: centered, constrained width/height, nice shadow.
            If multiple: grid layout.
          */}
          <div className={`w-full mx-auto h-full ${uploadedImages.length === 1 ? 'flex items-center justify-center py-4' : 'grid grid-cols-2 gap-4 auto-rows-min content-start'}`}>
              {uploadedImages.map((_, index) => (
                  <div key={index} className={`relative ${uploadedImages.length === 1 ? 'w-auto h-auto max-w-[80%] max-h-[85%]' : 'w-full aspect-[5/7]'}`}>
                      <canvas 
                        ref={(el) => (canvasRefs.current[index] = el)}
                        className={`shadow-xl rounded-sm border-[8px] border-white object-contain bg-white transition-transform duration-300 ${uploadedImages.length === 1 ? 'max-h-[60vh] md:max-h-[500px] w-auto' : 'w-full h-full'}`}
                        style={{ backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2N89uzZfwY8QFJSEp80A+OoAcMhYCSA2YyCg4MZSfwYDQcaD0YDYDQAogAAc60z4f2Wq6cAAAAASUVORK5CYII=")' }}
                      />
                      {uploadedImages.length > 1 && (
                          <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm z-10">
                              #{index + 1}
                          </div>
                      )}
                  </div>
              ))}
          </div>
      </div>

      {/* Controls Container */}
      <div className="flex-none bg-white border-t border-slate-100 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-10">
        <div className="p-5 space-y-5 max-h-[50vh] overflow-y-auto custom-scrollbar">
            
            {/* Toggles */}
            <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-600 flex items-center">
                    Beauty Filter 
                    <span className="ml-2 text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">Soft Skin+</span>
                </span>
                <button 
                  onClick={() => setLightingEnabled(!lightingEnabled)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${lightingEnabled ? 'bg-pink-400' : 'bg-slate-300'}`}
                >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${lightingEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
            </div>

            {/* Backgrounds */}
            <div>
                <div className="flex justify-between items-baseline mb-2">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Background</p>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {BACKGROUND_PRESETS.map(bg => (
                        <button
                            key={bg.id}
                            onClick={() => setSelectedBg(bg)}
                            className={`flex-shrink-0 w-10 h-10 rounded-full border-2 ${selectedBg.id === bg.id ? 'border-pink-500 scale-110' : 'border-transparent'} transition-all`}
                            style={{ background: bg.value }}
                            title={bg.name}
                        />
                    ))}
                </div>
            </div>

            {/* Frames */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Frames</p>
                    <button 
                        onClick={() => frameInputRef.current?.click()}
                        className="text-xs text-blue-500 font-bold hover:underline"
                    >
                        + Upload
                    </button>
                    <input type="file" ref={frameInputRef} className="hidden" accept="image/png" onChange={handleFrameUpload} />
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {[...FRAME_PRESETS, ...customFrames].map(frame => (
                        <button
                            key={frame.id}
                            onClick={() => setSelectedFrame(frame)}
                            className={`flex-shrink-0 w-14 h-14 rounded-lg border-2 overflow-hidden relative ${selectedFrame.id === frame.id ? 'border-pink-500 ring-2 ring-pink-200' : 'border-slate-200'}`}
                        >
                            {frame.src ? (
                                <img src={frame.src} alt={frame.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-slate-50 flex items-center justify-center text-xs text-slate-400">None</div>
                            )}
                            {frame.isCustom && <div className="absolute top-0 right-0 w-3 h-3 bg-blue-400 rounded-bl-lg"></div>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Location Input (Only for Standard) */}
            {selectedTemplate.id === 'standard' && (
                <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100">
                    <label className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block mb-1">Print Location</label>
                    <input 
                    type="text" 
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    className="w-full bg-white border border-blue-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="E.g. Shibuya Station"
                    />
                </div>
            )}

            {/* Actions */}
            <div className="pt-1 pb-4">
                <Button fullWidth onClick={handleGenerateLayout} className="text-lg shadow-blue-300 shadow-lg !bg-blue-500 hover:!bg-blue-600 !py-2.5">
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
        <div className="p-4 flex justify-between items-center text-white z-10">
            <h2 className="text-lg font-bold">Print Preview</h2>
            <button onClick={() => setAppState(AppState.EDIT)} className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors">Close</button>
        </div>
        
        <div className="flex-grow flex items-center justify-center p-6 overflow-auto bg-slate-900">
            {layoutImageSrc && (
                <img 
                    src={layoutImageSrc} 
                    alt="Print Layout" 
                    className="w-full h-auto shadow-2xl rounded-sm border-4 border-white"
                />
            )}
        </div>

        <div className="p-6 bg-slate-800 border-t border-slate-700 z-10">
             <p className="text-slate-400 text-xs text-center mb-4">
                 High-resolution sheet generated. Ready to save!
             </p>
             <Button fullWidth onClick={handleDownloadSheet} className="text-lg shadow-pink-500/50 shadow-lg transform active:scale-95 transition-all">
                Save to Camera Roll 📥
            </Button>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-pink-50/30 text-slate-800 font-sans selection:bg-pink-200">
      {appState === AppState.TEMPLATE_SELECT && renderTemplateSelection()}
      {appState === AppState.UPLOAD && renderUploadStep()}
      {appState === AppState.PROCESSING && renderProcessingStep()}
      {appState === AppState.EDIT && renderEditorStep()}
      {appState === AppState.LAYOUT && renderLayoutStep()}
    </div>
  );
}