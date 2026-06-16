const SITE_URL = 'https://pickleball-platform-brown.vercel.app';
const testUser = {
  email: 'e2e_' + Date.now() + '@example.com',
  password: 'password123!',
  name: '자동테스터'
};
async function runTest() {
  console.log('[1] 회원가입 테스트 진행 중...');
  const signupRes = await fetch(SITE_URL + '/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser),
  });
  const signupData = await signupRes.json();
  if (!signupRes.ok) throw new Error('회원가입 실패: ' + JSON.stringify(signupData));
  console.log('✅ 회원가입 성공:', signupData.user.id);
  const cookies = signupRes.headers.get('set-cookie') || '';
  const headers = { 'Content-Type': 'application/json', 'Cookie': cookies };

  console.log('[2] 로그인 테스트 진행 중...');
  const loginRes = await fetch(SITE_URL + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testUser.email, password: testUser.password }),
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok) throw new Error('로그인 실패: ' + JSON.stringify(loginData));
  console.log('✅ 로그인 성공:', loginData.user.id);

  console.log('[3] 커뮤니티 글 작성 테스트 진행 중...');
  const postRes = await fetch(SITE_URL + '/api/community', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      category: 'general',
      title: 'E2E 자동 테스트 글입니다',
      content: '정상적으로 작성 및 조회되는지 테스트합니다.'
    }),
  });
  const postData = await postRes.json();
  if (!postRes.ok) throw new Error('글 작성 실패: ' + JSON.stringify(postData));
  console.log('✅ 글 작성 성공:', postData.post.title);

  console.log('[4] 번개 생성 테스트 진행 중...');
  const meetupRes = await fetch(SITE_URL + '/api/meetups', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: 'E2E 자동 테스트 번개',
      date: new Date().toISOString().split('T')[0],
      startTime: '18:00',
      endTime: '20:00',
      region: '서울',
      venueName: '테스트 체육관',
      maxPlayers: 4,
      skillLevel: '무관'
    }),
  });
  const meetupData = await meetupRes.json();
  if (!meetupRes.ok) throw new Error('번개 생성 실패: ' + JSON.stringify(meetupData));
  console.log('✅ 번개 생성 성공:', meetupData.meetup.title);
  console.log('🎉 모든 E2E 테스트가 성공적으로 통과되었습니다!');
}
runTest().catch(e => { console.error('❌ E2E 테스트 실패:', e.message); process.exit(1); });
