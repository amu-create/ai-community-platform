# AI Community Hub

AI 학습자들이 정보를 공유하고 소통할 수 있는 종합 커뮤니티 플랫폼

## 주요 기능

- 🎯 **수준별 학습 경로**: 초급/중급/고급 사용자를 위한 맞춤형 학습 가이드
- 📚 **리소스 라이브러리**: 웹사이트, 유튜브, AI 도구 등 양질의 자료 큐레이션
- 💬 **커뮤니티**: Q&A, 팁 공유, 프로젝트 소개를 위한 활발한 소통 공간
- ⭐ **북마크 & 추천**: 유용한 자료 저장 및 커뮤니티 추천 시스템
- 🎖️ **레벨 시스템**: 기여도 기반 사용자 레벨 및 보상 체계

## 기술 스택

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Realtime)
- **State Management**: Zustand
- **Deployment**: Vercel

## 시작하기

1. 의존성 설치:
```bash
npm install
```

2. 환경 변수 설정:
`.env.local` 파일을 생성하고 다음 변수를 설정하세요:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. 개발 서버 실행:
```bash
npm run dev
```

4. 브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

## 프로젝트 구조

```
src/
├── app/              # Next.js 14 App Router
├── components/       # 재사용 가능한 컴포넌트
├── lib/             # 유틸리티 함수 및 설정
├── hooks/           # 커스텀 React 훅
├── types/           # TypeScript 타입 정의
└── store/           # Zustand 상태 관리
```

## 기여하기

프로젝트에 기여하고 싶으시다면 PR을 보내주세요!

## 라이선스

MIT License