"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { label: "대회", href: "/tournaments" },
  { label: "피클볼장", href: "/courts" },
  { label: "동호회", href: "/clubs" },
  { label: "같이치기", href: "/play-together" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

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
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-2 text-sm font-medium rounded-sm transition-colors ${
                  isActive
                    ? "text-brand-cyan bg-brand-cyan/10"
                    : "text-text-muted hover:text-white hover:bg-white/5"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden text-text-main p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
          onClick={() => setOpen(!open)}
          aria-label="메뉴 열기"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-dark/95 backdrop-blur-lg border-b border-ui-border overflow-hidden"
          >
            <div className="px-4 py-3 flex flex-col">
              {links.map((l) => {
                const isActive = pathname === l.href;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={`py-3 px-3 text-base font-medium rounded-sm transition-colors min-h-[44px] flex items-center ${
                      isActive
                        ? "text-brand-cyan bg-brand-cyan/10"
                        : "text-text-muted hover:text-white"
                    }`}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
