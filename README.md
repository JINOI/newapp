# Decision Helper

빠른 의사결정을 위한 비교표 중심 웹앱 (Next.js App Router + TypeScript + Tailwind + Supabase).

## 로컬 실행
```bash
npm install
npm run dev
```

## 환경변수
`.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 핵심 기능
- 3단계 플로우: 입력 → 기준/가중치 → 점수/결과
- 비교표 중심 UI, 가중합 점수 계산 + 추천
- 공개 링크 읽기 전용: `/d/[shareSlug]`
- 대시보드: 저장 목록/공유 토글/삭제
- Supabase Auth: 이메일/비밀번호 로그인/회원가입/로그아웃

## 로그인/세션 구성
- 클라이언트: `app/lib/supabase/client.ts`
- 서버: `app/lib/supabase/server.ts` (+ `getUser`)
- 미들웨어: `middleware.ts` (세션 쿠키 동기화)
- 헤더: `app/components/GlobalHeader.tsx` (로그인 상태에 따라 메뉴 전환)
- `/dashboard`는 서버에서 `getUser()`로 보호 후 리다이렉트

## 라우트
- `/` 랜딩
- `/new` Step1
- `/new/criteria` Step2
- `/new/score` Step3
- `/dashboard` 로그인 보호
- `/login` 로그인/회원가입 토글
- `/d/[shareSlug]` 공개 결과

## 로컬 스토리지 사용
- Draft: `decision-helper:draft:v1`
- 로컬 저장 목록: `decision-helper:decisions:v1`

## 키워드 기반 가중치 자동 설정
`context`에 키워드 포함 시 해당 기준 weight=4 (초기값만 적용)
- 비용(cost), 시간(time), 노력/피로(effort), 리스크(risk), 만족(enjoyment), 성장/효용(benefit), 되돌리기(reversibility)
- 구현: `app/lib/logic.ts`의 `keywordMap`

## 공유 링크
- slug 생성: `app/lib/shareSlug.ts` (8~12자, 중복 재시도)

## UI 테마
- 전역 배경/팔레트: `app/globals.css`
- 공통 카드: `.card`
- 공통 표 배경: `.table-surface`

## 주의사항
- Supabase Auth에서 이메일 인증이 켜져 있으면 회원가입 직후 세션이 없을 수 있음.
- 이메일 전송 레이트 리밋(`email rate limit exceeded`) 발생 시 잠시 대기하거나 다른 이메일 사용 필요.

## 주요 파일
- `app/lib/logic.ts` 기준/점수 계산 로직
- `app/components/DecisionTable.tsx` 비교표 컴포넌트
- `app/new/score/page.tsx` 총점/추천/선택 결과
