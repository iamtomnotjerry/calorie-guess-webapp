'use client';

import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  Zap, 
  Activity, 
  Heart, 
  AlertTriangle, 
  Lightbulb,
  Beef,
  Wheat,
  Droplets,
  Utensils
} from 'lucide-react';

interface ResultDisplayProps {
  text: string;
  loading: boolean;
  error?: string | null;
  language?: string;
}

const translations: Record<string, any> = {
  'Tiếng Việt': {
    analyzing: "Đang thẩm định món ăn...",
    scanning: "AI đang quét từng pixel để tính toán calo",
    completed: "Đã hoàn tất phân tích",
    totalEnergy: "Tổng năng lượng",
    nutritionPros: "Ưu điểm dinh dưỡng",
    nutritionCons: "Hạn chế cần lưu ý",
    aiAdvice: "Lời khuyên từ AI",
    disclaimer: "Khuyến nghị chỉ mang tính chất tham khảo • Độ chính xác dựa trên hình ảnh",
    errorTitle: "Đã xảy ra lỗi",
    overloadTitle: "Đầu bếp AI đang bận tí! 👨‍🍳",
    overloadMessage: "Hệ thống đang phục vụ quá nhiều thực khách. Bạn vui lòng đợi ít phút rồi thử lại nhé!",
    macros: {
      Protein: "Chất đạm",
      Carbs: "Tinh bột",
      Fat: "Chất béo"
    }
  },
  'English': {
    analyzing: "Analyzing dish...",
    scanning: "AI is scanning every pixel to calculate calories",
    completed: "Analysis Complete",
    totalEnergy: "Total Energy",
    nutritionPros: "Nutritional Strengths",
    nutritionCons: "Points to Note",
    aiAdvice: "AI Expert Advice",
    disclaimer: "Recommendations are for reference only • Accuracy based on image",
    errorTitle: "Error Occurred",
    overloadTitle: "AI Chef is a bit busy! 👨‍🍳",
    overloadMessage: "The kitchen is full right now. Please wait a few minutes and try again!",
    macros: {
      Protein: "Protein",
      Carbs: "Carbs",
      Fat: "Fat"
    }
  },
  '日本語': {
    analyzing: "料理を分析中...",
    scanning: "AIがピクセルごとにスキャンしてカロリーを計算しています",
    completed: "分析完了",
    totalEnergy: "総エネルギー",
    nutritionPros: "栄養の利点",
    nutritionCons: "注意点",
    aiAdvice: "AIのアドバイス",
    disclaimer: "推奨事項は参考用です • 画像に基づく精度",
    errorTitle: "エラーが発生しました",
    overloadTitle: "AIシェフが少し忙しいようです! 👨‍🍳",
    overloadMessage: "現在大変混み合っています。数分後にもう一度お試しください。",
    macros: {
      Protein: "タンパク質",
      Carbs: "炭水化物",
      Fat: "脂質"
    }
  },
  '한국어': {
    analyzing: "음식 분석 중...",
    scanning: "AI가 픽셀 단위로 스캔하여 칼로리를 계산하고 있습니다",
    completed: "분석 완료",
    totalEnergy: "총 에너지",
    nutritionPros: "영양학적 장점",
    nutritionCons: "주의 사항",
    aiAdvice: "AI 조언",
    disclaimer: "권장 사항은 참고용입니다 • 이미지 기반 정확도",
    errorTitle: "오류 발생",
    overloadTitle: "AI 셰프가 조금 바쁘네요! 👨‍🍳",
    overloadMessage: "현재 사용자가 많아 지연되고 있습니다. 잠시 후 다시 시도해주세요.",
    macros: {
      Protein: "단백질",
      Carbs: "탄수화물",
      Fat: "지방"
    }
  }
};

export default function ResultDisplay({ text, loading, error, language = 'Tiếng Việt' }: ResultDisplayProps) {
  const t = translations[language] || translations['English'];

  if (loading) {
    return (
      <div className="w-full max-w-2xl glass-card p-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
        <div className="text-center">
          <p className="text-xl font-bold gradient-text animate-pulse">{t.analyzing}</p>
          <p className="text-white/40 text-sm mt-2">{t.scanning}</p>
        </div>
      </div>
    );
  }

  if (error) {
    const isOverload = error.includes('503') || error.toLowerCase().includes('service unavailable') || error.toLowerCase().includes('high demand');
    
    if (isOverload) {
      return (
        <div className="w-full max-w-2xl glass-card p-10 border-blue-500/20 bg-blue-500/5 flex flex-col items-center text-center gap-6">
          <motion.div 
            animate={{ 
              rotate: [0, -10, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center"
          >
            <Utensils className="w-10 h-10 text-blue-400" />
          </motion.div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white">{t.overloadTitle}</h3>
            <p className="text-white/60 text-base max-w-sm mx-auto leading-relaxed">
              {t.overloadMessage}
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-base font-black transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20"
          >
            {language === 'Tiếng Việt' ? 'Thử lại ngay nào! 🚀' : 
             language === 'English' ? 'Try again now! 🚀' :
             language === '日本語' ? 'もう一度試す 🚀' : '다시 시도하기 🚀'}
          </button>
        </div>
      );
    }

    return (
      <div className="w-full max-w-2xl glass-card p-8 border-red-500/20 bg-red-500/5 flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
        <div>
          <h3 className="text-lg font-semibold text-red-400">{t.errorTitle}</h3>
          <p className="text-white/60 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!text) return null;

  let data;
  try {
    const cleaned = text.replace(/```json\n?/, '').replace(/\n?```/, '').trim();
    data = JSON.parse(cleaned);
  } catch (e) {
    // Fallback if parsing fails
    return (
      <div className="w-full max-w-2xl glass-card p-8 text-white/60 whitespace-pre-wrap">
        {text}
      </div>
    );
  }

  const macroIcons: Record<string, any> = {
    'Protein': Beef,
    'Carbs': Wheat,
    'Fat': Droplets,
    'Chất béo': Droplets,
    'Fat (Chất béo)': Droplets,
    'Tinh bột': Wheat
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="w-full max-w-2xl flex flex-col gap-6"
    >
      {/* Header & Total Calories */}
      <div className="glass-card p-8 flex flex-col md:flex-row justify-between items-center gap-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-12 bg-blue-500/10 blur-[80px] rounded-full -z-10" />
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold uppercase tracking-wider">
            <CheckCircle className="w-3.6 h-3.6" />
            {t.completed}
          </div>
          <h2 className="text-3xl font-black text-white">{data.dishName}</h2>
        </div>
        
        <div className="flex flex-col items-center bg-white/5 border border-white/10 p-6 rounded-3xl min-w-[160px]">
          <span className="text-white/40 text-xs uppercase font-bold tracking-widest mb-1">{t.totalEnergy}</span>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-black gradient-text">{data.calories.value}</span>
            <span className="text-sm font-bold text-white/40">{data.calories.unit}</span>
          </div>
        </div>
      </div>

      {/* Macronutrients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.macros.map((m: any, i: number) => {
          const Icon = macroIcons[m.name] || Activity;
          return (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="glass-card p-5 space-y-3 group hover:bg-white/10 transition-all cursor-default"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-blue-500/20 transition-colors">
                  <Icon className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-xl font-bold text-white">{m.value}</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white/60">{t.macros[m.name] || m.name}</h4>
                <p className="text-xs text-white/20 leading-tight mt-1">{m.details}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Health Assessment Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pros */}
        <div className="glass-card p-6 border-green-500/10 space-y-4">
          <div className="flex items-center gap-2 text-green-400 font-bold text-sm uppercase tracking-wider">
            <Heart className="w-4 h-4" />
            {t.nutritionPros}
          </div>
          <ul className="space-y-2">
            {data.healthAssessment.positives.map((p: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                <div className="mt-1.5 w-1 h-1 rounded-full bg-green-500 flex-shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Cons */}
        <div className="glass-card p-6 border-yellow-500/10 space-y-4">
          <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            {t.nutritionCons}
          </div>
          <ul className="space-y-2">
            {data.healthAssessment.negatives.map((n: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                <div className="mt-1.5 w-1 h-1 rounded-full bg-yellow-500 flex-shrink-0" />
                {n}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Expert Advice Block */}
      <div className="glass-card p-6 bg-blue-500/5 border-blue-500/20 relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Lightbulb className="w-32 h-32 text-blue-400" />
        </div>
        <div className="flex items-center gap-2 text-blue-400 font-bold text-sm uppercase tracking-wider mb-3">
          <Zap className="w-4 h-4" />
          {t.aiAdvice}
        </div>
        <p className="text-white/80 leading-relaxed relative z-10 italic">
          "{data.healthAssessment.advice}"
        </p>
      </div>

      <p className="text-center text-white/20 text-[10px] uppercase tracking-widest font-bold">
        {t.disclaimer}
      </p>
    </motion.div>
  );
}
