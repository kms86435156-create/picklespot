"use client";

interface MetricBoxProps {
  value: string;
  label: string;
  accent?: "cyan" | "red";
}

export default function MetricBox({ value, label, accent = "cyan" }: MetricBoxProps) {
  const borderColor = accent === "cyan" ? "border-brand-cyan/30" : "border-brand-red/30";
  const valueColor = accent === "cyan" ? "text-brand-cyan" : "text-brand-red";

  return (
    <div className={`border-l-2 ${borderColor} pl-3 py-1`}>
      <div className={`text-2xl font-black ${valueColor} font-mono`}>{value}</div>
      <div className="text-xs text-text-muted font-mono uppercase tracking-wider">{label}</div>
    </div>
  );
}
