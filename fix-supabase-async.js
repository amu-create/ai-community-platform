const fs = require('fs');
const path = require('path');

// 수정할 파일 목록
const files = [
  'src/app/sitemap.ts',
  'src/app/api/users/[userId]/points/route.ts',
  'src/app/api/users/[userId]/points/history/route.ts',
  'src/app/actions/chat.ts',
  'src/app/actions/ai.ts',
  'src/app/actions/admin.ts',
  'src/app/api/ai/recommend/route.ts',
  'src/app/api/ai/analyze/route.ts',
  'src/app/api/ai/activity/route.ts',
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace patterns
    content = content.replace(
      /const supabase = createServerClient\(\)/g,
      'const supabase = await createServerClient()'
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${file}`);
  } catch (error) {
    console.log(`❌ Error fixing ${file}: ${error.message}`);
  }
});

console.log('\n✨ All files fixed!');
