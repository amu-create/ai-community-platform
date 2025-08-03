#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const PROJECT_ROOT = path.join(__dirname, '..');

// 질문 함수
function ask(question) {
  return new Promise(resolve => {
    rl.question(chalk.cyan(question), resolve);
  });
}

// 명령 실행
function runCommand(command, description) {
  console.log(chalk.blue(`\n${description}...`));
  try {
    execSync(command, { 
      cwd: PROJECT_ROOT, 
      stdio: 'inherit' 
    });
    console.log(chalk.green('✅ 완료'));
    return true;
  } catch (error) {
    console.log(chalk.red('❌ 실패'));
    return false;
  }
}

// 워크플로우 정의
const workflows = {
  start: {
    name: '🚀 새 작업 시작',
    steps: [
      { 
        command: 'npm run env:check', 
        description: '환경 변수 확인',
        required: true 
      },
      { 
        command: 'npm run db:types:check', 
        description: 'Supabase 타입 확인',
        required: false 
      },
      { 
        command: 'npm run status', 
        description: '프로젝트 상태 확인',
        required: false 
      },
      {
        custom: async () => {
          const description = await ask('작업 설명을 입력하세요: ');
          runCommand(`npm run ai:session:start "${description}"`, 'AI 세션 시작');
        }
      }
    ]
  },
  
  commit: {
    name: '📝 커밋 준비',
    steps: [
      { 
        command: 'npm run format:check', 
        description: '코드 포맷 확인',
        required: false 
      },
      { 
        command: 'npm run type-check', 
        description: '타입 체크',
        required: true 
      },
      { 
        command: 'npm run security:scan', 
        description: '보안 스캔',
        required: true 
      },
      {
        custom: async () => {
          const files = execSync('git status --porcelain', { 
            cwd: PROJECT_ROOT, 
            encoding: 'utf8' 
          });
          
          if (files) {
            console.log(chalk.yellow('\n변경된 파일:'));
            console.log(files);
            
            const proceed = await ask('\n커밋을 계속하시겠습니까? (y/n): ');
            if (proceed.toLowerCase() === 'y') {
              const message = await ask('커밋 메시지: ');
              runCommand('git add .', '파일 추가');
              runCommand(`git commit -m "${message}"`, '커밋');
            }
          } else {
            console.log(chalk.yellow('커밋할 변경사항이 없습니다.'));
          }
        }
      }
    ]
  },
  
  deploy: {
    name: '🚢 배포 준비',
    steps: [
      { 
        command: 'npm run build', 
        description: '프로덕션 빌드',
        required: true 
      },
      { 
        command: 'npm run type-check', 
        description: '타입 체크',
        required: true 
      },
      { 
        command: 'npm test -- --passWithNoTests', 
        description: '테스트 실행',
        required: false 
      },
      {
        custom: async () => {
          console.log(chalk.green('\n✅ 배포 준비 완료!'));
          console.log(chalk.yellow('\nVercel 배포 체크리스트:'));
          console.log('1. 환경 변수 설정 확인');
          console.log('2. 도메인 설정 확인');
          console.log('3. 빌드 설정 확인');
          
          const deploy = await ask('\nVercel에 배포하시겠습니까? (y/n): ');
          if (deploy.toLowerCase() === 'y') {
            runCommand('vercel --prod', 'Vercel 배포');
          }
        }
      }
    ]
  },
  
  fix: {
    name: '🔧 문제 해결',
    steps: [
      { 
        command: 'npm run quality:check', 
        description: '코드 품질 체크',
        required: false 
      },
      { 
        command: 'npm run analyze:deps', 
        description: '의존성 분석',
        required: false 
      },
      { 
        command: 'npm run docs:errors', 
        description: '에러 패턴 문서 생성',
        required: false 
      },
      {
        custom: async () => {
          console.log(chalk.yellow('\n추가 진단 옵션:'));
          console.log('1. npm run lint --fix (린트 자동 수정)');
          console.log('2. npm run format (코드 포맷팅)');
          console.log('3. npm audit fix (보안 취약점 수정)');
          console.log('4. rm -rf .next && npm run dev (캐시 정리)');
        }
      }
    ]
  },
  
  update: {
    name: '🔄 프로젝트 업데이트',
    steps: [
      { 
        command: 'git pull', 
        description: '최신 코드 가져오기',
        required: true 
      },
      { 
        command: 'npm install', 
        description: '의존성 설치',
        required: true 
      },
      { 
        command: 'npm run db:sync', 
        description: 'DB 스키마 동기화',
        required: false 
      },
      { 
        command: 'npm run env:check', 
        description: '환경 변수 확인',
        required: true 
      }
    ]
  },
  
  analyze: {
    name: '📊 프로젝트 분석',
    steps: [
      { 
        command: 'npm run status', 
        description: '프로젝트 상태',
        required: false 
      },
      { 
        command: 'npm run quality:check', 
        description: '코드 품질',
        required: false 
      },
      { 
        command: 'npm run analyze:deps', 
        description: '의존성 분석',
        required: false 
      },
      { 
        command: 'npm run docs:api', 
        description: 'API 문서 생성',
        required: false 
      }
    ]
  }
};

// 메인 함수
async function main() {
  console.log(chalk.blue.bold('\n🤖 AI 개발 워크플로우 도우미\n'));
  
  // 워크플로우 목록 표시
  console.log(chalk.cyan('사용 가능한 워크플로우:\n'));
  Object.entries(workflows).forEach(([key, workflow], index) => {
    console.log(`${index + 1}. ${workflow.name} (${key})`);
  });
  
  const choice = await ask('\n워크플로우를 선택하세요 (번호 또는 이름): ');
  
  // 선택한 워크플로우 찾기
  let selectedWorkflow = null;
  let workflowKey = '';
  
  if (Number(choice)) {
    const keys = Object.keys(workflows);
    workflowKey = keys[Number(choice) - 1];
    selectedWorkflow = workflows[workflowKey];
  } else {
    workflowKey = choice.toLowerCase();
    selectedWorkflow = workflows[workflowKey];
  }
  
  if (!selectedWorkflow) {
    console.log(chalk.red('잘못된 선택입니다.'));
    rl.close();
    return;
  }
  
  console.log(chalk.green(`\n${selectedWorkflow.name} 시작...\n`));
  
  // 단계별 실행
  for (const step of selectedWorkflow.steps) {
    if (step.custom) {
      await step.custom();
    } else {
      const success = runCommand(step.command, step.description);
      
      if (!success && step.required) {
        console.log(chalk.red('\n필수 단계가 실패했습니다. 워크플로우를 중단합니다.'));
        break;
      }
    }
  }
  
  // 세션에 워크플로우 기록
  if (fs.existsSync(path.join(PROJECT_ROOT, '.taskmaster', 'sessions', 'current-session.json'))) {
    execSync(`npm run ai:session:note "워크플로우 실행: ${selectedWorkflow.name}"`, {
      cwd: PROJECT_ROOT,
      stdio: 'ignore'
    });
  }
  
  console.log(chalk.green(`\n✅ ${selectedWorkflow.name} 완료!\n`));
  
  rl.close();
}

// 빠른 실행 모드
const quickMode = process.argv[2];
if (quickMode && workflows[quickMode]) {
  console.log(chalk.green(`\n${workflows[quickMode].name} 빠른 실행...\n`));
  
  workflows[quickMode].steps.forEach(step => {
    if (!step.custom) {
      runCommand(step.command, step.description);
    }
  });
  
  console.log(chalk.green('\n✅ 완료!\n'));
} else {
  // 대화형 모드
  main().catch(console.error);
}
