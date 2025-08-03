#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

const PROJECT_ROOT = path.join(__dirname, '..');

// 패키지 정보 읽기
function getPackageInfo() {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf8')
  );
  return packageJson;
}

// 의존성 크기 분석
function analyzeDependencySize() {
  console.log(chalk.blue('📦 의존성 크기 분석 중...'));
  
  const sizes = {};
  const nodeModulesPath = path.join(PROJECT_ROOT, 'node_modules');
  
  if (fs.existsSync(nodeModulesPath)) {
    const packages = fs.readdirSync(nodeModulesPath);
    
    packages.forEach(pkg => {
      if (pkg.startsWith('.') || pkg === '@types') return;
      
      const pkgPath = path.join(nodeModulesPath, pkg);
      const size = getDirectorySize(pkgPath);
      
      if (size > 0) {
        sizes[pkg] = size;
      }
    });
  }
  
  // 크기순 정렬
  const sorted = Object.entries(sizes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
    
  return sorted;
}

// 디렉토리 크기 계산
function getDirectorySize(dir) {
  let totalSize = 0;
  
  try {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isFile()) {
        totalSize += stat.size;
      } else if (stat.isDirectory() && !item.startsWith('.')) {
        totalSize += getDirectorySize(itemPath);
      }
    });
  } catch (error) {
    // 무시
  }
  
  return totalSize;
}

// 오래된 패키지 확인
function checkOutdated() {
  console.log(chalk.blue('🔍 오래된 패키지 확인 중...'));
  
  try {
    const result = execSync('npm outdated --json', { 
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    if (result) {
      return JSON.parse(result);
    }
  } catch (error) {
    // npm outdated는 오래된 패키지가 있으면 에러 코드를 반환함
    if (error.stdout) {
      try {
        return JSON.parse(error.stdout);
      } catch {
        return {};
      }
    }
  }
  
  return {};
}

// 보안 취약점 확인
function checkVulnerabilities() {
  console.log(chalk.blue('🔒 보안 취약점 확인 중...'));
  
  try {
    const result = execSync('npm audit --json', {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    return JSON.parse(result);
  } catch (error) {
    if (error.stdout) {
      try {
        return JSON.parse(error.stdout);
      } catch {
        return null;
      }
    }
    return null;
  }
}

// 사용되지 않는 의존성 찾기
function findUnusedDependencies() {
  console.log(chalk.blue('🔍 사용되지 않는 의존성 검색 중...'));
  
  const packageInfo = getPackageInfo();
  const allDeps = {
    ...packageInfo.dependencies,
    ...packageInfo.devDependencies
  };
  
  const usedDeps = new Set();
  
  // src 폴더의 모든 import 스캔
  function scanImports(dir) {
    try {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.jsx'))) {
          const content = fs.readFileSync(itemPath, 'utf8');
          
          // import 문 찾기
          const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
          const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
          
          let match;
          while ((match = importRegex.exec(content)) !== null) {
            const dep = match[1].split('/')[0].replace('@', '');
            if (!dep.startsWith('.') && !dep.startsWith('~')) {
              usedDeps.add(dep);
            }
          }
          
          while ((match = requireRegex.exec(content)) !== null) {
            const dep = match[1].split('/')[0].replace('@', '');
            if (!dep.startsWith('.') && !dep.startsWith('~')) {
              usedDeps.add(dep);
            }
          }
        } else if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanImports(itemPath);
        }
      });
    } catch (error) {
      // 무시
    }
  }
  
  scanImports(path.join(PROJECT_ROOT, 'src'));
  
  // 사용되지 않는 의존성 찾기
  const unused = [];
  Object.keys(allDeps).forEach(dep => {
    // 특별한 의존성은 제외
    const specialDeps = ['husky', 'prettier', 'eslint', '@types/', 'typescript', 'tailwindcss', 'autoprefixer', 'postcss'];
    if (!usedDeps.has(dep) && !specialDeps.some(special => dep.includes(special))) {
      unused.push(dep);
    }
  });
  
  return unused;
}

// 리포트 생성
function generateReport() {
  console.log(chalk.blue('\n📊 의존성 분석 리포트 생성 중...\n'));
  
  const packageInfo = getPackageInfo();
  const sizes = analyzeDependencySize();
  const outdated = checkOutdated();
  const vulnerabilities = checkVulnerabilities();
  const unused = findUnusedDependencies();
  
  let markdown = `# 📦 의존성 분석 리포트

## 📅 분석 일시: ${new Date().toLocaleString('ko-KR')}

## 📊 의존성 통계
- **총 의존성**: ${Object.keys(packageInfo.dependencies || {}).length}개
- **개발 의존성**: ${Object.keys(packageInfo.devDependencies || {}).length}개
- **node_modules 크기**: ${(sizes.reduce((acc, [, size]) => acc + size, 0) / 1024 / 1024).toFixed(2)} MB

## 📏 크기별 상위 20개 패키지

| 패키지 | 크기 |
|--------|------|
${sizes.map(([pkg, size]) => `| ${pkg} | ${(size / 1024 / 1024).toFixed(2)} MB |`).join('\n')}

## 🔄 업데이트 필요 패키지

`;

  if (Object.keys(outdated).length > 0) {
    markdown += '| 패키지 | 현재 | 최신 | 타입 |\n';
    markdown += '|--------|------|------|------|\n';
    
    Object.entries(outdated).forEach(([pkg, info]) => {
      markdown += `| ${pkg} | ${info.current} | ${info.latest} | ${info.type} |\n`;
    });
  } else {
    markdown += '*모든 패키지가 최신 버전입니다.*\n';
  }

  markdown += `\n## 🔒 보안 취약점\n\n`;

  if (vulnerabilities && vulnerabilities.metadata) {
    const { vulnerabilities: vulns } = vulnerabilities.metadata;
    markdown += `- **심각**: ${vulns.critical || 0}개\n`;
    markdown += `- **높음**: ${vulns.high || 0}개\n`;
    markdown += `- **중간**: ${vulns.moderate || 0}개\n`;
    markdown += `- **낮음**: ${vulns.low || 0}개\n`;
    
    if (vulns.total > 0) {
      markdown += `\n**해결 명령어**: \`npm audit fix\`\n`;
    }
  } else {
    markdown += '*보안 취약점이 발견되지 않았습니다.*\n';
  }

  markdown += `\n## 🗑️ 사용되지 않는 의존성\n\n`;

  if (unused.length > 0) {
    markdown += '다음 패키지들은 코드에서 직접 import되지 않습니다:\n\n';
    unused.forEach(dep => {
      markdown += `- ${dep}\n`;
    });
    markdown += '\n*주의: 일부 패키지는 간접적으로 사용될 수 있습니다.*\n';
  } else {
    markdown += '*모든 의존성이 사용되고 있습니다.*\n';
  }

  markdown += `\n## 💡 권장사항\n\n`;

  const recommendations = [];
  
  if (sizes[0] && sizes[0][1] > 10 * 1024 * 1024) {
    recommendations.push('큰 패키지를 더 작은 대안으로 교체 검토');
  }
  
  if (Object.keys(outdated).length > 5) {
    recommendations.push('오래된 패키지 업데이트 (`npm update`)');
  }
  
  if (vulnerabilities?.metadata?.vulnerabilities?.total > 0) {
    recommendations.push('보안 취약점 해결 (`npm audit fix`)');
  }
  
  if (unused.length > 3) {
    recommendations.push('사용하지 않는 의존성 제거');
  }
  
  if (recommendations.length > 0) {
    recommendations.forEach((rec, index) => {
      markdown += `${index + 1}. ${rec}\n`;
    });
  } else {
    markdown += '*현재 의존성 관리 상태가 양호합니다.*\n';
  }

  markdown += `\n## 🛠️ 유용한 명령어

\`\`\`bash
# 의존성 업데이트
npm update

# 보안 취약점 자동 수정
npm audit fix

# 사용하지 않는 패키지 제거
npm uninstall [package-name]

# 패키지 크기 확인
npm list --depth=0

# 중복 패키지 제거
npm dedupe
\`\`\`

---
*이 리포트는 \`npm run analyze:deps\`로 재생성할 수 있습니다.*
`;

  const outputPath = path.join(PROJECT_ROOT, 'project-knowledge', 'DEPENDENCY_ANALYSIS.md');
  fs.writeFileSync(outputPath, markdown);
  
  // 콘솔 요약
  console.log(chalk.green('✅ 의존성 분석 완료!\n'));
  console.log(chalk.cyan('📊 요약:'));
  console.log(chalk.gray(`- 총 크기: ${(sizes.reduce((acc, [, size]) => acc + size, 0) / 1024 / 1024).toFixed(2)} MB`));
  console.log(chalk.gray(`- 업데이트 필요: ${Object.keys(outdated).length}개`));
  console.log(chalk.gray(`- 보안 이슈: ${vulnerabilities?.metadata?.vulnerabilities?.total || 0}개`));
  console.log(chalk.gray(`- 미사용 의존성: ${unused.length}개`));
  console.log(chalk.blue(`\n📁 상세 리포트: ${outputPath}`));
}

// 실행
generateReport();
