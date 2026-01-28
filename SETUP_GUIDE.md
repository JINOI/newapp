# 개발 환경 설정 가이드

## 1. Supabase 프로젝트 생성

1. https://supabase.com 접속 후 로그인
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - Name: 원하는 프로젝트 이름 (예: `decision-helper-dev`)
   - Database Password: 강력한 비밀번호 설정 (잃어버리면 복구 불가)
   - Region: 가장 가까운 지역 선택
4. 프로젝트 생성 완료까지 1-2분 대기

## 2. 환경 변수 설정

1. Supabase 콘솔에서 프로젝트 선택
2. 좌측 메뉴에서 **Settings** → **API** 클릭
3. 다음 정보를 복사:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** 키 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. 프로젝트 루트의 `.env.local` 파일을 열고 값 입력:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## 3. 데이터베이스 설정

Supabase 콘솔에서 다음 SQL 파일들을 순서대로 실행:

### 3-1. 테이블 생성
1. 좌측 메뉴에서 **SQL Editor** 클릭
2. **New query** 클릭
3. `supabase/sql/decisions-table.sql` 파일 내용을 복사하여 붙여넣기
4. **Run** 버튼 클릭 (또는 Ctrl+Enter)

### 3-2. RLS 정책 설정
1. `supabase/sql/decisions-rls.sql` 파일 내용을 복사하여 붙여넣기
2. **Run** 버튼 클릭

### 3-3. updated_at 트리거 설정
1. `supabase/sql/decisions-updated-at.sql` 파일 내용을 복사하여 붙여넣기
2. **Run** 버튼 클릭

## 4. 인증 설정 (선택사항)

1. **Settings** → **Authentication** → **URL Configuration**
2. **Site URL**에 `http://localhost:3000` 추가
3. **Redirect URLs**에 `http://localhost:3000/**` 추가
4. (선택) **Email Auth** → **Enable Email Confirmations**를 OFF로 설정하면 이메일 인증 없이 바로 로그인 가능 (개발용)

## 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속하여 확인!

## 문제 해결

### "Supabase 환경변수가 설정되지 않았습니다" 오류
- `.env.local` 파일이 제대로 생성되었는지 확인
- 값에 따옴표나 공백이 없는지 확인
- 개발 서버를 재시작 (`Ctrl+C` 후 `npm run dev`)

### 로그인이 안 될 때
- Supabase 콘솔 → **Authentication** → **Users**에서 사용자 확인
- **Settings** → **Authentication** → **URL Configuration**에서 Site URL 확인

### 데이터베이스 오류
- Supabase 콘솔 → **Table Editor**에서 `decisions` 테이블이 생성되었는지 확인
- SQL Editor에서 오류 메시지 확인
