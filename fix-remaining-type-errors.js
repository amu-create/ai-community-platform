const fs = require('fs').promises;
const path = require('path');

async function findAndFixTypeErrors() {
  const fixes = [
    {
      file: 'src/lib/ai/user-profile-analysis.ts',
      find: `      logger.error('User interest analysis failed', error instanceof Error ? error.message : 'Unknown error' instanceof Error ? error instanceof Error ? error.message : 'Unknown error' : new Error(error instanceof Error ? error.message : 'Unknown error'), { userId, });`,
      replace: `      logger.error('User interest analysis failed', error instanceof Error ? error : new Error('Unknown error'), { userId });`
    },
    {
      file: 'src/app/explore/users/page.tsx',
      find: `  const { user } = useAuth()`,
      replace: `  const authContext = useAuth()
  const { user } = useAuthStore()`
    },
    {
      file: 'src/app/explore/users/page.tsx',
      find: `import { useAuth } from '@/contexts/AuthContext'`,
      replace: `import { useAuth } from '@/contexts/AuthContext'
import { useAuthStore } from '@/store/authStore'`
    }
  ];

  console.log('🔧 Fixing remaining type errors...\n');

  for (const { file, find, replace } of fixes) {
    const filePath = path.join(__dirname, file);
    
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      if (content.includes(find)) {
        const newContent = content.replace(find, replace);
        await fs.writeFile(filePath, newContent, 'utf8');
        console.log(`✅ Fixed in ${file}`);
      } else {
        console.log(`⚠️  Pattern not found in ${file}`);
      }
    } catch (error) {
      console.log(`❌ Error processing ${file}: ${error.message}`);
    }
  }

  console.log('\n✨ Type fixes completed!');
}

findAndFixTypeErrors().catch(console.error);
