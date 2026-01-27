# Decision Helper

가중합 비교표로 빠르게 결정을 정리하고, 결과를 저장/공유하는 웹앱입니다.

## 0. 프로젝트 한 줄 소개
Decision Helper는 상황과 선택지를 입력하면 기준별 점수를 비교표로 정리하고, 가중합 총점과 추천 결과를 보여주는 웹앱입니다.

## 1. 주요 기능
- 3단계 플로우: 입력 → 기준/가중치 → 점수/결과
- 투명한 계산: 총점 = Σ(Weight × Score)
- 추천 규칙(동점 처리 포함)
- 저장(로그인 필요) / 공유 링크(읽기 전용)
- 대시보드(내 결정 목록, 공개/비공개 토글, 본인 데이터만 표시)
- 공개 링크는 누구나 열람, 비공개는 본인만 열람

## 2. 제품 사용 흐름(사용자 관점)
1) `/` 랜딩에서 “새 결정 시작” → `/new`
2) Step1: 제목/상황/선택지 입력 → `/new/criteria`
3) Step2: 기준 선택 + 가중치 조절 + 커스텀 기준 추가 → `/new/score`
4) Step3: 비교표에서 점수 입력(슬라이더) → 총점/추천 확인
5) 로그인 후 저장(비공개) → 저장 완료 후 공유 링크 생성 버튼 노출
6) 공유 버튼 클릭 시 공개 전환 + 공유 링크 생성
7) 저장 후 대시보드 이동 버튼으로 목록 관리

## 3. 기술 스택 및 선택 이유(짧게)
- Next.js App Router: 서버/클라이언트 컴포넌트 분리와 라우팅 단순화
- Tailwind CSS: 일관된 디자인 시스템을 빠르게 적용
- Supabase(Auth/DB): 인증과 DB를 한 곳에서 관리
- @supabase/ssr: 서버 컴포넌트에서 Supabase 클라이언트 생성에 사용

## 4. 로컬 실행 방법
필수 설치
```bash
npm install
```

실행
```bash
npm run dev
```

환경변수 설정(`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

실행 확인
- `http://localhost:3000` 접속 후 `/login`에서 로그인/회원가입 동작 확인

## 5. Supabase 설정 가이드(초보용)
- Supabase URL/Anon Key
  - 코드에서 필요한 환경변수: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Supabase 콘솔에서 프로젝트 설정 → API에서 확인

- Auth 설정(이메일/비밀번호)
  - 필요 시 Email confirmation On/Off 조정
  - Redirect/Site URL에 로컬/배포 주소 등록

- decisions 테이블 생성
  - SQL 파일 제공: `supabase/sql/decisions-table.sql`
  - JSON 컬럼: options / criteria / scores / total_scores

- RLS 정책
  - SQL 파일 제공: `supabase/sql/decisions-rls.sql`
  - 정책 개요: 본인만 CRUD, 공개 row는 read-only

- updated_at 트리거
  - SQL 파일 제공: `supabase/sql/decisions-updated-at.sql`

- 데이터 확인
  - Supabase 콘솔 → Table Editor에서 decisions 확인
  - Supabase 콘솔 → Authentication → Users에서 로그인 사용자 확인

## 6. 코드 구조 안내(핵심)
### app/ 라우트 트리
| 경로 | 파일 | 설명 |
| --- | --- | --- |
| `/` | `app/page.tsx` | 랜딩/소개 |
| `/new` | `app/new/page.tsx` | Step1 입력 |
| `/new/criteria` | `app/new/criteria/page.tsx` | Step2 기준/가중치 |
| `/new/score` | `app/new/score/page.tsx` | Step3 점수/결과 |
| `/login` | `app/login/page.tsx` | 로그인/회원가입 |
| `/dashboard` | `app/dashboard/page.tsx` + `app/dashboard/DashboardClient.tsx` | 로그인 보호 대시보드 |
| `/d/[shareSlug]` | `app/d/[shareSlug]/page.tsx` | 공개 결과(읽기 전용) |

### 주요 컴포넌트
- `app/components/DecisionTable.tsx`: 비교표(편집/읽기 전용 모드)
- `app/components/GlobalHeader.tsx`: 전역 헤더(로그인 상태에 따라 메뉴 전환)

### 상태 관리/스토리지
- 로컬 draft: `app/lib/storage.ts` (`decision-helper:draft:v1`)
- 로컬 저장 목록: `decision-helper:decisions:v1` (더 이상 사용하지 않음)
- `useDraft` 훅: `app/lib/useDraft.ts`
- `storage.ts`의 세션 관련 함수는 현재 코드에서 사용되지 않음

### Supabase 클라이언트
- 클라이언트: `app/lib/supabase/client.ts`
- 서버: `app/lib/supabase/server.ts` (getUser 포함)

### 계산 로직/키워드 룰
- `app/lib/logic.ts`
  - `computeTotals` / `recommendOption` / `topContributions`
  - `buildCriteriaFromContext` + `keywordMap`

## 7. 의사결정 로직 상세(가장 중요)
### 가중합 계산식
- Total(option) = Σ(Weight × Score)

### 점수/가중치 범위
- 점수(Score): 1~5
- 가중치(Weight): 1~5

### 동점 처리 규칙
- 총점이 같으면, **가장 높은 weight 기준의 점수**가 높은 옵션 우선
- 그래도 같으면 입력 순서(정렬 결과 첫 번째 옵션)

### context 키워드 기반 초기 weight 규칙
- 기본 weight: 모두 3
- context 문자열에 키워드가 포함되면 해당 기준 weight를 4로 설정
- 여러 기준 동시 매칭 가능
- 공백/대소문자 무시(공백 제거 포함 검사)
- 사용자 수정이 최종값(자동 설정은 초기값 역할)

기준별 키워드 목록
- 키워드는 `app/lib/logic.ts`의 `keywordMap`을 사용 (대폭 확장됨)
- 전체 목록은 길어서 README에 모두 싣지 않음

## 8. 공유 링크 동작 방식
- shareSlug 생성: `app/lib/shareSlug.ts` (8~12자, 중복 재시도)
- 공개 페이지 로딩: `app/d/[shareSlug]/page.tsx`에서 Supabase `decisions` 조회
  - 비공개라도 **본인 로그인 상태**면 열람 가능
  - 공개일 경우 로그인 없이도 열람 가능
- 대시보드에서 공개/비공개 토글: `app/dashboard/DashboardClient.tsx`

## 9. 유지보수/수정 가이드(다음 수정자용)
자주 바꾸는 포인트
- 키워드 목록 수정: `app/lib/logic.ts`의 `keywordMap`
- 기준 추가/삭제: `baseCriteria` 수정
- 점수/가중치 범위 변경: `DecisionTable` 입력 범위 + `computeTotals` 기준
- UI 카드/테이블 스타일: `app/globals.css`의 `.card`, `.table-surface`

주의사항
- 버튼 텍스트 대비: 검은 배경 버튼에는 `btn-ink` 클래스 사용
- 세션/헤더: 로그인 상태 표시가 깨질 경우 `GlobalHeader`의 세션 동기화 로직 확인
- Supabase RLS: SQL 파일 적용 여부 확인

디버깅 체크리스트
- 저장/공유가 안 됨: Supabase `decisions` 테이블/RLS/컬럼 확인
- 대시보드 접근 안 됨: 로그인 세션/`decisions` select 권한 확인
- 공유 링크가 비어 있음: `is_public`이 true인지 확인
- 공유 버튼이 안 보임: 저장 완료 후에만 노출됨
- 로그인 후 헤더가 바뀌지 않음: `GlobalHeader` 세션 동기화 확인

## 10. 배포(Vercel) 체크리스트
- 환경변수 등록: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- TODO(확인 필요): Supabase Auth Site URL/Redirect URL 업데이트
- 배포 후 로그인/공유 동작 확인

## 11. TODO / Known Issues
- TODO(확인 필요): Supabase Auth Email confirmation 설정

---

참고한 파일 경로
- `app/layout.tsx`
- `app/page.tsx`
- `app/new/page.tsx`
- `app/new/criteria/page.tsx`
- `app/new/score/page.tsx`
- `app/login/page.tsx`
- `app/dashboard/page.tsx`
- `app/dashboard/DashboardClient.tsx`
- `app/d/[shareSlug]/page.tsx`
- `app/components/DecisionTable.tsx`
- `app/components/GlobalHeader.tsx`
- `app/lib/types.ts`
- `app/lib/logic.ts`
- `app/lib/storage.ts`
- `app/lib/useDraft.ts`
- `app/lib/shareSlug.ts`
- `app/lib/supabase/client.ts`
- `app/lib/supabase/server.ts`
- `app/globals.css`
- `supabase/sql/decisions-table.sql`
- `supabase/sql/decisions-rls.sql`
- `supabase/sql/decisions-updated-at.sql`
