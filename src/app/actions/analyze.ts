'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { headers } from 'next/headers';
import { createClient } from 'redis';

// Initialize Redis Client for standard Redis (not Vercel KV REST)
const redisClient = createClient({
  url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

async function getRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  return redisClient;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function analyzeImage(base64Image: string, language: string = 'Tiếng Việt') {
  // Get identifying info for logging
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') || 'Unknown IP';
  const userAgent = headersList.get('user-agent') || 'Unknown Device';
  
  console.log(`>>> New analysis request from IP: ${ip} | Device: ${userAgent}`);

  // 100% Persistent Rate Limiting with Redis
  try {
    const redis = await getRedis();
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const fiveMinKey = `ratelimit:${ip}:5min:${Math.floor(now.getTime() / 300000)}`;
    const dailyKey = `ratelimit:${ip}:day:${today}`;
    
    // Check Per-5-Minute Limit (2 requests / 5 mins)
    const usage5Min = await redis.incr(fiveMinKey);
    if (usage5Min === 1) await redis.expire(fiveMinKey, 300); // 5 minutes (300s)
    if (usage5Min > 2) {
      console.warn(`>>> IP ${ip} blocked: 5-minute limit reached (2/5mins)`);
      return { 
        success: false, 
        error: language === 'Tiếng Việt' 
          ? 'Bạn đang gửi yêu cầu quá nhanh. Vui lòng đợi 5 phút rồi thử lại.' 
          : 'You are sending requests too fast. Please wait 5 minutes and try again.' 
      };
    }

    // Check Daily Limit (RPD: 15)
    const dailyUsage = await redis.incr(dailyKey);
    if (dailyUsage === 1) await redis.expire(dailyKey, 86400); 

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
    console.error('Redis Rate Limit error:', error);
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
        ? `Bạn là chuyên gia dinh dưỡng người Việt Nam, rất am hiểu về món ăn Việt và cách ước lượng khẩu phần thực tế từ hình ảnh.

Hãy phân tích **chính xác** hình ảnh món ăn này dựa trên khẩu phần thực tế nhìn thấy (không được ước lượng quá cao, không phóng đại).

YÊU CẦU BẮT BUỘC: Trả về **CHỈ MỘT ĐỐI TƯỢNG JSON hợp lệ**, không có bất kỳ ký tự nào khác trước hoặc sau JSON (không có \`\`\`json, không có giải thích).

Cấu trúc JSON phải đúng như sau:

{
  "dishName": "Tên món ăn cụ thể và chính xác bằng tiếng Việt",
  "calories": { "value": số nguyên, "unit": "kcal" },
  "macros": [
    { 
      "name": "Protein", 
      "value": "số_gam+g", 
      "details": "Nguồn gốc chi tiết (ví dụ: từ thịt heo nạc, tôm, trứng gà...)" 
    },
    { 
      "name": "Carbs", 
      "value": "số_gam+g", 
      "details": "Nguồn gốc chi tiết (ví dụ: từ cơm trắng, bún, bánh mì, khoai lang...)" 
    },
    { 
      "name": "Fat", 
      "value": "số_gam+g", 
      "details": "Nguồn gốc chi tiết (ví dụ: từ dầu ăn, mỡ hành, nước cốt dừa, thịt mỡ...)" 
    }
  ],
  "healthAssessment": {
    "positives": ["Ưu điểm 1", "Ưu điểm 2"],
    "negatives": ["Hạn chế 1", "Hạn chế 2"],
    "advice": "Lời khuyên ngắn gọn, thực tế để ăn món này lành mạnh hơn"
  }
}

Quy tắc quan trọng:
- Ước lượng calo và macros dựa trên **khẩu phần thực tế** trong ảnh (xem kích thước đĩa, lượng cơm/thịt/rau...).
- Nếu món ăn có nhiều món phụ (cơm + canh + thịt + rau), hãy tính tổng cho cả bữa.
- Luôn tính đến gia vị, dầu ăn, nước sốt vì chúng góp phần không nhỏ vào calo.
- Tất cả nội dung văn bản trong JSON phải bằng **tiếng Việt** tự nhiên, dễ hiểu.
- Nếu không chắc chắn về một chi tiết, hãy đưa ra ước lượng hợp lý thay vì đoán mò quá xa.`
        : `You are a professional nutritionist with deep knowledge of food portion estimation from images.

Analyze this food image **accurately** based on the visible real portion size. Do NOT overestimate calories or macros.

STRICT REQUIREMENT: Respond with **ONLY a valid JSON object**, nothing else before or after it (no \`\`\`json, no explanations).

Use exactly this structure:

{
  "dishName": "Specific and accurate dish name",
  "calories": { "value": integer_number, "unit": "kcal" },
  "macros": [
    { 
      "name": "Protein", 
      "value": "Xg", 
      "details": "Detailed source (e.g. from lean pork, shrimp, egg...)" 
    },
    { 
      "name": "Carbs", 
      "value": "Xg", 
      "details": "Detailed source (e.g. from white rice, noodles...)" 
    },
    { 
      "name": "Fat", 
      "value": "Xg", 
      "details": "Detailed source (e.g. from cooking oil, coconut milk, fatty meat...)" 
    }
  ],
  "healthAssessment": {
    "positives": ["Positive point 1", "Positive point 2"],
    "negatives": ["Issue 1", "Issue 2"],
    "advice": "Short, practical advice to make this meal healthier"
  }
}

Important rules:
- Base estimates on the actual visible portion in the image.
- Always account for oils, sauces, and seasonings as they significantly affect calories.
- All text inside the JSON must be in ${language}.
- Be realistic and conservative with calorie estimation.`;

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
