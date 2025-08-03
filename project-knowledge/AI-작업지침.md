# AI 작업 지침서 - AI Community Platform

## 🎯 프로젝트 개요

### 프로젝트 정보
```yaml
프로젝트명: AI Community Platform
위치: C:/ai-community-platform
프레임워크: Next.js 14 (App Router)
언어: TypeScript
데이터베이스: Supabase
배포: Vercel (https://ai-community-platform-sage.vercel.app)
```

### 핵심 API 정보
```yaml
# API 키와 토큰은 환경 변수에서 확인
# .env.local 파일 참조
# 절대 하드코딩하지 않음

Supabase:
  URL: NEXT_PUBLIC_SUPABASE_URL 환경변수 참조
  Anon Key: NEXT_PUBLIC_SUPABASE_ANON_KEY 환경변수 참조
  
Vercel:
  Team/Project ID: Vercel 대시보드에서 확인
  
GitHub:
  API Token: GitHub Settings > Developer settings에서 생성
  
OpenAI:
  API Key: OpenAI 대시보드에서 확인
```

## 📁 프로젝트 구조

### 주요 디렉토리 구조
```
C:/ai-community-platform/
├── src/
│   ├── app/              # Next.js 14 App Router 페이지
│   ├── components/       # React 컴포넌트
│   ├── contexts/         # React Context (AuthContext 등)
│   ├── hooks/           # Custom React Hooks
│   ├── lib/             # 유틸리티 함수 및 설정
│   ├── types/           # TypeScript 타입 정의
│   └── stores/          # Zustand 상태 관리
├── supabase/            # Supabase 설정 및 마이그레이션
├── public/              # 정적 파일
├── private-docs/        # 민감한 정보 문서 (Git 제외)
├── .taskmaster/         # TaskMaster AI 작업 관리
└── project-knowledge/   # AI 작업 지침 및 문서
```

### 중요 파일 위치
```yaml
환경변수:
  - .env.local (실제 환경변수)
  - .env.example (예제 파일)
  - .env.local.example (로컬 예제)

타입 정의:
  - src/types/database.types.ts (Supabase 스키마)
  - src/types/ (기타 타입 정의)

설정 파일:
  - next.config.js (Next.js 설정)
  - tailwind.config.ts (Tailwind CSS)
  - tsconfig.json (TypeScript)
```

## 🛠 기술 스택 상세

### 프론트엔드
```yaml
Framework: Next.js 14.2.18 (App Router)
UI Library: 
  - React 19.0.0
  - Tailwind CSS 3.4.1
  - Shadcn/UI (Radix UI 기반)
  
상태관리: Zustand 5.0.6
폼 처리: React Hook Form 7.61.1
검증: Zod 4.0.14
애니메이션: Framer Motion 12.23.12
```

### 백엔드 & 인프라
```yaml
Database: Supabase (PostgreSQL)
Auth: Supabase Auth
Storage: Supabase Storage
Realtime: Supabase Realtime
AI Integration: OpenAI API
Deployment: Vercel
```

## 💡 AI 작업 시 핵심 지침

### 1. 파일 작업 규칙
```yaml
절대경로 사용:
  - 항상 C:/ai-community-platform/ 기준
  - 상대경로 사용 금지
  
파일 생성/수정:
  - UTF-8 인코딩 필수
  - 한글 포함 시 BOM 추가
  - Windows 파일 시스템 제약 고려
  
민감 정보:
  - private-docs/ 폴더에 저장
  - .gitignore 확인 필수
```

### 2. 코드 작성 규칙
```typescript
// Import 순서
1. React/Next.js
2. 외부 라이브러리
3. 내부 컴포넌트
4. 유틸리티/타입
5. 스타일

// 컴포넌트 구조
export default function ComponentName() {
  // 1. Hooks
  // 2. State
  // 3. Effects
  // 4. Handlers
  // 5. Render
}

// 타입 정의
- database.types.ts의 타입 우선 사용
- 커스텀 타입은 types/ 폴더에
```

### 3. Supabase 작업
```typescript
// 클라이언트 사용
import { createClient } from '@/lib/supabase/supabase-client'

// 서버 컴포넌트
import { createServerClient } from '@/lib/supabase/supabase-server'

// RLS (Row Level Security) 필수
- 모든 테이블에 RLS 정책 설정
- auth.uid() 활용
```

### 4. 에러 처리
```typescript
// 전역 에러 처리
- ErrorBoundary 사용
- GlobalErrorHandler 활용
- logger.ts 통한 로깅

// API 에러
- 명확한 에러 메시지
- 상태 코드 포함
- 사용자 친화적 메시지
```

## 🚨 주의사항

### 1. 보안
```yaml
절대 하드코딩 금지:
  - API 키
  - 비밀번호
  - 민감한 URL
  
환경변수 사용:
  - NEXT_PUBLIC_ 프리픽스: 클라이언트
  - 그 외: 서버 전용
```

### 2. 성능
```yaml
이미지 최적화:
  - next/image 사용
  - WebP 포맷 우선
  - lazy loading 적용

번들 사이즈:
  - 동적 import 활용
  - tree shaking
  - 불필요한 의존성 제거
```

### 3. Windows 환경
```yaml
파일 시스템:
  - 파일 삭제 후 대기 필요
  - EPERM 오류 시 재시도
  - 백업 → 삭제 → 생성 순서

스크립트 실행:
  - BAT/CMD: chcp 65001 필수
  - PowerShell 권장
```

## 📊 데이터베이스 스키마

### 주요 테이블
```yaml
profiles: 사용자 프로필
  - skill_level: beginner/intermediate/advanced
  - level, points: 게이미피케이션
  
resources: AI 학습 자료
  - type: article/video/course/tool/book/other
  - difficulty: 난이도
  
posts: 커뮤니티 게시글
  - category: question/discussion/showcase/tutorial
  
learning_paths: 학습 경로
chat_rooms/messages: 실시간 채팅
bookmarks, votes, follows: 소셜 기능
```

## 🔄 작업 흐름

### 1. 새 기능 개발
```bash
1. TaskMaster로 작업 확인
2. 브랜치 생성 (선택)
3. 컴포넌트 개발
4. 타입 정의
5. API 연결
6. 테스트
7. 배포
```

### 2. 버그 수정
```bash
1. 에러 로그 확인
2. 재현 경로 파악
3. 수정 사항 적용
4. 테스트
5. 보고서 작성
```

### 3. 성능 개선
```bash
1. Lighthouse 분석
2. 번들 사이즈 체크
3. 최적화 적용
4. 측정 및 비교
```

## 📝 커밋 메시지 규칙
```
feat: 새 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
perf: 성능 개선
test: 테스트 추가
chore: 기타 변경사항
```

## 🎯 현재 프로젝트 상태

### 완료된 작업 (100%)
- ✅ 기본 프로젝트 구조
- ✅ 인증 시스템
- ✅ 데이터베이스 스키마
- ✅ 주요 페이지 UI
- ✅ 실시간 기능 UI
- ✅ SEO 최적화

### 진행 필요 작업
- 🔄 Supabase 실시간 연결
- 🔄 AI 추천 시스템 구현
- 🔄 테스트 코드 작성
- 🔄 성능 모니터링

## 💭 AI 효율성 향상 팁

### 1. 컨텍스트 유지
```yaml
프로젝트 위치 기억: C:/ai-community-platform
주요 파일 위치 암기
작업 히스토리 참조
```

### 2. 빠른 탐색
```yaml
desktop-commander 활용:
  - list_directory: 구조 파악
  - read_multiple_files: 동시 읽기
  - search_code: 코드 검색
  
taskmaster 활용:
  - get_tasks: 작업 목록
  - next_task: 우선순위
```

### 3. 효율적 코드 생성
```yaml
재사용 가능한 컴포넌트
타입 안전성 우선
에러 처리 포함
주석과 문서화
```

## 🚀 배포 체크리스트

### Vercel 배포 전
```yaml
환경변수 설정 확인
빌드 오류 체크
타입 오류 해결
SEO 메타데이터
```

### Supabase 설정
```yaml
RLS 정책 확인
인덱스 최적화
백업 설정
모니터링 활성화
```

---

이 문서는 AI가 프로젝트를 효율적으로 이해하고 작업할 수 있도록 만들어졌습니다.
지속적으로 업데이트하여 AI의 작업 속도와 정확도를 향상시키세요.
