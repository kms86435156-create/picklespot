"use client";

interface SystemLabelProps {
  text: string;
  color?: "cyan" | "red";
  ping?: boolean;
}

export default function SystemLabel({ text, color = "cyan", ping = true }: SystemLabelProps) {
  const dotColor = color === "cyan" ? "bg-brand-cyan" : "bg-brand-red";
  const textColor = color === "cyan" ? "text-brand-cyan" : "text-brand-red";

  return (
    <div className="flex items-center gap-2 font-mono text-xs tracking-widest uppercase">
      {ping && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping-slow absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-75`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`} />
        </span>
      )}
      <span className={textColor}>{text}</span>
    </div>
  );
}
