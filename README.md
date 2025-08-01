# AI Community Platform

AI 학습의 모든 것을 한 곳에서 - Learn, share, and grow together in AI

## 주요 기능

### 🎯 AI 학습 리소스
- 전문가가 큐레이션한 고품질 학습 자료
- 아티클, 비디오, 강좌, 도구 등 다양한 형태의 리소스
- 초급부터 고급까지 수준별 분류
- 카테고리와 태그를 통한 체계적인 분류

### 💬 활발한 커뮤니티
- 실시간 채팅 시스템
- 질문과 답변 게시판
- 투표 시스템을 통한 양질의 콘텐츠 발굴
- 팔로우/팔로워 시스템으로 네트워킹

### 📚 맞춤형 학습 경로
- 체계적인 커리큘럼 제공
- 단계별 학습 가이드
- 진행률 추적
- 개인화된 추천

### 🏆 성장 시스템
- 기여도 기반 레벨 시스템
- 포인트와 배지
- 주간 베스트 콘텐츠
- 리더보드

## 기술 스택

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **UI Components**: Shadcn/UI
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **State Management**: Zustand
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions

## 시작하기

### 사전 요구사항
- Node.js 18.17 이상
- npm 또는 yarn
- Supabase 계정

### 설치

```bash
# 저장소 클론
git clone https://github.com/yourusername/ai-community-platform.git
cd ai-community-platform

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 열어 Supabase 설정 입력

# 개발 서버 실행
npm run dev
```

### 환경 변수

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 프로젝트 구조

```
src/
├── app/               # Next.js 14 App Router
├── components/        # React 컴포넌트
├── contexts/         # React Context
├── hooks/            # Custom Hooks
├── lib/              # 유틸리티 함수
├── services/         # API 서비스
├── types/            # TypeScript 타입
└── styles/           # 스타일 파일
```

## 주요 명령어

```bash
npm run dev        # 개발 서버 실행
npm run build      # 프로덕션 빌드
npm run start      # 프로덕션 서버 실행
npm run lint       # ESLint 실행
npm run test       # 테스트 실행
npm run type-check # TypeScript 타입 체크
```

## 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 라이선스

MIT License - see the [LICENSE](LICENSE) file for details

## 문의

- 이메일: contact@ai-community.com
- 웹사이트: https://ai-community.vercel.app
- GitHub: https://github.com/yourusername/ai-community-platform
