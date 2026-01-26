# Decision Helper

가중합 비교표로 빠르게 결정을 정리하고, 결과를 저장/공유하는 웹앱입니다.

## 0. 프로젝트 한 줄 소개
Decision Helper는 상황과 선택지를 입력하면 기준별 점수를 비교표로 정리하고, 가중합 총점과 추천 결과를 보여주는 웹앱입니다.

## 1. 주요 기능
- 3단계 플로우: 입력 → 기준/가중치 → 점수/결과
- 투명한 계산: 총점 = Σ(Weight × Score)
- 추천 규칙(동점 처리 포함)
- 저장(로그인 UI만 제공, 실제 인증 없음) / 공유 링크(읽기 전용)
- 대시보드(내 결정 목록, 공개/비공개 토글)

## 2. 제품 사용 흐름(사용자 관점)
1) `/` 랜딩에서 “새 결정 시작” → `/new`
2) Step1: 제목/상황/선택지 입력 → `/new/criteria`
3) Step2: 기준 선택 + 가중치 조절 + 커스텀 기준 추가 → `/new/score`
4) Step3: 비교표에서 점수 입력(슬라이더) → 총점/추천 확인
5) 저장/공유(공개 링크 생성), 대시보드에서 관리

## 3. 기술 스택 및 선택 이유(짧게)
- Next.js App Router: 서버/클라이언트 컴포넌트 분리와 라우팅 단순화
- Tailwind CSS: 일관된 디자인 시스템을 빠르게 적용
- Supabase(DB): 데이터 저장소 용도로 사용(현재 Auth는 데모 UI)
- @supabase/ssr: 서버용 클라이언트 유틸 (Auth 사용 시에만 필요)

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
- `http://localhost:3000` 접속 후 UI 확인

## 5. Supabase 설정 가이드(초보용)
아래 내용은 코드에서 확인된 것만 명시합니다. UI 위치/세부 절차는 **TODO(확인 필요)**로 표기합니다.

- Supabase URL/Anon Key
  - 코드에서 필요한 환경변수: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - TODO(확인 필요): Supabase 콘솔에서 URL/anon key 위치

- Auth 설정
- 로그인/회원가입 UI는 존재하나 실제 인증 로직은 제거됨(데모)
  - TODO(확인 필요): Email confirmation 설정 위치 및 테스트용 비활성화 절차

- Redirect/Site URL
  - TODO(확인 필요): Supabase Auth Redirect/Site URL 설정 위치

- decisions 테이블 구조
  - 코드에 직접 DDL은 없음. UI에서 사용하는 데이터 구조는 `app/lib/types.ts` 기준
  - TODO(확인 필요): 실제 Supabase 테이블 스키마/컬럼

- RLS 정책
  - SQL 파일 제공: `supabase/sql/decisions-rls.sql`
  - 정책 개요: 본인만 CRUD, 공개 row는 read-only

- updated_at 트리거
  - SQL 파일 제공: `supabase/sql/decisions-updated-at.sql`

- 데이터 확인
  - TODO(확인 필요): Table Editor/SQL Editor 위치
  - TODO(확인 필요): Authentication → Users 위치

## 6. 코드 구조 안내(핵심)
### app/ 라우트 트리
| 경로 | 파일 | 설명 |
| --- | --- | --- |
| `/` | `app/page.tsx` | 랜딩/소개 |
| `/new` | `app/new/page.tsx` | Step1 입력 |
| `/new/criteria` | `app/new/criteria/page.tsx` | Step2 기준/가중치 |
| `/new/score` | `app/new/score/page.tsx` | Step3 점수/결과 |
| `/login` | `app/login/page.tsx` | 로그인/회원가입 UI(데모) |
| `/dashboard` | `app/dashboard/page.tsx` + `app/dashboard/DashboardClient.tsx` | 대시보드 |
| `/d/[shareSlug]` | `app/d/[shareSlug]/page.tsx` | 공개 결과(읽기 전용) |

### 주요 컴포넌트
- `app/components/DecisionTable.tsx`: 비교표(편집/읽기 전용 모드)
- `app/components/GlobalHeader.tsx`: 전역 헤더(로그인 버튼만 표시)

### 상태 관리/스토리지
- 로컬 draft: `app/lib/storage.ts` (`decision-helper:draft:v1`)
- 로컬 저장 목록: `decision-helper:decisions:v1`
- `useDraft` 훅: `app/lib/useDraft.ts`
- TODO(확인 필요): `storage.ts`의 세션 관련 함수는 현재 코드에서 사용되지 않음

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

기준별 키워드 목록(`app/lib/logic.ts` 그대로)
- 비용(cost)
  - 돈, 가격, 비용, 비싸, 비쌈, 비싸다, 저렴, 싸다, 쌈, 예산, 지출, 부담, 가성비, 월급, 생활비, 결제, 할인, 환불, 유지비, 고정비, 변동비
- 시간(time)
  - 시간, 바쁨, 마감, 급함, 촉박, 늦음, 늦다, 빨리, ASAP, 일정, 스케줄, 데드라인, 여유 없음, 쫓김, 당장, 지금, 이번 주, 오늘
- 노력/피로(effort)
  - 피곤, 체력, 힘듦, 귀찮, 번거롭, 힘들다, 지침, 피로, 부담됨, 벅참, 오래 걸림, 빡셈, 에너지, 집중력, 체력 소모, 녹초, 탈진
- 리스크(risk)
  - 리스크, 불안, 망할, 실패, 위험, 손해, 후회, 불확실, 걱정, 문제, 트러블, 깨짐, 안 될까, 틀릴까, 무서움, 리턴 없음, 복구 불가
- 만족(enjoyment)
  - 재밌, 즐거움, 만족, 하고 싶다, 끌림, 흥미, 재미, 기분, 행복, 스트레스 해소, 쉬고 싶다
- 성장/효용(benefit)
  - 성장, 도움이, 배움, 실력, 경험, 커리어, 의미, 가치, 남는 게, 얻는 것, 장점
- 되돌리기/안정성(reversibility)
  - 취소, 되돌리기, 복구, 다시, 실험, 테스트, 한 번, 잠깐, 임시

## 8. 공유 링크 동작 방식
- shareSlug 생성: `app/lib/shareSlug.ts` (8~12자, 중복 재시도)
- 공개 페이지 로딩: `app/d/[shareSlug]/page.tsx`에서 `findDecisionBySlug`로 조회
  - 현재는 **localStorage** 기반 조회
  - `isPublic === true`인 경우만 노출
- 대시보드에서 공개/비공개 토글: `app/dashboard/DashboardClient.tsx`

## 9. 유지보수/수정 가이드(다음 수정자용)
자주 바꾸는 포인트
- 키워드 목록 수정: `app/lib/logic.ts`의 `keywordMap`
- 기준 추가/삭제: `baseCriteria` 수정
- 점수/가중치 범위 변경: `DecisionTable` 입력 범위 + `computeTotals` 기준
- UI 카드/테이블 스타일: `app/globals.css`의 `.card`, `.table-surface`

주의사항
- 버튼 텍스트 대비: 검은 배경 버튼에는 `btn-ink` 클래스 사용
- 세션/헤더: 현재 로그인 상태 반영 로직 제거됨(데모 UI)
- Supabase RLS: SQL 파일 적용 여부 확인

디버깅 체크리스트
- 저장/공유가 안 됨: `localStorage` 데이터 유무 확인 (`decision-helper:*`)
- 대시보드 접근 안 됨: 현재 로그인 보호 없음(데모)
- 공유 링크가 비어 있음: `isPublic`이 true인지 확인

## 10. 배포(Vercel) 체크리스트
- 환경변수 등록: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- TODO(확인 필요): Supabase Auth Site URL/Redirect URL 업데이트
- 배포 후 로그인/공유 동작 확인

## 11. TODO / Known Issues
- TODO(확인 필요): Supabase decisions 테이블 실제 스키마/컬럼 정의
- TODO(확인 필요): Supabase Auth Email confirmation 설정
- TODO(확인 필요): Supabase 콘솔에서 URL/anon key 위치 설명
- TODO(확인 필요): 공유/저장이 localStorage가 아니라 Supabase DB로 연동되는지 여부

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
- `supabase/sql/decisions-rls.sql`
- `supabase/sql/decisions-updated-at.sql`
