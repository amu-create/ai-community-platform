# 🎯 AI 작업 효율화 도구 문서

## 📋 환경 변수 관리

### 환경 변수 검증
```bash
# 필수 환경 변수 확인
npm run env:check

# .env.local.example 파일 동기화
npm run env:sync
```

환경 변수가 누락된 경우 명확한 에러 메시지와 함께 필요한 변수 목록을 표시합니다.

### Vercel 배포 체크리스트
검증 완료 후 다음 환경 변수를 Vercel 대시보드에 설정:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_JWT_SECRET`
- `OPENAI_API_KEY`

## 🔄 타입 동기화 자동화

### Supabase 타입 생성
```bash
# 타입 파일 생성
npm run db:types

# 타입 변경사항 체크
npm run db:types:check

# DB 스키마 pull + 타입 생성
npm run db:sync
```

### Git Hook 자동화
- 커밋 시 자동으로 타입 체크
- 변경사항이 있으면 자동으로 `database.types.ts` 업데이트
- TypeScript 컴파일 검증 포함

## 💼 AI 작업 세션 관리

### 세션 시작 및 관리
```bash
# 새 작업 세션 시작
npm run ai:session:start "기능 개발"

# 작업 추가
npm run ai:session:task "로그인 폼 UI 개선"

# 노트 추가
npm run ai:session:note "Tailwind 클래스 충돌 해결 필요"

# 작업 완료 표시
npm run ai:session:complete 0

# 세션 저장 및 종료
npm run ai:session:save
```

### 세션 복원 및 조회
```bash
# 가장 최근 세션 복원
npm run ai:session:restore

# 특정 세션 복원
npm run ai:session:restore 1234567890

# 저장된 세션 목록
npm run ai:session:list
```

### 세션 기능
- 작업 시간 자동 추적
- Git 상태 변화 기록
- 수정된 파일 목록 관리
- 자동 보고서 생성 (`reports/` 폴더)

## 🔒 보안 관리

### 민감한 정보 스캔
```bash
# 프로젝트 전체 스캔
npm run security:scan

# 특정 디렉토리 스캔
npm run security:scan ./src
```

### 민감한 파일 이동
```bash
# private-docs 폴더로 이동
npm run security:move ./sensitive-file.md
```

자동으로 감지하는 패턴:
- OpenAI API 키
- JWT 토큰
- GitHub 토큰
- Vercel ID
- Supabase URL

## 🚀 개발 워크플로우

### 1. 작업 시작
```bash
# 세션 시작
npm run ai:session:start "새 기능 개발"

# 환경 변수 확인
npm run env:check
```

### 2. 개발 중
```bash
# 작업 기록
npm run ai:session:task "컴포넌트 생성"

# 타입 동기화
npm run db:types
```

### 3. 커밋 전
```bash
# 자동으로 실행됨 (Git Hook)
- 린트 체크
- 타입 체크
- 환경 변수 검증
- 민감 정보 스캔
```

### 4. 작업 완료
```bash
# 세션 저장
npm run ai:session:save
```

## 📊 생성되는 보고서

### 세션 보고서
위치: `reports/YYYY-MM-DD-session-{ID}.md`

포함 내용:
- 작업 시간 및 요약
- 완료/미완료 작업 목록
- 작업 노트
- 수정된 파일 목록
- Git 변경사항

### 민감 정보 스캔 결과
콘솔에 실시간 표시:
- 발견된 민감 정보 위치
- 마스킹된 미리보기
- 권장 조치사항

## 🛠 문제 해결

### 환경 변수 오류
```bash
# 예제 파일과 동기화
npm run env:sync

# 수동으로 .env.local 편집
```

### 타입 동기화 실패
```bash
# Supabase CLI 설치 확인
supabase --version

# 수동 타입 생성
npm run db:generate
```

### 세션 복구
```bash
# 현재 세션이 손상된 경우
rm .taskmaster/sessions/current-session.json

# 이전 세션에서 복원
npm run ai:session:restore
```

---

이 도구들은 AI 작업 효율성을 크게 향상시키며, 실수를 방지하고 작업 기록을 체계적으로 관리할 수 있게 해줍니다.
