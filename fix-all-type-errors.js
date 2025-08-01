const fs = require('fs');
const path = require('path');

// 타입 에러 수정 목록
const fixes = [
  {
    file: 'src/app/api/resources/route.ts',
    fixes: [
      {
        find: '      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length',
        replace: '      ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length'
      }
    ]
  },
  {
    file: 'src/app/api/users/[userId]/points/route.ts',
    fixes: [
      {
        find: 'const cookieStore = cookies()',
        replace: 'const cookieStore = await cookies()'
      }
    ]
  },
  {
    file: 'src/app/api/users/[userId]/points/history/route.ts',
    fixes: [
      {
        find: 'const cookieStore = cookies()',
        replace: 'const cookieStore = await cookies()'
      }
    ]
  },
  {
    file: 'src/app/auth/callback/route.ts',
    fixes: [
      {
        find: 'const cookieStore = cookies()',
        replace: 'const cookieStore = await cookies()'
      }
    ]
  },
  {
    file: 'src/app/sitemap.ts',
    fixes: [
      {
        find: 'posts.map((post) => ({',
        replace: 'posts.map((post: any) => ({'
      },
      {
        find: 'users.map((user) => ({',
        replace: 'users.map((user: any) => ({'
      }
    ]
  }
];

console.log('🔧 Fixing type errors...\n');

fixes.forEach(({ file, fixes: fileFixes }) => {
  const filePath = path.join(__dirname, file);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${file}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    fileFixes.forEach(fix => {
      if (content.includes(fix.find)) {
        content = content.replace(fix.find, fix.replace);
        modified = true;
        console.log(`✅ Fixed in ${file}: ${fix.find.substring(0, 50)}...`);
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
    } else {
      console.log(`✔️  No changes needed in ${file}`);
    }
  } catch (error) {
    console.log(`❌ Error processing ${file}: ${error.message}`);
  }
});

console.log('\n✨ Type fixes completed!');
