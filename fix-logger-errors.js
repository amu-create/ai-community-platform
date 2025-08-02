const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript files
const files = glob.sync('src/**/*.{ts,tsx}', {
  cwd: __dirname,
  absolute: true
});

console.log(`Found ${files.length} TypeScript files to check`);

let totalFixed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  
  // Pattern 1: logger.error('message', { ... })
  const pattern1 = /logger\.error\s*\(\s*(['"`][^'"`]+['"`])\s*,\s*\{([^}]+)\}\s*\)/g;
  
  // Pattern 2: logger.error('message', error)
  const pattern2 = /logger\.error\s*\(\s*(['"`][^'"`]+['"`])\s*,\s*(\w+)\s*\)/g;
  
  // Replace pattern 1
  content = content.replace(pattern1, (match, message, metadata) => {
    // Check if it's already in the correct format
    if (match.includes('new Error')) {
      return match;
    }
    
    modified = true;
    
    // Extract metadata
    const metadataStr = metadata.trim();
    
    // If metadata contains error property, extract it
    const errorMatch = metadataStr.match(/error\s*:\s*([^,}]+)/);
    if (errorMatch) {
      const errorExpr = errorMatch[1].trim();
      const remainingMetadata = metadataStr.replace(/error\s*:\s*[^,}]+,?\s*/, '').trim();
      
      if (remainingMetadata) {
        return `logger.error(${message}, ${errorExpr} instanceof Error ? ${errorExpr} : new Error(${errorExpr}), { ${remainingMetadata} })`;
      } else {
        return `logger.error(${message}, ${errorExpr} instanceof Error ? ${errorExpr} : new Error(${errorExpr}))`;
      }
    }
    
    // If no error in metadata, convert metadata to error
    return `logger.error(${message}, new Error('See metadata'), { ${metadataStr} })`;
  });
  
  // Replace pattern 2
  content = content.replace(pattern2, (match, message, errorVar) => {
    // Skip if it's already correct
    if (errorVar === 'error' || errorVar.includes('Error')) {
      return match;
    }
    
    modified = true;
    return `logger.error(${message}, ${errorVar} instanceof Error ? ${errorVar} : new Error(String(${errorVar})))`;
  });
  
  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Fixed logger.error calls in: ${path.relative(__dirname, file)}`);
    totalFixed++;
  }
});

console.log(`\n✨ Fixed logger.error calls in ${totalFixed} files`);
