const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 수정할 파일들의 경로
const files = [
  'src/app/actions/admin.ts',
  'src/app/actions/ai.ts',
  'src/app/api/ai/activity/route.ts',
  'src/app/api/ai/analyze/route.ts',
  'src/app/api/ai/recommend/route.ts',
  'src/app/api/auth/signout/route.ts',
  'src/app/api/bookmarks/check/route.ts',
  'src/app/api/bookmarks/route.ts',
  'src/app/api/users/[userId]/points/history/route.ts',
  'src/app/api/users/[userId]/points/route.ts',
  'src/app/auth/callback/route.ts',
  'src/app/page.tsx',
  'src/app/sitemap.ts',
  'src/lib/ai/recommendation-engine.ts'
];

let totalFixed = 0;

files.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    
    // createClient import를 createServerClient로 변경
    content = content.replace(
      /import\s*{\s*createClient\s*}\s*from\s*['"]@\/lib\/supabase\/server['"]/g,
      "import { createServerClient } from '@/lib/supabase/server'"
    );
    
    // createClient() 호출을 createServerClient()로 변경
    content = content.replace(
      /const\s+supabase\s*=\s*createClient\(\)/g,
      'const supabase = createServerClient()'
    );
    
    // createClient 단독 호출도 변경
    content = content.replace(
      /createClient\(\)/g,
      'createServerClient()'
    );
    
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      totalFixed++;
    } else {
      console.log(`⏭️  Skipped: ${filePath} (no changes needed)`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n✨ Total files fixed: ${totalFixed}`);
