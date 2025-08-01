const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/app/actions/learning.ts');

let content = fs.readFileSync(filePath, 'utf8');

// 모든 암시적 any 타입 수정
content = content.replace(
  /data\.steps\.map\(step => step\.id\)/g,
  'data.steps.map((step: any) => step.id)'
);

content = content.replace(
  /data\.steps\.forEach\(step => {/g,
  'data.steps.forEach((step: any) => {'
);

content = content.replace(
  /progress\.map\(p => \[p\.step_id, p\]\)/g,
  'progress.map((p: any) => [p.step_id, p])'
);

content = content.replace(
  /data\.map\(path => path\.id\)/g,
  'data.map((path: any) => path.id)'
);

content = content.replace(
  /data\.forEach\(path => {/g,
  'data.forEach((path: any) => {'
);

content = content.replace(
  /enrollments\.map\(e => \[e\.learning_path_id, e\]\)/g,
  'enrollments.map((e: any) => [e.learning_path_id, e])'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Fixed learning.ts types');
