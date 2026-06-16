import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) process.exit(1);

const supabase = createClient(url, key);

async function run() {
  const { count: vCount } = await supabase.from('venues').select('*', { count: 'exact', head: true }).eq('source_primary', 'auto-seed');
  const { count: tCount } = await supabase.from('tournaments').select('*', { count: 'exact', head: true }).eq('source_primary', 'auto-seed');
  const { count: mCount } = await supabase.from('meetups').select('*', { count: 'exact', head: true }).like('id', 'meetup_seed_beginner_%');
  
  console.log(\[Test Data Summary]\);
  console.log(\- Venues (auto-seed): \\);
  console.log(\- Tournaments (auto-seed): \\);
  console.log(\- Meetups (seed_beginner): \\);
}
run();
