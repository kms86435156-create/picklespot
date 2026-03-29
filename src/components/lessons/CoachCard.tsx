"use client";

import { MapPin, Star, Clock } from "lucide-react";
import { useTilt } from "@/hooks/useTilt";
import TechCorners from "@/components/ui/TechCorners";
import ClipButton from "@/components/ui/ClipButton";
import { useToast } from "@/components/ui/Toast";
// Coach type passed as `any`

export default function CoachCard({ coach: c }: { coach: any }) {
  const { ref, handleMouseMove, handleMouseLeave } = useTilt(4);
  const { toast } = useToast();

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative bg-ui-bg/50 border border-ui-border rounded-sm p-5 card-grid-bg group hover:border-brand-cyan/30 transition-all h-full flex flex-col"
      style={{ transformStyle: "preserve-3d", transition: "transform 0.15s ease-out" }}
    >
      <TechCorners />

      {/* Profile */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-brand-cyan/15 border border-brand-cyan/20 rounded-sm flex items-center justify-center clip-angled shrink-0">
          <span className="text-brand-cyan font-bold text-lg">{c.name[0]}</span>
        </div>
        <div>
          <h3 className="font-bold text-base">{c.name}</h3>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="flex items-center gap-0.5">
              <Star className="w-3 h-3 text-yellow-400" />
              {c.rating} ({c.reviewCount})
            </span>
            <span>{c.experience}</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <p className="text-sm text-text-muted mb-3 leading-relaxed">{c.bio}</p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {c.specialties.map((s) => (
          <span key={s} className="text-[10px] px-2 py-0.5 bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan rounded-sm">
            {s}
          </span>
        ))}
      </div>

      <div className="space-y-1 text-xs text-text-muted mb-4">
        <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />{c.region}</div>
        <div className="flex items-center gap-1.5"><Clock className="w-3 h-3" />{c.sessionDuration} · {c.lessonType.join(", ")}</div>
      </div>

      {/* Price + CTA */}
      <div className="mt-auto flex items-center justify-between pt-3 border-t border-ui-border">
        <div>
          <span className="text-brand-cyan font-mono font-bold text-lg">₩{c.pricePerSession.toLocaleString()}</span>
          <span className="text-xs text-text-muted ml-1">/회</span>
        </div>
        <ClipButton
          type="button"
          variant="cyan"
          onClick={() => toast("레슨 신청이 접수되었습니다. 코치가 확인 후 연락드립니다.", "success")}
        >
          레슨 신청
        </ClipButton>
      </div>
    </div>
  );
}
