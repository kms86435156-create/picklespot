import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-4xl mb-4">🔍</div>
      <h2 className="text-xl font-black mb-2">페이지를 찾을 수 없습니다</h2>
      <p className="text-text-muted text-sm mb-4">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
      <Link href="/" className="px-4 py-2 text-sm font-bold bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 rounded-sm hover:bg-brand-cyan/20 transition-all">
        홈으로 돌아가기
      </Link>
    </div>
  );
}
