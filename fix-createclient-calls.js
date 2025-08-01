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
    
    // createClient() 호출을 createServerClient()로 변경
    content = content.replace(/createClient\(\)/g, 'createServerClient()');
    
    // await createClient()를 createServerClient()로 변경
    content = content.replace(/await createClient\(\)/g, 'createServerClient()');
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});
