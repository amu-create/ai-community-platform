#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const API_DIR = path.join(__dirname, '..', 'src', 'app', 'api');
const OUTPUT_FILE = path.join(__dirname, '..', 'project-knowledge', 'API_ENDPOINTS.md');

// API 엔드포인트 스캔
function scanApiEndpoints() {
  const endpoints = [];
  
  function scanDir(dir, route = '') {
    try {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          scanDir(itemPath, `${route}/${item}`);
        } else if (item === 'route.ts' || item === 'route.js') {
          const content = fs.readFileSync(itemPath, 'utf8');
          const methods = extractMethods(content);
          
          if (methods.length > 0) {
            endpoints.push({
              path: `/api${route}`,
              file: path.relative(path.join(__dirname, '..'), itemPath),
              methods: methods,
              hasAuth: content.includes('auth') || content.includes('session'),
              hasValidation: content.includes('zod') || content.includes('validate'),
              description: extractDescription(content)
            });
          }
        }
      });
    } catch (error) {
      console.error(chalk.red(`Error scanning ${dir}:`, error.message));
    }
  }
  
  if (fs.existsSync(API_DIR)) {
    scanDir(API_DIR);
  }
  
  return endpoints;
}

// HTTP 메서드 추출
function extractMethods(content) {
  const methods = [];
  const methodRegex = /export\s+(?:async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)/g;
  
  let match;
  while ((match = methodRegex.exec(content)) !== null) {
    methods.push(match[1]);
  }
  
  return methods;
}

// 설명 추출 (주석에서)
function extractDescription(content) {
  const commentRegex = /\/\*\*\s*\n\s*\*\s*(.+?)\n/;
  const match = content.match(commentRegex);
  return match ? match[1].trim() : '';
}

// Supabase 함수 문서화
function documentSupabaseFunctions() {
  const functions = [
    {
      name: 'createClient',
      path: '@/lib/supabase/supabase-client',
      usage: 'Client Components',
      example: `import { createClient } from '@/lib/supabase/supabase-client'
const supabase = createClient()`
    },
    {
      name: 'createServerClient',
      path: '@/lib/supabase/supabase-server',
      usage: 'Server Components/Route Handlers',
      example: `import { createServerClient } from '@/lib/supabase/supabase-server'
const supabase = await createServerClient()`
    }
  ];
  
  return functions;
}

// 주요 컴포넌트 문서화
function documentComponents() {
  const componentsDir = path.join(__dirname, '..', 'src', 'components');
  const components = [];
  
  function scanComponents(dir, category = '') {
    try {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory() && !item.startsWith('.')) {
          scanComponents(itemPath, item);
        } else if (item.endsWith('.tsx') && !item.endsWith('.test.tsx')) {
          const content = fs.readFileSync(itemPath, 'utf8');
          const componentName = extractComponentName(content);
          
          if (componentName) {
            components.push({
              name: componentName,
              file: path.relative(path.join(__dirname, '..'), itemPath),
              category: category || 'general',
              props: extractProps(content),
              hasClient: content.includes("'use client'"),
              hasServer: content.includes("'use server'")
            });
          }
        }
      });
    } catch (error) {
      // 무시
    }
  }
  
  scanComponents(componentsDir);
  return components;
}

// 컴포넌트 이름 추출
function extractComponentName(content) {
  const exportRegex = /export\s+(?:default\s+)?function\s+(\w+)/;
  const match = content.match(exportRegex);
  return match ? match[1] : null;
}

// Props 추출
function extractProps(content) {
  const propsRegex = /interface\s+\w*Props\s*{([^}]+)}/;
  const match = content.match(propsRegex);
  
  if (match) {
    const propsContent = match[1];
    const props = [];
    const propRegex = /(\w+)(\?)?:\s*([^;]+)/g;
    
    let propMatch;
    while ((propMatch = propRegex.exec(propsContent)) !== null) {
      props.push({
        name: propMatch[1],
        required: !propMatch[2],
        type: propMatch[3].trim()
      });
    }
    
    return props;
  }
  
  return [];
}

// 문서 생성
function generateDocs() {
  console.log(chalk.blue('📚 API 및 컴포넌트 문서 생성 중...\n'));
  
  const endpoints = scanApiEndpoints();
  const supabaseFunctions = documentSupabaseFunctions();
  const components = documentComponents();
  
  let markdown = `# 🔌 API 엔드포인트 및 함수 문서

## 📅 최종 업데이트: ${new Date().toLocaleString('ko-KR')}

## 🌐 REST API 엔드포인트

`;

  if (endpoints.length === 0) {
    markdown += '*현재 구현된 API 엔드포인트가 없습니다.*\n\n';
  } else {
    endpoints.forEach(endpoint => {
      markdown += `### ${endpoint.path}\n`;
      markdown += `- **파일**: \`${endpoint.file}\`\n`;
      markdown += `- **메서드**: ${endpoint.methods.map(m => `\`${m}\``).join(', ')}\n`;
      markdown += `- **인증**: ${endpoint.hasAuth ? '✅ 필요' : '❌ 불필요'}\n`;
      markdown += `- **검증**: ${endpoint.hasValidation ? '✅ 있음' : '❌ 없음'}\n`;
      if (endpoint.description) {
        markdown += `- **설명**: ${endpoint.description}\n`;
      }
      markdown += '\n';
    });
  }

  markdown += `## 🔧 Supabase 클라이언트 함수

`;

  supabaseFunctions.forEach(func => {
    markdown += `### ${func.name}\n`;
    markdown += `- **경로**: \`${func.path}\`\n`;
    markdown += `- **용도**: ${func.usage}\n`;
    markdown += `- **예제**:\n\`\`\`typescript\n${func.example}\n\`\`\`\n\n`;
  });

  // 카테고리별 컴포넌트 정리
  const componentsByCategory = {};
  components.forEach(comp => {
    if (!componentsByCategory[comp.category]) {
      componentsByCategory[comp.category] = [];
    }
    componentsByCategory[comp.category].push(comp);
  });

  markdown += `## 🧩 주요 컴포넌트

`;

  Object.entries(componentsByCategory).forEach(([category, comps]) => {
    markdown += `### ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
    
    comps.forEach(comp => {
      markdown += `#### ${comp.name}\n`;
      markdown += `- **파일**: \`${comp.file}\`\n`;
      markdown += `- **타입**: ${comp.hasClient ? '클라이언트' : '서버'} 컴포넌트\n`;
      
      if (comp.props.length > 0) {
        markdown += `- **Props**:\n`;
        comp.props.forEach(prop => {
          markdown += `  - \`${prop.name}${prop.required ? '' : '?'}: ${prop.type}\`\n`;
        });
      }
      
      markdown += '\n';
    });
  });

  markdown += `## 🔍 빠른 검색

### API 엔드포인트별
\`\`\`typescript
${endpoints.map(e => `// ${e.path}\n${e.methods.map(m => `${m} ${e.path}`).join('\n')}`).join('\n\n')}
\`\`\`

### 인증이 필요한 엔드포인트
${endpoints.filter(e => e.hasAuth).map(e => `- ${e.path}`).join('\n') || '없음'}

### 클라이언트 컴포넌트
${components.filter(c => c.hasClient).map(c => `- ${c.name} (${c.category})`).join('\n').substring(0, 500) || '없음'}

---
*이 문서는 \`npm run docs:api\`로 업데이트할 수 있습니다.*
`;

  fs.writeFileSync(OUTPUT_FILE, markdown);
  
  console.log(chalk.green('✅ API 문서 생성 완료!'));
  console.log(chalk.blue(`📁 위치: ${OUTPUT_FILE}`));
  console.log(chalk.gray(`\n📊 통계:`));
  console.log(chalk.gray(`- API 엔드포인트: ${endpoints.length}개`));
  console.log(chalk.gray(`- 컴포넌트: ${components.length}개`));
}

// 실행
generateDocs();
