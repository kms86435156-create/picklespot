"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Heart, Plus, Pin, Eye, MapPin, Image as ImageIcon, Bell, ArrowUpDown } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import TabBar from "@/components/ui/TabBar";
import TechCorners from "@/components/ui/TechCorners";
import ClipButton from "@/components/ui/ClipButton";
import FilterBar from "@/components/ui/FilterBar";
import { useToast } from "@/components/ui/Toast";

/* ── 데이터 타입 ── */
interface Post {
  id: string;
  category: string;
  title: string;
  author: string;
  authorRegion?: string;
  excerpt: string;
  likes: number;
  comments: number;
  views: number;
  createdAt: string;
  region?: string;
  pinned?: boolean;
  images?: number;
  relatedEvent?: string;
}

interface Notice {
  id: string;
  type: "운영" | "대회" | "클럽";
  title: string;
  date: string;
  pinned: boolean;
  important: boolean;
}

/* ── Mock 데이터 ── */
const notices: Notice[] = [
  { id: "n1", type: "운영", title: "서비스 점검 안내 (4/5 02:00~06:00)", date: "2026-03-28", pinned: true, important: true },
  { id: "n2", type: "대회", title: "2026 전국 피클볼 오픈 대회 규정 변경 안내", date: "2026-03-27", pinned: true, important: true },
  { id: "n3", type: "운영", title: "활동점수 산정 기준 업데이트 (3월)", date: "2026-03-25", pinned: false, important: false },
  { id: "n4", type: "클럽", title: "인천 청라 '스매시' 동호회 정기 모임 장소 변경", date: "2026-03-23", pinned: false, important: false },
  { id: "n5", type: "대회", title: "부산 해운대컵 마감 임박 — 잔여 2자리", date: "2026-03-22", pinned: false, important: false },
  { id: "n6", type: "운영", title: "신규 코트 등록: 강남 피클볼 아레나", date: "2026-03-20", pinned: false, important: false },
];

const posts: Post[] = [
  { id: "p1", category: "자유", title: "피클볼 3개월 차 후기 — 진작 시작할 걸", author: "김민지", authorRegion: "서울", excerpt: "테니스 10년 치다가 피클볼로 넘어왔는데 재미가 완전 다르네요. 부상도 적고, 초보도 바로 랠리가 되니까 성취감이 빠릅니다.", likes: 24, comments: 8, views: 312, createdAt: "2시간 전" },
  { id: "p2", category: "후기", title: "인천 청라 월례전 참가 후기 + 사진", author: "이정호", authorRegion: "인천", excerpt: "이번 달 월례전 복식에서 3위 했습니다! 파트너랑 호흡이 잘 맞아서 풀세트까지 가는 경기가 많았어요.", likes: 41, comments: 15, views: 567, createdAt: "5시간 전", region: "인천", images: 4, relatedEvent: "인천 청라 월례전" },
  { id: "p3", category: "질문", title: "D에서 C로 올라가려면 뭘 연습해야 하나요?", author: "최수연", authorRegion: "경기", excerpt: "3개월째 D인데 도무지 올라갈 기미가 안 보입니다. 서브? 딩크? 뭐부터 연습해야 할까요?", likes: 12, comments: 22, views: 445, createdAt: "8시간 전" },
  { id: "p4", category: "장비", title: "조로스 패들 vs 셀커크 비교 리뷰", author: "박준호", authorRegion: "서울", excerpt: "두 패들 모두 2주씩 써봤습니다. 컨트롤은 셀커크가, 파워는 조로스가 확실히 우위.", likes: 67, comments: 18, views: 892, createdAt: "1일 전", images: 2 },
  { id: "p5", category: "자유", title: "부수 C에서 B로 올린 비결 공유합니다", author: "오정훈", authorRegion: "서울", excerpt: "6개월 동안 의식적으로 연습한 3가지: 서드샷 드롭, 딩크 패턴, 스플릿스텝. 이 세 가지가 부수를 바꿨습니다.", likes: 89, comments: 31, views: 1203, createdAt: "2일 전", pinned: true },
  { id: "p6", category: "동호회", title: "[서울 강남] 매주 화목 번개 정기 모임 안내", author: "강남피클볼", authorRegion: "서울", excerpt: "매주 화, 목 저녁 7시 강남 피클볼 아레나에서 정기 번개 진행합니다. C 이상 환영!", likes: 15, comments: 7, views: 234, createdAt: "2일 전", region: "서울" },
  { id: "p7", category: "후기", title: "해운대 피클볼 아레나 방문 후기", author: "정수현", authorRegion: "부산", excerpt: "실내 6면 + 실외 4면 규모가 어마어마합니다. 바다 보면서 야외에서 치는 느낌이 최고.", likes: 34, comments: 9, views: 478, createdAt: "3일 전", region: "부산", images: 6 },
  { id: "p8", category: "질문", title: "실내용 신발 추천 좀 해주세요", author: "김영숙", authorRegion: "경기", excerpt: "배드민턴 신발 신고 있는데 피클볼 전용 신발이 따로 있나요? 실내 코트에서 미끄러짐이 좀 있어서요.", likes: 8, comments: 14, views: 198, createdAt: "3일 전" },
  { id: "p9", category: "모집", title: "[대전] 주말 복식 정기 파트너 구합니다", author: "정하늘", authorRegion: "대전", excerpt: "매주 토요일 오전 유성 종합운동장에서 정기적으로 칠 복식 파트너 찾습니다. C~B 실력.", likes: 6, comments: 3, views: 156, createdAt: "4일 전", region: "대전" },
  { id: "p10", category: "자유", title: "50대에 시작한 피클볼, 1년 후기", author: "박미영", authorRegion: "경기", excerpt: "처음엔 어색했지만 지금은 주 3회 치러 나갑니다. 건강도 좋아지고 친구도 많이 사귀었어요.", likes: 112, comments: 28, views: 1567, createdAt: "5일 전" },
];

const regionFilters = [
  { key: "region", label: "지역", options: ["전체", "서울", "경기", "부산", "인천", "대전"] },
];

const mainTabs = ["커뮤니티", "공지사항", "갤러리"];
const communityTabs = ["전체", "자유", "후기", "질문", "장비", "모집", "동호회"];

const noticeTypeColors: Record<string, string> = {
  "운영": "text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20",
  "대회": "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  "클럽": "text-green-400 bg-green-400/10 border-green-400/20",
};

export default function CommunityContent() {
  const [mainTab, setMainTab] = useState(0);
  const [communityTab, setCommunityTab] = useState(0);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "comments">("recent");
  const { toast } = useToast();

  const filteredPosts = useMemo(() => {
    let result = posts;
    if (communityTab > 0) {
      const catMap: Record<number, string> = { 1: "자유", 2: "후기", 3: "질문", 4: "장비", 5: "모집", 6: "동호회" };
      result = result.filter((p) => p.category === catMap[communityTab]);
    }
    if (activeFilters.region && activeFilters.region !== "전체") {
      result = result.filter((p) => p.authorRegion === activeFilters.region || p.region === activeFilters.region);
    }
    const pinned = result.filter((p) => p.pinned);
    const rest = result.filter((p) => !p.pinned);
    rest.sort((a, b) => {
      if (sortBy === "popular") return b.likes - a.likes;
      if (sortBy === "comments") return b.comments - a.comments;
      return 0;
    });
    return [...pinned, ...rest];
  }, [communityTab, activeFilters, sortBy]);

  return (
    <div className="relative py-6 md:py-10">
      <div className="absolute inset-0 card-grid-bg pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-4">
          <PageHeader sysLabel="SYS.COMMUNITY" title="커뮤니티" subtitle="피클볼에 대한 이야기를 나누고 정보를 공유하세요" />
          {mainTab === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="shrink-0 mt-6">
              <ClipButton variant="cyan" arrow onClick={() => toast("글쓰기 기능은 준비중입니다.", "info")}><Plus className="w-4 h-4" />글쓰기</ClipButton>
            </motion.div>
          )}
        </div>

        {/* 메인 탭 */}
        <TabBar tabs={mainTabs} activeTab={mainTab} onTabChange={setMainTab} />

        {/* ═══ 커뮤니티 탭 ═══ */}
        {mainTab === 0 && (
          <>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-text-muted"><span className="text-brand-cyan font-bold">{filteredPosts.length}</span>개 글</span>
              <div className="flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-text-muted" />
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="bg-transparent text-xs text-text-muted border border-ui-border rounded-sm px-2 py-1.5 min-h-[36px] focus:border-brand-cyan/40 focus:outline-none cursor-pointer">
                  <option value="recent" className="bg-dark">최신순</option>
                  <option value="popular" className="bg-dark">인기순</option>
                  <option value="comments" className="bg-dark">댓글순</option>
                </select>
              </div>
            </div>
            <FilterBar filters={regionFilters} onFilterChange={(key, value) => setActiveFilters((prev) => ({ ...prev, [key]: value }))} />
            <TabBar tabs={communityTabs} activeTab={communityTab} onTabChange={setCommunityTab} />

            {filteredPosts.length === 0 ? (
              <EmptyBoard category={communityTabs[communityTab]} onWrite={() => toast("글쓰기 기능은 준비중입니다.", "info")} />
            ) : (
              <div className="space-y-2">
                {filteredPosts.map((post, i) => (
                  <motion.div key={post.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: i * 0.03 }}>
                    <PostRow post={post} onClick={() => toast("게시글 상세 보기는 준비중입니다.", "info")} />
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ═══ 공지사항 탭 ═══ */}
        {mainTab === 1 && <NoticeList notices={notices} onNoticeClick={() => toast("공지사항 상세 보기는 준비중입니다.", "info")} />}

        {/* ═══ 갤러리 탭 ═══ */}
        {mainTab === 2 && <GalleryGrid posts={posts.filter((p) => p.images && p.images > 0)} onItemClick={() => toast("갤러리 상세 보기는 준비중입니다.", "info")} />}
      </div>
    </div>
  );
}

/* ── 게시글 행 ── */
function PostRow({ post, onClick }: { post: Post; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="relative bg-ui-bg/30 border border-ui-border rounded-sm p-4 hover:border-brand-cyan/20 transition-all cursor-pointer group w-full text-left">
      <TechCorners />
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {post.pinned && <Pin className="w-3 h-3 text-brand-cyan shrink-0" />}
            <span className="text-[10px] font-mono text-brand-cyan bg-brand-cyan/10 px-1.5 py-0.5 rounded-sm border border-brand-cyan/20">{post.category}</span>
            {post.region && <span className="text-[10px] text-text-muted flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{post.region}</span>}
            {post.images && <span className="text-[10px] text-text-muted flex items-center gap-0.5"><ImageIcon className="w-2.5 h-2.5" />{post.images}</span>}
            {post.relatedEvent && <span className="text-[10px] text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded-sm border border-yellow-400/20">{post.relatedEvent}</span>}
          </div>
          <h3 className="font-bold text-sm mb-1 group-hover:text-brand-cyan transition-colors leading-snug">{post.title}</h3>
          <p className="text-xs text-text-muted line-clamp-1">{post.excerpt}</p>
          <div className="flex items-center gap-3 mt-2 text-[10px] text-text-muted/60">
            <span>{post.author}</span>
            {post.authorRegion && <span>{post.authorRegion}</span>}
            <span>{post.createdAt}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0 text-xs text-text-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{post.likes}</span>
            <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{post.comments}</span>
          </div>
          <span className="flex items-center gap-1 text-[10px]"><Eye className="w-2.5 h-2.5" />{post.views}</span>
        </div>
      </div>
    </button>
  );
}

/* ── 공지사항 ── */
function NoticeList({ notices, onNoticeClick }: { notices: Notice[]; onNoticeClick?: () => void }) {
  const pinned = notices.filter((n) => n.pinned);
  const rest = notices.filter((n) => !n.pinned);
  return (
    <div className="space-y-2">
      {pinned.map((n) => (
        <div key={n.id} className="relative bg-brand-cyan/5 border border-brand-cyan/20 rounded-sm p-4">
          <TechCorners color="rgba(0,212,255,0.15)" />
          <div className="flex items-center gap-2">
            <Pin className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm border ${noticeTypeColors[n.type]}`}>{n.type}</span>
            <h3 className="font-bold text-sm flex-1">{n.title}</h3>
            <span className="text-[10px] text-text-muted font-mono shrink-0">{n.date}</span>
          </div>
        </div>
      ))}
      {rest.map((n) => (
        <button type="button" key={n.id} onClick={onNoticeClick} className="relative bg-ui-bg/30 border border-ui-border rounded-sm p-4 hover:border-brand-cyan/20 transition-all cursor-pointer w-full text-left">
          <TechCorners />
          <div className="flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm border ${noticeTypeColors[n.type]}`}>{n.type}</span>
            <span className="text-sm flex-1">{n.title}</span>
            <span className="text-[10px] text-text-muted font-mono shrink-0">{n.date}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

/* ── 갤러리 ── */
function GalleryGrid({ posts, onItemClick }: { posts: Post[]; onItemClick?: () => void }) {
  if (posts.length === 0) {
    return (
      <div className="relative bg-ui-bg/20 border border-ui-border rounded-sm p-10 text-center card-grid-bg">
        <TechCorners />
        <div className="text-4xl mb-3">📷</div>
        <p className="font-bold mb-1">아직 사진이 없습니다</p>
        <p className="text-sm text-text-muted">대회 후기나 모임 사진을 올려보세요!</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <p className="text-sm text-text-muted">사진이 포함된 게시글을 모아서 보여드립니다</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {posts.map((post, i) => (
          <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: i * 0.04 }}>
            <button type="button" onClick={onItemClick} className="relative bg-ui-bg/30 border border-ui-border rounded-sm overflow-hidden hover:border-brand-cyan/20 transition-all cursor-pointer group w-full text-left">
              <TechCorners />
              <div className="h-36 bg-surface card-grid-bg flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon className="w-8 h-8 text-text-muted/20 mx-auto mb-1" />
                  <span className="text-[10px] text-text-muted/30 font-mono">{post.images}장</span>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-brand-cyan bg-brand-cyan/10 px-1.5 py-0.5 rounded-sm">{post.category}</span>
                  {post.relatedEvent && <span className="text-[10px] text-yellow-400">{post.relatedEvent}</span>}
                </div>
                <h3 className="font-bold text-xs group-hover:text-brand-cyan transition-colors leading-snug">{post.title}</h3>
                <div className="flex items-center justify-between mt-2 text-[10px] text-text-muted">
                  <span>{post.author}</span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5"><Heart className="w-2.5 h-2.5" />{post.likes}</span>
                    <span className="flex items-center gap-0.5"><MessageSquare className="w-2.5 h-2.5" />{post.comments}</span>
                  </div>
                </div>
              </div>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── 빈 상태 ── */
function EmptyBoard({ category, onWrite }: { category: string; onWrite?: () => void }) {
  const messages: Record<string, { emoji: string; main: string; sub: string }> = {
    "전체": { emoji: "💬", main: "아직 게시글이 없습니다", sub: "첫 번째 글을 작성해 보세요!" },
    "자유": { emoji: "📝", main: "자유게시판이 비어있습니다", sub: "피클볼에 대한 이야기를 나눠보세요" },
    "후기": { emoji: "⭐", main: "아직 후기가 없습니다", sub: "대회나 모임에 참가한 후기를 남겨주세요" },
    "질문": { emoji: "❓", main: "질문이 없습니다", sub: "궁금한 게 있으면 언제든 물어보세요" },
    "장비": { emoji: "🏓", main: "장비 리뷰가 없습니다", sub: "사용 중인 장비의 리뷰를 남겨주세요" },
    "모집": { emoji: "🤝", main: "모집 글이 없습니다", sub: "파트너나 팀원을 모집해 보세요" },
    "동호회": { emoji: "👥", main: "동호회 소식이 없습니다", sub: "동호회 소식을 공유해 주세요" },
  };
  const m = messages[category] || messages["전체"];
  return (
    <div className="relative bg-ui-bg/20 border border-ui-border rounded-sm p-10 text-center card-grid-bg">
      <TechCorners />
      <div className="text-4xl mb-3">{m.emoji}</div>
      <p className="font-bold mb-1">{m.main}</p>
      <p className="text-sm text-text-muted mb-4">{m.sub}</p>
      <ClipButton variant="cyan" onClick={onWrite}><Plus className="w-4 h-4" />글쓰기</ClipButton>
    </div>
  );
}
