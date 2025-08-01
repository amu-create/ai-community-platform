const fs = require('fs');
const path = require('path');

// 서버 사이드에서 createClient를 사용하는 파일들
const serverSideFiles = [
  'src/lib/supabase-server.ts',
  'src/app/api/auth/route.ts',
  'src/app/community/[category]/page.tsx',
  'src/app/community/[category]/[id]/page.tsx',
  'src/app/ai-market/page.tsx',
  'src/app/projects/page.tsx',
  'src/app/profile/page.tsx',
  'src/app/profile/[id]/page.tsx',
  'src/app/page.tsx',
  'src/app/posts/[id]/page.tsx',
  'src/app/admin/layout.tsx',
  'src/app/admin/dashboard/page.tsx',
  'src/app/admin/users/page.tsx',
  'src/app/admin/content/page.tsx',
  'src/app/admin/content/[type]/page.tsx',
  'src/app/admin/reports/page.tsx',
  'src/app/admin/settings/page.tsx',
  'src/app/api/admin/users/route.ts',
  'src/app/api/auth/callback/route.ts',
  'src/app/api/posts/route.ts',
  'src/app/api/posts/[id]/route.ts',
  'src/app/api/projects/route.ts',
  'src/app/api/projects/[id]/route.ts',
  'src/app/layout.tsx'
];

// 클라이언트 사이드에서 createClient를 사용하는 파일들
const clientSideFiles = [
  'src/lib/supabase-client.ts',
  'src/components/layout/DashboardNav.tsx'
];

console.log('🔧 Import 문제 수정 시작...\n');

// 서버 사이드 파일 수정
serverSideFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  파일 없음: ${file}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // createClient() 호출을 createServerClient()로 변경
    content = content.replace(/createClient\(\)/g, 'createServerClient()');
    
    // import 문 수정
    if (content.includes("from '@/lib/supabase-server'")) {
      content = content.replace(
        /import\s+{\s*createClient\s*}\s+from\s+['"]@\/lib\/supabase-server['"]/g,
        "import { createServerClient } from '@/lib/supabase-server'"
      );
    }

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ 수정됨: ${file}`);
    } else {
      console.log(`✔️  이미 정상: ${file}`);
    }
  } catch (error) {
    console.log(`❌ 에러: ${file} - ${error.message}`);
  }
});

console.log('\n📁 클라이언트 사이드 파일 확인...\n');

// 클라이언트 사이드 파일 확인
clientSideFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  파일 없음: ${file}`);
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    
    // 클라이언트 파일은 createClient를 사용해야 함
    if (content.includes('createServerClient')) {
      console.log(`⚠️  주의: ${file} - 클라이언트 파일인데 createServerClient 사용 중`);
    } else {
      console.log(`✔️  정상: ${file}`);
    }
  } catch (error) {
    console.log(`❌ 에러: ${file} - ${error.message}`);
  }
});

console.log('\n✨ Import 수정 완료!');
