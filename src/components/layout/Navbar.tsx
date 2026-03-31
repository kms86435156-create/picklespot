"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, User, LogOut, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/auth/AuthProvider";

const links = [
  { label: "대회", href: "/tournaments" },
  { label: "피클볼장", href: "/courts" },
  { label: "동호회", href: "/clubs" },
  { label: "번개", href: "/matches" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  // Poll unread messages
  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }
    function fetchUnread() {
      fetch("/api/messages/unread").then(r => r.json()).then(d => setUnreadCount(d.count || 0)).catch(() => {});
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, [user]);

  if (pathname.startsWith("/admin")) return null;

  async function handleLogout() {
    await logout();
    setUserMenuOpen(false);
    window.location.href = "/";
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-md border-b border-ui-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="inline-block w-7 h-7 bg-brand-cyan transform -skew-x-12 flex items-center justify-center">
            <span className="text-dark font-black text-[10px] skew-x-12 block leading-none pt-1 text-center">PBL</span>
          </span>
          <span className="font-mono font-bold text-base text-text-main tracking-tight">
            PBL<span className="text-brand-cyan">.SYS</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-1">
          {links.map((l) => {
            const isActive = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link key={l.href} href={l.href}
                className={`px-3 py-2 text-sm font-medium rounded-sm transition-colors ${
                  isActive ? "text-brand-cyan bg-brand-cyan/10" : "text-text-muted hover:text-white hover:bg-white/5"
                }`}>
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* Right side: chat + auth */}
        <div className="hidden lg:flex items-center gap-2">
          {loading ? (
            <div className="w-16 h-8" />
          ) : user ? (
            <>
              {/* Chat icon */}
              <Link href="/messages" className="relative p-2 text-text-muted hover:text-brand-cyan transition-colors">
                <MessageCircle className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 min-w-[18px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
              {/* User menu */}
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-muted hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                  <User className="w-4 h-4" />
                  <span className="max-w-[80px] truncate">{user.name}</span>
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 w-44 bg-surface border border-ui-border rounded-lg shadow-xl z-50 py-1">
                      <Link href="/mypage" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-muted hover:text-white hover:bg-white/5 transition-colors">
                        <User className="w-4 h-4" /> 마이페이지
                      </Link>
                      <Link href="/messages" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-muted hover:text-white hover:bg-white/5 transition-colors">
                        <MessageCircle className="w-4 h-4" /> 메시지
                        {unreadCount > 0 && <span className="ml-auto text-[10px] text-red-400 font-bold">{unreadCount}</span>}
                      </Link>
                      <button onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-text-muted hover:text-red-400 hover:bg-red-400/5 transition-colors">
                        <LogOut className="w-4 h-4" /> 로그아웃
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="px-3 py-1.5 text-sm text-text-muted hover:text-white transition-colors">
                로그인
              </Link>
              <Link href="/signup" className="px-3 py-1.5 text-sm bg-brand-cyan text-dark font-bold rounded-lg hover:bg-brand-cyan/90 transition-colors">
                회원가입
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="lg:hidden flex items-center gap-1">
          {user && (
            <Link href="/messages" className="relative p-2 text-text-muted hover:text-brand-cyan transition-colors">
              <MessageCircle className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          )}
          <button className="text-text-main p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={() => setOpen(!open)} aria-label="메뉴 열기">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-dark/95 backdrop-blur-lg border-b border-ui-border overflow-hidden">
            <div className="px-4 py-3 flex flex-col">
              {links.map((l) => {
                const isActive = pathname === l.href;
                return (
                  <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                    className={`py-3 px-3 text-base font-medium rounded-sm transition-colors min-h-[44px] flex items-center ${
                      isActive ? "text-brand-cyan bg-brand-cyan/10" : "text-text-muted hover:text-white"
                    }`}>
                    {l.label}
                  </Link>
                );
              })}
              <div className="border-t border-ui-border my-2" />
              {user ? (
                <>
                  <Link href="/messages" onClick={() => setOpen(false)}
                    className="py-3 px-3 text-base text-text-muted hover:text-white flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" /> 메시지
                    {unreadCount > 0 && <span className="text-xs text-red-400 font-bold ml-1">{unreadCount}</span>}
                  </Link>
                  <Link href="/mypage" onClick={() => setOpen(false)}
                    className="py-3 px-3 text-base text-text-muted hover:text-white flex items-center gap-2">
                    <User className="w-4 h-4" /> {user.name}
                  </Link>
                  <button onClick={() => { handleLogout(); setOpen(false); }}
                    className="py-3 px-3 text-base text-text-muted hover:text-red-400 flex items-center gap-2 text-left">
                    <LogOut className="w-4 h-4" /> 로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)}
                    className="py-3 px-3 text-base text-text-muted hover:text-white">로그인</Link>
                  <Link href="/signup" onClick={() => setOpen(false)}
                    className="py-3 px-3 text-base text-brand-cyan font-bold">회원가입</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
