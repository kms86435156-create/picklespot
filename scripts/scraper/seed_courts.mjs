import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE URL or KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

const regions = [
  { name: "서울", districts: ["강남구", "송파구", "서초구", "강동구", "마포구", "용산구", "성동구", "광진구", "노원구", "양천구", "강서구"] },
  { name: "경기", districts: ["수원시", "성남시", "고양시", "용인시", "부천시", "안산시", "안양시", "남양주시", "화성시", "평택시", "의정부시", "파주시", "김포시"] },
  { name: "인천", districts: ["연수구", "남동구", "부평구", "계양구", "서구"] },
  { name: "부산", districts: ["해운대구", "수영구", "동래구", "남구", "부산진구"] },
  { name: "대구", districts: ["수성구", "달서구", "동구", "북구"] },
  { name: "대전", districts: ["유성구", "서구", "중구"] },
  { name: "광주", districts: ["광산구", "서구", "북구"] },
  { name: "제주", districts: ["제주시", "서귀포시"] }
];

const adjectives = ["센트럴", "퍼스트", "스마일", "에이스", "프로", "챔피언", "스카이", "파크", "더블", "탑", "위너스", "올림픽", "스마트"];
const types = ["피클볼장", "피클볼클럽", "피클볼아레나", "실내피클볼", "테니스&피클볼", "스포츠센터"];

const generateCourts = () => {
  const courts = [];
  
  for (const region of regions) {
    for (const district of region.districts) {
      // Generate 2-4 courts per district
      const count = Math.floor(Math.random() * 3) + 2; 
      
      for (let i = 0; i < count; i++) {
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const type = types[Math.floor(Math.random() * types.length)];
        const isIndoor = Math.random() > 0.5;
        
        courts.push({
          id: uuidv4(),
          name: `${district} ${adj} ${type}`,
          slug: `court-${Date.now()}-${Math.floor(Math.random()*10000)}`,
          address: `${region.name} ${district} 도로명 ${Math.floor(Math.random() * 100) + 1}길`,
          region: region.name,
          region_depth1: district,
          court_count: Math.floor(Math.random() * 6) + 1,
          indoor_outdoor: isIndoor ? "실내" : "야외",
          floor_type: isIndoor ? "마루" : "하드코트",
          operating_hours: "06:00 - 22:00",
          pricing: "시간당 15,000원 ~ 25,000원",
          parking_available: Math.random() > 0.2,
          is_published: true,
          source_primary: "auto-seed",
          created_at: new Date().toISOString()
        });
      }
    }
  }
  return courts;
};

async function seed() {
  console.log("Generating courts...");
  const courts = generateCourts();
  console.log(`Generated ${courts.length} courts. Inserting to Supabase...`);

  // Insert in batches of 50
  for (let i = 0; i < courts.length; i += 50) {
    const batch = courts.slice(i, i + 50);
    const { error } = await supabase.from('venues').upsert(batch);
    if (error) {
      console.error("Error inserting batch:", error.message);
      return;
    }
    console.log(`Inserted batch ${i/50 + 1}`);
  }
  console.log("✅ Courts seeded successfully!");
}

seed();
