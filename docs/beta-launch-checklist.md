# PBL.SYS 베타 런칭 체크리스트

> 이 문서는 제한적 베타 오픈 전 반드시 완료해야 할 항목을 정리합니다.
> 모든 항목은 **사람이 수동으로** 수행해야 합니다.

---

## 1. Supabase 프로젝트 생성

- [ ] https://supabase.com 에서 새 프로젝트 생성
- [ ] Region: Northeast Asia (ap-northeast-1) 권장
- [ ] 프로젝트 URL, anon key, service role key 확보

**완료 기준:** Supabase 대시보드에서 프로젝트가 "Active" 상태이고, 3개 키(URL, anon key, service role key)를 모두 복사해둔 상태.

---

## 2. migration.sql 실행

- [ ] Supabase 대시보드 → SQL Editor 접속
- [ ] `supabase/migration.sql` 파일 내용을 전체 복사하여 실행
- [ ] 테이블 6개 생성 확인: tournaments, venues, clubs, registrations, leads, contents
- [ ] RLS 정책 적용 확인

**완료 기준:** Supabase Table Editor에서 6개 테이블이 모두 보이고, 각 테이블의 RLS가 "Enabled"로 표시됨.

---

## 3. Vercel 환경변수 설정

- [ ] Vercel 프로젝트 Settings → Environment Variables에 아래 5개 등록:

| 변수명 | 값 | 비고 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Supabase service role key (비공개) |
| `ADMIN_USERNAME` | (원하는 ID) | 관리자 로그인용 |
| `ADMIN_PASSWORD` | (강력한 비밀번호) | 관리자 로그인용 |

- [ ] Production + Preview 모두 적용
- [ ] 재배포 실행 (Settings 변경 후 반드시 Redeploy)

**완료 기준:** Vercel에서 5개 환경변수가 모두 등록되어 있고, 최신 배포가 완료된 상태.

---

## 4. 시드 데이터 실행

- [ ] 로컬에서 `.env`에 Supabase 키 설정
- [ ] `npx tsx src/scripts/seed-supabase.ts` 실행
- [ ] Supabase Table Editor에서 데이터 확인:
  - tournaments: 약 50건
  - venues: 약 200건
  - clubs: 약 25건

**완료 기준:** Supabase 테이블에 시드 데이터가 들어가 있고, 홈 화면에서 대회/장소/동호회가 표시됨.

> 시드 데이터는 데모용입니다. 실데이터 입력 후 시드 데이터를 삭제하거나, 시드 없이 바로 실데이터를 입력해도 됩니다.

---

## 5. /api/health 확인

- [ ] 배포된 URL에서 `/api/health` 접속
- [ ] 응답 확인:
  - `status`: `"ok"`
  - `storage`: `"supabase"`
  - `isDemoMode`: `false`
  - `supabase.connected`: `true`
  - `issues`: 빈 배열 `[]`

**완료 기준:** HTTP 200 응답, `status: "ok"`, `storage: "supabase"`, `issues` 배열이 비어 있음.

---

## 6. /admin Basic Auth 확인

- [ ] 배포된 URL에서 `/admin` 접속
- [ ] 브라우저에서 Basic Auth 팝업이 뜨는지 확인
- [ ] 설정한 ADMIN_USERNAME / ADMIN_PASSWORD로 로그인 성공 확인
- [ ] 잘못된 비밀번호로 401 거부되는지 확인

**완료 기준:** 올바른 자격증명으로만 `/admin` 접근 가능. 잘못된 자격증명은 401 반환.

---

## 7. 대회 생성/신청/승인 실테스트

- [ ] `/admin/tournaments` → 새 대회 1건 수동 생성
- [ ] 사이트 메인에서 해당 대회가 보이는지 확인
- [ ] 대회 상세 → "참가 신청" 폼 제출
- [ ] `/admin/registrations`에서 신청 건 확인
- [ ] 승인 처리 후 상태 변경 확인
- [ ] 같은 연락처로 중복 신청 시 거부되는지 확인

**완료 기준:** 대회 생성 → 사용자 신청 → 관리자 승인 플로우가 에러 없이 동작. 중복 신청이 차단됨.

---

## 8. 실제 데이터 입력 (대회 30 / 장소 100 / 동호회 20)

- [ ] 시드 데이터 삭제 또는 유지 결정
- [ ] 실제 대회 정보 30건 이상 입력 (CSV 또는 수동)
- [ ] 실제 피클볼장 100건 이상 입력
- [ ] 실제 동호회 20건 이상 입력
- [ ] 입력 데이터 품질 검증 (→ `docs/data-entry-guide.md` 참고)

**완료 기준:** 각 항목이 목표 수량 이상이고, 필수 필드(이름, 지역, 날짜 등)가 모두 채워져 있음. 홈에서 빈 섹션이 없음.

---

## 9. Featured 설정

- [ ] 대회 3~5개를 Featured로 설정 (접수중, 마감 7일 이상 남은 대회 우선)
- [ ] 장소 4~8개를 Featured로 설정 (정보가 풍부하고 코트 수 많은 곳)
- [ ] 동호회 3~4개를 Featured로 설정 (모집중이고 소개가 충실한 곳)
- [ ] 홈 화면에서 추천 섹션이 정상 표시되는지 확인

**완료 기준:** 홈의 "추천 대회", "추천 피클볼장", "모집중인 동호회" 섹션에 실데이터가 표시됨.

---

## 10. Guides 콘텐츠 검수

- [ ] `/guides/tournament-guide` 접속 → 내용 확인
- [ ] `/guides/venue-guide` 접속 → 내용 확인
- [ ] `/guides/organizer-guide` 접속 → 내용 확인
- [ ] 오탈자, 잘못된 정보, 과장된 표현 수정
- [ ] 관리자에서 `콘텐츠 관리` → 각 가이드의 `is_published` 상태 확인

**완료 기준:** 3개 가이드 페이지가 모두 정상 렌더링되고, 내용이 현재 기능 범위와 일치함.

---

## 최종 확인

모든 항목 완료 후:

1. `/api/health` → `status: "ok"`, `storage: "supabase"`
2. 홈 → 추천 대회/장소/동호회 정상 표시
3. 대회 상세 → 참가 신청 → 관리자 승인 플로우 정상
4. `/for-clubs` → 운영자 리드 폼 제출 정상
5. 모바일 브라우저에서 주요 페이지 확인

**위 5개가 모두 통과하면 베타 오픈 가능.**
