'use client';

import { motion } from 'framer-motion';
import { Info, CheckCircle, AlertCircle } from 'lucide-react';

interface ResultDisplayProps {
  text: string;
  loading: boolean;
  error?: string | null;
}

export default function ResultDisplay({ text, loading, error }: ResultDisplayProps) {
  if (loading) {
    return (
      <div className="w-full max-w-xl glass-card p-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-white/60 animate-pulse font-medium">Đang phân tích hình ảnh...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-xl glass-card p-8 border-red-500/20 bg-red-500/5 flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
        <div>
          <h3 className="text-lg font-semibold text-red-400">Đã xảy ra lỗi</h3>
          <p className="text-white/60 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!text) return null;

  // Simple parsing for list items
  const lines = text.split('\n').filter(line => line.trim().length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-xl glass-card p-8 space-y-6"
    >
      <div className="flex items-center gap-3 border-b border-white/10 pb-6">
        <div className="p-2 rounded-lg bg-green-500/10">
          <CheckCircle className="w-6 h-6 text-green-400" />
        </div>
        <h3 className="text-2xl font-bold gradient-text">Kết quả phân tích</h3>
      </div>

      <div className="space-y-4">
        {lines.map((line, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400" />
            <p className="text-white/80 leading-relaxed font-medium">{line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '')}</p>
          </motion.div>
        ))}
      </div>

      <div className="pt-4 flex items-center gap-2 text-white/40 text-xs italic">
        <Info className="w-4 h-4" />
        <span>Kết quả chỉ mang tính chất tham khảo dựa trên AI.</span>
      </div>
    </motion.div>
  );
}
