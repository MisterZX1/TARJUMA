
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ExportStatus, Project } from '../types';

interface ExportModalProps {
  status: ExportStatus;
  project: Project;
  onClose: () => void;
  onSendEmail: (email: string) => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ status, project, onClose, onSendEmail }) => {
  const [progress, setProgress] = useState(0);
  const [email, setEmail] = useState('');
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (status === 'rendering' && !isRendering) {
      startRendering();
    }
    // Cleanup on unmount
    return () => {
       if (finalVideoUrl) URL.revokeObjectURL(finalVideoUrl);
    };
  }, [status]);

  const startRendering = async () => {
    if (!project.videoUrl || !canvasRef.current) return;
    
    setIsRendering(true);
    setProgress(0);
    setFinalVideoUrl(null);
    chunksRef.current = [];

    const video = document.createElement('video');
    video.src = project.videoUrl;
    video.crossOrigin = "anonymous";
    video.muted = false;
    
    // Ensure video metadata is loaded
    await new Promise((resolve) => {
      video.onloadedmetadata = resolve;
    });

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Wait for custom fonts to be ready for Canvas
    if (document.fonts) {
      await document.fonts.ready;
    }

    const stream = canvas.captureStream(30);
    
    // Audio handling
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioContext.createMediaElementSource(video);
    const destination = audioContext.createMediaStreamDestination();
    source.connect(destination);
    source.connect(audioContext.destination);
    
    const audioTrack = destination.stream.getAudioTracks()[0];
    if (audioTrack) stream.addTrack(audioTrack);

    // MimeType detection for better compatibility
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
      ? 'video/webm;codecs=vp9' 
      : 'video/webm';

    const recorder = new MediaRecorder(stream, { mimeType });
    
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setFinalVideoUrl(url);
      setIsRendering(false);
      audioContext.close();
    };

    recorder.start();
    await video.play();

    const renderFrame = () => {
      if (video.paused || video.ended) {
        if (recorder.state === 'recording') recorder.stop();
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const currentTime = video.currentTime;
      const activeLyric = project.lyrics.find(l => currentTime >= l.startTime && currentTime <= l.endTime);

      if (activeLyric) {
        ctx.save();
        const { styleConfig } = project;
        const x = (styleConfig.positionX / 100) * canvas.width;
        const y = (styleConfig.positionY / 100) * canvas.height;
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = styleConfig.fontColor;
        
        const scaledFontSize = (styleConfig.fontSize / 1080) * canvas.height;
        const fontStack = styleConfig.customFontUrl ? 'CustomUserFont' : styleConfig.fontFamily;
        ctx.font = `bold ${scaledFontSize}px ${fontStack}, Amiri, Arial`;
        
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        ctx.fillText(activeLyric.translatedText, x, y);
        ctx.restore();
      }

      setProgress(Math.round((video.currentTime / video.duration) * 100));
      requestAnimationFrame(renderFrame);
    };

    requestAnimationFrame(renderFrame);
  };

  const handleDownload = () => {
    if (!finalVideoUrl) return;
    const a = document.createElement('a');
    a.href = finalVideoUrl;
    a.download = `tarjuma_export_${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (status === 'idle') return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] max-w-5xl w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
      >
        <button onClick={onClose} className="absolute top-8 right-8 z-10 text-neutral-500 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2.5}/></svg>
        </button>

        <div className="p-10 flex flex-col h-full overflow-y-auto custom-scrollbar">
          {isRendering ? (
            <div className="text-center py-20">
              <div className="relative w-40 h-40 mx-auto mb-10">
                 <svg className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="75" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-neutral-800" />
                    <motion.circle 
                      cx="80" cy="80" r="75" stroke="currentColor" strokeWidth="6" fill="transparent" 
                      className="text-blue-500"
                      strokeDasharray={471}
                      animate={{ strokeDashoffset: 471 - (471 * progress) / 100 }}
                      transition={{ duration: 0.5 }}
                    />
                 </svg>
                 <div className="absolute inset-0 flex items-center justify-center font-black text-3xl">{progress}%</div>
              </div>
              <h2 className="text-3xl font-black mb-3 font-arabic">جاري استخراج الفيديو...</h2>
              <p className="text-neutral-500 font-arabic">يتم الآن دمج الترجمة والتنسيقات، يرجى الانتظار</p>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div>
                  <div className="inline-block px-4 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-widest mb-4">تم الإكمال بنجاح</div>
                  <h2 className="text-5xl font-black mb-4 font-arabic leading-tight">فيديوك<br/>أصبح جاهزاً!</h2>
                  <p className="text-neutral-400 font-arabic text-lg">يمكنك الآن تحميل الفيديو النهائي مع الترجمة المثبتة.</p>
                </div>
                
                <div className="space-y-4">
                  <button 
                    onClick={handleDownload}
                    className="w-full bg-white text-black hover:bg-neutral-200 py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth={2.5}/></svg>
                    تحميل الفيديو (MP4/WebM)
                  </button>

                  <div className="bg-neutral-800/30 p-8 rounded-3xl border border-neutral-800/50">
                    <label className="text-xs text-neutral-500 mb-4 block font-bold uppercase tracking-widest">إرسال الرابط للبريد</label>
                    <div className="flex gap-3">
                      <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="flex-1 bg-black/50 border border-neutral-700 rounded-xl px-5 py-3 text-sm outline-none focus:border-blue-500 transition-colors"
                      />
                      <button onClick={() => onSendEmail(email)} className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-black hover:bg-blue-500 transition-colors">إرسال</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-4 bg-blue-500/10 rounded-[3rem] blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
                <div className="relative bg-black rounded-[2rem] overflow-hidden shadow-2xl border border-neutral-800 aspect-video flex items-center justify-center">
                  {finalVideoUrl ? (
                    <video src={finalVideoUrl} controls className="w-full h-full object-contain" autoPlay />
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-neutral-700">
                      <div className="w-12 h-12 border-4 border-neutral-800 border-t-blue-500 rounded-full animate-spin"></div>
                      <p className="text-[10px] font-bold uppercase tracking-widest">Preparing Preview...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ExportModal;
