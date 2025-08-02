const fs = require('fs').promises;
const path = require('path');
const glob = require('glob');
const { promisify } = require('util');
const globAsync = promisify(glob);

async function fixAsyncCreateServerClient() {
  const patterns = [
    'src/**/*.ts',
    'src/**/*.tsx',
  ];
  
  console.log('🔧 Fixing async createServerClient calls...\n');
  
  for (const pattern of patterns) {
    const files = await globAsync(pattern, { cwd: __dirname });
    
    for (const file of files) {
      const filePath = path.join(__dirname, file);
      
      try {
        let content = await fs.readFile(filePath, 'utf8');
        let modified = false;
        
        // Skip the server.ts file itself
        if (file.includes('supabase/server.ts')) continue;
        
        // Find patterns like: const supabase = createServerClient()
        const pattern1 = /const\s+(\w+)\s*=\s*createServerClient\(\)/g;
        if (pattern1.test(content)) {
          content = content.replace(pattern1, 'const $1 = await createServerClient()');
          modified = true;
        }
        
        // Find patterns in try blocks
        const pattern2 = /try\s*{\s*const\s+(\w+)\s*=\s*createServerClient\(\)/g;
        if (pattern2.test(content)) {
          content = content.replace(pattern2, 'try {\n    const $1 = await createServerClient()');
          modified = true;
        }
        
        if (modified) {
          await fs.writeFile(filePath, content, 'utf8');
          console.log(`✅ Fixed ${file}`);
        }
      } catch (error) {
        // Ignore errors for files that can't be read
      }
    }
  }
  
  console.log('\n✨ Async fixes completed!');
}

fixAsyncCreateServerClient().catch(console.error);
