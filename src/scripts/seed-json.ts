import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const venues = [
  {
    id: "v1", name: "잠실 피클볼 파크", slug: "jamsil-pickleball-park",
    address: "서울 송파구 올림픽로 424", region: "서울", lat: 37.5145, lng: 127.0729,
    type: "indoor", courtCount: 8, surface: "폴리우레탄", pricePerHour: 20000, priceWeekend: 25000,
    amenities: ["주차", "샤워실", "장비대여", "음수대", "탈의실", "카페"],
    hasParking: true, hasShower: true, hasLighting: true, hasEquipmentRental: true,
    operatingHours: "06:00~22:00", rating: 4.6, reviewCount: 124, reviews: [],
    peakHours: "08~10시, 17~20시",
    description: "올림픽공원 내 위치한 서울 최대 규모 실내 피클볼장. 8면 전용 코트와 프로숍을 갖추고 있습니다.",
    phone: "02-1234-5678", isVerified: true, lastVerifiedAt: "2026-03-29", sourcePrimary: "manual",
    availableSlots: [],
  },
  {
    id: "v2", name: "판교 스포츠센터 피클볼장", slug: "pangyo-sports-center",
    address: "경기 성남시 분당구 판교역로 235", region: "경기", lat: 37.3947, lng: 127.1112,
    type: "indoor", courtCount: 6, surface: "아크릴", pricePerHour: 18000, priceWeekend: 22000,
    amenities: ["주차", "샤워실", "카페", "장비대여", "탈의실"],
    hasParking: true, hasShower: true, hasLighting: true, hasEquipmentRental: true,
    operatingHours: "07:00~22:00", rating: 4.4, reviewCount: 89, reviews: [],
    peakHours: "12~13시, 18~20시",
    description: "판교 테크노밸리 인근 실내 피클볼장. 직장인 퇴근 후 이용 많음.",
    phone: "031-1234-5678", isVerified: true, lastVerifiedAt: "2026-03-29", sourcePrimary: "manual",
    availableSlots: [],
  },
  {
    id: "v3", name: "해운대 피클볼 아레나", slug: "haeundae-pickleball-arena",
    address: "부산 해운대구 해운대해변로 264", region: "부산", lat: 35.1587, lng: 129.1604,
    type: "both", courtCount: 10, surface: "콘크리트/폴리우레탄", pricePerHour: 15000,
    amenities: ["주차", "샤워실", "조명", "음수대", "탈의실"],
    hasParking: true, hasShower: true, hasLighting: true, hasEquipmentRental: false,
    operatingHours: "06:00~21:00", rating: 4.7, reviewCount: 201, reviews: [],
    peakHours: "07~09시, 14~16시, 19~20시",
    description: "부산 최대 규모 피클볼장. 실내 6면 + 실외 4면.",
    phone: "051-1234-5678", isVerified: true, lastVerifiedAt: "2026-03-29", sourcePrimary: "manual",
    availableSlots: [],
  },
  {
    id: "v4", name: "청라 피클볼 센터", slug: "cheongna-pickleball-center",
    address: "인천 서구 청라커낼로 102", region: "인천", lat: 37.5345, lng: 126.6408,
    type: "indoor", courtCount: 4, surface: "폴리우레탄", pricePerHour: 16000,
    amenities: ["주차", "장비대여", "탈의실"],
    hasParking: true, hasShower: false, hasLighting: true, hasEquipmentRental: true,
    operatingHours: "08:00~22:00", rating: 4.3, reviewCount: 56, reviews: [],
    peakHours: "10~11시, 18~20시",
    description: "청라 국제도시 내 아담한 피클볼 센터.",
    phone: "032-1234-5678", isVerified: true, lastVerifiedAt: "2026-03-29", sourcePrimary: "manual",
    availableSlots: [],
  },
  {
    id: "v5", name: "광교 피클볼장", slug: "gwanggyo-pickleball",
    address: "경기 수원시 영통구 광교중앙로 145", region: "경기", lat: 37.2866, lng: 127.0551,
    type: "outdoor", courtCount: 4, surface: "아크릴", pricePerHour: 12000,
    amenities: ["주차", "조명", "음수대"],
    hasParking: true, hasShower: false, hasLighting: true, hasEquipmentRental: false,
    operatingHours: "06:00~21:00", rating: 4.1, reviewCount: 43, reviews: [],
    peakHours: "08~10시, 15~18시",
    description: "광교호수공원 인근 야외 피클볼장.",
    phone: "031-5678-1234", isVerified: true, lastVerifiedAt: "2026-03-29", sourcePrimary: "manual",
    availableSlots: [],
  },
  {
    id: "v6", name: "강남 피클볼 아레나", slug: "gangnam-pickleball-arena",
    address: "서울 강남구 테헤란로 152", region: "서울", lat: 37.5005, lng: 127.0365,
    type: "indoor", courtCount: 6, surface: "폴리우레탄", pricePerHour: 25000, priceWeekend: 30000,
    amenities: ["주차", "샤워실", "장비대여", "탈의실", "카페", "프로숍"],
    hasParking: true, hasShower: true, hasLighting: true, hasEquipmentRental: true,
    operatingHours: "06:00~23:00", rating: 4.8, reviewCount: 187, reviews: [],
    peakHours: "07~09시, 19~22시",
    description: "강남역 도보 5분 프리미엄 실내 피클볼장.",
    phone: "02-5678-1234", isVerified: true, lastVerifiedAt: "2026-03-29", sourcePrimary: "manual",
    availableSlots: [],
  },
];

const tournaments = [
  { id: "t1", title: "2026 전국 피클볼 오픈", organizer: "대한피클볼협회", region: "서울", venueName: "서울 올림픽공원 체육관", startDate: "2026-04-19", endDate: "2026-04-20", registrationCloseAt: "2026-04-15", fee: 50000, feeText: "₩50,000", divisions: "남복/여복/혼복", level: "C이상", status: "open", description: "전국 규모 오픈 대회. 복식 3종목 동시 진행.", detailUrl: "", sourcePrimary: "manual", lastVerifiedAt: "2026-03-29" },
  { id: "t2", title: "부산 해운대컵 피클볼 대회", organizer: "부산피클볼연합", region: "부산", venueName: "해운대 실내체육관", startDate: "2026-04-26", fee: 40000, feeText: "₩40,000", divisions: "혼합복식", level: "D~C", status: "open", description: "해운대에서 열리는 혼합복식 전문 대회.", detailUrl: "", sourcePrimary: "manual", lastVerifiedAt: "2026-03-29" },
  { id: "t3", title: "인천 청라 피클볼 챌린지", organizer: "인천피클볼클럽", region: "인천", venueName: "청라 스포츠센터", startDate: "2026-05-03", fee: 30000, feeText: "₩30,000", divisions: "단식", level: "전체", status: "open", description: "레벨별 단식 토너먼트. 초보자 환영.", detailUrl: "", sourcePrimary: "manual", lastVerifiedAt: "2026-03-29" },
];

const coaches = [
  { id: "co1", name: "김태완 코치", region: "서울 강남", specialties: ["서브", "드롭샷", "전략"], rating: 4.9, reviewCount: 67, pricePerSession: 80000, sessionDuration: "60분", lessonType: ["개인", "그룹(2~4인)"], bio: "전 국가대표 출신. 초보~대회 준비까지 체계적으로.", experience: "지도 경력 8년", sourcePrimary: "manual", lastVerifiedAt: "2026-03-29" },
  { id: "co2", name: "박지은 코치", region: "경기 분당", specialties: ["기초", "풋워크", "초보 지도"], rating: 4.8, reviewCount: 45, pricePerSession: 60000, sessionDuration: "60분", lessonType: ["개인", "그룹(2~6인)"], bio: "처음 시작하는 분들도 편안하게 배울 수 있도록.", experience: "지도 경력 5년", sourcePrimary: "manual", lastVerifiedAt: "2026-03-29" },
];

fs.writeFileSync(path.join(DATA_DIR, "venues.json"), JSON.stringify(venues, null, 2));
fs.writeFileSync(path.join(DATA_DIR, "tournaments.json"), JSON.stringify(tournaments, null, 2));
fs.writeFileSync(path.join(DATA_DIR, "coaches.json"), JSON.stringify(coaches, null, 2));
fs.writeFileSync(path.join(DATA_DIR, "sync-jobs.json"), JSON.stringify([], null, 2));

console.log("JSON seed complete!");
console.log(`  venues: ${venues.length}`);
console.log(`  tournaments: ${tournaments.length}`);
console.log(`  coaches: ${coaches.length}`);
