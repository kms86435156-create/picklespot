"use client";

import { Navigation } from "lucide-react";

interface DirectionsButtonProps {
  lat: number;
  lng: number;
  name: string;
  className?: string;
}

export default function DirectionsButton({ lat, lng, name, className }: DirectionsButtonProps) {
  function handleClick() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const encodedName = encodeURIComponent(name);

    if (isMobile) {
      // Try Kakao Map app deeplink first, fallback to web
      window.location.href = `kakaomap://look?p=${lat},${lng}`;
      setTimeout(() => {
        window.open(`https://map.kakao.com/link/to/${encodedName},${lat},${lng}`, "_blank");
      }, 500);
    } else {
      window.open(`https://map.kakao.com/link/to/${encodedName},${lat},${lng}`, "_blank");
    }
  }

  return (
    <button
      onClick={handleClick}
      className={className || "flex items-center gap-1.5 px-4 py-2 text-sm text-brand-cyan border border-brand-cyan/30 rounded-lg hover:bg-brand-cyan/10 transition-colors"}
    >
      <Navigation className="w-4 h-4" /> 길찾기
    </button>
  );
}
