const fs = require('fs');
const path = require('path');

// 수정할 파일들
const files = [
  'src/app/api/ai/activity/route.ts',
  'src/app/api/ai/analyze/route.ts'
];

files.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // AppError를 UnauthorizedError로 변경
    content = content.replace(
      /new AppError\('Unauthorized', 'UNAUTHORIZED'\)/g,
      "new UnauthorizedError('Unauthorized')"
    );
    
    // import 문에 UnauthorizedError 추가
    if (!content.includes('UnauthorizedError')) {
      content = content.replace(
        /import { AppError } from '@\/lib\/error\/errors';/g,
        "import { AppError, UnauthorizedError } from '@/lib/error/errors';"
      );
    }
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});
