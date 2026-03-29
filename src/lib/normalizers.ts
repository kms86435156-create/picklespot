import { prisma } from "./prisma";

export interface RawVenue {
  name: string;
  addressRoad: string;
  addressJibun: string;
  phone: string;
  lat: number | null;
  lng: number | null;
  website: string;
  category: string;
  description: string;
  source: string;
  sourceUrl: string;
}

export function normalizeVenue(raw: RawVenue): RawVenue {
  return {
    ...raw,
    name: cleanName(raw.name),
    phone: cleanPhone(raw.phone),
    addressRoad: cleanAddress(raw.addressRoad),
    addressJibun: cleanAddress(raw.addressJibun),
    website: raw.website?.trim() || "",
  };
}

export function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

export async function dedupeVenue(normalized: RawVenue) {
  // 1. 정확한 이름 + 주소 일치
  const byNameAddr = await prisma.venue.findFirst({
    where: {
      name: normalized.name,
      addressRoad: normalized.addressRoad,
    },
  });
  if (byNameAddr) return byNameAddr;

  // 2. 전화번호 일치 (비어있지 않으면)
  if (normalized.phone && normalized.phone.length >= 8) {
    const byPhone = await prisma.venue.findFirst({
      where: { phone: normalized.phone },
    });
    if (byPhone) return byPhone;
  }

  // 3. 좌표 근접 (50m 이내) + 이름 유사
  if (normalized.lat && normalized.lng) {
    const nearby = await prisma.venue.findMany({
      where: {
        lat: { gte: normalized.lat - 0.0005, lte: normalized.lat + 0.0005 },
        lng: { gte: normalized.lng - 0.0005, lte: normalized.lng + 0.0005 },
      },
    });
    for (const v of nearby) {
      if (similarName(v.name, normalized.name)) return v;
    }
  }

  return null;
}

function cleanName(name: string): string {
  return name
    .replace(/<[^>]*>/g, "")  // HTML 태그 제거
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanPhone(phone: string): string {
  return phone.replace(/[^0-9-]/g, "").trim();
}

function cleanAddress(addr: string): string {
  return addr.replace(/\s+/g, " ").trim();
}

function similarName(a: string, b: string): boolean {
  const na = a.replace(/\s/g, "").toLowerCase();
  const nb = b.replace(/\s/g, "").toLowerCase();
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  return false;
}
