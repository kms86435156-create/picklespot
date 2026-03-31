"use client";

import { useEffect, useRef, useState, useCallback } from "react";

declare global {
  interface Window {
    kakao: any;
  }
}

export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  label: string;
  sub?: string;
  type?: "venue" | "match";
}

interface KakaoMapProps {
  pins: MapPin[];
  center?: { lat: number; lng: number };
  level?: number;
  height?: string;
  onPinClick?: (pin: MapPin) => void;
  showMyLocation?: boolean;
  className?: string;
}

export default function KakaoMap({
  pins,
  center,
  level = 8,
  height = "400px",
  onPinClick,
  showMyLocation,
  className = "",
}: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const overlayRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [noApiKey, setNoApiKey] = useState(false);
  const myPosRef = useRef<{ lat: number; lng: number } | null>(null);

  // Initialize map
  useEffect(() => {
    if (!window.kakao?.maps) {
      // Check if SDK script exists but not loaded yet
      if (!process.env.NEXT_PUBLIC_KAKAO_MAP_KEY) {
        setNoApiKey(true);
        return;
      }
      // Wait for SDK load
      const check = setInterval(() => {
        if (window.kakao?.maps) {
          clearInterval(check);
          initMap();
        }
      }, 200);
      const timeout = setTimeout(() => { clearInterval(check); setNoApiKey(true); }, 5000);
      return () => { clearInterval(check); clearTimeout(timeout); };
    }
    initMap();
  }, []);

  function initMap() {
    if (!containerRef.current || mapRef.current) return;
    window.kakao.maps.load(() => {
      const defaultCenter = center || (pins[0] ? { lat: pins[0].lat, lng: pins[0].lng } : { lat: 37.5665, lng: 126.978 });
      const mapCenter = new window.kakao.maps.LatLng(defaultCenter.lat, defaultCenter.lng);
      const map = new window.kakao.maps.Map(containerRef.current, {
        center: mapCenter,
        level,
      });
      // Dark map style (custom overlay for dark feel isn't native to Kakao, but we can adjust)
      mapRef.current = map;
      setMapReady(true);
    });
  }

  // Update pins when map is ready or pins change
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    // Clear old markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    if (overlayRef.current) { overlayRef.current.setMap(null); overlayRef.current = null; }

    // Add markers
    pins.forEach(pin => {
      if (!pin.lat || !pin.lng) return;
      const position = new window.kakao.maps.LatLng(pin.lat, pin.lng);

      const markerImage = pin.type === "match"
        ? new window.kakao.maps.MarkerImage(
            "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
            new window.kakao.maps.Size(24, 35)
          )
        : undefined;

      const marker = new window.kakao.maps.Marker({
        position,
        map,
        title: pin.label,
        ...(markerImage ? { image: markerImage } : {}),
      });

      window.kakao.maps.event.addListener(marker, "click", () => {
        // Close existing overlay
        if (overlayRef.current) overlayRef.current.setMap(null);

        if (onPinClick) {
          onPinClick(pin);
        }

        // Show info overlay
        const content = `
          <div style="background:#1e293b;border:1px solid #334155;border-radius:8px;padding:10px 14px;min-width:160px;box-shadow:0 4px 12px rgba(0,0,0,0.4);">
            <p style="color:#fff;font-weight:700;font-size:13px;margin:0 0 4px;">${pin.label}</p>
            ${pin.sub ? `<p style="color:#94a3b8;font-size:11px;margin:0;">${pin.sub}</p>` : ""}
            <div style="margin-top:8px;text-align:right;">
              <a href="/courts/${pin.id}" style="color:#06b6d4;font-size:11px;font-weight:700;text-decoration:none;">상세보기 →</a>
            </div>
          </div>
        `;
        const overlay = new window.kakao.maps.CustomOverlay({
          content,
          position,
          yAnchor: 1.3,
        });
        overlay.setMap(map);
        overlayRef.current = overlay;
      });

      markersRef.current.push(marker);
    });

    // Fit bounds if multiple pins
    if (pins.length > 1) {
      const bounds = new window.kakao.maps.LatLngBounds();
      pins.forEach(p => {
        if (p.lat && p.lng) bounds.extend(new window.kakao.maps.LatLng(p.lat, p.lng));
      });
      map.setBounds(bounds);
    }
  }, [mapReady, pins, onPinClick]);

  // My location
  const handleMyLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        myPosRef.current = { lat: latitude, lng: longitude };
        if (mapRef.current) {
          const loc = new window.kakao.maps.LatLng(latitude, longitude);
          mapRef.current.setCenter(loc);
          mapRef.current.setLevel(5);

          // Add my location marker
          const marker = new window.kakao.maps.Marker({
            position: loc,
            map: mapRef.current,
            image: new window.kakao.maps.MarkerImage(
              "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
              new window.kakao.maps.Size(30, 35)
            ),
          });
          markersRef.current.push(marker);
        }
      },
      () => alert("위치 정보를 가져올 수 없습니다."),
      { enableHighAccuracy: true }
    );
  }, []);

  if (noApiKey) {
    return (
      <div className={`bg-surface border border-ui-border rounded-lg flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center p-6">
          <p className="text-text-muted text-sm mb-1">지도를 표시하려면 카카오맵 API 키가 필요합니다</p>
          <p className="text-text-muted/50 text-xs">환경변수 NEXT_PUBLIC_KAKAO_MAP_KEY를 설정해주세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden border border-ui-border ${className}`} style={{ height }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      {showMyLocation && (
        <button
          onClick={handleMyLocation}
          className="absolute bottom-4 right-4 z-10 px-3 py-2 bg-dark/90 border border-ui-border rounded-lg text-xs text-white hover:bg-surface hover:border-brand-cyan/30 transition-colors flex items-center gap-1.5 shadow-lg"
        >
          <svg className="w-4 h-4 text-brand-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="3" /><path d="M12 2v4m0 12v4M2 12h4m12 0h4" /></svg>
          내 위치
        </button>
      )}
      {!mapReady && (
        <div className="absolute inset-0 bg-surface flex items-center justify-center">
          <div className="text-text-muted text-sm animate-pulse">지도 로딩 중...</div>
        </div>
      )}
    </div>
  );
}

/** Calculate distance between two coordinates in km */
export function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
