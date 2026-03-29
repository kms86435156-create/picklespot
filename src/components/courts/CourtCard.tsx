"use client";

import { MapPin, Star, ChevronDown } from "lucide-react";
import TechCorners from "@/components/ui/TechCorners";
import ClipButton from "@/components/ui/ClipButton";
import TimeSlotPicker from "./TimeSlotPicker";
// Court type passed as `any`

interface CourtCardProps {
  court: any;
  expanded: boolean;
  onSelect: () => void;
}

const typeLabels: Record<string, string> = {
  indoor: "실내",
  outdoor: "실외",
  both: "실내/실외",
};

export default function CourtCard({ court: c, expanded, onSelect }: CourtCardProps) {
  return (
    <div className={`relative bg-ui-bg/40 border rounded-sm transition-all ${expanded ? "border-brand-cyan/40" : "border-ui-border hover:border-brand-cyan/20"}`}>
      <TechCorners />

      {/* Main info */}
      <button onClick={onSelect} className="w-full text-left p-4 md:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="font-bold text-base">{c.name}</h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 rounded-sm">
                {typeLabels[c.type]}
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-text-muted mb-2">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{c.address}</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400" />
                {c.rating} ({c.reviewCount})
              </span>
              <span>코트 {c.courtCount}면</span>
              <span>₩{c.pricePerHour.toLocaleString()}/시간</span>
              <span>{c.operatingHours}</span>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-text-muted transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`} />
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {c.amenities.map((a) => (
            <span key={a} className="text-[10px] px-2 py-0.5 bg-white/5 border border-ui-border rounded-sm text-text-muted">
              {a}
            </span>
          ))}
        </div>
      </button>

      {/* Expanded: Time slots */}
      {expanded && (
        <div className="border-t border-ui-border p-4 md:p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold">시간 선택</span>
            <span className="text-xs text-text-muted font-mono">오늘 기준</span>
          </div>
          <TimeSlotPicker slots={c.availableSlots} />
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4 text-[10px] text-text-muted">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-brand-cyan/60 rounded-sm" /> 예약 가능</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-yellow-500/60 rounded-sm" /> 인기 시간</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-white/10 rounded-sm" /> 예약 마감</span>
            </div>
            <ClipButton variant="cyan">예약하기</ClipButton>
          </div>
        </div>
      )}
    </div>
  );
}
