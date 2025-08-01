const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 모든 파일에서 잘못된 error 경로 수정
const files = glob.sync('src/**/*.ts', { cwd: process.cwd() });

let totalFixed = 0;

files.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    
    // 잘못된 경로 수정
    content = content.replace(
      /@\/lib\/error\/errors/g,
      '@/lib/errors'
    );
    
    content = content.replace(
      /@\/lib\/error\/handlers/g,
      '@/lib/error-handler'
    );
    
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      totalFixed++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n✨ Total files fixed: ${totalFixed}`);
