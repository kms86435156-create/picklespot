/**
 * MVP 시드 데이터 — 새 필드 스펙 기준
 * Tournament: title, startDate, endDate, registrationDeadline, venueName, organizerName, organizerContact, entryFee, eventTypes, maxParticipants, currentParticipants, status, sourceUrl, isFeatured, region
 * Venue: name, address, roadAddress, region, phone, operatingHours, courtCount, indoorOutdoor, parkingAvailable, description, mapLink, isFeatured
 * Club: name, region, homeVenue, contactName, contactPhoneOrKakao, description, memberCount, joinMethod, externalLink, isFeatured
 */
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function write(file: string, data: any) {
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
  console.log(`  ✓ ${file} (${Array.isArray(data) ? data.length + "건" : "ok"})`);
}
function genId() { return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`; }
function pick<T>(a: T[]): T { return a[Math.floor(Math.random() * a.length)]; }
function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function dateStr(d: Date) { return d.toISOString().split("T")[0]; }
function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }

// ═══ 참조 데이터 ═══
const regions = [
  { r: "서울", cities: ["강남구", "송파구", "서초구", "마포구", "영등포구", "강서구", "강동구", "노원구", "용산구"] },
  { r: "경기", cities: ["성남시 분당구", "수원시 영통구", "용인시 수지구", "고양시 일산서구", "화성시", "안양시", "평택시", "김포시", "하남시", "광명시", "부천시", "의정부시", "파주시", "시흥시"] },
  { r: "인천", cities: ["연수구", "남동구", "서구", "청라", "송도"] },
  { r: "부산", cities: ["해운대구", "수영구", "남구", "동래구", "기장군"] },
  { r: "대구", cities: ["수성구", "달서구", "동구", "북구"] },
  { r: "대전", cities: ["유성구", "서구", "중구"] },
  { r: "광주", cities: ["서구", "북구", "광산구"] },
  { r: "울산", cities: ["남구", "중구"] },
  { r: "세종", cities: ["세종시"] },
  { r: "강원", cities: ["춘천시", "원주시", "강릉시"] },
  { r: "충북", cities: ["청주시", "충주시"] },
  { r: "충남", cities: ["천안시", "아산시"] },
  { r: "전북", cities: ["전주시", "익산시"] },
  { r: "전남", cities: ["여수시", "순천시"] },
  { r: "경북", cities: ["포항시", "구미시"] },
  { r: "경남", cities: ["창원시", "김해시", "양산시"] },
  { r: "제주", cities: ["제주시", "서귀포시"] },
];

const venueNames = [
  "피클볼 아레나", "피클볼 센터", "피클볼 파크", "스포츠센터", "체육관",
  "라켓센터", "피클존", "올코트", "피클하우스", "더피클볼", "프라임코트",
  "그린코트", "블루코트", "패들스포츠", "피클플레이", "어반피클볼",
  "피클볼 스테이션", "스마트피클볼", "피클라운지", "피클볼 아카데미",
  "배드민턴&피클볼장", "실내체육관", "다목적체육관", "스포츠컴플렉스",
];

const organizers = [
  "대한피클볼협회", "KPA 피클볼", "서울시피클볼연합", "경기도피클볼협회",
  "피클볼코리아", "부산피클볼연맹", "인천피클볼협회", "전국피클볼연맹",
  "한국피클볼동호인연합회", "코리안피클볼리그", "수도권피클볼연합",
];

const tPrefixes = ["전국", "제1회", "제2회", "제3회", "2026", "봄맞이", "시장배", "구청장배", "체육회장배", "도지사배", "오픈", "챌린저", "마스터스"];
const tSuffixes = ["피클볼 대회", "피클볼 오픈", "피클볼 챔피언십", "피클볼 컵", "피클볼 챌린지", "피클볼 페스티벌"];
const eventTypesList = ["남복, 여복, 혼복", "남복, 여복", "남복, 여복, 혼복, 단식", "남복, 혼복", "초급부, 중급부, 상급부", "팀전 (4인)"];
const surfaces = ["데코터프", "우레탄", "PU코트", "아크릴", "합성수지", "탄성우레탄"];
const roads = ["중앙로", "스포츠로", "체육관길", "올림픽로", "건강로", "문화로", "역삼로", "테헤란로", "판교로"];

const now = new Date();
const nowStr = new Date().toISOString();

// ═══ 1. 대회 50개 ═══
const tournaments: any[] = [];
for (let i = 0; i < 50; i++) {
  const rg = pick(regions);
  const startOff = randInt(-30, 120);
  const start = addDays(now, startOff);
  const end = addDays(start, randInt(0, 2));
  const regDeadline = addDays(start, -randInt(3, 10));
  const fee = pick([20000, 25000, 30000, 35000, 40000, 50000]);
  const maxP = pick([32, 48, 64, 96, 128]);

  let status: string;
  if (start < now && end < now) status = "closed";
  else if (regDeadline < now) status = "closed";
  else status = "open";
  if (i < 3) status = "draft"; // 일부 임시저장

  tournaments.push({
    id: genId(),
    title: `${pick(tPrefixes)} ${rg.r} ${pick(tSuffixes)}`,
    startDate: dateStr(start),
    endDate: dateStr(end),
    registrationDeadline: dateStr(regDeadline),
    venueName: `${pick(rg.cities)} ${pick(venueNames)}`,
    venueId: null,
    organizerName: pick(organizers),
    organizerContact: `010-${randInt(1000, 9999)}-${randInt(1000, 9999)}`,
    entryFee: fee,
    eventTypes: pick(eventTypesList),
    maxParticipants: maxP,
    currentParticipants: status === "closed" ? randInt(Math.floor(maxP * 0.7), maxP) : randInt(0, Math.floor(maxP * 0.5)),
    description: `${rg.r}에서 개최되는 피클볼 대회입니다.\n참가 자격: 피클볼 동호인 누구나\n대회 형식: 토너먼트`,
    status,
    sourceUrl: "",
    isFeatured: i < 5,
    region: rg.r,
    createdAt: nowStr,
    updatedAt: nowStr,
  });
}

// ═══ 2. 장소 200개 ═══
const venues: any[] = [];
const usedNames = new Set<string>();
for (let i = 0; i < 200; i++) {
  const rg = pick(regions);
  const city = pick(rg.cities);
  let name = `${city} ${pick(venueNames)}`;
  if (usedNames.has(name)) name += ` ${randInt(2, 9)}호점`;
  usedNames.add(name);
  const io = pick(["실내", "실내", "실내", "실외", "실내+실외"]);
  const cc = randInt(2, 12);

  venues.push({
    id: genId(),
    name,
    slug: name.replace(/\s+/g, "-").slice(0, 40) + "-" + Math.random().toString(36).slice(2, 6),
    address: `${rg.r} ${city}`,
    roadAddress: `${rg.r} ${city} ${pick(roads)} ${randInt(1, 300)}`,
    region: rg.r,
    phone: `0${randInt(2, 64)}-${randInt(100, 999)}-${randInt(1000, 9999)}`,
    operatingHours: pick(["06:00~22:00", "07:00~23:00", "08:00~22:00", "09:00~21:00", "24시간"]),
    courtCount: cc,
    indoorOutdoor: io,
    parkingAvailable: Math.random() > 0.2,
    description: `${rg.r} ${city}에 위치한 ${io} ${cc}면 코트입니다. ${pick(surfaces)} 바닥.`,
    mapLink: "",
    isFeatured: i < 8,
    // Legacy compat
    type: io === "실내" ? "indoor" : io === "실외" ? "outdoor" : "both",
    surface: pick(surfaces),
    pricePerHour: pick([10000, 12000, 15000, 18000, 20000, 25000]),
    hasParking: Math.random() > 0.2,
    hasShower: Math.random() > 0.4,
    hasLighting: true,
    hasEquipmentRental: Math.random() > 0.5,
    rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
    reviewCount: randInt(0, 80),
    sourcePrimary: "seed",
    createdAt: nowStr,
    updatedAt: nowStr,
  });
}

// ═══ 3. 동호회 25개 ═══
const clubParts = ["피클", "패들", "스매시", "딩크", "에이스", "볼리", "스핀", "터치", "팝", "조이", "원", "프로", "탑", "블루", "그린"];
const clubSuffix = ["피클볼", "피클볼클럽", "PB", "피클러스", "동호회", "패들러스"];
const joinMethods = ["카카오톡 오픈채팅 문의", "전화/문자 문의", "네이버 카페 가입 후 문의", "인스타그램 DM", "현장 방문"];

const clubs: any[] = [];
for (let i = 0; i < 25; i++) {
  const rg = pick(regions.slice(0, 8));
  const city = pick(rg.cities);

  clubs.push({
    id: genId(),
    name: `${pick(clubParts)}${pick(clubSuffix)}`,
    slug: `club-${Math.random().toString(36).slice(2, 8)}`,
    region: rg.r,
    homeVenue: `${city} ${pick(venueNames)}`,
    contactName: pick(["김회장", "이대표", "박총무", "최운영자", "정사무장"]),
    contactPhoneOrKakao: `010-${randInt(1000, 9999)}-${randInt(1000, 9999)}`,
    description: `${rg.r} ${city} 기반 피클볼 동호회입니다. ${pick([
      "초보자부터 고수까지 모두 환영합니다!",
      "함께 즐기며 실력을 키워가는 클럽입니다.",
      "주말마다 모여서 피클볼을 즐기고 있습니다.",
      "친목과 실력 향상을 동시에!",
      "매주 정기 모임과 월 1회 내부 리그를 운영합니다.",
    ])}`,
    memberCount: randInt(10, 80),
    joinMethod: pick(joinMethods),
    externalLink: i % 3 === 0 ? `https://cafe.naver.com/pickle${randInt(100, 999)}` : "",
    isFeatured: i < 4,
    // Legacy compat
    city,
    level: pick(["입문~초급", "초급~중급", "중급~상급", "전 급수"]),
    meetingSchedule: pick(["매주 토/일 09:00~12:00", "매주 수/금 19:00~21:00", "매주 토 14:00~17:00", "주 3회 (월/수/금) 20:00~22:00"]),
    meetingVenue: `${city} ${pick(venueNames)}`,
    fee: pick(["월 3만원", "월 5만원", "월 2만원", "회당 1만원", "무료"]),
    tags: ["친목", "실력향상", pick(["주말활동", "레슨", "대회참가", "초보환영"])],
    isRecruiting: Math.random() > 0.15,
    sourcePrimary: "seed",
    createdAt: nowStr,
    updatedAt: nowStr,
  });
}

// ═══ 저장 ═══
// ═══ 4. 시뮬레이션용 대회 + 신청자 ═══
const simTournamentId = "sim_tournament_001";
const simTournament = {
  id: simTournamentId,
  title: "[시뮬레이션] 제1회 PBL.SYS 피클볼 오픈",
  startDate: dateStr(addDays(now, 14)),
  endDate: dateStr(addDays(now, 14)),
  registrationDeadline: dateStr(addDays(now, 7)),
  venueName: "강남구 피클볼 아레나",
  venueId: null,
  organizerName: "PBL.SYS 운영팀",
  organizerContact: "010-0000-0000",
  entryFee: 30000,
  eventTypes: "남자복식, 여자복식, 혼합복식",
  maxParticipants: 16,
  currentParticipants: 12,
  description: "PBL.SYS 런칭 기념 소규모 오픈 대회입니다.\n\n참가 자격: 피클볼 동호인 누구나\n대회 형식: 16강 토너먼트\n시상: 우승/준우승 트로피 + 상품\n\n접수 마감 후 참가자 확정 안내를 드립니다.",
  status: "open",
  sourceUrl: "",
  isFeatured: true,
  region: "서울",
  createdAt: nowStr,
  updatedAt: nowStr,
};
tournaments.push(simTournament);

// 시뮬레이션 신청자 12명
const simNames = ["김민수", "이서준", "박지호", "최영희", "정수빈", "강하늘", "윤도현", "한지민", "오세훈", "장미란", "임재현", "배수진"];
const simDivisions = ["남자복식", "남자복식", "남자복식", "여자복식", "여자복식", "혼합복식", "혼합복식", "여자복식", "남자복식", "혼합복식", "남자복식", "혼합복식"];
const simRegistrations = simNames.map((name, i) => ({
  id: `sim_reg_${String(i + 1).padStart(3, "0")}`,
  tournamentId: simTournamentId,
  playerName: name,
  playerPhone: `010-${randInt(1000, 9999)}-${randInt(1000, 9999)}`,
  gender: i < 3 || i === 8 || i === 10 ? "남" : "여",
  division: simDivisions[i],
  partnerName: i % 2 === 0 ? simNames[i + 1] || "" : "",
  clubName: pick(["강남피클러스", "판교PB클럽", "서울피클볼", ""]),
  level: pick(["C", "B", "A", "D"]),
  memo: "",
  privacyAgreed: true,
  status: i < 8 ? "approved" : i < 10 ? "pending" : "waitlisted",
  adminMemo: i < 8 ? "확인 완료" : "",
  createdAt: new Date(Date.now() - (12 - i) * 3600000).toISOString(),
  updatedAt: nowStr,
}));

write("tournaments.json", tournaments);
write("venues.json", venues);
write("clubs.json", clubs);
write("registrations.json", simRegistrations);
if (!fs.existsSync(path.join(DATA_DIR, "inquiries.json"))) write("inquiries.json", []);
if (!fs.existsSync(path.join(DATA_DIR, "leads.json"))) write("leads.json", []);

console.log(`\n✅ 시드 데이터 생성 완료`);
console.log(`   대회 ${tournaments.length}개 (접수중 ${tournaments.filter(t => t.status === "open").length})`);
console.log(`   장소 ${venues.length}개`);
console.log(`   동호회 ${clubs.length}개`);
console.log(`   시뮬레이션 대회 1개 + 신청자 ${simRegistrations.length}명`);
