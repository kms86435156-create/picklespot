import { prisma } from "@/lib/prisma";
import { normalizeVenue, generateSlug, dedupeVenue } from "../normalizers";
import type { CollectorResult } from "./index";

// 카카오 Local API (키워드 검색)
// https://developers.kakao.com/docs/latest/ko/local/dev-guide
const KAKAO_REST_KEY = process.env.KAKAO_REST_KEY || "";
const API_URL = "https://dapi.kakao.com/v2/local/search/keyword.json";

const QUERIES = [
  "피클볼", "피클볼장", "피클볼 코트",
];

interface KakaoPlace {
  id: string;
  place_name: string;
  category_name: string;
  phone: string;
  address_name: string;
  road_address_name: string;
  x: string; // lng
  y: string; // lat
  place_url: string;
}

async function searchKakao(query: string, page = 1): Promise<KakaoPlace[]> {
  if (!KAKAO_REST_KEY) return [];

  const url = `${API_URL}?query=${encodeURIComponent(query)}&page=${page}&size=15`;
  const res = await fetch(url, {
    headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` },
  });

  if (!res.ok) throw new Error(`Kakao API error: ${res.status}`);
  const data = await res.json();
  return data.documents || [];
}

export async function collectKakaoLocal(_jobId: string): Promise<CollectorResult> {
  const result: CollectorResult = { created: 0, updated: 0, skipped: 0, errors: 0, logs: [] };

  if (!KAKAO_REST_KEY) {
    result.logs.push("KAKAO_REST_KEY not set — skipping Kakao Local collection");
    return result;
  }

  for (const query of QUERIES) {
    try {
      // Collect up to 3 pages
      for (let page = 1; page <= 3; page++) {
        const places = await searchKakao(query, page);
        if (places.length === 0) break;

        result.logs.push(`Query "${query}" page ${page}: ${places.length} results`);

        for (const place of places) {
          try {
            const normalized = normalizeVenue({
              name: place.place_name,
              addressRoad: place.road_address_name,
              addressJibun: place.address_name,
              phone: place.phone,
              lat: parseFloat(place.y) || null,
              lng: parseFloat(place.x) || null,
              website: place.place_url,
              category: place.category_name,
              description: "",
              source: "kakao-local",
              sourceUrl: place.place_url,
            });

            const existing = await dedupeVenue(normalized);
            if (existing) {
              // Update with Kakao data if it has better coordinates
              if (normalized.lat && normalized.lng && (!existing.lat || !existing.lng)) {
                await prisma.venue.update({
                  where: { id: existing.id },
                  data: { lat: normalized.lat, lng: normalized.lng },
                });
                result.updated++;
              } else {
                result.skipped++;
              }
              continue;
            }

            const slug = generateSlug(normalized.name);
            await prisma.venue.create({
              data: {
                name: normalized.name,
                slug,
                addressRoad: normalized.addressRoad,
                addressJibun: normalized.addressJibun,
                lat: normalized.lat,
                lng: normalized.lng,
                regionDepth1: normalized.addressRoad.split(" ")[0] || "",
                regionDepth2: normalized.addressRoad.split(" ")[1] || "",
                phone: normalized.phone,
                website: normalized.website,
                sourcePrimary: "kakao-local",
                sourceUrls: JSON.stringify([normalized.sourceUrl]),
                isVerified: false,
              },
            });

            await prisma.sourceRecord.create({
              data: {
                entityType: "venue",
                entityId: slug,
                sourceName: "kakao-local",
                sourceUrl: normalized.sourceUrl,
                rawPayload: JSON.stringify(place),
                parseStatus: "success",
              },
            });

            result.created++;
          } catch (e: any) {
            result.errors++;
            result.logs.push(`Error: ${e.message}`);
          }
        }

        await new Promise((r) => setTimeout(r, 200));
      }
    } catch (e: any) {
      result.errors++;
      result.logs.push(`Query "${query}" failed: ${e.message}`);
    }
  }

  return result;
}
