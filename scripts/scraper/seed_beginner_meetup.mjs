import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('❌ ERROR: Supabase 연동 정보가 없습니다.');
  process.exit(1);
}

const supabase = createClient(url, key);

async function run() {
  console.log('🌱 초보 환영 번개 템플릿(시드)을 생성합니다...');

  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 6);
  const saturday = new Date(today.setDate(diff));
  
  const dateStr = saturday.toISOString().split('T')[0];

  const meetup = {
    id: `meetup_seed_beginner_${Date.now()}`,
    title: '[초보환영] 라켓 없어도 OK! 몸만 오시면 되는 무료 피클볼 체험 🏓',
    date: dateStr,
    start_time: '14:00',
    end_time: '16:00',
    region: '서울',
    venue_name: '뚝섬 한강공원 피클볼장',
    venue_address: '서울 성동구 강변북로 139',
    max_players: 4,
    current_players: 1, // 호스트 1명
    skill_level: '입문',
    fee: 0,
    description: '피클볼 플랫폼 공식 운영팀에서 주최하는 초보자 전용 무료 번개입니다.\n\n테니스랑 비슷한데 훨씬 쉽고 재밌습니다! 라켓도 무료로 빌려드리고, 처음 30분은 규칙도 알려드리니 부담 없이 몸만 오세요!\n\n* 준비물: 편한 운동화, 운동복, 마실 물\n* 대관비: 운영팀 전액 지원 (무료)',
    is_beginner_friendly: true,
    host_id: 'admin_seed_host',
    host_name: '운영팀',
    status: 'open',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase.from('meetups').insert(meetup);
  
  if (error) {
    console.error('❌ 생성 실패:', error.message);
  } else {
    console.log('✅ 초보 환영 번개 생성 완료! (DB 적재 성공)');
  }
}

run();
