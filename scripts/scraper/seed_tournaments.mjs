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

const prefixes = ["전국", "제1회", "제2회", "제3회", "대한피클볼협회장배", "시도지사배", "시장배", "연합회장배"];
const regions = ["서울", "경기", "인천", "부산", "대구", "대전", "광주", "울산", "세종", "강원", "충청", "전라", "경상", "제주"];
const suffixes = ["피클볼 대회", "피클볼 챔피언십", "피클볼 페스티벌", "오픈 피클볼 대회"];

const generateTournaments = (count = 35) => {
  const tournaments = [];
  
  for (let i = 0; i < count; i++) {
    const region = regions[Math.floor(Math.random() * regions.length)];
    const title = `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${region} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
    
    // Random dates between now and next 3 months
    const today = new Date();
    const startObj = new Date(today.getTime() + Math.random() * 90 * 24 * 60 * 60 * 1000);
    const endObj = new Date(startObj.getTime() + 2 * 24 * 60 * 60 * 1000);
    
    // Reg dates
    const regStartObj = new Date(startObj.getTime() - 30 * 24 * 60 * 60 * 1000);
    const regEndObj = new Date(startObj.getTime() - 7 * 24 * 60 * 60 * 1000);

    const fmt = (d) => d.toISOString().split('T')[0];

    tournaments.push({
      id: uuidv4(),
      title,
      organizer: `${region} 피클볼협회`,
      organizer_name: "대회운영본부",
      organizer_contact: "010-0000-0000",
      region: region,
      venue_name: `${region} 종합운동장 피클볼장`,
      venue_address: `${region} 어딘가`,
      start_date: fmt(startObj),
      end_date: fmt(endObj),
      registration_open_at: fmt(regStartObj) + "T09:00:00",
      registration_close_at: fmt(regEndObj) + "T18:00:00",
      registration_deadline: fmt(regEndObj),
      fee: Math.floor(Math.random() * 3 + 2) * 10000,
      entry_fee: Math.floor(Math.random() * 3 + 2) * 10000,
      fee_text: "팀당 참가비",
      divisions: "남성복식, 여성복식, 혼합복식",
      event_types: "복식",
      level: "전국부, 신인부",
      max_participants: Math.floor(Math.random() * 10 + 5) * 10,
      current_participants: Math.floor(Math.random() * 20),
      status: regEndObj > new Date() ? "open" : "closed",
      description: "본 대회는 피클볼 활성화를 위해 개최되는 대회입니다. 많은 관심과 참여 바랍니다.",
      detail_url: "",
      poster_url: "",
      is_featured: Math.random() > 0.8,
      source_primary: "auto-seed",
      created_at: new Date().toISOString()
    });
  }
  return tournaments;
};

async function seed() {
  console.log("Generating tournaments...");
  const tournaments = generateTournaments();
  console.log(`Generated ${tournaments.length} tournaments. Inserting to Supabase...`);

  // Insert
  const { error } = await supabase.from('tournaments').upsert(tournaments);
  if (error) {
    console.error("Error inserting tournaments:", error.message);
    return;
  }
  console.log("✅ Tournaments seeded successfully!");
}

seed();
