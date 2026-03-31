"use client";

import Link from "next/link";
import { MapPin, Phone, Clock, Car, Home, ExternalLink, ArrowLeft, Trophy, ChevronRight } from "lucide-react";
import OrganizerCTA from "@/components/ui/OrganizerCTA";
import KakaoMap from "@/components/map/KakaoMap";
import DirectionsButton from "@/components/map/DirectionsButton";
import BookingSlotPicker from "@/components/venues/BookingSlotPicker";
import VenueReviews from "@/components/venues/VenueReviews";

function InfoItem({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  if (!value) return null;
  const content = (
    <div className="flex items-start gap-3 py-3 border-b border-ui-border last:border-0">
      <div className="w-5 h-5 mt-0.5 text-brand-cyan shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-text-muted">{label}</p>
        <p className="text-sm text-white break-all">{value}</p>
      </div>
    </div>
  );
  if (href) return <a href={href} target="_blank" rel="noopener" className="block hover:bg-brand-cyan/5 transition-colors">{content}</a>;
  return content;
}

export default function VenueDetailPage({ venue: v, nearbyTournaments }: { venue: any; nearbyTournaments: any[] }) {
  const typeLabel = v.indoorOutdoor || (v.type === "indoor" ? "실내" : v.type === "outdoor" ? "실외" : "실내+실외");

  return (
    <div className="min-h-screen bg-dark pt-14">
      <div className="max-w-5xl mx-auto px-4 pt-4">
        <Link href="/courts" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-brand-cyan transition-colors">
          <ArrowLeft className="w-4 h-4" /> 장소 목록
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-cyan/10 text-brand-cyan">{typeLabel}</span>
                <span className="text-xs text-text-muted">{v.region}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{v.name}</h1>
            </div>

            {/* Info card */}
            <div className="bg-surface border border-ui-border rounded-lg p-5">
              <h2 className="text-sm font-bold text-text-muted mb-3 uppercase tracking-wider">장소 정보</h2>
              <InfoItem icon={<MapPin className="w-4 h-4" />} label="주소" value={v.roadAddress || v.address || ""} />
              <InfoItem icon={<Phone className="w-4 h-4" />} label="전화" value={v.phone} href={v.phone ? `tel:${v.phone}` : undefined} />
              <InfoItem icon={<Clock className="w-4 h-4" />} label="운영시간" value={v.operatingHours} />
              <InfoItem icon={<Home className="w-4 h-4" />} label="코트" value={`${v.courtCount || "?"}면 · ${typeLabel}`} />
              <InfoItem icon={<Car className="w-4 h-4" />} label="주차" value={(v.parkingAvailable || v.hasParking) ? "주차 가능" : "주차 불가 또는 확인 필요"} />
              {v.mapLink && (
                <InfoItem icon={<ExternalLink className="w-4 h-4" />} label="지도" value="지도에서 보기" href={v.mapLink} />
              )}
            </div>

            {/* Map + Directions */}
            {v.lat && v.lng && (
              <div className="space-y-3">
                <KakaoMap
                  pins={[{ id: v.id, lat: v.lat, lng: v.lng, label: v.name, sub: v.address || v.roadAddress, type: "venue" }]}
                  height="250px"
                  level={4}
                />
                <DirectionsButton lat={v.lat} lng={v.lng} name={v.name} />
              </div>
            )}

            {/* Booking Slot Picker */}
            <BookingSlotPicker venueId={v.id} venueName={v.name} />

            {/* Amenities */}
            <div className="bg-surface border border-ui-border rounded-lg p-5">
              <h2 className="text-sm font-bold text-text-muted mb-3 uppercase tracking-wider">편의시설</h2>
              <div className="flex flex-wrap gap-2">
                {[
                  { check: v.parkingAvailable || v.hasParking, label: "주차장" },
                  { check: v.hasShower, label: "샤워실" },
                  { check: v.hasLighting, label: "야간조명" },
                  { check: v.hasEquipmentRental, label: "장비대여" },
                ].map(a => (
                  <span key={a.label} className={`text-xs px-3 py-1.5 rounded-lg border ${a.check ? "bg-brand-cyan/5 border-brand-cyan/20 text-brand-cyan" : "bg-white/2 border-ui-border text-text-muted/40"}`}>
                    {a.check ? "✓" : "✕"} {a.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            {v.description && (
              <div className="bg-surface border border-ui-border rounded-lg p-5">
                <h2 className="text-sm font-bold text-text-muted mb-3 uppercase tracking-wider">소개</h2>
                <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">{v.description}</p>
              </div>
            )}

            {/* Reviews */}
            <VenueReviews venueId={v.id} />

            {/* Nearby tournaments */}
            {nearbyTournaments.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-text-muted mb-3 uppercase tracking-wider flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-brand-cyan" /> 근처 대회
                </h2>
                <div className="space-y-2">
                  {nearbyTournaments.map(t => (
                    <Link key={t.id} href={`/tournaments/${t.id}`} className="block">
                      <div className="bg-surface border border-ui-border rounded-lg p-4 hover:border-brand-cyan/30 transition-all group flex items-center justify-between">
                        <div>
                          <p className="font-bold text-sm text-white group-hover:text-brand-cyan transition-colors">{t.title}</p>
                          <p className="text-xs text-text-muted mt-0.5">{t.startDate} · ₩{(t.entryFee || 0).toLocaleString()}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-text-muted" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-20 space-y-4">
              {/* Quick summary */}
              <div className="bg-surface border border-ui-border rounded-lg p-5">
                <h3 className="font-bold text-white text-center mb-3">{v.name}</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-text-muted">유형</span><span className="text-white">{typeLabel}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">코트</span><span className="text-white">{v.courtCount || "?"}면</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">주차</span><span className="text-white">{(v.parkingAvailable || v.hasParking) ? "가능" : "확인필요"}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">운영</span><span className="text-white">{v.operatingHours || "확인필요"}</span></div>
                </div>
                {v.phone && (
                  <a href={`tel:${v.phone}`} className="block mt-4 py-2.5 bg-brand-cyan text-dark font-bold text-sm rounded text-center hover:bg-brand-cyan/90 transition-colors">
                    전화하기
                  </a>
                )}
              </div>

              {/* CTA */}
              <OrganizerCTA variant="sidebar" context="venue" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
