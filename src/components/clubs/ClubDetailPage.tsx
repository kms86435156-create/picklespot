"use client";

import Link from "next/link";
import { Users, MapPin, Phone, MessageCircle, ExternalLink, ArrowLeft, Calendar } from "lucide-react";
import OrganizerCTA from "@/components/ui/OrganizerCTA";

function InfoItem({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  if (!value) return null;
  const inner = (
    <div className="flex items-start gap-3 py-3 border-b border-ui-border last:border-0">
      <div className="w-5 h-5 mt-0.5 text-brand-cyan shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-text-muted">{label}</p>
        <p className="text-sm text-white">{value}</p>
      </div>
    </div>
  );
  if (href) return <a href={href} target="_blank" rel="noopener" className="block hover:bg-brand-cyan/5 transition-colors">{inner}</a>;
  return inner;
}

export default function ClubDetailPage({ club: c }: { club: any }) {
  return (
    <div className="min-h-screen bg-dark pt-14">
      <div className="max-w-5xl mx-auto px-4 pt-4">
        <Link href="/clubs" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-brand-cyan transition-colors">
          <ArrowLeft className="w-4 h-4" /> 동호회 목록
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {c.isRecruiting !== false && <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-400/10 text-green-400">모집중</span>}
                <span className="text-xs text-text-muted">{c.region} {c.city}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{c.name}</h1>
            </div>

            <div className="bg-surface border border-ui-border rounded-lg p-5">
              <h2 className="text-sm font-bold text-text-muted mb-3 uppercase tracking-wider">동호회 정보</h2>
              <InfoItem icon={<MapPin className="w-4 h-4" />} label="활동 장소" value={c.homeVenue || c.meetingVenue || ""} />
              <InfoItem icon={<Users className="w-4 h-4" />} label="회원 수" value={c.memberCount ? `${c.memberCount}명` : ""} />
              <InfoItem icon={<Calendar className="w-4 h-4" />} label="활동 일정" value={c.meetingSchedule || ""} />
              <InfoItem icon={<Phone className="w-4 h-4" />} label="담당자" value={c.contactName ? `${c.contactName} · ${c.contactPhoneOrKakao || c.contactPhone || ""}` : ""} />
              {c.joinMethod && (
                <InfoItem icon={<MessageCircle className="w-4 h-4" />} label="가입 방법" value={c.joinMethod} />
              )}
              {(c.externalLink || c.website) && (
                <InfoItem icon={<ExternalLink className="w-4 h-4" />} label="외부 링크" value={c.externalLink || c.website} href={c.externalLink || c.website} />
              )}
            </div>

            {c.description && (
              <div className="bg-surface border border-ui-border rounded-lg p-5">
                <h2 className="text-sm font-bold text-text-muted mb-3 uppercase tracking-wider">소개</h2>
                <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">{c.description}</p>
              </div>
            )}

            {Array.isArray(c.tags) && c.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {c.tags.map((tag: string) => (
                  <span key={tag} className="text-xs px-3 py-1 bg-white/5 text-text-muted rounded-full">{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-20 space-y-4">
              <div className="bg-surface border border-ui-border rounded-lg p-5 text-center">
                <div className="w-16 h-16 bg-brand-cyan/10 border border-brand-cyan/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-brand-cyan" />
                </div>
                <h3 className="font-bold text-white mb-1">{c.name}</h3>
                <p className="text-xs text-text-muted mb-4">{c.region} {c.city} · {c.level || "전 급수"}</p>
                {(c.contactPhoneOrKakao || c.contactPhone) && (
                  <a href={`tel:${c.contactPhoneOrKakao || c.contactPhone}`}
                    className="block w-full py-2.5 bg-brand-cyan text-dark font-bold text-sm rounded hover:bg-brand-cyan/90 transition-colors mb-2">
                    연락하기
                  </a>
                )}
                {(c.externalLink || c.website) && (
                  <a href={c.externalLink || c.website} target="_blank" rel="noopener"
                    className="block w-full py-2.5 border border-ui-border text-white font-bold text-sm rounded hover:border-brand-cyan/30 transition-colors">
                    외부 페이지 방문
                  </a>
                )}
              </div>

              <OrganizerCTA variant="sidebar" context="club" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
