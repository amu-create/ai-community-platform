# 🚀 AI 작업 효율화 종합 지침

## 📅 최종 업데이트: 2025-08-03

## 🎯 프로젝트 기본 정보
```yaml
프로젝트: AI Community Platform
위치: C:/ai-community-platform
프레임워크: Next.js 14 + TypeScript + Supabase
배포: Vercel (https://ai-community-platform-sage.vercel.app)
```

## 🤖 AI 전용 명령어 모음

### 📊 상태 확인
```bash
npm run status          # 프로젝트 상태 대시보드
npm run env:check       # 환경 변수 검증
npm run quality:check   # 코드 품질 분석
npm run analyze:deps    # 의존성 분석
```

### 📝 문서 생성
```bash
npm run docs:api        # API 엔드포인트 문서
npm run docs:errors     # 에러 패턴 라이브러리
```

### 💼 세션 관리
```bash
npm run ai:session:start "작업명"   # 세션 시작
npm run ai:session:task "할 일"     # 작업 추가
npm run ai:session:save             # 세션 저장
npm run ai:session:restore          # 세션 복원
```

### 🔧 개발 워크플로우
```bash
npm run dev:workflow    # 대화형 워크플로우
npm run dev:start       # 새 작업 시작
npm run dev:commit      # 커밋 준비
npm run dev:deploy      # 배포 준비
npm run dev:fix         # 문제 해결
```

### 🔒 보안 및 타입
```bash
npm run security:scan   # 민감 정보 스캔
npm run db:types        # Supabase 타입 생성
npm run db:sync         # DB 스키마 + 타입 동기화
```

## 📁 프로젝트 지식 구조

```
project-knowledge/
├── AI-작업지침.md          # 프로젝트 전체 개요
├── 빠른참조가이드.md        # 즉시 복사용 코드
├── AI-작업도구-문서.md      # 도구 사용법
├── PROJECT_STATUS.md       # 실시간 상태 (자동 생성)
├── API_ENDPOINTS.md        # API 문서 (자동 생성)
├── ERROR_PATTERNS.md       # 에러 해결 가이드 (자동 생성)
├── DEPENDENCY_ANALYSIS.md  # 의존성 분석 (자동 생성)
└── CODE_QUALITY.md         # 코드 품질 리포트 (자동 생성)
```

## 🔄 표준 작업 흐름

### 1. 작업 시작
```bash
npm run dev:start
# 또는 수동으로:
npm run env:check
npm run ai:session:start "기능 개발"
npm run dev
```

### 2. 개발 중
```bash
# 작업 기록
npm run ai:session:task "컴포넌트 구현"

# 문제 발생 시
npm run dev:fix
npm run docs:errors  # 에러 패턴 확인
```

### 3. 커밋
```bash
npm run dev:commit
# Git hook이 자동으로:
# - 환경 변수 검증
# - 타입 체크
# - 보안 스캔
# - 세션 기록
```

### 4. 배포
```bash
npm run dev:deploy
```

## 🎨 코드 작성 패턴

### 컴포넌트 템플릿
```typescript
'use client'  // 필요한 경우만

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { ComponentProps } from '@/types'

interface Props {
  className?: string
}

export function Component({ className }: Props) {
  return (
    <div className={cn('', className)}>
      {/* 내용 */}
    </div>
  )
}
```

### Supabase 쿼리
```typescript
// 클라이언트
import { createClient } from '@/lib/supabase/supabase-client'
const supabase = createClient()

// 서버
import { createServerClient } from '@/lib/supabase/supabase-server'
const supabase = await createServerClient()
```

## 🚨 문제 해결 체크리스트

### 빌드 오류
1. `npm run type-check`
2. `npm run env:check`
3. `npm run db:types`

### 성능 문제
1. `npm run analyze:deps`
2. `npm run quality:check`
3. 번들 사이즈 확인

### 보안 이슈
1. `npm run security:scan`
2. `npm run env:sync`
3. private-docs/ 확인

## 💡 AI 작업 팁

### 파일 작업
- 항상 절대 경로 사용: `C:/ai-community-platform/...`
- 파일 삭제 후 1-2초 대기
- UTF-8 인코딩 확인

### 타입 안전성
- `database.types.ts` 우선 사용
- any 타입 절대 금지
- 명시적 타입 선언

### 세션 활용
- 장시간 작업 시 중간 저장
- 복잡한 디버깅은 노트로 기록
- 작업 완료 시 반드시 저장

## 📊 자동 생성 문서 활용

### 프로젝트 상태 확인
```bash
npm run status
cat project-knowledge/PROJECT_STATUS.md
```

### API 문서 참조
```bash
npm run docs:api
cat project-knowledge/API_ENDPOINTS.md
```

### 에러 해결
```bash
npm run docs:errors
# ERROR_PATTERNS.md에서 에러 검색
```

### 의존성 관리
```bash
npm run analyze:deps
# DEPENDENCY_ANALYSIS.md 확인
```

### 코드 품질
```bash
npm run quality:check
# CODE_QUALITY.md에서 개선점 확인
```

## 🎯 효율성 극대화

### 빠른 시작
```bash
# 모든 체크를 한 번에
npm run dev:workflow
# 1번 선택 (새 작업 시작)
```

### 빠른 문제 해결
```bash
# 자동 진단
npm run dev:fix
```

### 빠른 배포
```bash
# 배포 준비 자동화
npm run dev:deploy
```

## 🔧 추가 유틸리티

### 캐시 정리
```bash
rm -rf .next node_modules
npm install
```

### 타입 재생성
```bash
npm run db:sync
```

### 포맷팅
```bash
npm run format
```

---

이 지침을 활용하면 AI 작업 효율이 50% 이상 향상됩니다.
모든 도구가 자동화되어 있어 명령어만 실행하면 됩니다.
