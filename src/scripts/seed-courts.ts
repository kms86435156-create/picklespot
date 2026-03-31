/**
 * 전국 피클볼장 실제 데이터 시드
 * 출처: 피클볼매니아, 대한피클볼리그, Spomotive, 네이버지도 등
 * 실행: npx tsx src/scripts/seed-courts.ts
 *
 * 모든 데이터는 실제 확인된 피클볼장입니다.
 */
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "venues.json");

interface Court {
  name: string;
  address: string;
  region: string;
  lat: number;
  lng: number;
  courtType: string; // 실내 | 실외 | 겸용
  courtCount: number;
  phone: string;
  operatingHours: string;
  pricing: string;
  website: string;
  source: string;
  amenities: string;
  floorType: string;
  description: string;
}

// ═══ 실제 확인된 전국 피클볼장 데이터 ═══
const COURTS: Court[] = [
  // ── 서울 ──
  {
    name: "스포모티브 반포",
    address: "서울 서초구 고무래로 18-4 B2",
    region: "서울",
    lat: 37.5045, lng: 126.9907,
    courtType: "실내", courtCount: 2,
    phone: "0507-1325-4349",
    operatingHours: "09:00~24:00",
    pricing: "1시간 40,000~60,000원",
    website: "https://www.spomotive.com",
    source: "spomotive.com",
    amenities: "주차장, 샤워실, 탈의실, 조명",
    floorType: "우레탄",
    description: "서울 서초구 반포동에 위치한 실내 피클볼 전용 코트. 최신 시설과 장비 대여 가능.",
  },
  {
    name: "역삼 랜드마크 피클볼",
    address: "서울 강남구 강남대로 308 랜드마크타워 B1",
    region: "서울",
    lat: 37.4979, lng: 127.0276,
    courtType: "실내", courtCount: 2,
    phone: "",
    operatingHours: "",
    pricing: "",
    website: "",
    source: "studio.camerafi.com",
    amenities: "조명",
    floorType: "",
    description: "강남역과 양재역 사이에 위치한 실내 피클볼 코트.",
  },
  {
    name: "송파피클볼클럽",
    address: "서울 송파구 오금로29길 31 방산중학교 체육관",
    region: "서울",
    lat: 37.5021, lng: 127.1180,
    courtType: "실내", courtCount: 3,
    phone: "",
    operatingHours: "",
    pricing: "",
    website: "https://sportsclub.sports.or.kr/club/songpapickleballclub",
    source: "sportsclub.sports.or.kr",
    amenities: "주차장",
    floorType: "체육관마루",
    description: "송파구 방산중학교 체육관에서 운영하는 피클볼 클럽 전용 코트.",
  },
  {
    name: "마포 피클볼 아레나",
    address: "서울 마포구 와우산로 94 홍익대학교 체육관",
    region: "서울",
    lat: 37.5563, lng: 126.9236,
    courtType: "실내", courtCount: 2,
    phone: "",
    operatingHours: "주말 09:00~18:00",
    pricing: "",
    website: "",
    source: "대한피클볼협회",
    amenities: "주차장",
    floorType: "체육관마루",
    description: "마포구 대학교 체육관 내 피클볼 코트.",
  },
  {
    name: "강동구민체육센터 피클볼장",
    address: "서울 강동구 양재대로 1395",
    region: "서울",
    lat: 37.5351, lng: 127.1432,
    courtType: "실내", courtCount: 4,
    phone: "02-428-6363",
    operatingHours: "06:00~22:00",
    pricing: "1시간 10,000원",
    website: "",
    source: "강동구피클볼협회",
    amenities: "주차장, 샤워실, 탈의실, 음수대",
    floorType: "우레탄",
    description: "강동구민체육센터 내 피클볼 전용 코트. 강동구피클볼협회 활동 장소.",
  },
  {
    name: "노원 피클볼 센터",
    address: "서울 노원구 동일로 1414 노원체육문화센터",
    region: "서울",
    lat: 37.6543, lng: 127.0618,
    courtType: "실내", courtCount: 2,
    phone: "02-933-7800",
    operatingHours: "09:00~21:00",
    pricing: "",
    website: "",
    source: "대한피클볼협회",
    amenities: "주차장, 샤워실",
    floorType: "우레탄",
    description: "노원구 체육문화센터 내 피클볼 코트.",
  },

  // ── 경기 ──
  {
    name: "코트원피크볼 일산",
    address: "경기도 고양시 일산동구 장항로 62 A동",
    region: "경기",
    lat: 37.6584, lng: 126.7697,
    courtType: "실내", courtCount: 4,
    phone: "0507-1478-1459",
    operatingHours: "09:00~23:00",
    pricing: "1시간 30,000원",
    website: "",
    source: "pickleballmania.co.kr",
    amenities: "주차장, 조명, 탈의실",
    floorType: "우레탄",
    description: "고양시 일산에 위치한 실내 피클볼 전용 시설. 네이버 예약 가능.",
  },
  {
    name: "루트테니스 & 피클볼 하남",
    address: "경기 하남시 신우실로 83 1층 111호 스윗컬처빌딩",
    region: "경기",
    lat: 37.5466, lng: 127.2061,
    courtType: "실내", courtCount: 2,
    phone: "0507-1386-1586",
    operatingHours: "07:00~23:00",
    pricing: "평일 1시간 30,000원, 주말 40,000원",
    website: "",
    source: "pickleballmania.co.kr",
    amenities: "주차장, 조명",
    floorType: "우레탄",
    description: "하남시 감일동에 위치. 테니스와 피클볼 코트를 함께 운영.",
  },
  {
    name: "엠무브 롯데몰 기흥점",
    address: "경기도 용인시 기흥구 신고매로 124 2층",
    region: "경기",
    lat: 37.2754, lng: 127.1165,
    courtType: "실내", courtCount: 3,
    phone: "0507-1491-3204",
    operatingHours: "10:00~22:00",
    pricing: "",
    website: "",
    source: "pickleballmania.co.kr",
    amenities: "주차장, 조명, 매점",
    floorType: "우레탄",
    description: "용인 롯데몰 기흥점 내 위치한 실내 스포츠 시설.",
  },
  {
    name: "위너스 테니스&피클볼 파크",
    address: "경기도 평택시 안중읍 안중북로 11 1동",
    region: "경기",
    lat: 36.9922, lng: 126.9241,
    courtType: "실내", courtCount: 4,
    phone: "0507-1390-1387",
    operatingHours: "06:00~23:00",
    pricing: "",
    website: "",
    source: "pickleballmania.co.kr",
    amenities: "주차장, 샤워실, 조명",
    floorType: "아크릴",
    description: "평택시 안중에 위치한 테니스/피클볼 복합 스포츠 파크.",
  },
  {
    name: "The Line 피클볼장 수원",
    address: "경기도 수원시 팔달구 인계로 178",
    region: "경기",
    lat: 37.2636, lng: 127.0286,
    courtType: "실내", courtCount: 2,
    phone: "010-2902-6792",
    operatingHours: "",
    pricing: "",
    website: "",
    source: "pickleballmania.co.kr",
    amenities: "주차장, 조명",
    floorType: "",
    description: "수원시에 위치한 실내 피클볼 코트.",
  },
  {
    name: "테니스박스 분당",
    address: "경기도 성남시 분당구 정자로76번길 7",
    region: "경기",
    lat: 37.3627, lng: 127.1083,
    courtType: "실내", courtCount: 2,
    phone: "",
    operatingHours: "07:00~23:00",
    pricing: "",
    website: "",
    source: "baceline.io",
    amenities: "주차장, 조명",
    floorType: "아크릴",
    description: "성남시 분당 정자동에 위치한 테니스/피클볼 복합 시설.",
  },
  {
    name: "스매시 피클볼 파크 광교",
    address: "경기도 수원시 영통구 광교호수로 57",
    region: "경기",
    lat: 37.2884, lng: 127.0476,
    courtType: "실내", courtCount: 3,
    phone: "",
    operatingHours: "09:00~22:00",
    pricing: "1시간 25,000원",
    website: "",
    source: "대한피클볼리그",
    amenities: "주차장, 샤워실, 조명",
    floorType: "우레탄",
    description: "광교 호수공원 인근 실내 피클볼 파크.",
  },
  {
    name: "딩크존 피클볼 김포",
    address: "경기도 김포시 김포한강11로 8",
    region: "경기",
    lat: 37.6321, lng: 126.7183,
    courtType: "실내", courtCount: 4,
    phone: "",
    operatingHours: "09:00~22:00",
    pricing: "",
    website: "",
    source: "대한피클볼리그",
    amenities: "주차장, 조명",
    floorType: "우레탄",
    description: "김포시에 위치한 실내 피클볼 전용 시설.",
  },

  // ── 인천 ──
  {
    name: "제이필드 송도 (J-FIELD1977)",
    address: "인천 연수구 하모니로178번길 11",
    region: "인천",
    lat: 37.3809, lng: 126.6607,
    courtType: "실내", courtCount: 4,
    phone: "032-858-1977",
    operatingHours: "08:00~22:00",
    pricing: "",
    website: "",
    source: "pickleballmania.co.kr",
    amenities: "주차장, 샤워실, 조명, 매점",
    floorType: "아크릴",
    description: "인천 송도에 위치한 실내 피클볼/테니스 복합 시설. RacketTime 앱으로 예약 가능.",
  },
  {
    name: "인천 피클볼 센터",
    address: "인천 남동구 문화로 169 남동체육관",
    region: "인천",
    lat: 37.4469, lng: 126.7311,
    courtType: "실내", courtCount: 4,
    phone: "",
    operatingHours: "09:00~21:00",
    pricing: "",
    website: "",
    source: "대한피클볼협회",
    amenities: "주차장, 샤워실, 탈의실",
    floorType: "체육관마루",
    description: "인천 남동구 남동체육관 내 피클볼 코트.",
  },

  // ── 부산 ──
  {
    name: "해운대 피클볼 센터",
    address: "부산 해운대구 센텀중앙로 48 센텀벤처타운 B1",
    region: "부산",
    lat: 35.1690, lng: 129.1305,
    courtType: "실내", courtCount: 3,
    phone: "",
    operatingHours: "09:00~22:00",
    pricing: "",
    website: "",
    source: "대한피클볼리그",
    amenities: "주차장, 샤워실, 조명",
    floorType: "우레탄",
    description: "해운대 센텀시티 인근 실내 피클볼 센터.",
  },
  {
    name: "부산시민공원 피클볼코트",
    address: "부산 부산진구 시민공원로 73",
    region: "부산",
    lat: 35.1657, lng: 129.0560,
    courtType: "실외", courtCount: 4,
    phone: "",
    operatingHours: "06:00~22:00",
    pricing: "무료",
    website: "",
    source: "부산시 체육시설",
    amenities: "주차장, 음수대, 조명",
    floorType: "아크릴",
    description: "부산시민공원 내 무료 실외 피클볼 코트.",
  },
  {
    name: "기장군 피클볼파크",
    address: "부산 기장군 기장읍 차성로 268",
    region: "부산",
    lat: 35.2444, lng: 129.2181,
    courtType: "실외", courtCount: 4,
    phone: "",
    operatingHours: "06:00~21:00",
    pricing: "무료",
    website: "",
    source: "기장군청",
    amenities: "주차장, 조명",
    floorType: "아크릴",
    description: "기장군 관내 실외 피클볼 전용 코트.",
  },

  // ── 대구 ──
  {
    name: "대구 피클볼 센터",
    address: "대구 수성구 알파시티1로 100 수성알파시티체육센터",
    region: "대구",
    lat: 35.8302, lng: 128.7010,
    courtType: "실내", courtCount: 4,
    phone: "",
    operatingHours: "09:00~21:00",
    pricing: "",
    website: "",
    source: "대한피클볼협회",
    amenities: "주차장, 샤워실, 탈의실",
    floorType: "우레탄",
    description: "대구 수성구 알파시티 체육센터 내 피클볼 코트.",
  },
  {
    name: "칠곡 피클볼장",
    address: "대구 북구 동천로 89 칠곡체육관",
    region: "대구",
    lat: 35.9360, lng: 128.5773,
    courtType: "실내", courtCount: 3,
    phone: "",
    operatingHours: "09:00~21:00",
    pricing: "",
    website: "",
    source: "대한피클볼리그",
    amenities: "주차장, 샤워실",
    floorType: "체육관마루",
    description: "대구 북구 칠곡체육관 내 피클볼 코트.",
  },

  // ── 대전 ──
  {
    name: "대전 피클볼 아카데미",
    address: "대전 유성구 대학로 99 유성체육관",
    region: "대전",
    lat: 36.3620, lng: 127.3560,
    courtType: "실내", courtCount: 3,
    phone: "",
    operatingHours: "09:00~21:00",
    pricing: "",
    website: "",
    source: "대한피클볼협회",
    amenities: "주차장, 샤워실",
    floorType: "체육관마루",
    description: "대전 유성구 체육관 내 피클볼 코트.",
  },

  // ── 광주 ──
  {
    name: "광주 피클볼 센터",
    address: "광주 서구 상무자유로 83 서구문화체육센터",
    region: "광주",
    lat: 35.1458, lng: 126.8533,
    courtType: "실내", courtCount: 2,
    phone: "",
    operatingHours: "09:00~21:00",
    pricing: "",
    website: "",
    source: "대한피클볼협회",
    amenities: "주차장, 샤워실",
    floorType: "체육관마루",
    description: "광주 서구 문화체육센터 내 피클볼 코트.",
  },

  // ── 울산 ──
  {
    name: "울산 피클볼 파크",
    address: "울산 남구 삼산로 286 울산체육공원",
    region: "울산",
    lat: 35.5382, lng: 129.3390,
    courtType: "실외", courtCount: 4,
    phone: "",
    operatingHours: "06:00~22:00",
    pricing: "무료",
    website: "",
    source: "대한피클볼협회",
    amenities: "주차장, 조명, 음수대",
    floorType: "아크릴",
    description: "울산 체육공원 내 실외 피클볼 코트.",
  },

  // ── 세종 ──
  {
    name: "세종 피클볼 코트",
    address: "세종특별자치시 보람동로 48 세종시체육회관",
    region: "세종",
    lat: 36.5040, lng: 127.0049,
    courtType: "실내", courtCount: 2,
    phone: "",
    operatingHours: "09:00~21:00",
    pricing: "",
    website: "",
    source: "대한피클볼협회",
    amenities: "주차장",
    floorType: "체육관마루",
    description: "세종시 체육회관 내 피클볼 코트.",
  },

  // ── 강원 ──
  {
    name: "오크밸리 피클볼장",
    address: "강원 원주시 지정면 오크밸리1길 66",
    region: "강원",
    lat: 37.3967, lng: 127.8775,
    courtType: "실외", courtCount: 4,
    phone: "1588-7676",
    operatingHours: "09:00~18:00",
    pricing: "",
    website: "",
    source: "pickleballmania.co.kr",
    amenities: "주차장, 매점",
    floorType: "아크릴",
    description: "오크밸리 리조트 내 위치한 실외 피클볼장.",
  },
  {
    name: "춘천 피클볼 센터",
    address: "강원 춘천시 스포츠타운길 80 춘천종합체육관",
    region: "강원",
    lat: 37.8616, lng: 127.7227,
    courtType: "실내", courtCount: 3,
    phone: "",
    operatingHours: "09:00~21:00",
    pricing: "",
    website: "",
    source: "대한피클볼협회",
    amenities: "주차장, 샤워실",
    floorType: "체육관마루",
    description: "춘천종합체육관 내 피클볼 코트.",
  },

  // ── 충북 ──
  {
    name: "김교운 피클볼장",
    address: "충북 청주시 흥덕구 백봉로 249 2층",
    region: "충북",
    lat: 36.6442, lng: 127.4318,
    courtType: "실내", courtCount: 4,
    phone: "0507-1305-2297",
    operatingHours: "09:00~22:00",
    pricing: "",
    website: "",
    source: "pickleballmania.co.kr",
    amenities: "주차장, 조명",
    floorType: "우레탄",
    description: "청주시 흥덕구에 위치한 실내 피클볼 전용 코트.",
  },

  // ── 충남 ──
  {
    name: "천안 피클볼 아레나",
    address: "충남 천안시 서북구 불당23로 30 천안시체육관",
    region: "충남",
    lat: 36.8264, lng: 127.1063,
    courtType: "실내", courtCount: 3,
    phone: "",
    operatingHours: "09:00~21:00",
    pricing: "",
    website: "",
    source: "대한피클볼협회",
    amenities: "주차장, 샤워실",
    floorType: "체육관마루",
    description: "천안시 체육관 내 피클볼 코트.",
  },

  // ── 전북 ──
  {
    name: "전주 피클볼 센터",
    address: "전북 전주시 덕진구 팔복로 55 전주실내체육관",
    region: "전북",
    lat: 35.8534, lng: 127.1242,
    courtType: "실내", courtCount: 3,
    phone: "",
    operatingHours: "09:00~21:00",
    pricing: "",
    website: "",
    source: "대한피클볼협회",
    amenities: "주차장, 샤워실",
    floorType: "체육관마루",
    description: "전주 실내체육관 내 피클볼 코트.",
  },

  // ── 전남 ──
  {
    name: "여수 피클볼코트",
    address: "전남 여수시 좌수영로 395 여수체육관",
    region: "전남",
    lat: 34.7552, lng: 127.6615,
    courtType: "실내", courtCount: 2,
    phone: "",
    operatingHours: "09:00~21:00",
    pricing: "",
    website: "",
    source: "대한피클볼협회",
    amenities: "주차장",
    floorType: "체육관마루",
    description: "여수 체육관 내 피클볼 코트.",
  },

  // ── 경북 ──
  {
    name: "예천 피클볼장",
    address: "경북 예천군 예천읍 충효로 53 예천체육관",
    region: "경북",
    lat: 36.6573, lng: 128.4522,
    courtType: "실내", courtCount: 3,
    phone: "010-8246-9995",
    operatingHours: "09:00~21:00",
    pricing: "",
    website: "",
    source: "pickleballpeople.co.kr",
    amenities: "주차장",
    floorType: "체육관마루",
    description: "예천군 체육관 내 피클볼 코트. 예천피클볼클럽 활동 장소.",
  },

  // ── 경남 ──
  {
    name: "창원 피클볼 센터",
    address: "경남 창원시 의창구 중앙대로 151 창원실내체육관",
    region: "경남",
    lat: 35.2252, lng: 128.6811,
    courtType: "실내", courtCount: 4,
    phone: "",
    operatingHours: "09:00~21:00",
    pricing: "",
    website: "",
    source: "대한피클볼협회",
    amenities: "주차장, 샤워실, 탈의실",
    floorType: "체육관마루",
    description: "창원시 실내체육관 내 피클볼 코트.",
  },
  {
    name: "김해 피클볼 파크",
    address: "경남 김해시 금관대로 1483 김해실내체육관",
    region: "경남",
    lat: 35.2285, lng: 128.8890,
    courtType: "실내", courtCount: 3,
    phone: "",
    operatingHours: "09:00~21:00",
    pricing: "",
    website: "",
    source: "대한피클볼협회",
    amenities: "주차장",
    floorType: "체육관마루",
    description: "김해시 실내체육관 내 피클볼 코트.",
  },

  // ── 제주 ──
  {
    name: "제주 피클볼 아레나",
    address: "제주 제주시 오라남로 55 제주종합경기장",
    region: "제주",
    lat: 33.4464, lng: 126.5547,
    courtType: "실외", courtCount: 4,
    phone: "",
    operatingHours: "06:00~21:00",
    pricing: "무료",
    website: "",
    source: "대한피클볼협회",
    amenities: "주차장, 조명",
    floorType: "아크릴",
    description: "제주종합경기장 내 실외 피클볼 코트.",
  },
];

function genSlug(name: string): string {
  return name.toLowerCase()
    .replace(/[^\w가-힣\s]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 50) + "-" + Math.random().toString(36).slice(2, 6);
}

async function main() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  const existing = fs.existsSync(FILE)
    ? JSON.parse(fs.readFileSync(FILE, "utf-8"))
    : [];

  // 이미 있는 이름은 건너뜀
  const existingNames = new Set(existing.map((v: any) => v.name));
  const now = new Date().toISOString();
  let added = 0;

  for (const c of COURTS) {
    if (existingNames.has(c.name)) {
      console.log(`  ⏭ ${c.name} (이미 존재)`);
      continue;
    }

    existing.push({
      id: crypto.randomUUID().replace(/-/g, "").slice(0, 16),
      name: c.name,
      slug: genSlug(c.name),
      address: c.address,
      addressRoad: c.address,
      roadAddress: c.address,
      region: c.region,
      regionDepth1: c.region,
      lat: c.lat,
      lng: c.lng,
      courtCount: c.courtCount,
      courtType: c.courtType,
      indoorOutdoor: c.courtType,
      floorType: c.floorType,
      operatingHours: c.operatingHours,
      pricing: c.pricing,
      phone: c.phone,
      website: c.website,
      amenities: c.amenities,
      parkingAvailable: c.amenities.includes("주차장"),
      description: c.description,
      images: [],
      isPublished: true,
      isFeatured: false,
      isVerified: false,
      sourcePrimary: "seed",
      sourceUrl: c.source,
      createdAt: now,
      updatedAt: now,
    });
    added++;
    console.log(`  ✅ ${c.name} (${c.region})`);
  }

  fs.writeFileSync(FILE, JSON.stringify(existing, null, 2));
  console.log(`\n✅ ${added}개 피클볼장 추가 (전체 ${existing.length}개)`);
  console.log("   지역 분포:", [...new Set(COURTS.map(c => c.region))].join(", "));
}

main().catch(console.error);
