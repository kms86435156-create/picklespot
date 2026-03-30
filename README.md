# PBL.SYS — 피클볼 플랫폼

전국 피클볼 대회 일정, 피클볼장 ��기, 동호회 탐색을 위한 통합 플랫폼.

---

## 현재 상태: 제한적 베타 가능

코드 구현은 완료되었으며, **수동 운영 작업(Supabase 연결, 환경변수 설정, 실데이터 입력)을 마치면 베타 오픈이 가능**합니다.

### 구현 완료된 기능

- 대회 목록/상세/검색 (지역, 상태, 키워드 필터)
- 대회 참가 신청 + 중복 방지 + 관리자 승인
- 피클볼장 목록/상세/검색
- 동호회 목록/상세/검색
- 관리자 대시보드 (Basic Auth 보호)
- 대회/장소/동호회 CRUD (수동 입력 + CSV 대량 업로드)
- Featured 추천 시스템 (홈 메인 노출)
- 운영자 리드 수집 폼 (/for-clubs)
- 가이드 콘텐츠 관리
- 데모모드(JSON) / 실운영모드(Supabase) 자동 전환
- /api/health 상태 점검 엔드포인트

### 베타 오픈 전 필수 수동 작업

1. Supabase 프로젝트 생성 + migration.sql 실행
2. Vercel 환경변수 5개 설정 (Supabase 3개 + Admin 2개)
3. 시드 또는 실데이터 입력 (대회 30+ / 장소 100+ / 동호회 20+)
4. Featured 설정 + /api/health 확인

상세 절차: [docs/beta-launch-checklist.md](docs/beta-launch-checklist.md)

### 아직 없는 것 (베타 이후 고려)

- **결제 시스템** — 참가비 온라인 결제 없음. 현장 수납 또는 계좌이체 안내만 가능.
- **사용자 로그인/회원가입** — 계정 체계 없음. 신청은 이름+연락처 기반.
- **자동 알림** — 신청 확인, 승인 결과 등의 SMS/카카오톡 알림 없음.
- **이미지 업로드** — 대회 포스터, 장소 사진 등 이미지 첨부 없음.
- **같이치기/레슨/커뮤니티** — 네비게이션에서 제거됨. 추후 필요 시 추가.

---

## 기술 스택

- **프레임워크:** Next.js 14 (App Router)
- **스타일:** Tailwind CSS
- **데이터:** Supabase (Postgres) / JSON 파일 fallback
- **배포:** Vercel
- **인증:** Basic Auth (관리자만)

## 로컬 개발

```bash
npm install
npm run dev
```

http://localhost:3000 에서 확인. Supabase 환경변수가 없으면 자동으로 JSON fallback(데모모드)으로 동작합니다.

## 문서

| 문서 | 내용 |
|------|------|
| [docs/beta-launch-checklist.md](docs/beta-launch-checklist.md) | 베타 오픈 전 체크리스트 (10개 항목) |
| [docs/data-entry-guide.md](docs/data-entry-guide.md) | 운영자 데이터 입력 가이드 |
| [docs/manual-qa.md](docs/manual-qa.md) | 수동 검증 시나리오 (8개) |
