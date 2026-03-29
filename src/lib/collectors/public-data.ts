import { prisma } from "@/lib/prisma";
import { normalizeVenue, generateSlug, dedupeVenue } from "../normalizers";
import type { CollectorResult } from "./index";

// 공공데이터 — 전국공공체육시설개방정보
// https://www.data.go.kr/data/15066466/fileData.do
// API key가 없으면 skip
const PUBLIC_DATA_KEY = process.env.PUBLIC_DATA_KEY || "";

export async function collectPublicData(_jobId: string): Promise<CollectorResult> {
  const result: CollectorResult = { created: 0, updated: 0, skipped: 0, errors: 0, logs: [] };

  if (!PUBLIC_DATA_KEY) {
    result.logs.push("PUBLIC_DATA_KEY not set — skipping public data collection");
    result.logs.push("To enable: register at data.go.kr and set PUBLIC_DATA_KEY env var");
    return result;
  }

  try {
    // 공공체육시설 API 호출 (예시 - 실제 엔드포인트는 활용 신청 후 확인)
    const url = `https://api.odcloud.kr/api/15066466/v1/uddi:b69ceeb4-c81e-47c0-b68c-b7e4bc5e0b1a?page=1&perPage=100&serviceKey=${PUBLIC_DATA_KEY}`;
    const res = await fetch(url);

    if (!res.ok) {
      result.logs.push(`Public data API error: ${res.status}`);
      result.errors++;
      return result;
    }

    const data = await res.json();
    const items = data.data || [];
    result.logs.push(`Public data: ${items.length} facilities fetched`);

    for (const item of items) {
      // 피클볼 관련 시설만 필터
      const name = item["시설명"] || item["체육시설명"] || "";
      const type = item["종목"] || item["체육시설종류"] || "";

      if (!name.includes("피클볼") && !type.includes("피클볼")) {
        result.skipped++;
        continue;
      }

      try {
        const normalized = normalizeVenue({
          name,
          addressRoad: item["도로명주소"] || item["소재지도로명주소"] || "",
          addressJibun: item["지번주소"] || item["소재지지번주소"] || "",
          phone: item["전화번호"] || "",
          lat: parseFloat(item["위도"]) || null,
          lng: parseFloat(item["경도"]) || null,
          website: "",
          category: "public_sports_facility",
          description: `${item["관리기관명"] || ""} 관리`,
          source: "public-data",
          sourceUrl: "https://data.go.kr",
        });

        const existing = await dedupeVenue(normalized);
        if (existing) {
          result.skipped++;
          continue;
        }

        const slug = generateSlug(normalized.name);
        await prisma.venue.create({
          data: {
            name: normalized.name,
            slug,
            category: "public_sports_facility",
            description: normalized.description,
            addressRoad: normalized.addressRoad,
            addressJibun: normalized.addressJibun,
            lat: normalized.lat,
            lng: normalized.lng,
            regionDepth1: normalized.addressRoad.split(" ")[0] || "",
            regionDepth2: normalized.addressRoad.split(" ")[1] || "",
            phone: normalized.phone,
            sourcePrimary: "public-data",
            sourceUrls: JSON.stringify(["https://data.go.kr"]),
            isVerified: false,
          },
        });

        result.created++;
      } catch (e: any) {
        result.errors++;
        result.logs.push(`Error: ${e.message}`);
      }
    }
  } catch (e: any) {
    result.errors++;
    result.logs.push(`Public data fetch failed: ${e.message}`);
  }

  return result;
}
