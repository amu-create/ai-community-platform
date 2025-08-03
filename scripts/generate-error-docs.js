#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// 에러 패턴 정의
const errorPatterns = {
  // Windows 파일 시스템
  'EPERM: operation not permitted': {
    category: 'File System',
    causes: [
      'Windows 파일 시스템 권한 문제',
      '파일이 다른 프로세스에서 사용 중',
      '파일 삭제 직후 즉시 생성 시도'
    ],
    solutions: [
      '1-2초 대기 후 재시도',
      '파일 핸들이 닫혔는지 확인',
      '백업 → 삭제 → 생성 순서로 진행'
    ],
    example: `// 해결 예제
await fs.promises.unlink(filePath);
await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
await fs.promises.writeFile(filePath, content);`
  },

  'Module not found': {
    category: 'Import/Export',
    causes: [
      'import 경로 오류',
      'tsconfig paths 설정 문제',
      'node_modules 설치 누락'
    ],
    solutions: [
      'tsconfig.json의 paths 확인',
      'npm install 실행',
      '상대 경로 → 절대 경로 변경'
    ],
    example: `// tsconfig.json
"paths": {
  "@/*": ["./src/*"],
  "@/lib/*": ["./src/lib/*"]
}`
  },

  'Invalid environment variables': {
    category: 'Environment',
    causes: [
      '.env.local 파일 누락',
      '환경 변수 이름 오타',
      'NEXT_PUBLIC_ 프리픽스 누락'
    ],
    solutions: [
      'npm run env:check 실행',
      '.env.local.example 복사',
      '클라이언트 변수에 NEXT_PUBLIC_ 추가'
    ],
    example: `# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...`
  },

  'Hydration failed': {
    category: 'React/Next.js',
    causes: [
      '서버/클라이언트 렌더링 불일치',
      'Date 객체 직접 렌더링',
      '브라우저 전용 API 사용'
    ],
    solutions: [
      'suppressHydrationWarning 추가',
      'useEffect 내에서 클라이언트 전용 코드 실행',
      'date-fns로 날짜 포맷팅'
    ],
    example: `// 해결 예제
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);

if (!mounted) return null;`
  },

  'Type error': {
    category: 'TypeScript',
    causes: [
      '타입 정의 누락',
      'any 타입 사용',
      '타입 불일치'
    ],
    solutions: [
      'database.types.ts 타입 사용',
      'npm run db:types 실행',
      '명시적 타입 선언'
    ],
    example: `// 타입 안전 예제
import { Tables } from '@/types/database.types'

type Profile = Tables<'profiles'>
type Resource = Tables<'resources'>`
  },

  'Supabase auth error': {
    category: 'Authentication',
    causes: [
      'RLS 정책 누락',
      '토큰 만료',
      '권한 부족'
    ],
    solutions: [
      'Supabase 대시보드에서 RLS 확인',
      'auth.refreshSession() 호출',
      'service role key 사용 (서버 전용)'
    ],
    example: `// RLS 정책 예제
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);`
  },

  'Build failed': {
    category: 'Build/Deploy',
    causes: [
      'TypeScript 오류',
      '환경 변수 누락',
      'import 오류'
    ],
    solutions: [
      'npm run type-check 실행',
      'Vercel 환경 변수 설정',
      'dynamic import 사용'
    ],
    example: `// Dynamic import 예제
const Component = dynamic(() => import('./Component'), {
  ssr: false
});`
  }
};

// 에러 로그 분석
function analyzeErrorLogs() {
  const logsDir = path.join(__dirname, '..', 'logs');
  const recentErrors = [];
  
  if (fs.existsSync(logsDir)) {
    const files = fs.readdirSync(logsDir)
      .filter(f => f.endsWith('.log'))
      .sort()
      .reverse()
      .slice(0, 5);
      
    files.forEach(file => {
      const content = fs.readFileSync(path.join(logsDir, file), 'utf8');
      const errors = content.match(/error|Error|ERROR/gi) || [];
      if (errors.length > 0) {
        recentErrors.push({
          file,
          count: errors.length,
          sample: content.substring(0, 200)
        });
      }
    });
  }
  
  return recentErrors;
}

// 해결책 제안
function suggestSolutions(errorMessage) {
  const suggestions = [];
  
  Object.entries(errorPatterns).forEach(([pattern, info]) => {
    if (errorMessage.toLowerCase().includes(pattern.toLowerCase())) {
      suggestions.push({
        pattern,
        ...info
      });
    }
  });
  
  return suggestions;
}

// 문서 생성
function generateErrorDocs() {
  console.log(chalk.blue('🚨 에러 패턴 문서 생성 중...\n'));
  
  const recentErrors = analyzeErrorLogs();
  
  let markdown = `# 🚨 에러 패턴 라이브러리

## 📅 최종 업데이트: ${new Date().toLocaleString('ko-KR')}

## 🔍 빠른 검색

에러 메시지의 일부를 Ctrl+F로 검색하세요.

## 📚 에러 패턴 목록

`;

  // 카테고리별로 정리
  const categories = {};
  Object.entries(errorPatterns).forEach(([pattern, info]) => {
    if (!categories[info.category]) {
      categories[info.category] = [];
    }
    categories[info.category].push({ pattern, ...info });
  });

  Object.entries(categories).forEach(([category, errors]) => {
    markdown += `### ${category}\n\n`;
    
    errors.forEach(error => {
      markdown += `#### ❌ ${error.pattern}\n\n`;
      
      markdown += `**원인:**\n`;
      error.causes.forEach(cause => {
        markdown += `- ${cause}\n`;
      });
      
      markdown += `\n**해결책:**\n`;
      error.solutions.forEach(solution => {
        markdown += `- ${solution}\n`;
      });
      
      if (error.example) {
        markdown += `\n**예제:**\n\`\`\`typescript\n${error.example}\n\`\`\`\n`;
      }
      
      markdown += '\n---\n\n';
    });
  });

  // 최근 에러 분석
  if (recentErrors.length > 0) {
    markdown += `## 📊 최근 에러 분석\n\n`;
    recentErrors.forEach(error => {
      markdown += `- **${error.file}**: ${error.count}개 에러 발견\n`;
    });
    markdown += '\n';
  }

  // 디버깅 체크리스트
  markdown += `## 🔧 일반 디버깅 체크리스트

### 1. 환경 설정
- [ ] \`npm run env:check\` - 환경 변수 확인
- [ ] \`npm run type-check\` - TypeScript 오류 확인
- [ ] \`npm run db:types\` - Supabase 타입 동기화

### 2. 의존성
- [ ] \`npm install\` - 패키지 설치
- [ ] \`npm outdated\` - 오래된 패키지 확인
- [ ] \`npm audit\` - 보안 취약점 확인

### 3. 캐시 정리
- [ ] \`.next\` 폴더 삭제
- [ ] \`node_modules\` 재설치
- [ ] 브라우저 캐시 정리

### 4. 로그 확인
- [ ] 브라우저 콘솔
- [ ] 터미널 출력
- [ ] Vercel 함수 로그

## 💡 에러 해결 팁

### Windows 환경
\`\`\`bash
# 파일 권한 문제 해결
npm cache clean --force
rm -rf node_modules
npm install
\`\`\`

### TypeScript 오류
\`\`\`bash
# 타입 정의 재생성
npm run db:types
npm run type-check -- --noEmit
\`\`\`

### Supabase 연결
\`\`\`bash
# 연결 테스트
npx supabase status
npx supabase db remote commit
\`\`\`

---
*새로운 에러 패턴을 발견하면 이 문서에 추가해주세요.*
`;

  const outputPath = path.join(__dirname, '..', 'project-knowledge', 'ERROR_PATTERNS.md');
  fs.writeFileSync(outputPath, markdown);
  
  console.log(chalk.green('✅ 에러 패턴 문서 생성 완료!'));
  console.log(chalk.blue(`📁 위치: ${outputPath}`));
  
  // 빠른 에러 진단 도구
  const diagnostic = `// 빠른 에러 진단 도구
export function diagnoseError(error: Error) {
  const patterns = ${JSON.stringify(errorPatterns, null, 2)};
  
  const message = error.message || error.toString();
  const suggestions = [];
  
  Object.entries(patterns).forEach(([pattern, info]) => {
    if (message.toLowerCase().includes(pattern.toLowerCase())) {
      suggestions.push(info);
    }
  });
  
  return suggestions;
}`;
  
  const diagnosticPath = path.join(__dirname, '..', 'src', 'lib', 'error-diagnostic.ts');
  fs.writeFileSync(diagnosticPath, diagnostic);
  
  console.log(chalk.green('✅ 에러 진단 도구 생성!'));
  console.log(chalk.blue(`📁 위치: ${diagnosticPath}`));
}

// 실행
generateErrorDocs();
