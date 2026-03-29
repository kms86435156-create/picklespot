export interface UserProfile {
  name: string;
  level: string;
  dupr: number;
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  activityScore: number;
  activityRank: string;
  nextRankScore: number;
  mannerScore: number;
  attendRate: number;
  badges: Badge[];
  trustScore: number;
  noShowCount: number;
  preferredRegion: string;
  preferredTime: string;
  joinedDate: string;
  upcomingEvents: UpcomingEvent[];
  recentResults: RecentResult[];
  registeredTournaments: RegisteredTournament[];
  courtReservations: CourtReservation[];
  myFlashGames: MyFlashGame[];
  monthlyStats: MonthlyStat[];
  notifications: NotificationSetting[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  condition: string;
  earnedAt: string;
  progress?: number;
  maxProgress?: number;
}

export interface UpcomingEvent {
  id: string;
  type: "tournament" | "flash" | "court" | "lesson";
  title: string;
  date: string;
  time?: string;
  location: string;
  dDay: number;
}

export interface RecentResult {
  id: string;
  opponent: string;
  result: "win" | "loss";
  score: string;
  date: string;
  tournament?: string;
}

export interface RegisteredTournament {
  id: string;
  title: string;
  date: string;
  status: "confirmed" | "pending" | "waitlist" | "cancelled";
}

export interface CourtReservation {
  id: string;
  courtName: string;
  date: string;
  time: string;
  status: "confirmed" | "completed" | "cancelled";
}

export interface MyFlashGame {
  id: string;
  title: string;
  date: string;
  location: string;
  role: "host" | "participant";
  status: "upcoming" | "completed";
}

export interface MonthlyStat {
  month: string;
  matches: number;
  wins: number;
}

export interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface ActivityScoreRule {
  action: string;
  points: number;
  icon: string;
}

export const activityScoreRules: ActivityScoreRule[] = [
  { action: "예약 후 실제 참석", points: 10, icon: "✅" },
  { action: "번개 주최", points: 15, icon: "⚡" },
  { action: "후기 작성", points: 3, icon: "✍️" },
  { action: "경기 결과 입력", points: 2, icon: "📊" },
  { action: "노쇼 없음 (월간)", points: 5, icon: "🏅" },
  { action: "대회 참가", points: 20, icon: "🏆" },
  { action: "신규 회원 초대", points: 10, icon: "👥" },
  { action: "대회 입상", points: 30, icon: "🥇" },
];

export const mockUser: UserProfile = {
  name: "이정호",
  level: "C+",
  dupr: 4.2,
  totalMatches: 87,
  wins: 52,
  losses: 35,
  winRate: 59.8,
  activityScore: 1240,
  activityRank: "실버",
  nextRankScore: 1500,
  mannerScore: 4.8,
  attendRate: 97,
  trustScore: 95,
  noShowCount: 0,
  preferredRegion: "인천",
  preferredTime: "주말 오전",
  joinedDate: "2025-06-15",
  monthlyStats: [
    { month: "10월", matches: 8, wins: 5 },
    { month: "11월", matches: 12, wins: 7 },
    { month: "12월", matches: 10, wins: 6 },
    { month: "1월", matches: 14, wins: 9 },
    { month: "2월", matches: 11, wins: 7 },
    { month: "3월", matches: 15, wins: 10 },
  ],
  badges: [
    { id: "b1", name: "대회 참가자", icon: "🏆", description: "공식 대회 5회 이상 참가", condition: "대회 5회 참가 시 획득", earnedAt: "2026-02-15", progress: 7, maxProgress: 5 },
    { id: "b2", name: "번개왕", icon: "⚡", description: "번개 모임 10회 이상 주최", condition: "번개 10회 주최 시 획득", earnedAt: "2026-03-01", progress: 15, maxProgress: 10 },
    { id: "b3", name: "노쇼 제로", icon: "✨", description: "3개월 연속 노쇼 없음", condition: "연속 3개월 노쇼 0회", earnedAt: "2026-03-15" },
    { id: "b4", name: "첫 승리", icon: "🎉", description: "첫 공식 경기 승리", condition: "첫 경기 승리 시 자동 획득", earnedAt: "2025-08-20" },
    { id: "b5", name: "매너 플레이어", icon: "🤝", description: "매너 점수 4.5 이상 유지", condition: "매너점수 4.5+ 유지 (30일 기준)", earnedAt: "2026-03-10" },
    { id: "b6", name: "꾸준한 참가자", icon: "📅", description: "3개월 연속 월 5경기 이상", condition: "3개월 연속 월 5경기 이상 참가", earnedAt: "2026-01-01", progress: 3, maxProgress: 3 },
  ],
  upcomingEvents: [
    { id: "ue1", type: "tournament", title: "2026 전국 피클볼 오픈", date: "2026-04-19", location: "서울 올림픽공원", dDay: 21 },
    { id: "ue2", type: "flash", title: "잠실 주말 오전 가볍게 한 판", date: "2026-03-30", time: "09:00", location: "잠실 피클볼 파크", dDay: 1 },
    { id: "ue3", type: "court", title: "코트 예약", date: "2026-03-31", time: "18:00~19:00", location: "청라 피클볼 센터", dDay: 2 },
    { id: "ue4", type: "lesson", title: "정수현 코치 레슨", date: "2026-04-05", time: "10:00", location: "청라 피클볼 센터", dDay: 7 },
  ],
  recentResults: [
    { id: "rr1", opponent: "김민수/박서연", result: "win", score: "11-8, 11-6", date: "2026-03-22", tournament: "인천 청라 월례전" },
    { id: "rr2", opponent: "최영진/한소희", result: "loss", score: "9-11, 11-7, 8-11", date: "2026-03-15" },
    { id: "rr3", opponent: "정하늘/오성호", result: "win", score: "11-5, 11-9", date: "2026-03-10" },
    { id: "rr4", opponent: "윤정민/이준혁", result: "win", score: "11-7, 9-11, 11-4", date: "2026-03-03", tournament: "판교 오픈" },
    { id: "rr5", opponent: "박미영/김영숙", result: "loss", score: "7-11, 11-9, 5-11", date: "2026-02-25" },
  ],
  registeredTournaments: [
    { id: "rt1", title: "2026 전국 피클볼 오픈", date: "2026-04-19", status: "confirmed" },
    { id: "rt2", title: "인천 청라 피클볼 챌린지", date: "2026-05-03", status: "pending" },
  ],
  courtReservations: [
    { id: "cr1", courtName: "청라 피클볼 센터", date: "2026-03-31", time: "18:00~19:00", status: "confirmed" },
    { id: "cr2", courtName: "잠실 피클볼 파크", date: "2026-03-25", time: "09:00~10:00", status: "completed" },
    { id: "cr3", courtName: "강남 피클볼 아레나", date: "2026-03-20", time: "19:00~20:00", status: "completed" },
  ],
  myFlashGames: [
    { id: "mf1", title: "잠실 주말 오전 가볍게 한 판", date: "2026-03-30", location: "잠실 피클볼 파크", role: "participant", status: "upcoming" },
    { id: "mf2", title: "청라 일요 가족 피클볼", date: "2026-04-06", location: "청라 피클볼 센터", role: "host", status: "upcoming" },
    { id: "mf3", title: "인천 평일 저녁 번개", date: "2026-03-20", location: "청라 피클볼 센터", role: "host", status: "completed" },
  ],
  notifications: [
    { id: "n1", label: "대회 신청 완료", description: "대회 신청이 확정되었을 때", enabled: true },
    { id: "n2", label: "예약 완료", description: "코트 예약이 확정되었을 때", enabled: true },
    { id: "n3", label: "일정 하루 전", description: "대회/예약/번개 하루 전 알림", enabled: true },
    { id: "n4", label: "마감 임박", description: "관심 대회 마감 임박 시", enabled: true },
    { id: "n5", label: "파트너 수락", description: "파트너 초대 수락 시", enabled: true },
    { id: "n6", label: "장소 변경", description: "참여 모임 장소 변경 시", enabled: true },
    { id: "n7", label: "취소/환불", description: "취소 또는 환불 처리 결과", enabled: true },
    { id: "n8", label: "번개 모집 완료", description: "참여 번개 인원 충원 시", enabled: false },
  ],
};
