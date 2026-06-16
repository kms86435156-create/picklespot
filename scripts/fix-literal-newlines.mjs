import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('❌ Supabase 연동 정보가 없습니다.');
  process.exit(1);
}

const supabase = createClient(url, key);

const TABLES = [
  { table: 'meetups', field: 'description' },
  { table: 'tournaments', field: 'description' },
  { table: 'clubs', field: 'description' },
  { table: 'community_posts', field: 'content' },
  { table: 'club_posts', field: 'content' },
];

async function run() {
  console.log('🔍 리터럴 \\n 문자열이 포함된 레코드를 검색합니다...\n');

  for (const { table, field } of TABLES) {
    // backslash + n 리터럴 문자열 검색
    const { data, error } = await supabase
      .from(table)
      .select(`id, ${field}`)
      .like(field, '%\\n%');

    if (error) {
      console.log(`⚠️  ${table}.${field}: 조회 실패 (${error.message})`);
      continue;
    }

    if (!data || data.length === 0) {
      console.log(`✅ ${table}.${field}: 리터럴 \\n 없음`);
      continue;
    }

    console.log(`🔧 ${table}.${field}: ${data.length}건 발견 — 수정 중...`);

    for (const row of data) {
      const original = row[field];
      // 리터럴 백슬래시+n을 실제 줄바꿈으로 교체
      const fixed = original.replace(/\\n/g, '\n');

      if (original === fixed) continue; // 이미 정상

      const { error: updateError } = await supabase
        .from(table)
        .update({ [field]: fixed })
        .eq('id', row.id);

      if (updateError) {
        console.log(`  ❌ ${row.id}: 수정 실패 (${updateError.message})`);
      } else {
        console.log(`  ✅ ${row.id}: 수정 완료`);
        // 변경 전후 미리보기
        const preview = original.substring(0, 80).replace(/\n/g, '↵');
        console.log(`     변경 전: ${preview}...`);
      }
    }
  }

  console.log('\n✅ 완료!');
}

run();
