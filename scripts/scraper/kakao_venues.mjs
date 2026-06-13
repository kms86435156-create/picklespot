import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const KAKAO_API_KEY = process.env.KAKAO_REST_API_KEY;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const isPreview = process.argv.includes('--preview');

if (!KAKAO_API_KEY && !isPreview) {
  console.error('❌ ERROR: .env 파일에 KAKAO_REST_API_KEY를 설정해주세요.');
  process.exit(1);
}

const supabase = url && key ? createClient(url, key) : null;
if (!isPreview && !supabase) {
  console.error('❌ ERROR: Supabase 연동 정보가 없습니다.');
  process.exit(1);
}

// 전국 주요 1차 지역 (도/광역시)
const regions = ['서울', '경기', '인천', '부산', '대구', '대전', '광주', '울산', '세종', '강원', '충청', '전라', '경상', '제주'];
const keywords = ['피클볼', '피클볼장'];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchKakao(keyword, region, page = 1) {
  if (!KAKAO_API_KEY && isPreview) {
    // 미리보기 모드인데 키가 없는 경우 가짜 데이터(Mock) 반환하여 동작 구조 검증
    return {
      documents: [
        {
          id: `${Date.now()}_${Math.random().toString(36).substring(7)}`,
          place_name: `${region} ${keyword} 센터`,
          category_name: "스포츠,레저 > 스포츠시설 > 피클볼장",
          address_name: `${region} 가상의 구 가상의 동 123-45`,
          road_address_name: `${region} 가상의 구 가상로 67`,
          y: "37.123456",
          x: "127.123456",
          phone: "02-1234-5678",
          place_url: "http://place.map.kakao.com/12345678"
        }
      ],
      meta: { is_end: true }
    };
  }

  const query = `${region} ${keyword}`;
  const res = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&page=${page}&size=15`, {
    headers: { 'Authorization': `KakaoAK ${KAKAO_API_KEY}` }
  });
  if (!res.ok) throw new Error(`Kakao API Error: ${res.status} ${res.statusText}`);
  return res.json();
}

async function run() {
  console.log(`🚀 카카오 API 피클볼장 수집 스크립트 시작 ${isPreview ? '(미리보기 모드)' : '(DB 저장 모드)'}`);
  
  if (!KAKAO_API_KEY && isPreview) {
    console.log('⚠️ API 키가 없어 Mock(가짜) 데이터로 미리보기를 진행합니다.');
  }

  const results = new Map(); // 중복 제거용 Map (카카오 place_id 기준)

  for (const region of regions) {
    for (const keyword of keywords) {
      if (isPreview && results.size >= 5) break; // 미리보기일 때는 5개만 수집하고 조기 종료
      
      console.log(`검색 중: ${region} ${keyword}...`);
      try {
        let isEnd = false;
        let page = 1;
        while (!isEnd && page <= 3) {
          const data = await fetchKakao(keyword, region, page);
          
          for (const place of data.documents) {
            if (!place.category_name.includes('스포츠') && !place.category_name.includes('피클볼')) continue;
            
            if (!results.has(place.id)) {
              results.set(place.id, {
                id: `kakao_${place.id}`,
                name: place.place_name,
                slug: `court-${place.id}`,
                address: place.address_name,
                road_address: place.road_address_name || '',
                region: region,
                region_depth1: place.address_name.split(' ')[1] || '',
                lat: parseFloat(place.y),
                lng: parseFloat(place.x),
                phone: place.phone || '',
                source_url: place.place_url,
                source_primary: 'kakao_api',
                is_verified: false,
                is_published: true,
                created_at: new Date().toISOString()
              });
            }
          }
          isEnd = data.meta.is_end;
          page++;
          if (!isPreview) await delay(200);
        }
      } catch (error) {
        console.error(`⚠️ ${region} ${keyword} 검색 실패:`, error.message);
      }
    }
  }

  const uniqueVenues = Array.from(results.values());
  console.log(`\n🎯 총 ${uniqueVenues.length}개의 고유한 실제 피클볼장(및 관련 시설) 데이터가 수집되었습니다.`);

  if (isPreview) {
    console.log('\n👀 [미리보기 결과 Top 5]');
    console.table(uniqueVenues.slice(0, 5).map(v => ({ 이름: v.name, 지역: v.region_depth1, 주소: v.road_address || v.address })));
    console.log('\n💡 실제 DB에 저장하려면 --preview 옵션을 빼고 실행하세요.');
    return;
  }

  console.log('\n💾 Supabase DB에 적재를 시작합니다...');
  let successCount = 0;
  for (let i = 0; i < uniqueVenues.length; i += 50) {
    const batch = uniqueVenues.slice(i, i + 50);
    const { error } = await supabase.from('venues').upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error('❌ 적재 실패:', error.message);
    } else {
      successCount += batch.length;
      console.log(`✅ ${successCount}개 적재 완료...`);
    }
  }
  
  console.log(`\n🎉 모든 적재가 완료되었습니다. (is_verified = false 상태로 저장됨)`);
}

run();
