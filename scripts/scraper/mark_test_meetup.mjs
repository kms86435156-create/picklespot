import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  process.exit(1);
}

const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase
    .from('meetups')
    .update({ 
      title: '[운영 테스트용] 라켓 없어도 OK! 피클볼 체험 (테스트 모임입니다)',
      description: '⚠️ 이 모임은 플랫폼 기능 테스트를 위해 생성된 임시 데이터입니다. 실제 모임이 개최되지 않으니 참가 신청을 하지 말아주세요!\n\n피클볼 플랫폼 공식 운영팀에서 주최하는 초보자 전용 무료 번개입니다.\n* 준비물: 편한 운동화, 운동복, 마실 물',
    })
    .like('id', 'meetup_seed_beginner_%');
    
  if (error) {
    console.error('❌ 업데이트 실패:', error.message);
  } else {
    console.log('✅ 테스트 표시 업데이트 완료');
  }
}

run();
