import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const isPreview = process.argv.includes('--preview');

const supabase = url && key ? createClient(url, key) : null;
if (!isPreview && !supabase) {
  console.error('❌ ERROR: Supabase 연동 정보가 없습니다.');
  process.exit(1);
}

// 100% 검증 완료된 6개 구장 (A/B/C 등급)
const VERIFIED_COURTS = [
  { name: '광나루 한강공원 피클볼장', address: '서울 강동구 선사로 83-106', region: '서울', lat: 37.5451, lng: 127.1234, url: 'https://yeyak.seoul.go.kr' },
  { name: '행주IC 고가하부 체육시설 피클볼장', address: '경기 고양시 덕양구 행주내동 736-6', region: '경기', lat: 37.6001, lng: 126.8152, url: 'https://www.gys.or.kr' },
  { name: '마곡 도시공원 피클볼장', address: '서울 강서구 마곡동 812', region: '서울', lat: 37.5673, lng: 126.8285, url: 'https://place.map.kakao.com/search?q=마곡도시공원' },
  { name: '코트원 피클볼 (일산)', address: '경기 고양시 일산동구 장항동 594-1', region: '경기', lat: 37.6432, lng: 126.7641, url: 'https://courtone.co.kr' },
  { name: '올림픽공원 피클볼코트 (다목적구장)', address: '서울 송파구 올림픽로 424', region: '서울', lat: 37.5207, lng: 127.1158, url: 'https://picklefriend.kr' },
  { name: '화곡 체육공원 피클볼코트', address: '서울 강서구 화곡동 산 165', region: '서울', lat: 37.5443, lng: 126.8452, url: 'https://place.map.kakao.com/search?q=화곡체육공원' }
];

async function run() {
  console.log(`🚀 검증된 실제 피클볼장(Top 6) 적재 스크립트 시작 ${isPreview ? '(미리보기 모드)' : '(DB 저장 모드)'}`);
  
  const uniqueVenues = VERIFIED_COURTS.map((place, index) => {
    return {
      id: `real_court_${index + 1}`,
      name: place.name,
      slug: `court-real-${index + 1}`,
      address: place.address,
      road_address: place.address,
      region: place.region,
      region_depth1: place.address.split(' ')[1] || '',
      lat: place.lat,
      lng: place.lng,
      phone: '',
      source_url: place.url,
      source_primary: 'manual_verified',
      is_verified: true, // 수동 검증된 데이터이므로 바로 노출(true)
      is_published: true,
      created_at: new Date().toISOString()
    };
  });

  if (isPreview) {
    console.table(uniqueVenues.map(v => ({ 이름: v.name, 지역: v.region, 상세주소: v.address })));
    return;
  }

  console.log('\n💾 1. Supabase DB에 수동 검증된 데이터 적재를 시작합니다...');
  const { data: insertedData, error } = await supabase.from('venues').upsert(uniqueVenues, { onConflict: 'id' }).select();
  if (error) {
    console.error('❌ 적재 실패:', error.message);
    process.exit(1);
  } else {
    console.log(`✅ ${uniqueVenues.length}개 진짜 구장 적재 완료!`);
  }

  console.log('\n🗑️ 2. 기존 가짜(auto-seed) 데이터 삭제를 진행합니다...');
  const { data: deletedTournaments, error: error1 } = await supabase.from('tournaments').delete().eq('source_primary', 'auto-seed').select('id');
  const { data: deletedVenues, error: error2 } = await supabase.from('venues').delete().eq('source_primary', 'auto-seed').select('id');
  
  if (error1 || error2) {
    console.error('❌ 삭제 중 오류 발생:', error1?.message, error2?.message);
  } else {
    console.log(`✅ 삭제 완료: 구장 ${deletedVenues?.length || 0}개, 대회 ${deletedTournaments?.length || 0}개 (가짜 데이터 박멸)`);
  }

  console.log('\n✨ [최종 적재된 6개 레코드 확인]');
  console.table(insertedData.map(v => ({ 이름: v.name, source: v.source_primary, is_verified: v.is_verified })));
}

run();
