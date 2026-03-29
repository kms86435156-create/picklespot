"use client";

import { ArrowRight } from "lucide-react";

interface ClipButtonProps {
  children: React.ReactNode;
  variant?: "cyan" | "red";
  size?: "md" | "lg";
  arrow?: boolean;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}

export default function ClipButton({
  children,
  variant = "cyan",
  size = "md",
  arrow = false,
  className = "",
  onClick,
  type = "button",
  disabled = false,
}: ClipButtonProps) {
  const base =
    variant === "cyan"
      ? "bg-brand-cyan text-dark hover:bg-brand-cyan/90"
      : "bg-brand-red text-white hover:bg-brand-red/90";

  const sizeClass = size === "lg" ? "px-8 py-4 text-xl" : "px-6 py-3 text-sm";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`clip-angled font-black uppercase tracking-wider transition-all duration-200 inline-flex items-center gap-2 ${base} ${sizeClass} ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {children}
      {arrow && <ArrowRight className="w-5 h-5" />}
    </button>
  );
}
