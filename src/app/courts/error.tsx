"use client";

import Link from "next/link";

export default function CourtsError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-4xl mb-4">🏸</div>
      <h2 className="text-xl font-black mb-2">코트 정보를 불러올 수 없습니다</h2>
      <p className="text-text-muted text-sm mb-4 max-w-md">
        {error.message || "데이터를 가져오는 중 문제가 발생했습니다."}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-4 py-2 text-sm font-bold bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 rounded-sm hover:bg-brand-cyan/20 transition-all"
        >
          다시 시도
        </button>
        <Link href="/" className="px-4 py-2 text-sm text-text-muted hover:text-white transition-colors">
          홈으로
        </Link>
      </div>
    </div>
  );
}
