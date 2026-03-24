'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Image as ImageIcon, X, UploadCloud } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
  onReset: () => void;
}

export default function ImageUploader({ onImageSelected, onReset }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreview(base64);
      onImageSelected(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full max-w-xl">
      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            className="glass-card p-12 flex flex-col items-center justify-center border-dashed border-2 border-white/20 hover:border-blue-500/50 cursor-pointer group transition-all"
          >
            <div className="p-6 rounded-full bg-blue-500/10 mb-6 group-hover:scale-110 transition-transform">
              <Camera className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Chụp ảnh hoặc chọn từ máy</h3>
            <p className="text-white/40 text-center text-sm">
              Kéo thả hình ảnh vào đây hoặc nhấn để chọn tệp
            </p>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-3xl overflow-hidden glass-card group"
          >
            <img src={preview} alt="Selected" className="w-full h-[400px] object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <button
                onClick={() => {
                   setPreview(null);
                   onReset();
                }}
                className="p-3 rounded-full bg-red-500 text-white hover:scale-110 transition-transform"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
