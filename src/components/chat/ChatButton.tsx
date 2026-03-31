"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { MessageCircle } from "lucide-react";

interface ChatButtonProps {
  targetUserId: string;
  context?: string;
  label?: string;
  className?: string;
}

export default function ChatButton({ targetUserId, context, label = "메시지 보내기", className }: ChatButtonProps) {
  const router = useRouter();
  const { user } = useAuth();

  if (!user || user.id === targetUserId) return null;

  async function handleClick() {
    const res = await fetch("/api/chat/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId, context: context || "" }),
    });
    const data = await res.json();
    if (data.conversation) {
      router.push(`/messages/${data.conversation.id}`);
    } else if (res.status === 401) {
      router.push("/login?from=/messages");
    }
  }

  return (
    <button
      onClick={handleClick}
      className={className || "flex items-center justify-center gap-1.5 w-full py-2.5 border border-brand-cyan/30 text-brand-cyan font-bold text-sm rounded hover:bg-brand-cyan/10 transition-colors"}
    >
      <MessageCircle className="w-4 h-4" /> {label}
    </button>
  );
}
