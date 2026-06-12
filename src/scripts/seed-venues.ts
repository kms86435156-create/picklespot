import fs from "fs";
import path from "path";

const venuesPath = path.join(process.cwd(), "data", "venues.json");

const SEED_VENUES = [
  { name: "엠무브테니스 용마점", region: "서울 중랑", address: "서울 중랑구 망우로70길 103", indoorOutdoor: "겸용", parkingAvailable: true, courtCount: 4, isFeatured: true, operatingHours: "06:00 - 24:00", phone: "02-1234-5678" },
  { name: "반포 스포모티브", region: "서울 서초", address: "서울 서초구 고무래로 18-4 B2", indoorOutdoor: "실내", parkingAvailable: true, courtCount: 2, isFeatured: true, operatingHours: "06:00 - 23:00", phone: "02-535-1234" },
  { name: "송도 제이필드", region: "인천 연수", address: "인천 연수구 하모니로178번길 11", indoorOutdoor: "실내", parkingAvailable: true, courtCount: 3, isFeatured: true, operatingHours: "06:00 - 24:00", phone: "032-831-5678" },
  { name: "수원 The Line 피클볼장", region: "경기 수원", address: "경기 수원시", indoorOutdoor: "실내", parkingAvailable: true, courtCount: 2, isFeatured: false, operatingHours: "09:00 - 22:00", phone: "" },
  { name: "클럽 520 (휘경여고)", region: "서울 동대문", address: "서울 동대문구 휘경로 117 체육관", indoorOutdoor: "실내", parkingAvailable: true, courtCount: 3, isFeatured: false, operatingHours: "주말 개방", phone: "" },
  { name: "위너스 테니스&피클볼 파크", region: "경기 평택", address: "경기 평택시", indoorOutdoor: "겸용", parkingAvailable: true, courtCount: 4, isFeatured: false, operatingHours: "06:00 - 23:00", phone: "" },
  { name: "고양 행주피클볼구장", region: "경기 고양", address: "경기 고양시 덕양구 행주외동", indoorOutdoor: "실외", parkingAvailable: true, courtCount: 4, isFeatured: false, operatingHours: "09:00 - 18:00", phone: "" },
  { name: "일자산자연공원 야외 코트", region: "서울 강동", address: "서울 강동구 둔촌동 산125", indoorOutdoor: "실외", parkingAvailable: true, courtCount: 2, isFeatured: false, operatingHours: "상시 개방", phone: "" },
  { name: "안양 호계체육관", region: "경기 안양", address: "경기 안양시 동안구 귀인로 80번길", indoorOutdoor: "실내", parkingAvailable: true, courtCount: 4, isFeatured: false, operatingHours: "06:00 - 22:00", phone: "031-389-5300" },
  { name: "남양주 체육문화센터", region: "경기 남양주", address: "경기 남양주시 다산지금로 51", indoorOutdoor: "실외", parkingAvailable: true, courtCount: 2, isFeatured: false, operatingHours: "06:00 - 22:00", phone: "031-560-1251" }
];

function seedVenues() {
  const venues = SEED_VENUES.map((v, i) => ({
    id: `venue_${Date.now()}_${i}`,
    ...v,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));

  fs.writeFileSync(venuesPath, JSON.stringify(venues, null, 2), "utf8");
  console.log(`✅ Seeded ${venues.length} venues`);
}

seedVenues();
