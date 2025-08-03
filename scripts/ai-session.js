#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

const SESSION_DIR = path.join(__dirname, '..', '.taskmaster', 'sessions');
const CURRENT_SESSION_FILE = path.join(SESSION_DIR, 'current-session.json');

// 세션 디렉토리 확인 및 생성
function ensureSessionDir() {
  if (!fs.existsSync(SESSION_DIR)) {
    fs.mkdirSync(SESSION_DIR, { recursive: true });
  }
}

// 현재 Git 상태 가져오기
function getGitStatus() {
  try {
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    const lastCommit = execSync('git log -1 --oneline', { encoding: 'utf8' }).trim();
    
    return {
      branch,
      hasChanges: status.length > 0,
      modifiedFiles: status.split('\n').filter(line => line.trim()).map(line => line.substring(3)),
      lastCommit
    };
  } catch {
    return null;
  }
}

// 열린 파일 목록 추측 (최근 수정된 파일)
function getRecentFiles() {
  const srcDir = path.join(__dirname, '..', 'src');
  const files = [];
  
  function scanDir(dir, depth = 0) {
    if (depth > 3) return; // 너무 깊이 들어가지 않음
    
    try {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
          const mtime = stat.mtime.getTime();
          const now = Date.now();
          const hourAgo = now - (60 * 60 * 1000);
          
          if (mtime > hourAgo) {
            files.push({
              path: path.relative(path.join(__dirname, '..'), itemPath),
              modified: new Date(mtime).toISOString()
            });
          }
        } else if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanDir(itemPath, depth + 1);
        }
      });
    } catch (error) {
      // 권한 오류 등 무시
    }
  }
  
  scanDir(srcDir);
  return files.sort((a, b) => b.modified.localeCompare(a.modified)).slice(0, 10);
}

// 세션 시작
function startSession(description) {
  ensureSessionDir();
  
  const session = {
    id: Date.now().toString(),
    startTime: new Date().toISOString(),
    description: description || '새 작업 세션',
    gitStatus: getGitStatus(),
    recentFiles: getRecentFiles(),
    tasks: [],
    notes: [],
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      cwd: process.cwd()
    }
  };
  
  fs.writeFileSync(CURRENT_SESSION_FILE, JSON.stringify(session, null, 2));
  
  console.log(chalk.green('✅ 새 작업 세션 시작!'));
  console.log(chalk.blue(`📝 세션 ID: ${session.id}`));
  console.log(chalk.gray(`📁 작업 디렉토리: ${session.environment.cwd}`));
  if (session.gitStatus) {
    console.log(chalk.gray(`🌿 Git 브랜치: ${session.gitStatus.branch}`));
  }
}

// 세션 업데이트
function updateSession(type, data) {
  if (!fs.existsSync(CURRENT_SESSION_FILE)) {
    console.log(chalk.red('❌ 활성 세션이 없습니다. ai:session:start로 시작하세요.'));
    return;
  }
  
  const session = JSON.parse(fs.readFileSync(CURRENT_SESSION_FILE, 'utf8'));
  
  switch (type) {
    case 'task':
      session.tasks.push({
        time: new Date().toISOString(),
        description: data,
        completed: false
      });
      console.log(chalk.green(`✅ 작업 추가: ${data}`));
      break;
      
    case 'note':
      session.notes.push({
        time: new Date().toISOString(),
        content: data
      });
      console.log(chalk.green(`📝 노트 추가: ${data}`));
      break;
      
    case 'file':
      if (!session.modifiedFiles) session.modifiedFiles = [];
      if (!session.modifiedFiles.includes(data)) {
        session.modifiedFiles.push(data);
      }
      console.log(chalk.green(`📄 파일 수정 기록: ${data}`));
      break;
      
    case 'complete':
      const taskIndex = parseInt(data);
      if (session.tasks[taskIndex]) {
        session.tasks[taskIndex].completed = true;
        session.tasks[taskIndex].completedAt = new Date().toISOString();
        console.log(chalk.green(`✅ 작업 완료: ${session.tasks[taskIndex].description}`));
      }
      break;
  }
  
  session.lastUpdate = new Date().toISOString();
  fs.writeFileSync(CURRENT_SESSION_FILE, JSON.stringify(session, null, 2));
}

// 세션 저장
function saveSession() {
  if (!fs.existsSync(CURRENT_SESSION_FILE)) {
    console.log(chalk.red('❌ 저장할 활성 세션이 없습니다.'));
    return;
  }
  
  const session = JSON.parse(fs.readFileSync(CURRENT_SESSION_FILE, 'utf8'));
  session.endTime = new Date().toISOString();
  session.gitStatusEnd = getGitStatus();
  
  // 작업 요약 생성
  const summary = {
    duration: calculateDuration(session.startTime, session.endTime),
    tasksCompleted: session.tasks.filter(t => t.completed).length,
    totalTasks: session.tasks.length,
    filesModified: session.modifiedFiles?.length || 0
  };
  
  session.summary = summary;
  
  // 세션 파일로 저장
  const sessionFileName = `session-${session.id}.json`;
  const sessionPath = path.join(SESSION_DIR, sessionFileName);
  fs.writeFileSync(sessionPath, JSON.stringify(session, null, 2));
  
  // 보고서 생성
  generateSessionReport(session);
  
  // 현재 세션 파일 삭제
  fs.unlinkSync(CURRENT_SESSION_FILE);
  
  console.log(chalk.green('\n✅ 세션 저장 완료!'));
  console.log(chalk.blue(`📊 작업 시간: ${summary.duration}`));
  console.log(chalk.blue(`✅ 완료된 작업: ${summary.tasksCompleted}/${summary.totalTasks}`));
  console.log(chalk.blue(`📝 수정된 파일: ${summary.filesModified}개`));
  console.log(chalk.gray(`💾 저장 위치: ${sessionPath}`));
}

// 세션 복원
function restoreSession(sessionId) {
  ensureSessionDir();
  
  let sessionPath;
  if (sessionId) {
    sessionPath = path.join(SESSION_DIR, `session-${sessionId}.json`);
  } else {
    // 가장 최근 세션 찾기
    const files = fs.readdirSync(SESSION_DIR)
      .filter(f => f.startsWith('session-') && f.endsWith('.json'))
      .sort()
      .reverse();
      
    if (files.length === 0) {
      console.log(chalk.red('❌ 복원할 세션이 없습니다.'));
      return;
    }
    
    sessionPath = path.join(SESSION_DIR, files[0]);
  }
  
  if (!fs.existsSync(sessionPath)) {
    console.log(chalk.red('❌ 세션 파일을 찾을 수 없습니다.'));
    return;
  }
  
  const session = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
  
  console.log(chalk.green('\n📋 세션 정보:'));
  console.log(chalk.blue(`ID: ${session.id}`));
  console.log(chalk.blue(`설명: ${session.description}`));
  console.log(chalk.blue(`시작: ${new Date(session.startTime).toLocaleString()}`));
  if (session.endTime) {
    console.log(chalk.blue(`종료: ${new Date(session.endTime).toLocaleString()}`));
    console.log(chalk.blue(`소요 시간: ${session.summary?.duration || '알 수 없음'}`));
  }
  
  if (session.tasks.length > 0) {
    console.log(chalk.yellow('\n📋 작업 목록:'));
    session.tasks.forEach((task, index) => {
      const status = task.completed ? chalk.green('✅') : chalk.gray('⬜');
      console.log(`${status} ${index}. ${task.description}`);
    });
  }
  
  if (session.notes.length > 0) {
    console.log(chalk.yellow('\n📝 노트:'));
    session.notes.forEach(note => {
      console.log(chalk.gray(`- ${note.content}`));
    });
  }
  
  if (session.modifiedFiles?.length > 0) {
    console.log(chalk.yellow('\n📄 수정된 파일:'));
    session.modifiedFiles.forEach(file => {
      console.log(chalk.gray(`- ${file}`));
    });
  }
}

// 작업 시간 계산
function calculateDuration(start, end) {
  const diff = new Date(end) - new Date(start);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}시간 ${minutes}분`;
  } else {
    return `${minutes}분`;
  }
}

// 세션 보고서 생성
function generateSessionReport(session) {
  const reportDir = path.join(__dirname, '..', 'reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const date = new Date(session.startTime);
  const dateStr = date.toISOString().split('T')[0];
  const reportPath = path.join(reportDir, `${dateStr}-session-${session.id}.md`);
  
  let report = `# 작업 세션 보고서\n\n`;
  report += `## 세션 정보\n`;
  report += `- **ID**: ${session.id}\n`;
  report += `- **설명**: ${session.description}\n`;
  report += `- **시작**: ${new Date(session.startTime).toLocaleString()}\n`;
  report += `- **종료**: ${new Date(session.endTime).toLocaleString()}\n`;
  report += `- **소요 시간**: ${session.summary.duration}\n\n`;
  
  report += `## 작업 요약\n`;
  report += `- 완료된 작업: ${session.summary.tasksCompleted}/${session.summary.totalTasks}\n`;
  report += `- 수정된 파일: ${session.summary.filesModified}개\n\n`;
  
  if (session.tasks.length > 0) {
    report += `## 작업 내역\n`;
    session.tasks.forEach((task, index) => {
      const status = task.completed ? '✅' : '⬜';
      report += `${index + 1}. ${status} ${task.description}\n`;
      if (task.completed) {
        report += `   - 완료 시간: ${new Date(task.completedAt).toLocaleString()}\n`;
      }
    });
    report += '\n';
  }
  
  if (session.notes.length > 0) {
    report += `## 작업 노트\n`;
    session.notes.forEach(note => {
      report += `- ${note.content}\n`;
    });
    report += '\n';
  }
  
  if (session.modifiedFiles?.length > 0) {
    report += `## 수정된 파일\n`;
    session.modifiedFiles.forEach(file => {
      report += `- ${file}\n`;
    });
    report += '\n';
  }
  
  if (session.gitStatus && session.gitStatusEnd) {
    report += `## Git 변경사항\n`;
    report += `- 시작 브랜치: ${session.gitStatus.branch}\n`;
    report += `- 종료 브랜치: ${session.gitStatusEnd.branch}\n`;
    if (session.gitStatusEnd.modifiedFiles.length > 0) {
      report += `- 변경된 파일:\n`;
      session.gitStatusEnd.modifiedFiles.forEach(file => {
        report += `  - ${file}\n`;
      });
    }
  }
  
  fs.writeFileSync(reportPath, report);
}

// 메인 실행
const command = process.argv[2];
const args = process.argv.slice(3).join(' ');

switch (command) {
  case 'start':
    startSession(args);
    break;
    
  case 'task':
    updateSession('task', args);
    break;
    
  case 'note':
    updateSession('note', args);
    break;
    
  case 'file':
    updateSession('file', args);
    break;
    
  case 'complete':
    updateSession('complete', args);
    break;
    
  case 'save':
  case 'end':
    saveSession();
    break;
    
  case 'restore':
  case 'load':
    restoreSession(args);
    break;
    
  case 'list':
    ensureSessionDir();
    const sessions = fs.readdirSync(SESSION_DIR)
      .filter(f => f.startsWith('session-') && f.endsWith('.json'))
      .sort()
      .reverse();
      
    if (sessions.length === 0) {
      console.log(chalk.yellow('📭 저장된 세션이 없습니다.'));
    } else {
      console.log(chalk.blue('📚 저장된 세션 목록:'));
      sessions.forEach(file => {
        const session = JSON.parse(fs.readFileSync(path.join(SESSION_DIR, file), 'utf8'));
        console.log(chalk.gray(`- ${session.id}: ${session.description} (${new Date(session.startTime).toLocaleDateString()})`));
      });
    }
    break;
    
  default:
    console.log(chalk.yellow('🤖 AI 작업 세션 관리자\n'));
    console.log('사용법:');
    console.log('  npm run ai:session:start [설명]  - 새 세션 시작');
    console.log('  npm run ai:session:task [작업]   - 작업 추가');
    console.log('  npm run ai:session:note [메모]   - 노트 추가');
    console.log('  npm run ai:session:complete [번호] - 작업 완료');
    console.log('  npm run ai:session:save         - 세션 저장 및 종료');
    console.log('  npm run ai:session:restore [ID] - 세션 복원');
    console.log('  npm run ai:session:list        - 저장된 세션 목록');
}
