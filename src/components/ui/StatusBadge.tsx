"use client";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

const config: Record<string, { label: string; className: string }> = {
  open: { label: "모집중", className: "bg-brand-cyan/15 text-brand-cyan border-brand-cyan/30" },
  closing: { label: "마감임박", className: "bg-brand-red/15 text-brand-red border-brand-red/30 animate-pulse" },
  closed: { label: "마감", className: "bg-white/5 text-text-muted border-white/10" },
  full: { label: "마감", className: "bg-white/5 text-text-muted border-white/10" },
  waitlist: { label: "대기자 가능", className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  ongoing: { label: "진행중", className: "bg-green-500/15 text-green-400 border-green-500/30" },
  confirmed: { label: "신청 완료", className: "bg-brand-cyan/15 text-brand-cyan border-brand-cyan/30" },
  pending: { label: "대기중", className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  completed: { label: "완료", className: "bg-white/5 text-text-muted border-white/10" },
  cancelled: { label: "취소 완료", className: "bg-brand-red/15 text-brand-red border-brand-red/30" },
  refunding: { label: "환불 처리중", className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  registered: { label: "신청 완료", className: "bg-brand-cyan/15 text-brand-cyan border-brand-cyan/30" },
  waitlisted: { label: "대기자 등록", className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
};

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const { label, className } = config[status] || config.open;
  const sizeClass = size === "md" ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[11px]";
  return (
    <span className={`inline-flex items-center font-mono font-bold border rounded-sm ${sizeClass} ${className}`}>
      {label}
    </span>
  );
}
