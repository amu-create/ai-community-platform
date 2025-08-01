const fs = require('fs');
const path = require('path');

// 수정할 파일들
const files = [
  'src/app/actions/community.ts',
  'src/app/actions/learning.ts'
];

files.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // 잘못된 경로 수정
    content = content.replace(
      /@\/utils\/supabase\/server/g,
      '@/lib/supabase/server'
    );
    
    // createClient를 createServerClient로 변경
    content = content.replace(
      /import\s*{\s*createClient\s*}\s*from\s*['"]@\/lib\/supabase\/server['"]/g,
      "import { createServerClient } from '@/lib/supabase/server'"
    );
    
    // cookies 호출 제거 및 createClient 호출 수정
    content = content.replace(
      /const cookieStore = await cookies\(\);\s*const supabase = createClient\(cookieStore\);/g,
      'const supabase = createServerClient();'
    );
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});
