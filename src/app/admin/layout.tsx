import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dark">
      {/* Admin sidebar */}
      <div className="flex">
        <aside className="w-56 bg-surface border-r border-ui-border min-h-screen p-4 hidden md:block shrink-0">
          <div className="mb-6">
            <Link href="/admin" className="font-mono font-bold text-brand-cyan text-sm">PBL.SYS</Link>
            <div className="text-[10px] text-text-muted font-mono mt-0.5">호스트센터</div>
          </div>
          <nav className="space-y-1">
            <AdminLink href="/admin" label="대시보드" />
            <div className="border-t border-ui-border my-3" />
            <div className="px-3 py-1 text-[10px] text-text-muted font-mono uppercase tracking-wider">데이터 관리</div>
            <AdminLink href="/admin/tournaments" label="대회 관리" />
            <AdminLink href="/admin/venues" label="장소 관리" />
            <AdminLink href="/admin/clubs" label="동호회 관리" />
            <div className="border-t border-ui-border my-3" />
            <div className="px-3 py-1 text-[10px] text-text-muted font-mono uppercase tracking-wider">운영</div>
            <AdminLink href="/admin/registrations" label="대회 접수 관리" />
            <AdminLink href="/admin/booking-requests" label="예약 요청 관리" />
            <AdminLink href="/admin/meetups" label="번개모임 관리" />
            <AdminLink href="/admin/leads" label="운영자 리드" />
            <AdminLink href="/admin/contents" label="콘텐츠 관리" />
            <div className="border-t border-ui-border my-3" />
            <AdminLink href="/" label="← 사이트로 돌아가기" />
          </nav>
        </aside>

        {/* Mobile nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-ui-border z-50 flex overflow-x-auto">
          <MobileLink href="/admin" label="홈" />
          <MobileLink href="/admin/tournaments" label="대회" />
          <MobileLink href="/admin/venues" label="장소" />
          <MobileLink href="/admin/clubs" label="동호회" />
          <MobileLink href="/admin/registrations" label="접수" />
          <MobileLink href="/admin/booking-requests" label="예약" />
          <MobileLink href="/admin/meetups" label="번개" />
        </div>

        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">{children}</main>
      </div>
    </div>
  );
}

function AdminLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="block px-3 py-2 text-sm text-text-muted hover:text-brand-cyan hover:bg-brand-cyan/5 rounded-sm transition-colors">
      {label}
    </Link>
  );
}

function MobileLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="flex-1 py-3 text-center text-xs text-text-muted hover:text-brand-cyan transition-colors">
      {label}
    </Link>
  );
}
