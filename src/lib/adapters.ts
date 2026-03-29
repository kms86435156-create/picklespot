// DB 응답을 프론트 컴포넌트가 기대하는 형태로 변환

export function adaptVenue(dbVenue: any) {
  const f = dbVenue.facility;
  return {
    id: dbVenue.id,
    name: dbVenue.name,
    slug: dbVenue.slug,
    address: dbVenue.addressRoad,
    region: dbVenue.regionDepth1,
    lat: dbVenue.lat,
    lng: dbVenue.lng,
    type: f?.indoorOutdoor === "indoor" ? "indoor" : f?.indoorOutdoor === "outdoor" ? "outdoor" : "both",
    courtCount: f?.courtCount || 0,
    surface: f?.floorType || "",
    pricePerHour: dbVenue.pricing?.[0]?.amount || 0,
    priceWeekend: dbVenue.pricing?.find((p: any) => p.note?.includes("주말"))?.amount,
    amenities: buildAmenities(f),
    hasParking: f?.parking || false,
    hasShower: f?.shower || false,
    hasLighting: f?.lighting || false,
    hasEquipmentRental: f?.rentalEquipment || false,
    operatingHours: "문의 필요",
    rating: 0,
    reviewCount: 0,
    reviews: [],
    peakHours: "문의 필요",
    description: dbVenue.description || "",
    photos: [],
    phone: dbVenue.phone,
    isVerified: dbVenue.isVerified,
    lastVerifiedAt: dbVenue.lastVerifiedAt,
    sourcePrimary: dbVenue.sourcePrimary,
    // 시간 슬롯은 아직 실시간 데이터 없음 — 빈 배열
    availableSlots: [],
  };
}

export function adaptTournament(t: any) {
  const now = new Date();
  const regClose = t.registrationCloseAt ? new Date(t.registrationCloseAt) : null;
  let status = t.status || "open";
  if (regClose && regClose < now) status = "closed";

  return {
    id: t.id,
    title: t.title,
    date: t.startDate ? new Date(t.startDate).toISOString().split("T")[0] : "",
    endDate: t.endDate ? new Date(t.endDate).toISOString().split("T")[0] : undefined,
    registrationDeadline: t.registrationCloseAt ? new Date(t.registrationCloseAt).toISOString().split("T")[0] : null,
    location: t.venueName,
    address: "",
    region: t.region,
    type: guessType(t.divisions),
    typeLabel: t.divisions,
    level: t.level,
    status,
    currentSlots: 0,
    maxSlots: 0,
    waitlistCount: 0,
    entryFee: t.fee,
    organizer: t.organizer,
    organizerContact: "",
    description: t.description || "",
    refundPolicy: "주최 측 문의",
    rules: [],
    schedule: [],
    faq: [],
    notice: "",
    amenities: [],
    participants: [],
    detailUrl: t.detailUrl || "",
    sourcePrimary: t.sourcePrimary,
    lastVerifiedAt: t.lastVerifiedAt,
  };
}

export function adaptCoach(c: any) {
  return {
    id: c.id,
    name: c.name,
    region: c.region,
    level: "",
    specialties: c.specialties ? c.specialties.split(", ") : [],
    rating: 0,
    reviewCount: 0,
    pricePerSession: parseInt(c.priceText?.replace(/[^0-9]/g, "")) || 0,
    sessionDuration: "60분",
    lessonType: c.lessonType ? c.lessonType.split(", ") : [],
    bio: c.bio || "",
    experience: c.experience || "",
    sourcePrimary: c.sourcePrimary,
    lastVerifiedAt: c.lastVerifiedAt,
  };
}

function buildAmenities(f: any): string[] {
  if (!f) return [];
  const a: string[] = [];
  if (f.parking) a.push("주차");
  if (f.shower) a.push("샤워실");
  if (f.lighting) a.push("조명");
  if (f.rentalEquipment) a.push("장비대여");
  return a;
}

function guessType(divisions: string): string {
  if (!divisions) return "doubles";
  if (divisions.includes("단식")) return "singles";
  if (divisions.includes("혼")) return "mixed";
  if (divisions.includes("팀")) return "team";
  return "doubles";
}
