const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Finding all TypeScript errors...\n');

try {
  // Run build to get all errors
  execSync('npm run build', { 
    cwd: __dirname,
    stdio: 'pipe'
  });
  console.log('✅ Build successful! No type errors found.');
} catch (error) {
  const output = error.stdout ? error.stdout.toString() : '';
  const stderr = error.stderr ? error.stderr.toString() : '';
  const fullOutput = output + stderr;
  
  // Parse errors
  const errorPattern = /\.\/src\/(.+):(\d+):(\d+)\n(Type error: .+)/g;
  const errors = [];
  let match;
  
  while ((match = errorPattern.exec(fullOutput)) !== null) {
    errors.push({
      file: match[1],
      line: parseInt(match[2]),
      col: parseInt(match[3]),
      message: match[4]
    });
  }
  
  console.log(`Found ${errors.length} type errors:\n`);
  
  // Group by file
  const errorsByFile = errors.reduce((acc, err) => {
    if (!acc[err.file]) acc[err.file] = [];
    acc[err.file].push(err);
    return acc;
  }, {});
  
  // Display errors
  Object.entries(errorsByFile).forEach(([file, fileErrors]) => {
    console.log(`📄 ${file}:`);
    fileErrors.forEach(err => {
      console.log(`  Line ${err.line}: ${err.message}`);
    });
    console.log('');
  });
  
  // Common fixes
  console.log('💡 Common fixes to apply:');
  console.log('1. Add type annotations for parameters: (param: any)');
  console.log('2. Add type assertions: as Type[]');
  console.log('3. Convert TrustedHTML: (result as unknown) as string');
  console.log('4. Add await for cookies(): await cookies()');
  console.log('5. Handle Promise types in dynamic routes');
}
