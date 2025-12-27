
import React, { useState } from 'react';
import { Project, VisualStyle, AnimationType, ExportStatus } from './types';
import Visualizer from './components/Visualizer';
import ProjectEditor from './components/ProjectEditor';
import ExportModal from './components/ExportModal';

const App: React.FC = () => {
  const [project, setProject] = useState<Project>({
    id: 'p-' + Date.now(),
    title: 'فيديو جديد',
    videoUrl: null,
    lyrics: [],
    style: VisualStyle.CLASSIC,
    styleConfig: {
      fontFamily: 'Amiri',
      fontSize: 48,
      fontColor: '#ffffff',
      positionX: 50,
      positionY: 80,
      animationType: AnimationType.FADE
    },
    createdAt: Date.now()
  });

  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');

  const handleStartExport = () => {
    if (!project.videoUrl) {
      alert("الرجاء رفع فيديو أولاً");
      return;
    }
    setExportStatus('rendering');
    // Simulate render time
    setTimeout(() => {
      setExportStatus('success');
    }, 5500);
  };

  const handleSendEmail = (email: string) => {
    if (!email) return;
    setExportStatus('emailing');
    // Simulate API call
    setTimeout(() => {
      alert("تم إرسال الرابط إلى " + email);
      setExportStatus('idle');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      <nav className="border-b border-neutral-900 px-8 py-4 flex justify-between items-center bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/20">T</div>
          <h1 className="text-xl font-black tracking-tighter">TARJUMA <span className="text-blue-500 text-sm align-top ml-1">AI</span></h1>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleStartExport}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-1.5 rounded-full text-sm font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth={2}/></svg>
            تصدير الفيديو
          </button>
        </div>
      </nav>

      <main className="max-w-screen-2xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
          <ProjectEditor project={project} onUpdate={setProject} />
        </div>

        <div className="lg:col-span-8">
          <div className="sticky top-24">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 font-arabic">معاينة الإخراج</h2>
              </div>
              <p className="text-[10px] font-mono text-neutral-600 uppercase">Live Renderer v2.5</p>
            </div>
            
            <Visualizer project={project} />

            <div className="mt-8 grid grid-cols-4 gap-4">
              <div className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800 text-center">
                <p className="text-[9px] text-neutral-600 uppercase mb-1">الخط</p>
                <p className="text-xs text-neutral-400 font-medium truncate font-arabic">{project.styleConfig.customFontUrl ? 'خط مخصص' : project.styleConfig.fontFamily}</p>
              </div>
              <div className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800 text-center">
                <p className="text-[9px] text-neutral-600 uppercase mb-1">الحجم</p>
                <p className="text-xs text-neutral-400 font-medium">{project.styleConfig.fontSize}px</p>
              </div>
              <div className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800 text-center">
                <p className="text-[9px] text-neutral-600 uppercase mb-1">الموقع</p>
                <p className="text-xs text-neutral-400 font-medium">{project.styleConfig.positionX}% , {project.styleConfig.positionY}%</p>
              </div>
              <div className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800 text-center">
                <p className="text-[9px] text-neutral-600 uppercase mb-1">الحركة</p>
                <p className="text-xs text-neutral-400 font-medium truncate uppercase">{project.styleConfig.animationType}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ExportModal 
        status={exportStatus} 
        onClose={() => setExportStatus('idle')}
        onSendEmail={handleSendEmail}
      />
    </div>
  );
};

export default App;
