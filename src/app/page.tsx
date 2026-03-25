'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Zap, ShieldCheck, Languages } from 'lucide-react';
import LanguageSelector from '@/components/LanguageSelector';
import ImageUploader from '@/components/ImageUploader';
import ResultDisplay from '@/components/ResultDisplay';
import { analyzeImage } from '@/app/actions/analyze';

export default function Home() {
  const [selectedLanguage, setSelectedLanguage] = useState('Tiếng Việt');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [foodDescription, setFoodDescription] = useState('');

  const handleImageAnalysis = async (base64: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await analyzeImage(base64, selectedLanguage, foodDescription);
      
      if (res.success) {
        setResult(res.text || '');
      } else {
        setError(res.error || 'Có lỗi xảy ra khi phân tích hình ảnh.');
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError('Không thể kết nối với máy chủ AI. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-blue-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col items-center">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
            <Zap className="w-4 h-4 fill-current" />
            <span>Powered by Gemini</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4">
            Calorie<span className="gradient-text">Guess</span> AI
          </h1>
          <p className="text-xl text-white/40 max-w-2xl mx-auto">
            Phân tích dinh dưỡng cực kỳ chính xác qua hình ảnh. 
            Công nghệ AI tiên tiến (non-overrated) giúp bạn kiểm soát chế độ ăn hiệu quả.
          </p>
        </motion.header>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 w-full max-w-4xl">
           {[
             { icon: Camera, title: "Nhanh chóng", desc: "Kết quả chỉ sau vài giây" },
             { icon: ShieldCheck, title: "Chính xác", desc: "Uớc lượng sát thực tế" },
             { icon: Languages, title: "Đa ngôn ngữ", desc: "Hỗ trợ Việt, Anh, Nhật, Hàn" }
           ].map((f, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 * i }}
               className="glass-card p-6 flex items-start gap-4 hover:bg-white/10 transition-colors"
             >
               <div className="p-3 rounded-xl bg-white/5 text-blue-400">
                 <f.icon className="w-6 h-6" />
               </div>
               <div>
                 <h4 className="font-bold text-white/90">{f.title}</h4>
                 <p className="text-sm text-white/40">{f.desc}</p>
               </div>
             </motion.div>
           ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-6 mb-12 w-full max-w-2xl">
          <div className="w-full">
            <textarea
              placeholder={
                selectedLanguage === 'Tiếng Việt' ? "Thêm ghi chú (ví dụ: Bún bò thêm móng giò, phở ít bánh...)" :
                selectedLanguage === 'English' ? "Add note (e.g., Extra beef Pho, less noodles...)" :
                selectedLanguage === '日本語' ? "メモを追加 (例: 牛肉多めのフォー、麺少なめ...)" :
                "메모 추가 (예: 소고기 추가 쌀국수, 면 적게...)"
              }
              value={foodDescription}
              onChange={(e) => setFoodDescription(e.target.value)}
              className="w-full h-24 p-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all resize-none glass-morphism"
            />
          </div>
          <LanguageSelector 
            selected={selectedLanguage} 
            onChange={setSelectedLanguage} 
          />
        </div>

        {/* Main Interface */}
        <div className="w-full flex flex-col items-center gap-12">
          <ImageUploader 
            onImageSelected={handleImageAnalysis} 
            onReset={() => {
              setResult(null);
              setError(null);
              setFoodDescription('');
            }} 
          />
          
          <AnimatePresence>
            {(loading || result || error) && (
              <ResultDisplay 
                text={result || ''} 
                loading={loading} 
                error={error} 
                language={selectedLanguage}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="mt-24 pt-12 border-t border-white/10 w-full text-center text-white/20 text-sm">
          <p>© 2026 CalorieGuess AI. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
