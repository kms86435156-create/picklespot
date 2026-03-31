"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PromoBanners() {
  const [banners, setBanners] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch("/api/banners")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setBanners(data); })
      .catch(() => {});
  }, []);

  // 자동 전환 (5초)
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const goTo = useCallback((idx: number) => {
    setCurrent(((idx % banners.length) + banners.length) % banners.length);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const banner = banners[current];

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="relative rounded-lg overflow-hidden border border-ui-border group">
        <a href={banner.linkUrl || "#"} target={banner.linkUrl ? "_blank" : undefined} rel="noopener noreferrer" className="block">
          {banner.imageUrl ? (
            <img src={banner.imageUrl} alt={banner.title || "배너"} className="w-full h-32 sm:h-44 md:h-52 object-cover" />
          ) : (
            <div className="w-full h-32 sm:h-44 md:h-52 bg-gradient-to-r from-brand-cyan/10 to-brand-red/5 flex items-center justify-center">
              <p className="text-lg font-bold text-white">{banner.title}</p>
            </div>
          )}
        </a>

        {/* 네비게이션 */}
        {banners.length > 1 && (
          <>
            <button onClick={() => goTo(current - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => goTo(current + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70">
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* 인디케이터 */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {banners.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)} className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-brand-cyan" : "bg-white/30"}`} />
              ))}
            </div>
          </>
        )}

        {/* 타이틀 오버레이 */}
        {banner.title && banner.imageUrl && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3 pointer-events-none">
            <p className="text-sm font-bold text-white">{banner.title}</p>
          </div>
        )}
      </div>
    </div>
  );
}
