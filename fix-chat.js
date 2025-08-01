const fs = require('fs');
const path = require('path');

// chat.ts 파일 경로
const filePath = path.join(process.cwd(), 'src/app/actions/chat.ts');

let content = fs.readFileSync(filePath, 'utf8');

// createClient 호출을 createServerClient로 변경
content = content.replace(/const supabase = createClient\(cookieStore\);/g, 'const supabase = createServerClient();');

// cookies 사용 부분 수정
content = content.replace(/const cookieStore = await cookies\(\);/g, '');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Fixed chat.ts');
