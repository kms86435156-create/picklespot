"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Zap, MapPin, Users, User, type LucideIcon } from "lucide-react";

type Tab = {
  label: string;
  href: string;
  icon: LucideIcon;
  hot?: boolean;
  exact?: boolean;
};

const tabs: Tab[] = [
  { label: "홈", href: "/", icon: Home, exact: true },
  { label: "번개", href: "/matches", icon: Zap, hot: true },
  { label: "코트", href: "/courts", icon: MapPin },
  { label: "모임", href: "/clubs", icon: Users },
  { label: "MY", href: "/mypage", icon: User },
];

export default function BottomNavBar() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-dark/95 backdrop-blur-lg border-t border-ui-border"
      aria-label="하단 내비게이션"
    >
      {/* h-16 content area + pb-4 for safe area */}
      <div className="flex items-stretch h-16 pb-4">
        {tabs.map((tab) => {
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname === tab.href || pathname.startsWith(tab.href + "/");
          const Icon = tab.icon;

          if (tab.hot) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-all"
                aria-label={tab.label}
                aria-current={isActive ? "page" : undefined}
              >
                <span
                  className={`relative flex items-center justify-center transition-all ${
                    isActive
                      ? "text-brand-cyan drop-shadow-[0_0_8px_rgba(0,212,255,0.85)]"
                      : "text-text-muted"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {/* Ambient glow ring — only when active */}
                  {isActive && (
                    <span className="absolute inset-0 rounded-full bg-brand-cyan/20 blur-md scale-[2]" />
                  )}
                </span>
                <span
                  className={`text-[10px] font-bold leading-none transition-colors ${
                    isActive ? "text-brand-cyan" : "text-text-muted"
                  }`}
                >
                  ⚡{tab.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-all"
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={`w-5 h-5 transition-all ${
                  isActive ? "text-brand-cyan scale-110" : "text-text-muted"
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`text-[10px] font-medium leading-none transition-colors ${
                  isActive ? "text-brand-cyan" : "text-text-muted"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
