'use client';

import { motion } from 'framer-motion';

interface LanguageSelectorProps {
  selected: string;
  onChange: (lang: string) => void;
}

export default function LanguageSelector({ selected, onChange }: { selected: string, onChange: (lang: string) => void }) {
  const languages = ['Tiếng Việt', 'English', '日本語', '한국어'];

  return (
    <div className="flex gap-2 p-1 bg-white/5 rounded-full border border-white/10">
      {languages.map((lang) => (
        <motion.button
          key={lang}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(lang)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            selected === lang 
              ? 'bg-blue-500 text-white shadow-lg' 
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          {lang}
        </motion.button>
      ))}
    </div>
  );
}
