/**
 * 카카오맵 API로 전국 피클볼장 실제 데이터 수집
 * 실행: npx tsx src/scripts/fetch-kakao-venues.ts
 *
 * 카카오 키워드 검색 API는 한 번에 최대 45개(15개×3페이지)까지 반환.
 * 전국을 커버하기 위해 주요 도시별로 검색합니다.
 */
import fs from "fs";
import path from "path";

const KAKAO_REST_KEY = "cf7465d41a479bfb84a276e7f5b92784";
const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "venues.json");

// 주요 도시 좌표 (검색 중심점)
const CITIES: { name: string; region: string; lng: number; lat: number }[] = [
  { name: "서울", region: "서울", lng: 126.978, lat: 37.5665 },
  { name: "강남", region: "서울", lng: 127.0495, lat: 37.5172 },
  { name: "송파", region: "서울", lng: 127.1058, lat: 37.5145 },
  { name: "마포", region: "서울", lng: 126.9082, lat: 37.5663 },
  { name: "노원", region: "서울", lng: 127.0569, lat: 37.6543 },
  { name: "수원", region: "경기", lng: 127.0286, lat: 37.2636 },
  { name: "성남", region: "경기", lng: 127.1378, lat: 37.4201 },
  { name: "고양", region: "경기", lng: 126.832, lat: 37.6584 },
  { name: "용인", region: "경기", lng: 127.1773, lat: 37.2411 },
  { name: "하남", region: "경기", lng: 127.2061, lat: 37.5466 },
  { name: "김포", region: "경기", lng: 126.7153, lat: 37.6153 },
  { name: "평택", region: "경기", lng: 127.0122, lat: 36.9922 },
  { name: "안양", region: "경기", lng: 126.9512, lat: 37.3943 },
  { name: "파주", region: "경기", lng: 126.78, lat: 37.76 },
  { name: "화성", region: "경기", lng: 126.831, lat: 37.199 },
  { name: "인천", region: "인천", lng: 126.7052, lat: 37.4563 },
  { name: "송도", region: "인천", lng: 126.6607, lat: 37.3809 },
  { name: "부산", region: "부산", lng: 129.0756, lat: 35.1796 },
  { name: "해운대", region: "부산", lng: 129.1604, lat: 35.1631 },
  { name: "대구", region: "대구", lng: 128.6014, lat: 35.8714 },
  { name: "대전", region: "대전", lng: 127.3845, lat: 36.3504 },
  { name: "광주", region: "광주", lng: 126.8526, lat: 35.1595 },
  { name: "울산", region: "울산", lng: 129.3114, lat: 35.5384 },
  { name: "세종", region: "세종", lng: 127.0049, lat: 36.504 },
  { name: "춘천", region: "강원", lng: 127.7295, lat: 37.8813 },
  { name: "원주", region: "강원", lng: 127.9202, lat: 37.342 },
  { name: "강릉", region: "강원", lng: 128.8761, lat: 37.7519 },
  { name: "청주", region: "충북", lng: 127.4872, lat: 36.6424 },
  { name: "천안", region: "충남", lng: 127.1522, lat: 36.8151 },
  { name: "전주", region: "전북", lng: 127.1485, lat: 35.8242 },
  { name: "여수", region: "전남", lng: 127.6623, lat: 34.7604 },
  { name: "목포", region: "전남", lng: 126.3922, lat: 34.8118 },
  { name: "포항", region: "경북", lng: 129.3436, lat: 36.019 },
  { name: "경주", region: "경북", lng: 129.2248, lat: 35.8562 },
  { name: "창원", region: "경남", lng: 128.6811, lat: 35.2281 },
  { name: "김해", region: "경남", lng: 128.8893, lat: 35.2285 },
  { name: "제주", region: "제주", lng: 126.5312, lat: 33.4996 },
  { name: "서귀포", region: "제주", lng: 126.5125, lat: 33.2541 },
];

const KEYWORDS = ["피클볼", "피클볼장", "피클볼코트"];

interface KakaoPlace {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name: string;
  phone: string;
  place_url: string;
  x: string; // lng
  y: string; // lat
  category_name: string;
}

interface KakaoResponse {
  documents: KakaoPlace[];
  meta: { is_end: boolean; total_count: number };
}

async function searchKakao(keyword: string, lng: number, lat: number, page: number): Promise<KakaoResponse> {
  const url = new URL("https://dapi.kakao.com/v2/local/search/keyword.json");
  url.searchParams.set("query", keyword);
  url.searchParams.set("x", String(lng));
  url.searchParams.set("y", String(lat));
  url.searchParams.set("radius", "20000"); // 20km
  url.searchParams.set("page", String(page));
  url.searchParams.set("size", "15");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kakao API error ${res.status}: ${text}`);
  }
  return res.json();
}

function extractRegion(address: string): string {
  const regionMap: Record<string, string> = {
    "서울": "서울", "부산": "부산", "대구": "대구", "인천": "인천",
    "광주": "광주", "대전": "대전", "울산": "울산", "세종": "세종",
    "경기": "경기", "강원": "강원", "충북": "충북", "충남": "충남",
    "전북": "전북", "전남": "전남", "경북": "경북", "경남": "경남",
    "제주": "제주",
  };
  for (const [key, val] of Object.entries(regionMap)) {
    if (address.startsWith(key)) return val;
  }
  return "";
}

function extractRegionDepth2(address: string): string {
  const parts = address.split(" ");
  return parts.length >= 2 ? parts[1] : "";
}

function genSlug(name: string): string {
  return name.toLowerCase()
    .replace(/[^\w가-힣\s]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 50) + "-" + Math.random().toString(36).slice(2, 6);
}

async function main() {
  console.log("🔍 카카오맵 API로 피클볼장 검색 시작...\n");

  // 기존 데이터 로드
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const existing: any[] = fs.existsSync(FILE)
    ? JSON.parse(fs.readFileSync(FILE, "utf-8"))
    : [];
  const existingNames = new Set(existing.map((v: any) => v.name));

  // 카카오 place_id로 중복 방지
  const seenIds = new Set<string>();
  const newVenues: any[] = [];

  for (const city of CITIES) {
    for (const keyword of KEYWORDS) {
      for (let page = 1; page <= 3; page++) {
        try {
          const data = await searchKakao(keyword, city.lng, city.lat, page);

          for (const place of data.documents) {
            if (seenIds.has(place.id)) continue;
            seenIds.add(place.id);

            // 이미 있는 이름이면 건너뜀
            if (existingNames.has(place.place_name)) continue;

            const address = place.road_address_name || place.address_name;
            const region = extractRegion(address);

            newVenues.push({
              id: crypto.randomUUID().replace(/-/g, "").slice(0, 16),
              name: place.place_name,
              slug: genSlug(place.place_name),
              address: place.address_name,
              addressRoad: place.road_address_name,
              roadAddress: place.road_address_name,
              region: region,
              regionDepth1: region,
              regionDepth2: extractRegionDepth2(address),
              lat: parseFloat(place.y),
              lng: parseFloat(place.x),
              courtCount: 0,
              courtType: "",
              indoorOutdoor: "unknown",
              floorType: "",
              operatingHours: "",
              pricing: "",
              phone: place.phone,
              website: "",
              amenities: "",
              parkingAvailable: false,
              description: "",
              images: [],
              isPublished: true,
              isFeatured: false,
              isVerified: false,
              sourcePrimary: "kakao",
              sourceUrl: place.place_url,
              category: place.category_name,
              kakaoId: place.id,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });

            existingNames.add(place.place_name);
            console.log(`  ✅ ${place.place_name} — ${address}`);
          }

          if (data.meta.is_end) break;

          // API rate limit 방지
          await new Promise(r => setTimeout(r, 200));
        } catch (err) {
          console.error(`  ❌ ${city.name}/${keyword} page${page}: ${err}`);
        }
      }
    }
  }

  // 기존 + 신규 병합 저장
  const merged = [...existing, ...newVenues];
  fs.writeFileSync(FILE, JSON.stringify(merged, null, 2));

  console.log(`\n════════════════════════════════`);
  console.log(`✅ 신규 수집: ${newVenues.length}개`);
  console.log(`📊 기존: ${existing.length}개 → 전체: ${merged.length}개`);

  // 지역별 분포
  const regionCount: Record<string, number> = {};
  for (const v of merged) {
    regionCount[v.region] = (regionCount[v.region] || 0) + 1;
  }
  console.log(`\n📍 지역별 분포:`);
  for (const [region, count] of Object.entries(regionCount).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${region}: ${count}개`);
  }
}

main().catch(console.error);
