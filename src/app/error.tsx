"use client";

import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  // Attempt to provide user-friendly error messages
  const message = getKoreanErrorMessage(error);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-4xl mb-4">⚠️</div>
      <h2 className="text-xl font-black mb-2">문제가 발생했습니다</h2>
      <p className="text-text-muted text-sm mb-4 max-w-md">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-4 py-2 text-sm font-bold bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 rounded-sm hover:bg-brand-cyan/20 transition-all"
        >
          다시 시도
        </button>
        <Link
          href="/"
          className="px-4 py-2 text-sm text-text-muted hover:text-white transition-colors border border-ui-border rounded-sm"
        >
          홈으로
        </Link>
      </div>
      {process.env.NODE_ENV === "development" && error.message && (
        <pre className="mt-6 text-xs text-text-muted/50 max-w-lg overflow-auto text-left bg-dark/50 p-3 rounded-sm border border-ui-border">
          {error.message}
        </pre>
      )}
    </div>
  );
}

function getKoreanErrorMessage(error: Error): string {
  const msg = error.message || "";

  if (msg.includes("fetch") || msg.includes("network") || msg.includes("ECONNREFUSED")) {
    return "네트워크 요청에 실패했습니다. 인터넷 연결을 확인하고 다시 시도해주세요.";
  }
  if (msg.includes("not found") || msg.includes("404")) {
    return "요청한 페이지 또는 데이터를 찾을 수 없습니다.";
  }
  if (msg.includes("timeout")) {
    return "서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.";
  }
  if (msg.includes("supabase") || msg.includes("database")) {
    return "데이터베이스 연결에 문제가 발생했습니다.";
  }
  if (msg.includes("Cannot read properties of") || msg.includes("undefined")) {
    return "페이지 데이터를 처리하는 중 오류가 발생했습니다.";
  }

  return msg || "알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
}
