const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Next.js 15 동적 라우트 params Promise 타입 수정...\n');

// 동적 라우트 페이지 파일 찾기
const dynamicRouteFiles = glob.sync('src/app/**/\\[*\\]/**/page.tsx', {
  cwd: __dirname,
  absolute: false
});

console.log(`📁 ${dynamicRouteFiles.length}개의 동적 라우트 파일 발견\n`);

dynamicRouteFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // interface PageProps 패턴 찾기
    const interfaceRegex = /interface\s+\w+Props\s*{\s*params:\s*{\s*([^}]+)\s*}>\s*}/g;
    const simpleInterfaceRegex = /interface\s+\w+Props\s*{\s*params:\s*{\s*([^}]+)\s*}\s*}/g;
    
    // Promise 타입으로 변경
    content = content.replace(interfaceRegex, (match, params) => {
      return match.replace('params:', 'params: Promise<');
    });
    
    content = content.replace(simpleInterfaceRegex, (match, params) => {
      return match.replace('params: {', 'params: Promise<{').replace('}>', '}>');
    });
    
    // 함수 시그니처에서 params 사용 수정
    if (content.includes('export default async function') || content.includes('export async function')) {
      // params 사용 부분을 await로 수정
      const functionRegex = /export\s+(default\s+)?async\s+function\s+\w+\s*\(\s*{\s*params\s*}\s*:\s*\w+\s*\)\s*{/g;
      
      content = content.replace(functionRegex, (match) => {
        return match + '\n  const resolvedParams = await params;';
      });
      
      // params. 사용을 resolvedParams.로 변경
      content = content.replace(/params\./g, 'resolvedParams.');
    }
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ 수정됨: ${file}`);
    } else {
      console.log(`✔️  확인 필요: ${file}`);
    }
  } catch (error) {
    console.log(`❌ 에러: ${file} - ${error.message}`);
  }
});

console.log('\n✨ 동적 라우트 params 타입 수정 완료!');
