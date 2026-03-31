"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function AdminLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-muted hover:text-red-400 hover:bg-red-400/5 rounded-sm transition-colors"
    >
      <LogOut className="w-4 h-4" />
      로그아웃
    </button>
  );
}
