"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Props {
  variant?: "inline" | "sidebar" | "banner";
  context?: "tournament" | "venue" | "club" | "general";
}

const COPY = {
  tournament: {
    title: "이 대회를 운영하고 계신가요?",
    desc: "PBL.SYS로 접수, 참가자 관리, 정원 관리를 자동화하세요.",
    href: "/request?type=tournament",
    label: "대회 등록 요청",
  },
  venue: {
    title: "이 장소를 운영하고 계신가요?",
    desc: "장소 정보를 직접 관리하고 예약을 받아보세요.",
    href: "/request?type=court",
    label: "장소 등록 요청",
  },
  club: {
    title: "동호회를 운영하고 계신가요?",
    desc: "회원 모집, 대회 접수, 일정 관리를 무료로 시작하세요.",
    href: "/signup/organizer",
    label: "운영자로 가입하기",
  },
  general: {
    title: "동호회 운영자이신가요?",
    desc: "무료로 회원 관리 + 대회 접수를 시작하세요.",
    href: "/signup/organizer",
    label: "운영자로 가입하기",
  },
};

export default function OrganizerCTA({ variant = "sidebar", context = "general" }: Props) {
  const copy = COPY[context];

  if (variant === "banner") {
    return (
      <div className="bg-gradient-to-r from-brand-cyan/10 via-brand-cyan/5 to-brand-red/5 border border-brand-cyan/20 rounded-lg p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center gap-5">
          <div className="flex-1 text-center md:text-left">
            <p className="font-bold text-white mb-1">{copy.title}</p>
            <p className="text-sm text-text-muted">{copy.desc}</p>
          </div>
          <Link href={copy.href} className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-brand-cyan text-dark font-bold text-sm rounded hover:bg-brand-cyan/90 transition-colors">
            {copy.label} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (variant === "sidebar") {
    return (
      <div className="bg-brand-cyan/5 border border-brand-cyan/20 rounded-lg p-4">
        <p className="text-xs font-bold text-white mb-1">{copy.title}</p>
        <p className="text-[11px] text-text-muted mb-3">{copy.desc}</p>
        <Link href={copy.href} className="inline-flex items-center gap-1 text-xs text-brand-cyan hover:underline font-bold">
          {copy.label} <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    );
  }

  // inline
  return (
    <div className="flex items-center gap-3 bg-surface border border-ui-border rounded-lg p-4 hover:border-brand-cyan/20 transition-colors">
      <div className="flex-1">
        <p className="text-sm font-bold text-white">{copy.title}</p>
        <p className="text-xs text-text-muted">{copy.desc}</p>
      </div>
      <Link href={copy.href} className="shrink-0 text-xs text-brand-cyan hover:underline font-bold flex items-center gap-1">
        {copy.label} <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
