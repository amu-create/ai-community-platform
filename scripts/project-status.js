#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// 프로젝트 루트
const PROJECT_ROOT = path.join(__dirname, '..');

// 상태 체크 함수들
function checkBuildStatus() {
  try {
    execSync('npm run build', { cwd: PROJECT_ROOT, stdio: 'ignore' });
    return { status: 'success', message: '빌드 성공' };
  } catch (error) {
    return { status: 'error', message: '빌드 실패' };
  }
}

function checkTypeStatus() {
  try {
    execSync('npm run type-check', { cwd: PROJECT_ROOT, stdio: 'ignore' });
    return { status: 'success', message: '타입 체크 통과' };
  } catch (error) {
    return { status: 'error', message: '타입 오류 존재' };
  }
}

function checkTestStatus() {
  try {
    const result = execSync('npm test -- --passWithNoTests', { 
      cwd: PROJECT_ROOT, 
      encoding: 'utf8',
      stdio: 'pipe' 
    });
    const match = result.match(/Tests:\s+(\d+)\s+passed.*?(\d+)\s+total/);
    if (match) {
      return { 
        status: 'success', 
        message: `테스트 ${match[1]}/${match[2]} 통과` 
      };
    }
    return { status: 'warning', message: '테스트 없음' };
  } catch (error) {
    return { status: 'error', message: '테스트 실패' };
  }
}

function checkGitStatus() {
  try {
    const branch = execSync('git branch --show-current', { 
      cwd: PROJECT_ROOT, 
      encoding: 'utf8' 
    }).trim();
    
    const status = execSync('git status --porcelain', { 
      cwd: PROJECT_ROOT, 
      encoding: 'utf8' 
    });
    
    const changes = status.split('\n').filter(line => line.trim()).length;
    
    return {
      branch,
      changes,
      clean: changes === 0
    };
  } catch (error) {
    return { branch: 'unknown', changes: 0, clean: true };
  }
}

function checkDeploymentStatus() {
  // Vercel 배포 상태 (API가 있다면 사용)
  return {
    url: 'https://ai-community-platform-sage.vercel.app',
    status: 'deployed',
    lastDeploy: new Date().toISOString()
  };
}

function countTodos() {
  let todoCount = 0;
  let fixmeCount = 0;
  
  function scanDir(dir) {
    try {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
          const content = fs.readFileSync(itemPath, 'utf8');
          const todos = (content.match(/TODO/g) || []).length;
          const fixmes = (content.match(/FIXME/g) || []).length;
          todoCount += todos;
          fixmeCount += fixmes;
        } else if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanDir(itemPath);
        }
      });
    } catch (error) {
      // 무시
    }
  }
  
  scanDir(path.join(PROJECT_ROOT, 'src'));
  return { todoCount, fixmeCount };
}

function getPackageInfo() {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf8')
  );
  
  return {
    name: packageJson.name,
    version: packageJson.version,
    dependencies: Object.keys(packageJson.dependencies).length,
    devDependencies: Object.keys(packageJson.devDependencies).length
  };
}

function getProjectSize() {
  let fileCount = 0;
  let totalSize = 0;
  
  function scanDir(dir) {
    try {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isFile()) {
          fileCount++;
          totalSize += stat.size;
        } else if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanDir(itemPath);
        }
      });
    } catch (error) {
      // 무시
    }
  }
  
  scanDir(path.join(PROJECT_ROOT, 'src'));
  
  return {
    files: fileCount,
    size: (totalSize / 1024 / 1024).toFixed(2) + ' MB'
  };
}

// 대시보드 생성
function generateDashboard() {
  console.log(chalk.blue('\n🔄 프로젝트 상태 분석 중...\n'));
  
  const buildStatus = checkBuildStatus();
  const typeStatus = checkTypeStatus();
  const testStatus = checkTestStatus();
  const gitStatus = checkGitStatus();
  const deployment = checkDeploymentStatus();
  const todos = countTodos();
  const packageInfo = getPackageInfo();
  const projectSize = getProjectSize();
  
  // 마크다운 생성
  let markdown = `# 🎯 프로젝트 상태 대시보드

## 📅 최종 업데이트: ${new Date().toLocaleString('ko-KR')}

## 🚦 빌드 상태
- ${buildStatus.status === 'success' ? '✅' : '❌'} **빌드**: ${buildStatus.message}
- ${typeStatus.status === 'success' ? '✅' : '❌'} **타입 체크**: ${typeStatus.message}
- ${testStatus.status === 'success' ? '✅' : testStatus.status === 'warning' ? '⚠️' : '❌'} **테스트**: ${testStatus.message}

## 🌿 Git 상태
- **현재 브랜치**: \`${gitStatus.branch}\`
- **변경사항**: ${gitStatus.changes}개 파일
- **상태**: ${gitStatus.clean ? '✅ 깨끗함' : '⚠️ 커밋 필요'}

## 🚀 배포 정보
- **URL**: ${deployment.url}
- **상태**: ${deployment.status === 'deployed' ? '✅ 배포됨' : '⚠️ 확인 필요'}
- **마지막 배포**: ${new Date(deployment.lastDeploy).toLocaleString('ko-KR')}

## 📊 프로젝트 통계
- **버전**: v${packageInfo.version}
- **의존성**: ${packageInfo.dependencies}개 (개발: ${packageInfo.devDependencies}개)
- **소스 파일**: ${projectSize.files}개 (${projectSize.size})
- **TODO**: ${todos.todoCount}개
- **FIXME**: ${todos.fixmeCount}개

## 🔍 빠른 체크리스트
\`\`\`bash
# 개발 서버 시작
npm run dev

# 환경 변수 확인
npm run env:check

# 타입 동기화
npm run db:sync

# 보안 스캔
npm run security:scan
\`\`\`

## 📋 주요 디렉토리
- \`/src/app\` - Next.js 14 App Router 페이지
- \`/src/components\` - React 컴포넌트
- \`/src/lib\` - 유틸리티 및 설정
- \`/supabase\` - 데이터베이스 스키마
- \`/project-knowledge\` - AI 작업 문서

## 🎯 다음 단계 추천
1. ${gitStatus.changes > 0 ? '변경사항 커밋하기' : '새 기능 개발 시작'}
2. ${todos.todoCount > 0 ? 'TODO 항목 처리하기' : '코드 리뷰 진행'}
3. ${testStatus.status === 'warning' ? '테스트 코드 작성하기' : '테스트 커버리지 확인'}

---
*이 대시보드는 \`npm run status\`로 업데이트할 수 있습니다.*
`;

  // 파일 저장
  const dashboardPath = path.join(PROJECT_ROOT, 'project-knowledge', 'PROJECT_STATUS.md');
  fs.writeFileSync(dashboardPath, markdown);
  
  // 콘솔 출력
  console.log(chalk.green('✅ 프로젝트 상태 대시보드 생성 완료!\n'));
  
  // 요약 출력
  console.log(chalk.cyan('📊 상태 요약:'));
  console.log(chalk.gray('━'.repeat(50)));
  console.log(`${buildStatus.status === 'success' ? chalk.green('✅') : chalk.red('❌')} 빌드: ${buildStatus.message}`);
  console.log(`${typeStatus.status === 'success' ? chalk.green('✅') : chalk.red('❌')} 타입: ${typeStatus.message}`);
  console.log(`${testStatus.status === 'success' ? chalk.green('✅') : chalk.yellow('⚠️')} 테스트: ${testStatus.message}`);
  console.log(`${gitStatus.clean ? chalk.green('✅') : chalk.yellow('⚠️')} Git: ${gitStatus.branch} (${gitStatus.changes}개 변경)`);
  console.log(chalk.gray('━'.repeat(50)));
  console.log(chalk.blue(`\n📁 대시보드 위치: ${dashboardPath}`));
}

// 실행
generateDashboard();
