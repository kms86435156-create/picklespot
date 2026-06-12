import type { Metadata } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNavBar from "@/components/layout/BottomNavBar";
import ClientProviders from "@/components/layout/ClientProviders";
import NoticeBanner from "@/components/home/NoticeBanner";
import Script from "next/script";
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pickleball-platform-brown.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "PBL.SYS — 오늘 같이 칠 사람 찾기",
    template: "%s | PBL.SYS",
  },
  description:
    "내 근처에서 오늘 같이 피클볼 칠 사람을 찾아보세요. 번개 모집, 코트 찾기, 초보자 모임까지.",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "PBL.SYS — 오늘 같이 칠 사람 찾기",
    description: "내 근처에서 오늘 같이 피클볼 칠 사람을 찾아보세요. 번개 모집, 코트 찾기, 초보자 모임까지.",
    type: "website",
    locale: "ko_KR",
    siteName: "PBL.SYS",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "PBL.SYS — 오늘 같이 칠 사람 찾기",
    description: "내 근처에서 오늘 같이 피클볼 칠 사람을 찾아보세요. 번개 모집, 코트 찾기, 초보자 모임까지.",
  },
  robots: {
    index: true,
    follow: true,
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
        {process.env.NEXT_PUBLIC_KAKAO_MAP_KEY && (
          <Script
            src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`}
            strategy="beforeInteractive"
          />
        )}
        <ClientProviders>
          <Navbar />
          <div className="pt-14">
            <NoticeBanner />
          </div>
          <main className="min-h-screen pb-16 lg:pb-0">{children}</main>
          <BottomNavBar />
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}
