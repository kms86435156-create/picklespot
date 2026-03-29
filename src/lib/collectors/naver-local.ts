import { prisma } from "@/lib/prisma";
import { normalizeVenue, generateSlug, dedupeVenue } from "../normalizers";
import type { CollectorResult } from "./index";

// 네이버 지역 검색 API
// https://developers.naver.com/docs/serviceapi/search/local/local.md
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID || "";
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET || "";
const API_URL = "https://openapi.naver.com/v1/search/local.json";

const QUERIES = [
  "피클볼", "피클볼장", "실내 피클볼", "피클볼 코트",
  "서울 피클볼", "경기 피클볼", "부산 피클볼", "인천 피클볼",
  "대전 피클볼", "대구 피클볼", "광주 피클볼", "제주 피클볼",
];

interface NaverLocalItem {
  title: string;
  link: string;
  category: string;
  description: string;
  telephone: string;
  address: string;
  roadAddress: string;
  mapx: string;
  mapy: string;
}

async function searchNaver(query: string, start = 1): Promise<NaverLocalItem[]> {
  if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
    return [];
  }

  const url = `${API_URL}?query=${encodeURIComponent(query)}&display=5&start=${start}&sort=comment`;
  const res = await fetch(url, {
    headers: {
      "X-Naver-Client-Id": NAVER_CLIENT_ID,
      "X-Naver-Client-Secret": NAVER_CLIENT_SECRET,
    },
  });

  if (!res.ok) {
    throw new Error(`Naver API error: ${res.status}`);
  }

  const data = await res.json();
  return data.items || [];
}

export async function collectNaverLocal(_jobId: string): Promise<CollectorResult> {
  const result: CollectorResult = { created: 0, updated: 0, skipped: 0, errors: 0, logs: [] };

  if (!NAVER_CLIENT_ID) {
    result.logs.push("NAVER_CLIENT_ID not set — skipping Naver Local collection");
    return result;
  }

  for (const query of QUERIES) {
    try {
      const items = await searchNaver(query);
      result.logs.push(`Query "${query}": ${items.length} results`);

      for (const item of items) {
        try {
          const normalized = normalizeVenue({
            name: item.title.replace(/<[^>]*>/g, ""),
            addressRoad: item.roadAddress,
            addressJibun: item.address,
            phone: item.telephone,
            lat: parseNaverCoord(item.mapy),
            lng: parseNaverCoord(item.mapx),
            website: item.link,
            category: item.category,
            description: item.description,
            source: "naver-local",
            sourceUrl: item.link,
          });

          const slug = generateSlug(normalized.name);
          const existing = await dedupeVenue(normalized);

          if (existing) {
            result.skipped++;
            continue;
          }

          await prisma.venue.create({
            data: {
              name: normalized.name,
              slug,
              category: normalized.category.includes("피클볼") ? "pickleball_court" : "sports_facility",
              description: normalized.description,
              addressRoad: normalized.addressRoad,
              addressJibun: normalized.addressJibun,
              lat: normalized.lat,
              lng: normalized.lng,
              regionDepth1: extractRegion(normalized.addressRoad, 1),
              regionDepth2: extractRegion(normalized.addressRoad, 2),
              phone: normalized.phone,
              website: normalized.website,
              sourcePrimary: "naver-local",
              sourceUrls: JSON.stringify([normalized.sourceUrl]),
              isVerified: false,
            },
          });

          // Save source record
          await prisma.sourceRecord.create({
            data: {
              entityType: "venue",
              entityId: slug,
              sourceName: "naver-local",
              sourceUrl: normalized.sourceUrl,
              rawPayload: JSON.stringify(item),
              parseStatus: "success",
            },
          });

          result.created++;
        } catch (e: any) {
          result.errors++;
          result.logs.push(`Error processing "${item.title}": ${e.message}`);
        }
      }

      // Rate limit: 100ms between queries
      await new Promise((r) => setTimeout(r, 100));
    } catch (e: any) {
      result.errors++;
      result.logs.push(`Query "${query}" failed: ${e.message}`);
    }
  }

  return result;
}

function parseNaverCoord(val: string): number | null {
  if (!val) return null;
  // 네이버 좌표는 10^7 배 정수로 제공됨
  const num = parseInt(val);
  return num ? num / 10000000 : null;
}

function extractRegion(address: string, depth: number): string {
  const parts = address.split(" ");
  return parts[depth - 1] || "";
}
