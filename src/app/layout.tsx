import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://calorie-guess-webapp.vercel.app'),
  title: "CalorieGuess AI - Phân tích dinh dưỡng chính xác",
  description: "Trình phân tích hình ảnh thực phẩm bằng AI Gemini cho kết quả chính xác, không phóng đại.",
  keywords: ["dinh dưỡng", "calo", "gemini ai", "phân tích món ăn", "sức khỏe"],
  icons: {
    icon: '/icon.png',
  },
  openGraph: {
    title: "CalorieGuess AI - Phân tích dinh dưỡng chính xác",
    description: "Trình phân tích hình ảnh thực phẩm bằng AI Gemini cho kết quả chính xác, không phóng đại.",
    url: 'https://calorie-guess-webapp.vercel.app',
    siteName: 'CalorieGuess AI',
    locale: 'vi_VN',
    type: 'website',
    images: [
      {
        url: 'https://calorie-guess-webapp.vercel.app/social-preview.png',
        width: 1200,
        height: 630,
        alt: 'CalorieGuess AI Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "CalorieGuess AI - Phân tích dinh dưỡng chính xác",
    description: "Trình phân tích hình ảnh thực phẩm bằng AI Gemini cho kết quả chính xác, không phóng đại.",
    images: ['/social-preview.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen bg-[#0a0a0a]" suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
