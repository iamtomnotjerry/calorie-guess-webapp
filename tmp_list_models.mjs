import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKeyMatch = envContent.match(/GEMINI_API_KEY=["']?([^"'\n]+)["']?/);
const apiKey = apiKeyMatch ? apiKeyMatch[1] : '';

async function run() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    // Ghi toàn bộ dữ liệu thô vào file JSON
    const outputPath = path.resolve(process.cwd(), 'available_models.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    
    console.log(`>>> Đã lưu danh sách model thô vào: ${outputPath}`);
    console.log(`>>> Tổng số model tìm thấy: ${data.models ? data.models.length : 0}`);
  } catch (e) {
    console.error('LỖI KHI GỌI API:', e.message);
  }
}

run();
