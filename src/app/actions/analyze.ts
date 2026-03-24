'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { headers } from 'next/headers';
import { kv } from '@vercel/kv';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function analyzeImage(base64Image: string, language: string = 'Tiếng Việt') {
  // Get identifying info for logging
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') || 'Unknown IP';
  const userAgent = headersList.get('user-agent') || 'Unknown Device';
  
  console.log(`>>> New analysis request from IP: ${ip} | Device: ${userAgent}`);

  // 100% Persistent Rate Limiting with Vercel KV
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const minuteKey = `ratelimit:${ip}:min:${Math.floor(now.getTime() / 60000)}`;
    const dailyKey = `ratelimit:${ip}:day:${today}`;
    
    // Check Per-Minute Limit (RPM: 2)
    const rpmUsage = await kv.incr(minuteKey);
    if (rpmUsage === 1) await kv.expire(minuteKey, 60);
    if (rpmUsage > 2) {
      console.warn(`>>> IP ${ip} blocked: Minute limit reached (2/minute)`);
      return { 
        success: false, 
        error: language === 'Tiếng Việt' 
          ? 'Bạn đang gửi yêu cầu quá nhanh. Vui lòng đợi 1 phút rồi thử lại.' 
          : 'You are sending requests too fast. Please wait 1 minute and try again.' 
      };
    }

    // Check Daily Limit (RPD: 15)
    const dailyUsage = await kv.incr(dailyKey);
    if (dailyUsage === 1) await kv.expire(dailyKey, 86400); 

    if (dailyUsage > 15) {
      console.warn(`>>> IP ${ip} blocked: Daily limit reached (15/15)`);
      return { 
        success: false, 
        error: language === 'Tiếng Việt' 
          ? 'Bạn đã hết 15 lượt miễn phí của hôm nay. Hãy quay lại vào ngày mai nhé!' 
          : 'You have reached your daily limit of 15 requests. Please come back tomorrow!' 
      };
    }
  } catch (error) {
    console.error('KV Rate Limit error:', error);
    // Continue anyway if KV fails? Or block? 
    // Usually better to continue to avoid breaking the app if DB is down temporarily.
  }

  // Model rotation list based on your specific quotas:
  // 1. Gemini 3 Flash (20 RPD) - High quality
  // 2. Gemini 2.5 Flash (20 RPD) - High quality fallback
  // 3. Gemini 3.1 Flash Lite (500 RPD) - High volume fallback
  const MODELS = [
    'gemini-3-flash-preview',
    'gemini-2.5-flash',
    'gemini-3.1-flash-lite'
  ];

  let lastError = null;

  for (const modelName of MODELS) {
    try {
      console.log(`Attempting analysis with model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = language === 'Tiếng Việt' 
        ? "Phân tích hình ảnh món ăn này. Cung cấp: 1. Tên món ăn. 2. Ước tính lượng calo (hãy chính xác nhất có thể dựa trên khẩu phần, KHÔNG ước tính quá cao - non-overrated). 3. Các chất dinh dưỡng đa lượng (Protein, Carbs, Chất béo tính bằng gam). 4. Đánh giá sức khỏe. Định dạng theo danh sách rõ ràng. TẤT CẢ phản hồi phải bằng Tiếng Việt."
        : `Analyze this food image. Provide: 1. Name of the dish. 2. Estimated calories (be as accurate as possible based on the portion size, do NOT overestimate - non-overrated). 3. Macronutrients (Protein, Carbs, Fats in grams). 4. Health assessment. Format as a clear list. All output MUST be in ${language}.`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Image.split(',')[1],
            mimeType: 'image/jpeg',
          },
        },
      ]);

      const response = await result.response;
      console.log(`Analysis successful with model: ${modelName}`);
      return { success: true, text: response.text() };

    } catch (error: any) {
      lastError = error;
      // If it's a rate limit error (429), try the next model
      if (error.message?.includes('429') || error.message?.includes('Too Many Requests') || error.status === 429) {
        console.warn(`Model ${modelName} hit rate limit. Trying next model...`);
        continue;
      }
      // For other errors, log and potentially stop
      console.error(`Error with model ${modelName}:`, error.message);
      // If it's a "model not found" or similar configuration error, try next anyway
      if (error.message?.includes('not found') || error.message?.includes('404')) {
        continue;
      }
      break; 
    }
  }

  return { 
    success: false, 
    error: lastError?.message || 'Không thể kết nối với bất kỳ model AI nào. Vui lòng thử lại sau.' 
  };
}
