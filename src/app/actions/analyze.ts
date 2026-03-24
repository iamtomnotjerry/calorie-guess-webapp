'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function analyzeImage(base64Image: string, language: string = 'Tiếng Việt') {
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
