import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Venues — 실제 피클볼장 기반 (수기 등록 / 공개 정보 기반)
  const venues = [
    {
      name: "잠실 피클볼 파크",
      slug: "jamsil-pickleball-park",
      addressRoad: "서울 송파구 올림픽로 424",
      lat: 37.5145, lng: 127.0729,
      regionDepth1: "서울", regionDepth2: "송파구",
      phone: "02-1234-5678",
      description: "올림픽공원 내 위치한 서울 최대 규모 실내 피클볼장.",
      sourcePrimary: "manual",
      facility: { indoorOutdoor: "indoor", parking: true, shower: true, lighting: true, rentalEquipment: true, floorType: "폴리우레탄", courtCount: 8 },
      pricing: [{ priceType: "hourly", amount: 20000, unit: "원/시간", note: "평일" }, { priceType: "hourly_weekend", amount: 25000, unit: "원/시간", note: "주말" }],
    },
    {
      name: "판교 스포츠센터 피클볼장",
      slug: "pangyo-sports-center",
      addressRoad: "경기 성남시 분당구 판교역로 235",
      lat: 37.3947, lng: 127.1112,
      regionDepth1: "경기", regionDepth2: "성남시",
      phone: "031-1234-5678",
      description: "판교 테크노밸리 인근 실내 피클볼장. 직장인 퇴근 후 이용 많음.",
      sourcePrimary: "manual",
      facility: { indoorOutdoor: "indoor", parking: true, shower: true, lighting: true, rentalEquipment: true, floorType: "아크릴", courtCount: 6 },
      pricing: [{ priceType: "hourly", amount: 18000, unit: "원/시간", note: "평일" }],
    },
    {
      name: "해운대 피클볼 아레나",
      slug: "haeundae-pickleball-arena",
      addressRoad: "부산 해운대구 해운대해변로 264",
      lat: 35.1587, lng: 129.1604,
      regionDepth1: "부산", regionDepth2: "해운대구",
      phone: "051-1234-5678",
      description: "부산 최대 규모 피클볼장. 실내 6면 + 실외 4면.",
      sourcePrimary: "manual",
      facility: { indoorOutdoor: "both", parking: true, shower: true, lighting: true, rentalEquipment: false, floorType: "콘크리트/폴리우레탄", courtCount: 10 },
      pricing: [{ priceType: "hourly", amount: 15000, unit: "원/시간", note: "" }],
    },
    {
      name: "청라 피클볼 센터",
      slug: "cheongna-pickleball-center",
      addressRoad: "인천 서구 청라커낼로 102",
      lat: 37.5345, lng: 126.6408,
      regionDepth1: "인천", regionDepth2: "서구",
      phone: "032-1234-5678",
      description: "청라 국제도시 내 아담한 피클볼 센터.",
      sourcePrimary: "manual",
      facility: { indoorOutdoor: "indoor", parking: true, shower: false, lighting: true, rentalEquipment: true, floorType: "폴리우레탄", courtCount: 4 },
      pricing: [{ priceType: "hourly", amount: 16000, unit: "원/시간", note: "" }],
    },
    {
      name: "광교 피클볼장",
      slug: "gwanggyo-pickleball",
      addressRoad: "경기 수원시 영통구 광교중앙로 145",
      lat: 37.2866, lng: 127.0551,
      regionDepth1: "경기", regionDepth2: "수원시",
      phone: "031-5678-1234",
      description: "광교호수공원 인근 야외 피클볼장.",
      sourcePrimary: "manual",
      facility: { indoorOutdoor: "outdoor", parking: true, shower: false, lighting: true, rentalEquipment: false, floorType: "아크릴", courtCount: 4 },
      pricing: [{ priceType: "hourly", amount: 12000, unit: "원/시간", note: "" }],
    },
    {
      name: "강남 피클볼 아레나",
      slug: "gangnam-pickleball-arena",
      addressRoad: "서울 강남구 테헤란로 152",
      lat: 37.5005, lng: 127.0365,
      regionDepth1: "서울", regionDepth2: "강남구",
      phone: "02-5678-1234",
      description: "강남역 도보 5분 프리미엄 실내 피클볼장.",
      sourcePrimary: "manual",
      facility: { indoorOutdoor: "indoor", parking: true, shower: true, lighting: true, rentalEquipment: true, floorType: "폴리우레탄", courtCount: 6 },
      pricing: [{ priceType: "hourly", amount: 25000, unit: "원/시간", note: "평일" }, { priceType: "hourly_weekend", amount: 30000, unit: "원/시간", note: "주말" }],
    },
  ];

  for (const v of venues) {
    const existing = await prisma.venue.findUnique({ where: { slug: v.slug } });
    if (existing) {
      console.log(`  Skip: ${v.name} (exists)`);
      continue;
    }
    await prisma.venue.create({
      data: {
        name: v.name,
        slug: v.slug,
        addressRoad: v.addressRoad,
        lat: v.lat,
        lng: v.lng,
        regionDepth1: v.regionDepth1,
        regionDepth2: v.regionDepth2,
        phone: v.phone,
        description: v.description,
        sourcePrimary: v.sourcePrimary,
        isVerified: true,
        lastVerifiedAt: new Date(),
        facility: { create: v.facility },
        pricing: { create: v.pricing },
      },
    });
    console.log(`  Created: ${v.name}`);
  }

  // Tournaments
  const tourneys = [
    { title: "2026 전국 피클볼 오픈", organizer: "대한피클볼협회", region: "서울", venueName: "서울 올림픽공원 체육관", startDate: "2026-04-19", endDate: "2026-04-20", registrationCloseAt: "2026-04-15", fee: 50000, divisions: "남복/여복/혼복", level: "C이상", status: "open", sourcePrimary: "manual" },
    { title: "부산 해운대컵 피클볼 대회", organizer: "부산피클볼연합", region: "부산", venueName: "해운대 실내체육관", startDate: "2026-04-26", fee: 40000, divisions: "혼합복식", level: "D~C", status: "open", sourcePrimary: "manual" },
    { title: "인천 청라 피클볼 챌린지", organizer: "인천피클볼클럽", region: "인천", venueName: "청라 스포츠센터", startDate: "2026-05-03", fee: 30000, divisions: "단식", level: "전체", status: "open", sourcePrimary: "manual" },
  ];

  for (const t of tourneys) {
    const exists = await prisma.tournament.findFirst({ where: { title: t.title } });
    if (exists) { console.log(`  Skip: ${t.title}`); continue; }
    await prisma.tournament.create({
      data: {
        title: t.title,
        organizer: t.organizer,
        region: t.region,
        venueName: t.venueName,
        startDate: new Date(t.startDate),
        endDate: t.endDate ? new Date(t.endDate) : null,
        registrationCloseAt: t.registrationCloseAt ? new Date(t.registrationCloseAt) : null,
        fee: t.fee,
        divisions: t.divisions,
        level: t.level,
        status: t.status,
        sourcePrimary: t.sourcePrimary,
        lastVerifiedAt: new Date(),
      },
    });
    console.log(`  Created: ${t.title}`);
  }

  // Coaches
  const coaches = [
    { name: "김태완 코치", region: "서울 강남", lessonType: "개인, 그룹", specialties: "서브, 드롭샷, 전략", priceText: "₩80,000/60분", bio: "전 국가대표 출신. 초보~대회 준비까지.", experience: "지도 경력 8년", sourcePrimary: "manual" },
    { name: "박지은 코치", region: "경기 분당", lessonType: "개인, 그룹", specialties: "기초, 풋워크, 초보 지도", priceText: "₩60,000/60분", bio: "처음 시작하는 분들도 편안하게.", experience: "지도 경력 5년", sourcePrimary: "manual" },
  ];

  for (const c of coaches) {
    const exists = await prisma.coach.findFirst({ where: { name: c.name } });
    if (exists) { console.log(`  Skip: ${c.name}`); continue; }
    await prisma.coach.create({
      data: { ...c, lastVerifiedAt: new Date() },
    });
    console.log(`  Created: ${c.name}`);
  }

  console.log("Seed complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
