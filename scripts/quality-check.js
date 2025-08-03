#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

const PROJECT_ROOT = path.join(__dirname, '..');

// 코드 메트릭스 계산
function calculateCodeMetrics() {
  const metrics = {
    files: 0,
    lines: 0,
    functions: 0,
    components: 0,
    avgFileSize: 0,
    largeFiles: [],
    complexFiles: []
  };
  
  function scanDir(dir) {
    try {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
          metrics.files++;
          
          const content = fs.readFileSync(itemPath, 'utf8');
          const lines = content.split('\n').length;
          metrics.lines += lines;
          
          // 함수 수 계산
          const functionMatches = content.match(/function\s+\w+|=>\s*{|const\s+\w+\s*=\s*\(/g) || [];
          metrics.functions += functionMatches.length;
          
          // 컴포넌트 수 계산
          const componentMatches = content.match(/export\s+(?:default\s+)?function\s+[A-Z]\w*|const\s+[A-Z]\w*\s*=.*=>/g) || [];
          metrics.components += componentMatches.length;
          
          // 큰 파일 찾기
          if (lines > 300) {
            metrics.largeFiles.push({
              file: path.relative(PROJECT_ROOT, itemPath),
              lines
            });
          }
          
          // 복잡한 파일 찾기 (함수가 많은 파일)
          if (functionMatches.length > 10) {
            metrics.complexFiles.push({
              file: path.relative(PROJECT_ROOT, itemPath),
              functions: functionMatches.length
            });
          }
        } else if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanDir(itemPath);
        }
      });
    } catch (error) {
      // 무시
    }
  }
  
  scanDir(path.join(PROJECT_ROOT, 'src'));
  
  metrics.avgFileSize = Math.round(metrics.lines / metrics.files);
  
  return metrics;
}

// 코드 스타일 체크
function checkCodeStyle() {
  const issues = [];
  
  function scanDir(dir) {
    try {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
          const content = fs.readFileSync(itemPath, 'utf8');
          const relativePath = path.relative(PROJECT_ROOT, itemPath);
          
          // console.log 체크
          if (content.includes('console.log')) {
            issues.push({
              file: relativePath,
              type: 'console.log',
              severity: 'warning'
            });
          }
          
          // any 타입 체크
          if (content.includes(': any')) {
            issues.push({
              file: relativePath,
              type: 'any type',
              severity: 'error'
            });
          }
          
          // TODO/FIXME 체크
          const todoMatches = content.match(/TODO|FIXME/g) || [];
          if (todoMatches.length > 0) {
            issues.push({
              file: relativePath,
              type: 'TODO/FIXME',
              severity: 'info',
              count: todoMatches.length
            });
          }
          
          // 긴 줄 체크
          const lines = content.split('\n');
          lines.forEach((line, index) => {
            if (line.length > 120) {
              issues.push({
                file: relativePath,
                type: 'long line',
                severity: 'warning',
                line: index + 1
              });
            }
          });
        } else if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanDir(itemPath);
        }
      });
    } catch (error) {
      // 무시
    }
  }
  
  scanDir(path.join(PROJECT_ROOT, 'src'));
  
  return issues;
}

// 의존성 순환 체크
function checkCircularDependencies() {
  const dependencies = {};
  const circular = [];
  
  function scanImports(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = [];
    
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      if (match[1].startsWith('.') || match[1].startsWith('@/')) {
        imports.push(match[1]);
      }
    }
    
    return imports;
  }
  
  function checkCircular(file, visited = new Set(), path = []) {
    if (visited.has(file)) {
      if (path.includes(file)) {
        const cycle = path.slice(path.indexOf(file));
        cycle.push(file);
        circular.push(cycle);
      }
      return;
    }
    
    visited.add(file);
    path.push(file);
    
    const deps = dependencies[file] || [];
    deps.forEach(dep => {
      checkCircular(dep, visited, [...path]);
    });
  }
  
  // 모든 파일의 의존성 수집
  function scanDir(dir) {
    try {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
          const relativePath = path.relative(PROJECT_ROOT, itemPath);
          dependencies[relativePath] = scanImports(itemPath);
        } else if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanDir(itemPath);
        }
      });
    } catch (error) {
      // 무시
    }
  }
  
  scanDir(path.join(PROJECT_ROOT, 'src'));
  
  // 순환 의존성 체크
  Object.keys(dependencies).forEach(file => {
    checkCircular(file);
  });
  
  return circular;
}

// 리포트 생성
function generateQualityReport() {
  console.log(chalk.blue('🔍 코드 품질 분석 중...\n'));
  
  const metrics = calculateCodeMetrics();
  const styleIssues = checkCodeStyle();
  const circular = checkCircularDependencies();
  
  let markdown = `# 📊 코드 품질 리포트

## 📅 분석 일시: ${new Date().toLocaleString('ko-KR')}

## 📈 코드 메트릭스

| 항목 | 값 |
|------|-----|
| 총 파일 수 | ${metrics.files}개 |
| 총 코드 줄 수 | ${metrics.lines.toLocaleString()}줄 |
| 평균 파일 크기 | ${metrics.avgFileSize}줄 |
| 총 함수 수 | ${metrics.functions}개 |
| 총 컴포넌트 수 | ${metrics.components}개 |

## 📏 큰 파일 (300줄 초과)

`;

  if (metrics.largeFiles.length > 0) {
    markdown += '| 파일 | 줄 수 |\n';
    markdown += '|------|-------|\n';
    metrics.largeFiles.forEach(file => {
      markdown += `| ${file.file} | ${file.lines}줄 |\n`;
    });
    markdown += '\n💡 **권장**: 큰 파일은 여러 개의 작은 모듈로 분리하는 것이 좋습니다.\n';
  } else {
    markdown += '*300줄을 초과하는 파일이 없습니다.*\n';
  }

  markdown += `\n## 🔧 복잡한 파일 (함수 10개 초과)\n\n`;

  if (metrics.complexFiles.length > 0) {
    markdown += '| 파일 | 함수 수 |\n';
    markdown += '|------|--------|\n';
    metrics.complexFiles.forEach(file => {
      markdown += `| ${file.file} | ${file.functions}개 |\n`;
    });
    markdown += '\n💡 **권장**: 관련 함수들을 별도의 유틸리티 파일로 분리하세요.\n';
  } else {
    markdown += '*과도하게 복잡한 파일이 없습니다.*\n';
  }

  // 코드 스타일 이슈
  markdown += `\n## 🎨 코드 스타일 이슈\n\n`;

  const issuesByType = {};
  styleIssues.forEach(issue => {
    if (!issuesByType[issue.type]) {
      issuesByType[issue.type] = [];
    }
    issuesByType[issue.type].push(issue);
  });

  if (Object.keys(issuesByType).length > 0) {
    Object.entries(issuesByType).forEach(([type, issues]) => {
      markdown += `### ${type} (${issues.length}개)\n\n`;
      
      if (issues.length <= 10) {
        issues.forEach(issue => {
          markdown += `- \`${issue.file}\``;
          if (issue.line) markdown += ` (줄 ${issue.line})`;
          if (issue.count) markdown += ` (${issue.count}개)`;
          markdown += '\n';
        });
      } else {
        markdown += `총 ${issues.length}개 파일에서 발견됨\n`;
      }
      markdown += '\n';
    });
  } else {
    markdown += '*코드 스타일 이슈가 발견되지 않았습니다.*\n';
  }

  // 순환 의존성
  markdown += `## 🔄 순환 의존성\n\n`;

  if (circular.length > 0) {
    markdown += '⚠️ **순환 의존성이 발견되었습니다:**\n\n';
    circular.forEach((cycle, index) => {
      markdown += `${index + 1}. ${cycle.join(' → ')}\n`;
    });
    markdown += '\n💡 **권장**: 순환 의존성은 코드 구조를 복잡하게 만듭니다. 리팩토링이 필요합니다.\n';
  } else {
    markdown += '*순환 의존성이 발견되지 않았습니다.*\n';
  }

  // 코드 품질 점수
  let qualityScore = 100;
  qualityScore -= styleIssues.filter(i => i.severity === 'error').length * 5;
  qualityScore -= styleIssues.filter(i => i.severity === 'warning').length * 2;
  qualityScore -= circular.length * 10;
  qualityScore -= metrics.largeFiles.length * 3;
  qualityScore = Math.max(0, qualityScore);

  markdown += `\n## 🎯 코드 품질 점수: ${qualityScore}/100\n\n`;

  if (qualityScore >= 90) {
    markdown += '🌟 **우수** - 코드 품질이 매우 좋습니다!';
  } else if (qualityScore >= 70) {
    markdown += '✅ **양호** - 몇 가지 개선사항이 있지만 전반적으로 좋습니다.';
  } else if (qualityScore >= 50) {
    markdown += '⚠️ **주의** - 상당한 개선이 필요합니다.';
  } else {
    markdown += '❌ **위험** - 즉시 리팩토링이 필요합니다.';
  }

  markdown += `\n\n## 💡 개선 권장사항\n\n`;

  const recommendations = [];
  
  if (metrics.largeFiles.length > 0) {
    recommendations.push('큰 파일을 작은 모듈로 분리');
  }
  
  if (issuesByType['any type']?.length > 0) {
    recommendations.push('any 타입을 구체적인 타입으로 변경');
  }
  
  if (issuesByType['console.log']?.length > 0) {
    recommendations.push('console.log를 적절한 로깅 시스템으로 교체');
  }
  
  if (circular.length > 0) {
    recommendations.push('순환 의존성 해결을 위한 구조 개선');
  }
  
  if (recommendations.length > 0) {
    recommendations.forEach((rec, index) => {
      markdown += `${index + 1}. ${rec}\n`;
    });
  } else {
    markdown += '*현재 코드 품질이 우수합니다. 계속 유지하세요!*\n';
  }

  markdown += `\n## 🛠️ 품질 개선 명령어

\`\`\`bash
# 린트 실행
npm run lint

# 타입 체크
npm run type-check

# 포맷팅
npm run format

# 테스트 실행
npm test
\`\`\`

---
*이 리포트는 \`npm run quality:check\`로 재생성할 수 있습니다.*
`;

  const outputPath = path.join(PROJECT_ROOT, 'project-knowledge', 'CODE_QUALITY.md');
  fs.writeFileSync(outputPath, markdown);
  
  // 콘솔 요약
  console.log(chalk.green('✅ 코드 품질 분석 완료!\n'));
  console.log(chalk.cyan('📊 품질 점수: ') + 
    (qualityScore >= 70 ? chalk.green : qualityScore >= 50 ? chalk.yellow : chalk.red)
    (`${qualityScore}/100`));
  console.log(chalk.gray(`\n📈 메트릭스:`));
  console.log(chalk.gray(`- 파일: ${metrics.files}개`));
  console.log(chalk.gray(`- 코드: ${metrics.lines.toLocaleString()}줄`));
  console.log(chalk.gray(`- 이슈: ${styleIssues.length}개`));
  console.log(chalk.blue(`\n📁 상세 리포트: ${outputPath}`));
}

// 실행
generateQualityReport();
