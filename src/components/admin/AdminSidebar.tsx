"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Trophy, MapPin, Users, ClipboardList,
  UserPlus, Megaphone, Settings, ExternalLink, Menu, X, Inbox,
} from "lucide-react";
import AdminLogoutButton from "./AdminLogoutButton";

const NAV_SECTIONS = [
  {
    label: null,
    items: [
      { href: "/admin/dashboard", label: "대시보드", icon: LayoutDashboard },
    ],
  },
  {
    label: "데이터 관리",
    items: [
      { href: "/admin/tournaments", label: "대회 관리", icon: Trophy },
      { href: "/admin/courts", label: "피클볼장 관리", icon: MapPin },
      { href: "/admin/clubs", label: "동호회 관리", icon: Users },
    ],
  },
  {
    label: "운영",
    items: [
      { href: "/admin/requests", label: "등록 요청", icon: Inbox },
      { href: "/admin/pre-registrations", label: "사전등록 신청", icon: UserPlus },
      { href: "/admin/registrations", label: "대회 접수 관리", icon: ClipboardList },
      { href: "/admin/notices", label: "공지/배너 관리", icon: Megaphone },
      { href: "/admin/settings", label: "설정", icon: Settings },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/admin/dashboard") return pathname === "/admin/dashboard" || pathname === "/admin";
    return pathname.startsWith(href);
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="mb-6">
        <Link href="/admin/dashboard" className="font-mono font-bold text-brand-cyan text-sm" onClick={() => setMobileOpen(false)}>
          PBL.SYS
        </Link>
        <div className="text-[10px] text-text-muted font-mono mt-0.5">호스트센터</div>
      </div>

      {/* Nav */}
      <nav className="space-y-1 flex-1">
        {NAV_SECTIONS.map((section, si) => (
          <div key={si}>
            {si > 0 && <div className="border-t border-ui-border my-3" />}
            {section.label && (
              <div className="px-3 py-1 text-[10px] text-text-muted font-mono uppercase tracking-wider">
                {section.label}
              </div>
            )}
            {section.items.map(item => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-sm transition-colors ${
                    active
                      ? "text-brand-cyan bg-brand-cyan/10 font-medium"
                      : "text-text-muted hover:text-brand-cyan hover:bg-brand-cyan/5"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-ui-border mt-3 pt-3 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-3 py-2 text-sm text-text-muted hover:text-brand-cyan hover:bg-brand-cyan/5 rounded-sm transition-colors"
          onClick={() => setMobileOpen(false)}
        >
          <ExternalLink className="w-4 h-4 shrink-0" />
          사이트로 돌아가기
        </Link>
        <AdminLogoutButton />
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-56 bg-surface border-r border-ui-border min-h-screen p-4 hidden md:flex flex-col shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-[60] bg-surface border border-ui-border rounded-lg p-2 text-text-muted hover:text-brand-cyan transition-colors"
        aria-label="메뉴 열기"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-[70]"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`md:hidden fixed top-0 left-0 h-full w-64 bg-surface border-r border-ui-border p-4 flex flex-col z-[80] transform transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-3 right-3 text-text-muted hover:text-white transition-colors"
          aria-label="메뉴 닫기"
        >
          <X className="w-5 h-5" />
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}
