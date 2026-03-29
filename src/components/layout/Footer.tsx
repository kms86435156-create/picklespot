"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-ui-border bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Links */}
        <div className="flex flex-wrap gap-4 mb-4 text-xs text-text-muted">
          <Link href="/tournaments" className="hover:text-brand-cyan transition-colors">대회</Link>
          <Link href="/play-together" className="hover:text-brand-cyan transition-colors">같이치기</Link>
          <Link href="/courts" className="hover:text-brand-cyan transition-colors">코트예약</Link>
          <Link href="/lessons" className="hover:text-brand-cyan transition-colors">레슨</Link>
          <Link href="/community" className="hover:text-brand-cyan transition-colors">커뮤니티</Link>
          <Link href="/learn" className="hover:text-brand-cyan transition-colors">배우기</Link>
        </div>

        {/* Status */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs font-mono text-text-muted pt-4 border-t border-ui-border">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-[10px] text-text-muted/50">데이터: 수동 등록 기준</span>
          </div>
          <div className="flex items-center gap-4">
            <span>© 2026 PBL.SYS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
