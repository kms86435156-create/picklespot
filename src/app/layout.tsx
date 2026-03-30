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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pickleball-platform.vercel.app";

export const metadata: Metadata = {
  title: "PBL.SYS — 피클볼 올인원 플랫폼",
  description:
    "전국 피클볼 대회 일정, 피클볼장 찾기, 동호회 탐색까지. 피클볼의 모든 것, 한 곳에서.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "PBL.SYS — 피클볼 올인원 플랫폼",
    description: "전국 피클볼 대회 일정, 피클볼장 찾기, 동호회 탐색까지. 피클볼의 모든 것, 한 곳에서.",
    type: "website",
    locale: "ko_KR",
    siteName: "PBL.SYS",
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
        <ClientProviders>
          <Navbar />
          <main className="min-h-screen pt-14">{children}</main>
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}
