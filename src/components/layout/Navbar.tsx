"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, User, LogOut, MessageCircle, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/auth/AuthProvider";

const links = [
  { label: "대회", href: "/tournaments" },
  { label: "피클볼장", href: "/courts" },
  { label: "동호회", href: "/clubs" },
  { label: "배우기", href: "/learn" },
  { label: "번개", href: "/matches" },
  { label: "커뮤니티", href: "/community" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  // Poll unread messages + notifications
  useEffect(() => {
    if (!user) { setUnreadCount(0); setNotifCount(0); return; }
    function fetchUnread() {
      fetch("/api/messages/unread").then(r => r.json()).then(d => setUnreadCount(d.count || 0)).catch(() => {});
      fetch("/api/notifications?countOnly=true").then(r => r.json()).then(d => setNotifCount(d.unreadCount || 0)).catch(() => {});
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, [user]);

  async function openNotifications() {
    setNotifOpen(!notifOpen);
    setUserMenuOpen(false);
    if (!notifOpen) {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data.notifications || []);
    }
  }

  async function markNotifRead(id: string, link?: string) {
    await fetch("/api/notifications", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setNotifCount(prev => Math.max(0, prev - 1));
    setNotifOpen(false);
    if (link) window.location.href = link;
  }

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setNotifCount(0);
  }

  function notifIcon(type: string) {
    if (type.startsWith("match_")) return "⚡";
    if (type.startsWith("chat_")) return "💬";
    if (type.startsWith("club_")) return "👥";
    if (type.startsWith("tournament_")) return "🏆";
    return "🔔";
  }

  function timeAgo(d: string) {
    if (!d) return "";
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "방금";
    if (m < 60) return `${m}분 전`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}시간 전`;
    return `${Math.floor(h / 24)}일 전`;
  }

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
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
              {/* Bell icon + dropdown */}
              <div className="relative">
                <button onClick={openNotifications} className="relative p-2 text-text-muted hover:text-brand-cyan transition-colors">
                  <Bell className="w-5 h-5" />
                  {notifCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                      {notifCount > 9 ? "9+" : notifCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 w-80 bg-surface border border-ui-border rounded-lg shadow-xl z-50 max-h-[420px] flex flex-col">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-ui-border">
                        <span className="text-sm font-bold text-white">알림</span>
                        {notifCount > 0 && (
                          <button onClick={markAllRead} className="text-[10px] text-brand-cyan hover:underline">모두 읽음</button>
                        )}
                      </div>
                      <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                          <p className="text-sm text-text-muted text-center py-8">알림이 없습니다</p>
                        ) : (
                          notifications.slice(0, 20).map(n => (
                            <button key={n.id} onClick={() => markNotifRead(n.id, n.link)}
                              className={`w-full text-left px-4 py-3 border-b border-ui-border/50 hover:bg-white/5 transition-colors ${!n.isRead ? "bg-brand-cyan/5" : ""}`}>
                              <div className="flex items-start gap-2.5">
                                <span className="text-base mt-0.5">{notifIcon(n.type)}</span>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs font-medium leading-snug ${!n.isRead ? "text-white" : "text-text-muted"}`}>{n.title}</p>
                                  <p className="text-[11px] text-text-muted/70 mt-0.5 line-clamp-2">{n.message}</p>
                                  <p className="text-[10px] text-text-muted/40 mt-1">{timeAgo(n.createdAt)}</p>
                                </div>
                                {!n.isRead && <span className="w-2 h-2 bg-brand-cyan rounded-full mt-1.5 shrink-0" />}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                      <Link href="/notifications" onClick={() => setNotifOpen(false)}
                        className="block text-center text-xs text-brand-cyan hover:underline py-2.5 border-t border-ui-border">
                        전체 보기
                      </Link>
                    </div>
                  </>
                )}
              </div>
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
            <>
            <Link href="/messages" className="relative p-2 text-text-muted hover:text-brand-cyan transition-colors">
              <MessageCircle className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
            <Link href="/notifications" className="relative p-2 text-text-muted hover:text-brand-cyan transition-colors">
              <Bell className="w-5 h-5" />
              {notifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                  {notifCount > 9 ? "9+" : notifCount}
                </span>
              )}
            </Link>
            </>
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
