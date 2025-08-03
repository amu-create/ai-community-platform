#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// 민감한 패턴 정의
const sensitivePatterns = [
  /sk-[a-zA-Z0-9]{48}/g,  // OpenAI API Key
  /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g,  // JWT Token
  /ghp_[a-zA-Z0-9]{36}/g,  // GitHub Token
  /prj_[a-zA-Z0-9]{24}/g,  // Vercel Project ID
  /team_[a-zA-Z0-9]{24}/g,  // Vercel Team ID
  /supabase\.co/g,  // Supabase URL (부분 마스킹)
];

// 파일 검사
function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  const issues = [];

  sensitivePatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        issues.push({
          file: fileName,
          pattern: pattern.source,
          found: maskSensitiveData(match)
        });
      });
    }
  });

  return issues;
}

// 민감한 데이터 마스킹
function maskSensitiveData(data) {
  if (data.length <= 10) {
    return data.substring(0, 3) + '*'.repeat(data.length - 3);
  }
  return data.substring(0, 5) + '...' + data.substring(data.length - 5);
}

// 디렉토리 스캔
function scanDirectory(dir, exclude = []) {
  const issues = [];
  
  function scan(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const itemPath = path.join(currentDir, item);
      const stat = fs.statSync(itemPath);
      
      // 제외 경로 체크
      if (exclude.some(ex => itemPath.includes(ex))) {
        return;
      }
      
      if (stat.isFile() && (item.endsWith('.md') || item.endsWith('.txt') || item.endsWith('.js') || item.endsWith('.ts'))) {
        const fileIssues = scanFile(itemPath);
        issues.push(...fileIssues.map(issue => ({
          ...issue,
          file: path.relative(dir, itemPath)
        })));
      } else if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scan(itemPath);
      }
    });
  }
  
  scan(dir);
  return issues;
}

// 파일 이동
function moveToPrivate(filePath) {
  const privateDir = path.join(__dirname, '..', 'private-docs');
  if (!fs.existsSync(privateDir)) {
    fs.mkdirSync(privateDir, { recursive: true });
  }
  
  const fileName = path.basename(filePath);
  const newPath = path.join(privateDir, fileName);
  
  fs.renameSync(filePath, newPath);
  console.log(chalk.green(`✅ 이동 완료: ${fileName} → private-docs/`));
  
  return newPath;
}

// 메인 실행
const command = process.argv[2];
const targetPath = process.argv[3] || process.cwd();

switch (command) {
  case 'scan':
    console.log(chalk.blue('🔍 민감한 정보 스캔 중...\n'));
    
    const issues = scanDirectory(targetPath, ['node_modules', '.git', 'private-docs']);
    
    if (issues.length === 0) {
      console.log(chalk.green('✅ 민감한 정보가 발견되지 않았습니다!'));
    } else {
      console.log(chalk.red(`⚠️  ${issues.length}개의 민감한 정보가 발견되었습니다:\n`));
      
      const fileGroups = {};
      issues.forEach(issue => {
        if (!fileGroups[issue.file]) {
          fileGroups[issue.file] = [];
        }
        fileGroups[issue.file].push(issue);
      });
      
      Object.entries(fileGroups).forEach(([file, fileIssues]) => {
        console.log(chalk.yellow(`📄 ${file}:`));
        fileIssues.forEach(issue => {
          console.log(chalk.gray(`   - ${issue.found}`));
        });
      });
      
      console.log(chalk.cyan('\n💡 권장사항:'));
      console.log('1. 민감한 정보가 포함된 파일을 private-docs/ 폴더로 이동');
      console.log('2. 환경 변수로 대체');
      console.log('3. .gitignore에 추가');
    }
    break;
    
  case 'move':
    if (!targetPath || targetPath === process.cwd()) {
      console.log(chalk.red('❌ 이동할 파일 경로를 지정하세요.'));
      break;
    }
    
    moveToPrivate(targetPath);
    break;
    
  default:
    console.log(chalk.yellow('🔒 민감한 정보 관리 도구\n'));
    console.log('사용법:');
    console.log('  npm run security:scan [경로]  - 민감한 정보 스캔');
    console.log('  npm run security:move [파일]  - private-docs로 이동');
}
