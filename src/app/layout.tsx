import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SLAM PICK",
  description: "슬롯 분할형 인플루언서 공동 마케팅 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
