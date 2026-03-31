/**
 * 카카오 로컬 API로 피클볼장 데이터 수집
 * 실행: KAKAO_REST_API_KEY=your_key npx tsx src/scripts/collect-kakao.ts
 *
 * 카카오 REST API 키 발급: https://developers.kakao.com/
 * → 애플리케이션 → 앱 키 → REST API 키
 */
import fs from "fs";
import path from "path";

const API_KEY = process.env.KAKAO_REST_API_KEY;
if (!API_KEY) {
  console.error("❌ KAKAO_REST_API_KEY 환경변수가 필요합니다.");
  console.error("   사용법: KAKAO_REST_API_KEY=your_key npx tsx src/scripts/collect-kakao.ts");
  process.exit(1);
}

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "venues.json");

const KEYWORDS = ["피클볼", "피클볼장", "피클볼코트", "피클볼 센터"];

interface KakaoPlace {
  id: string;
  place_name: string;
  category_name: string;
  address_name: string;
  road_address_name: string;
  phone: string;
  x: string; // lng
  y: string; // lat
  place_url: string;
}

function getRegion(address: string): string {
  const regionMap: Record<string, string> = {
    "서울": "서울", "경기": "경기", "인천": "인천", "부산": "부산",
    "대구": "대구", "광주": "광주", "대전": "대전", "울산": "울산",
    "세종": "세종", "강원": "강원", "충북": "충북", "충남": "충남",
    "전북": "전북", "전남": "전남", "경북": "경북", "경남": "경남", "제주": "제주",
    "충청북": "충북", "충청남": "충남", "전라북": "전북", "전라남": "전남",
    "경상북": "경북", "경상남": "경남",
  };
  for (const [key, val] of Object.entries(regionMap)) {
    if (address.includes(key)) return val;
  }
  return "";
}

async function searchKakao(keyword: string, page: number = 1): Promise<{ documents: KakaoPlace[]; meta: { is_end: boolean } }> {
  const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(keyword)}&page=${page}&size=15`;
  const res = await fetch(url, {
    headers: { Authorization: `KakaoAK ${API_KEY}` },
  });
  if (!res.ok) throw new Error(`Kakao API error: ${res.status}`);
  return res.json();
}

function genSlug(name: string): string {
  return name.toLowerCase().replace(/[^\w가-힣\s]/g, "").replace(/\s+/g, "-").slice(0, 50) + "-" + Math.random().toString(36).slice(2, 6);
}

async function main() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  const existing = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, "utf-8")) : [];
  const existingNames = new Set(existing.map((v: any) => v.name));
  const seenIds = new Set<string>();
  const now = new Date().toISOString();
  let added = 0;

  for (const keyword of KEYWORDS) {
    console.log(`🔍 "${keyword}" 검색 중...`);
    let page = 1;
    let isEnd = false;

    while (!isEnd && page <= 3) { // 최대 3페이지
      const { documents, meta } = await searchKakao(keyword, page);
      isEnd = meta.is_end;

      for (const place of documents) {
        if (seenIds.has(place.id)) continue;
        seenIds.add(place.id);

        if (existingNames.has(place.place_name)) {
          console.log(`  ⏭ ${place.place_name} (이미 존재)`);
          continue;
        }

        const region = getRegion(place.road_address_name || place.address_name);
        const venue = {
          id: `kakao_${place.id}`,
          name: place.place_name,
          slug: genSlug(place.place_name),
          address: place.road_address_name || place.address_name,
          addressRoad: place.road_address_name,
          roadAddress: place.road_address_name,
          region,
          regionDepth1: region,
          lat: parseFloat(place.y),
          lng: parseFloat(place.x),
          courtCount: 0,
          courtType: "",
          indoorOutdoor: "",
          floorType: "",
          operatingHours: "",
          pricing: "",
          phone: place.phone,
          website: place.place_url,
          amenities: "",
          parkingAvailable: false,
          description: `카카오 지도에서 수집된 데이터. 카테고리: ${place.category_name}`,
          images: [],
          isPublished: true,
          isFeatured: false,
          isVerified: false,
          sourcePrimary: "kakao_local",
          sourceUrl: place.place_url,
          createdAt: now,
          updatedAt: now,
        };

        existing.push(venue);
        existingNames.add(place.place_name);
        added++;
        console.log(`  ✅ ${place.place_name} (${region || "지역 미상"}) — ${place.road_address_name || place.address_name}`);
      }

      page++;
      // Rate limit
      await new Promise(r => setTimeout(r, 300));
    }
  }

  fs.writeFileSync(FILE, JSON.stringify(existing, null, 2));
  console.log(`\n✅ 카카오 API 수집 완료: ${added}개 추가 (전체 ${existing.length}개)`);
}

main().catch(console.error);
