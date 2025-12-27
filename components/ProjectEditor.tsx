
import React, { useState } from 'react';
import { LyricLine, Project, AnimationType } from '../types';
import { transcribeVideo } from '../services/geminiService';

interface ProjectEditorProps {
  project: Project;
  onUpdate: (updated: Project) => void;
}

const ProjectEditor: React.FC<ProjectEditorProps> = ({ project, onUpdate }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const videoUrl = URL.createObjectURL(file);
    onUpdate({ ...project, videoUrl, title: file.name });

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const result = await transcribeVideo(base64, file.type);
        
        const newLyrics: LyricLine[] = result.captions.map((cap, idx) => ({
          id: `cap-${idx}-${Date.now()}`,
          startTime: cap.startTime,
          endTime: cap.endTime,
          originalText: cap.text,
          translatedText: cap.translation
        }));

        onUpdate({ ...project, videoUrl, lyrics: newLyrics });
        setIsProcessing(false);
      };
    } catch (err) {
      alert("تعذر استخراج النصوص تلقائياً");
      setIsProcessing(false);
    }
  };

  const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onUpdate({
        ...project,
        styleConfig: { ...project.styleConfig, customFontUrl: url }
      });
    }
  };

  const updateStyle = (updates: Partial<typeof project.styleConfig>) => {
    onUpdate({
      ...project,
      styleConfig: { ...project.styleConfig, ...updates }
    });
  };

  const updateLyric = (index: number, updates: Partial<LyricLine>) => {
    const newLyrics = [...project.lyrics];
    newLyrics[index] = { ...newLyrics[index], ...updates };
    onUpdate({ ...project, lyrics: newLyrics });
  };

  return (
    <div className="space-y-6 h-full pb-20">
      {/* 1. Upload & Transcription */}
      <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 shadow-xl">
        <label className="block text-xs font-bold text-neutral-500 mb-4 uppercase tracking-widest">1. محتوى الفيديو</label>
        <div className="flex flex-col gap-4">
          <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" id="video-upload" />
          <label htmlFor="video-upload" className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-neutral-800 rounded-xl hover:border-blue-500 hover:bg-blue-500/5 cursor-pointer transition-all">
            <span className="text-xs text-neutral-500 font-arabic">رفع فيديو جديد</span>
          </label>
          {isProcessing && (
            <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg">
              <div className="animate-spin h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="text-xs text-blue-400 font-arabic">جاري تحليل الفيديو...</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Style & Typography */}
      <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 shadow-xl">
        <label className="block text-xs font-bold text-neutral-500 mb-6 uppercase tracking-widest">2. الخط والتنسيق</label>
        
        <div className="space-y-6">
          {/* Font Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-neutral-600 mb-2 uppercase">الخط</label>
              <select 
                value={project.styleConfig.fontFamily}
                onChange={(e) => updateStyle({ fontFamily: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-300"
              >
                <option value="Amiri">Amiri (Classic)</option>
                <option value="Montserrat">Montserrat (Modern)</option>
                <option value="serif">Serif (Default)</option>
                <option value="sans-serif">Sans-Serif</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-neutral-600 mb-2 uppercase">رفع خط خاص (TTF)</label>
              <input type="file" accept=".ttf,.otf" onChange={handleFontUpload} className="hidden" id="font-upload" />
              <label htmlFor="font-upload" className="w-full block bg-neutral-800 hover:bg-neutral-700 text-center py-2 rounded-lg text-xs cursor-pointer transition-colors">
                {project.styleConfig.customFontUrl ? 'تم رفع خط' : 'اختر ملف'}
              </label>
            </div>
          </div>

          {/* Color & Size */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-neutral-600 mb-2 uppercase">اللون</label>
              <div className="flex gap-2 items-center">
                <input 
                  type="color" 
                  value={project.styleConfig.fontColor}
                  onChange={(e) => updateStyle({ fontColor: e.target.value })}
                  className="w-8 h-8 rounded bg-transparent border-0 cursor-pointer"
                />
                <span className="text-[10px] text-neutral-500 font-mono">{project.styleConfig.fontColor}</span>
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-neutral-600 mb-2 uppercase">الحجم ({project.styleConfig.fontSize}px)</label>
              <input 
                type="range" min="12" max="120" value={project.styleConfig.fontSize}
                onChange={(e) => updateStyle({ fontSize: parseInt(e.target.value) })}
                className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>

          {/* Position */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] text-neutral-600 uppercase">الموقع الأفقي ({project.styleConfig.positionX}%)</label>
              <input 
                type="range" min="0" max="100" value={project.styleConfig.positionX}
                onChange={(e) => updateStyle({ positionX: parseInt(e.target.value) })}
                className="w-40 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <div className="flex justify-between items-center">
              <label className="text-[10px] text-neutral-600 uppercase">الموقع الرأسي ({project.styleConfig.positionY}%)</label>
              <input 
                type="range" min="0" max="100" value={project.styleConfig.positionY}
                onChange={(e) => updateStyle({ positionY: parseInt(e.target.value) })}
                className="w-40 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Animation Types */}
      <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 shadow-xl">
        <label className="block text-xs font-bold text-neutral-500 mb-6 uppercase tracking-widest">3. نوع التحريك</label>
        <div className="grid grid-cols-3 gap-2">
          {Object.values(AnimationType).map((type) => (
            <button
              key={type}
              onClick={() => updateStyle({ animationType: type })}
              className={`py-2 rounded-lg text-[10px] font-bold transition-all border ${
                project.styleConfig.animationType === type 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-neutral-950 border-neutral-800 text-neutral-600 hover:border-neutral-700'
              }`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Lyrics Editor */}
      <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 shadow-xl">
        <label className="block text-xs font-bold text-neutral-500 mb-6 uppercase tracking-widest">4. إدارة النصوص</label>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {project.lyrics.map((lyric, idx) => (
            <div key={lyric.id} className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
              <input 
                value={lyric.translatedText}
                onChange={(e) => updateLyric(idx, { translatedText: e.target.value })}
                className="w-full bg-transparent border-b border-neutral-800 focus:border-blue-500 outline-none mb-2 font-arabic text-white text-sm"
              />
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                   <input 
                     type="number" step="0.1" value={lyric.startTime}
                     onChange={(e) => updateLyric(idx, { startTime: parseFloat(e.target.value) })}
                     className="w-12 bg-neutral-900 text-[10px] border border-neutral-800 rounded px-1 text-center"
                   />
                   <span className="text-neutral-700 text-[10px]">→</span>
                   <input 
                     type="number" step="0.1" value={lyric.endTime}
                     onChange={(e) => updateLyric(idx, { endTime: parseFloat(e.target.value) })}
                     className="w-12 bg-neutral-900 text-[10px] border border-neutral-800 rounded px-1 text-center"
                   />
                </div>
                <button onClick={() => onUpdate({...project, lyrics: project.lyrics.filter((_, i) => i !== idx)})} className="text-neutral-800 hover:text-red-500 transition-colors">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth={2}/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectEditor;
