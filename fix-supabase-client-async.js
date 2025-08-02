const fs = require('fs');
const path = require('path');

// 수정할 파일 목록
const files = [
  'src/app/api/search/route.ts',
  'src/app/api/tags/route.ts',
  'src/app/api/categories/route.ts',
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace patterns
    content = content.replace(
      /const supabase = createServerSupabaseClient\(\)/g,
      'const supabase = await createServerSupabaseClient()'
    );
    
    // Fix orphan createServerSupabaseClient() calls
    content = content.replace(
      /(\s+)createServerSupabaseClient\(\)/g,
      '$1const supabase = await createServerSupabaseClient()'
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${file}`);
  } catch (error) {
    console.log(`❌ Error fixing ${file}: ${error.message}`);
  }
});

console.log('\n✨ All files fixed!');
