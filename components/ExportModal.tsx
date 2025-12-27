
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExportStatus } from '../types';

interface ExportModalProps {
  status: ExportStatus;
  onClose: () => void;
  onSendEmail: (email: string) => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ status, onClose, onSendEmail }) => {
  const [progress, setProgress] = useState(0);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (status === 'rendering') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [status]);

  if (status === 'idle') return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden"
      >
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 blur-[100px] rounded-full"></div>

        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2}/></svg>
        </button>

        <div className="text-center">
          {status === 'rendering' && (
            <>
              <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="text-2xl font-black mb-2 font-arabic">جاري تصدير الفيديو...</h2>
              <p className="text-neutral-500 text-sm mb-8">يتم الآن دمج النصوص والخطوط مع الفيديو بأعلى جودة</p>
              
              <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden mb-2">
                <motion.div 
                  className="h-full bg-blue-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>{progress}% COMPLETE</span>
                <span>{progress === 100 ? 'FINISHED' : 'RENDERING FRAMES...'}</span>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M5 13l4 4L19 7" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="text-2xl font-black mb-2 font-arabic">اكتمل التصدير بنجاح!</h2>
              <p className="text-neutral-500 text-sm mb-8">فيديوهاتك جاهزة للمشاركة مع العالم</p>
              
              <div className="flex flex-col gap-3">
                <button className="w-full bg-white text-black py-3 rounded-xl font-bold hover:bg-neutral-200 transition-all flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth={2}/></svg>
                  تحميل الفيديو MP4
                </button>
                
                <div className="h-px bg-neutral-800 my-2"></div>
                
                <div className="text-right">
                  <label className="text-xs text-neutral-500 mb-2 block font-arabic">أرسل الرابط إلى بريدك الإلكتروني</label>
                  <div className="flex gap-2">
                    <input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500"
                    />
                    <button 
                      onClick={() => onSendEmail(email)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-500 transition-all"
                    >
                      إرسال
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {status === 'emailing' && (
            <div className="py-10">
              <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"></div>
              <h2 className="text-xl font-bold font-arabic">جاري الإرسال...</h2>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ExportModal;
