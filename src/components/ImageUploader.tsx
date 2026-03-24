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

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.8 quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFile = async (file: File) => {
    try {
      // Show local preview immediately (optional, but good for UX)
      const localPreview = URL.createObjectURL(file);
      setPreview(localPreview);
      
      // Compress for AI analysis
      const compressedBase64 = await compressImage(file);
      onImageSelected(compressedBase64);
    } catch (err) {
      console.error('Compression error:', err);
      // Fallback to original if compression fails
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreview(base64);
        onImageSelected(base64);
      };
      reader.readAsDataURL(file);
    }
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
            <img src={preview} alt="Selected" className="w-full h-[300px] md:h-[400px] object-cover" />
            
            {/* Delete/Reset Button - Now always visible and in top-right corner */}
            <button
              onClick={() => {
                setPreview(null);
                onReset();
              }}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 hover:bg-red-500 hover:border-red-500 transition-all z-10"
              aria-label="Remove image"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
