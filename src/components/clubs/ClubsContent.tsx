"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Users, MapPin, Calendar, Phone, MessageCircle, ExternalLink, Search, Filter } from "lucide-react";
import Link from "next/link";

const REGIONS = ["전체", "서울", "경기", "인천", "부산", "대구", "대전", "광주", "울산", "세종", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"];
const LEVELS = ["전체", "입문~초급", "초급~중급", "중급~상급", "전 급수"];

interface ClubsContentProps {
  clubs: any[];
}

export default function ClubsContent({ clubs }: ClubsContentProps) {
  const [region, setRegion] = useState("전체");
  const [level, setLevel] = useState("전체");
  const [keyword, setKeyword] = useState("");
  const [recruitingOnly, setRecruitingOnly] = useState(false);

  const filtered = useMemo(() => {
    return clubs.filter(c => {
      if (region !== "전체" && c.region !== region) return false;
      if (level !== "전체" && c.level !== level) return false;
      if (recruitingOnly && !c.isRecruiting) return false;
      if (keyword && !c.name.includes(keyword) && !c.description?.includes(keyword) && !c.city?.includes(keyword)) return false;
      return true;
    });
  }, [clubs, region, level, keyword, recruitingOnly]);

  const recruitingCount = clubs.filter(c => c.isRecruiting).length;

  return (
    <div className="min-h-screen bg-dark pt-14">
      {/* Hero */}
      <div className="bg-gradient-to-b from-brand-cyan/5 to-transparent border-b border-ui-border">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-brand-cyan/10 border border-brand-cyan/30 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-brand-cyan" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">피클볼 동호회</h1>
              <p className="text-sm text-text-muted">전국 피클볼 동호회를 찾아보세요</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex gap-6 mt-4 text-sm">
            <div>
              <span className="text-brand-cyan font-bold text-lg">{clubs.length}</span>
              <span className="text-text-muted ml-1">개 동호회</span>
            </div>
            <div>
              <span className="text-green-400 font-bold text-lg">{recruitingCount}</span>
              <span className="text-text-muted ml-1">개 모집중</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-surface border border-ui-border rounded-lg p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="동호회 이름, 지역 검색..."
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-dark border border-ui-border rounded text-sm text-white placeholder:text-text-muted focus:border-brand-cyan focus:outline-none"
              />
            </div>
            <select
              value={region}
              onChange={e => setRegion(e.target.value)}
              className="px-3 py-2 bg-dark border border-ui-border rounded text-sm text-white focus:border-brand-cyan focus:outline-none"
            >
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select
              value={level}
              onChange={e => setLevel(e.target.value)}
              className="px-3 py-2 bg-dark border border-ui-border rounded text-sm text-white focus:border-brand-cyan focus:outline-none"
            >
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-text-muted hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={recruitingOnly}
                onChange={e => setRecruitingOnly(e.target.checked)}
                className="accent-brand-cyan"
              />
              모집중만
            </label>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-text-muted mb-4">{filtered.length}개 동호회</p>

        {/* Club Grid */}
        {filtered.length === 0 ? (
          <div className="bg-surface border border-ui-border rounded-lg p-12 text-center">
            <Users className="w-12 h-12 text-text-muted/20 mx-auto mb-3" />
            <p className="text-text-muted font-medium mb-1">
              {clubs.length === 0 ? "아직 등록된 동호회가 없습니다" : "조건에 맞는 동호회가 없습니다"}
            </p>
            <p className="text-xs text-text-muted/70 mb-4">
              {clubs.length === 0 ? "첫 번째 동호회를 등록해보세요!" : "다른 조건으로 검색하거나, 동호회를 등록해보세요."}
            </p>
            <Link href="/signup/organizer" className="inline-flex items-center gap-1 text-sm text-brand-cyan hover:underline font-bold">
              동호회 등록하기 →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((club, i) => (
              <motion.div
                key={club.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
              <Link href={`/clubs/${club.id}`} className="block bg-surface border border-ui-border rounded-lg overflow-hidden hover:border-brand-cyan/30 transition-colors group">
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white group-hover:text-brand-cyan transition-colors">{club.name}</h3>
                        {club.isVerified && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-brand-cyan/10 text-brand-cyan rounded">인증</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-text-muted mt-1">
                        <MapPin className="w-3 h-3" />
                        <span>{club.region} {club.city}</span>
                      </div>
                    </div>
                    {club.isRecruiting ? (
                      <span className="text-[11px] px-2 py-1 bg-green-400/10 text-green-400 rounded-full font-medium">모집중</span>
                    ) : (
                      <span className="text-[11px] px-2 py-1 bg-ui-border text-text-muted rounded-full">마감</span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-text-muted line-clamp-2 mb-4">{club.description}</p>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-text-muted">
                      <Users className="w-3 h-3 text-brand-cyan" />
                      <span>회원 {club.memberCount}명</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-text-muted">
                      <Filter className="w-3 h-3 text-brand-cyan" />
                      <span>{club.level || "전 급수"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-text-muted col-span-2">
                      <Calendar className="w-3 h-3 text-brand-cyan" />
                      <span>{club.meetingSchedule || "일정 문의"}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {Array.isArray(club.tags) && club.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {club.tags.slice(0, 4).map((tag: string) => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-white/5 text-text-muted rounded">{tag}</span>
                      ))}
                    </div>
                  )}

                  {/* Fee + Contact */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-ui-border">
                    <span className="text-xs text-text-muted">{club.fee || "회비 문의"}</span>
                    <div className="flex gap-2">
                      {club.contactPhone && (
                        <a href={`tel:${club.contactPhone}`} className="text-text-muted hover:text-brand-cyan transition-colors">
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                      {club.contactKakao && (
                        <span title={`카카오: ${club.contactKakao}`} className="text-text-muted hover:text-yellow-400 cursor-pointer transition-colors">
                          <MessageCircle className="w-4 h-4" />
                        </span>
                      )}
                      {club.website && (
                        <a href={club.website} target="_blank" rel="noopener" className="text-text-muted hover:text-brand-cyan transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA for club owners */}
        <div className="mt-12 bg-gradient-to-r from-brand-cyan/10 to-brand-red/5 border border-brand-cyan/20 rounded-lg p-6 md:p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">동호회를 운영하고 계신가요?</h2>
          <p className="text-sm text-text-muted mb-4">PBL.SYS에 무료로 동호회를 등록하고, 회원 모집부터 대회 접수까지 한 곳에서 관리하세요.</p>
          <Link
            href="/clubs/create"
            className="inline-block px-6 py-3 bg-brand-cyan text-dark font-bold text-sm rounded hover:bg-brand-cyan/90 transition-colors"
          >
            운영자로 가입하고 동호회 등록하기
          </Link>
        </div>
      </div>
    </div>
  );
}
