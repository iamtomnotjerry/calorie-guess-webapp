'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function analyzeImage(base64Image: string, language: string = 'Tiếng Việt') {
  try {
    //địt con mẹ mà nó là 3 flash preview mới nhất!
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    const prompt = language === 'Tiếng Việt' 
      ? "Phân tích hình ảnh món ăn này. Cung cấp: 1. Tên món ăn. 2. Ước tính lượng calo (hãy chính xác nhất có thể dựa trên khẩu phần, KHÔNG ước tính quá cao - non-overrated). 3. Các chất dinh dưỡng đa lượng (Protein, Carbs, Chất béo tính bằng gam). 4. Đánh giá sức khỏe. Định dạng theo danh sách rõ ràng. TẤT CẢ phản hồi phải bằng Tiếng Việt."
      : "Analyze this food image. Provide: 1. Name of the dish. 2. Estimated calories (be as accurate as possible based on the portion size, do NOT overestimate - non-overrated). 3. Macronutrients (Protein, Carbs, Fats in grams). 4. Health assessment. Format as a clear list. All output MUST be in " + language + ".";

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
    return { success: true, text: response.text() };
  } catch (error: any) {
    console.error('Analysis error:', error);
    return { success: false, error: error.message || 'Failed to analyze image' };
  }
}
