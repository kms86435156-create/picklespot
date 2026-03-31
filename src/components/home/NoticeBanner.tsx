"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Megaphone, X } from "lucide-react";

export default function NoticeBanner() {
  const [notice, setNotice] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/notices")
      .then(r => r.json())
      .then(data => {
        // 고정(pinned) 공지 중 첫 번째
        const pinned = data.find((n: any) => n.isPinned);
        if (pinned) setNotice(pinned);
      })
      .catch(() => {});
  }, []);

  if (!notice || dismissed) return null;

  return (
    <div className="bg-brand-cyan/5 border-b border-brand-cyan/20">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        <Link href="/notices" className="flex items-center gap-2 min-w-0 group">
          <Megaphone className="w-4 h-4 text-brand-cyan shrink-0" />
          <span className="text-sm text-white font-medium truncate group-hover:text-brand-cyan transition-colors">
            {notice.title}
          </span>
          <span className="text-[10px] text-brand-cyan shrink-0 hidden sm:inline">자세히 보기 →</span>
        </Link>
        <button onClick={() => setDismissed(true)} className="p-1 text-text-muted hover:text-white transition-colors shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
