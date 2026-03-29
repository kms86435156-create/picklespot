"use client";

import TechCorners from "@/components/ui/TechCorners";

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-black mb-6">설정</h1>
      <div className="relative bg-ui-bg/40 border border-ui-border rounded-sm p-6">
        <TechCorners />
        <p className="text-text-muted text-sm">운영시간, 가격, 예약정책 설정 기능은 준비중입니다.</p>
      </div>
    </div>
  );
}
