import type { Metadata } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ClientProviders from "@/components/layout/ClientProviders";
import "./globals.css";

const pretendard = localFont({
  src: [
    {
      path: "./fonts/PretendardVariable.woff2",
      style: "normal",
    },
  ],
  variable: "--font-pretendard",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PBL.SYS — 피클볼 올인원 플랫폼",
  description:
    "대회 검색, 코트 예약, 같이 칠 사람 찾기까지. 피클볼의 모든 것, 한 곳에서.",
  openGraph: {
    title: "PBL.SYS — 피클볼 올인원 플랫폼",
    description: "대회 검색, 코트 예약, 같이 칠 사람 찾기까지. 피클볼의 모든 것, 한 곳에서.",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="scroll-smooth">
      <body
        className={`${pretendard.variable} ${jetbrainsMono.variable} font-sans antialiased bg-dark text-text-main`}
      >
        <ClientProviders>
          <Navbar />
          <main className="min-h-screen pt-14">{children}</main>
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}
