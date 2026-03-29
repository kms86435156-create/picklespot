import fs from "fs";
import path from "path";

const D = path.join(process.cwd(), "data");
if (!fs.existsSync(D)) fs.mkdirSync(D, { recursive: true });

// Flash Games
const flashGames = [
  { id: "fg1", title: "잠실 주말 오전 가볍게 한 판", authorName: "김민수", authorLevel: "C", authorAttendRate: 98, authorMannerScore: 4.8, authorGamesHosted: 23, location: "잠실 피클볼 파크", address: "서울 송파구 올림픽로 424", region: "서울", dateTime: "2026-03-30T09:00", duration: "2시간", currentPlayers: 2, maxPlayers: 4, players: [{ name: "김민수", level: "C", trustScore: 92 }, { name: "박지현", level: "D+", trustScore: 88 }], level: "C~D", vibe: "casual", beginnerWelcome: true, status: "open", createdAt: "2026-03-28T14:00", authorTrustScore: 92, authorNoShow: 0, description: "주말 아침 가볍게 복식 한 판!", equipment: ["개인 패들 지참", "실내화 필수"], notice: "주차는 올림픽공원 이용 (유료)", costPerPerson: 5000, sourceType: "manual_seed" },
  { id: "fg2", title: "판교 평일 저녁 빡겜 모집", authorName: "이준혁", authorLevel: "B+", authorAttendRate: 95, authorMannerScore: 4.5, authorGamesHosted: 45, location: "판교 스포츠센터", address: "경기 성남시 분당구 판교역로 235", region: "경기", dateTime: "2026-03-31T19:00", duration: "2시간", currentPlayers: 3, maxPlayers: 4, players: [{ name: "이준혁", level: "B+", trustScore: 88 }, { name: "최영진", level: "A", trustScore: 94 }, { name: "정하늘", level: "B", trustScore: 85 }], level: "B이상", vibe: "competitive", beginnerWelcome: false, status: "open", createdAt: "2026-03-28T10:00", authorTrustScore: 88, authorNoShow: 0, description: "실력자들끼리 진지하게 한 판.", equipment: ["개인 패들", "실내화"], notice: "1자리 남았습니다!", costPerPerson: 6000, sourceType: "manual_seed" },
  { id: "fg3", title: "해운대 토요 오후 혼복 모집", authorName: "박서연", authorLevel: "C+", authorAttendRate: 100, authorMannerScore: 4.9, authorGamesHosted: 12, location: "해운대 실내체육관", address: "부산 해운대구 해운대해변로 264", region: "부산", dateTime: "2026-04-05T14:00", duration: "2시간 30분", currentPlayers: 2, maxPlayers: 4, players: [{ name: "박서연", level: "C+", trustScore: 95 }, { name: "김영숙", level: "D", trustScore: 88 }], level: "C~D", vibe: "casual", beginnerWelcome: true, gender: "혼성", status: "open", createdAt: "2026-03-29T08:00", authorTrustScore: 95, authorNoShow: 0, description: "남녀 혼합 복식으로 편하게!", equipment: ["패들 대여 가능"], notice: "체육관 1층 로비에서 만나요", costPerPerson: 4000, sourceType: "manual_seed" },
];

const partnerPosts = [
  { id: "pp1", authorName: "윤정민", authorLevel: "C+", authorAttendRate: 94, authorMannerScore: 4.7, authorTotalGames: 62, region: "서울 강남", level: "C+", preferredTime: "평일 저녁 7시 이후", preferredDays: ["화", "목", "토"], vibe: "competitive", lookingFor: "복식 파트너 (대회 출전용)", message: "복식 파트너 구합니다. 주 2~3회 같이 칠 분 찾아요.", createdAt: "2026-03-28T09:00", trustScore: 93, noShowCount: 0, badges: ["대회 5회 참가", "노쇼 제로"], sourceType: "manual_seed" },
  { id: "pp2", authorName: "김영숙", authorLevel: "D", authorAttendRate: 100, authorMannerScore: 4.9, authorTotalGames: 18, region: "수원 광교", level: "D", preferredTime: "평일 오전 10~12시", preferredDays: ["월", "수", "금"], vibe: "casual", lookingFor: "편하게 같이 운동할 파트너", message: "50대 여성입니다. 편하게 같이 운동할 분 구해요.", createdAt: "2026-03-29T11:00", trustScore: 88, noShowCount: 0, badges: ["첫 승리"], sourceType: "manual_seed" },
];

// User profile
const user = [{
  name: "이정호", level: "C+", dupr: 4.2, totalMatches: 0, wins: 0, losses: 0, winRate: 0,
  activityScore: 0, activityRank: "브론즈", nextRankScore: 500, mannerScore: 0, attendRate: 0,
  trustScore: 0, noShowCount: 0, preferredRegion: "", preferredTime: "", joinedDate: "2026-03-29",
  monthlyStats: [], badges: [],
  upcomingEvents: [], recentResults: [], registeredTournaments: [], courtReservations: [], myFlashGames: [],
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
}];

const notifications: any[] = [];
const notificationSettings = [
  { id: "booking", label: "예약 · 신청", description: "대회 신청, 코트 예약, 번개 참가 확정", enabled: true, channel: "both" },
  { id: "reminder", label: "일정 리마인드", description: "대회, 예약, 번개 하루 전 알림", enabled: true, channel: "both" },
  { id: "deadline", label: "마감 임박", description: "관심 대회 마감 임박 시", enabled: true, channel: "kakao" },
  { id: "partner", label: "파트너 · 매칭", description: "파트너 초대 수락, 번개 모집 완료", enabled: true, channel: "push" },
  { id: "changes", label: "변경 · 취소", description: "장소 변경, 취소, 환불 처리 결과", enabled: true, channel: "both" },
  { id: "activity", label: "활동 기록", description: "경기 결과 기록", enabled: false, channel: "push" },
];

fs.writeFileSync(path.join(D, "flash-games.json"), JSON.stringify(flashGames, null, 2));
fs.writeFileSync(path.join(D, "partner-posts.json"), JSON.stringify(partnerPosts, null, 2));
fs.writeFileSync(path.join(D, "user.json"), JSON.stringify(user, null, 2));
fs.writeFileSync(path.join(D, "notifications.json"), JSON.stringify(notifications, null, 2));
fs.writeFileSync(path.join(D, "notification-settings.json"), JSON.stringify(notificationSettings, null, 2));

console.log("Additional seed complete!");
console.log(`  flash-games: ${flashGames.length}`);
console.log(`  partner-posts: ${partnerPosts.length}`);
console.log(`  user: 1`);
console.log(`  notifications: ${notifications.length} (empty — no events yet)`);
console.log(`  notification-settings: ${notificationSettings.length}`);
