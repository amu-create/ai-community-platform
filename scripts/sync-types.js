#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const SUPABASE_PROJECT_ID = 'rxwchcvgzhuokpqsjatf';
const TYPES_PATH = path.join(__dirname, '..', 'src', 'types', 'database.types.ts');

// Supabase CLI 설치 확인
function checkSupabaseCLI() {
  try {
    execSync('supabase --version', { stdio: 'ignore' });
    return true;
  } catch {
    console.log(chalk.red('❌ Supabase CLI가 설치되지 않았습니다.'));
    console.log(chalk.yellow('📦 설치 방법: npm install -g supabase'));
    return false;
  }
}

// 타입 생성
function generateTypes() {
  console.log(chalk.blue('🔄 Supabase 타입 생성 중...'));
  
  try {
    // 백업 생성
    if (fs.existsSync(TYPES_PATH)) {
      const backupPath = TYPES_PATH + '.backup';
      fs.copyFileSync(TYPES_PATH, backupPath);
      console.log(chalk.gray('📋 기존 타입 파일 백업 완료'));
    }

    // 타입 생성 명령 실행
    const command = `supabase gen types typescript --project-id ${SUPABASE_PROJECT_ID}`;
    const types = execSync(command, { encoding: 'utf8' });
    
    // 타입 파일 저장
    fs.writeFileSync(TYPES_PATH, types);
    console.log(chalk.green('✅ 타입 파일 생성 완료!'));
    
    // 생성된 타입 검증
    validateTypes();
    
  } catch (error) {
    console.error(chalk.red('❌ 타입 생성 실패:'), error.message);
    
    // 백업 복원
    const backupPath = TYPES_PATH + '.backup';
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, TYPES_PATH);
      console.log(chalk.yellow('♻️  백업 파일로 복원했습니다.'));
    }
    
    process.exit(1);
  }
}

// 타입 검증
function validateTypes() {
  console.log(chalk.blue('\n🔍 타입 파일 검증 중...'));
  
  const content = fs.readFileSync(TYPES_PATH, 'utf8');
  const requiredTables = [
    'profiles',
    'resources',
    'categories',
    'posts',
    'comments',
    'bookmarks',
    'follows',
    'learning_paths',
    'chat_rooms',
    'chat_messages'
  ];
  
  let missingTables = [];
  requiredTables.forEach(table => {
    if (!content.includes(`${table}:`)) {
      missingTables.push(table);
    }
  });
  
  if (missingTables.length > 0) {
    console.log(chalk.yellow('⚠️  다음 테이블이 타입 정의에서 누락되었습니다:'));
    missingTables.forEach(table => {
      console.log(chalk.yellow(`   - ${table}`));
    });
  } else {
    console.log(chalk.green('✅ 모든 필수 테이블이 포함되어 있습니다.'));
  }
  
  // TypeScript 컴파일 체크
  try {
    execSync('npx tsc --noEmit src/types/database.types.ts', { stdio: 'ignore' });
    console.log(chalk.green('✅ TypeScript 컴파일 검증 통과'));
  } catch {
    console.log(chalk.yellow('⚠️  TypeScript 컴파일 경고가 있습니다.'));
  }
}

// Git hook 설정
function setupGitHook() {
  console.log(chalk.blue('\n🔧 Git pre-commit hook 설정 중...'));
  
  const hookPath = path.join(__dirname, '..', '.husky', 'pre-commit');
  const hookContent = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# 기존 lint-staged 실행
npx lint-staged

# Supabase 타입 동기화
echo "🔄 Checking Supabase types..."
node scripts/sync-types.js --check

# 변경사항이 있으면 자동으로 추가
if git diff --quiet src/types/database.types.ts; then
  echo "✅ Supabase types are up to date"
else
  echo "📝 Supabase types updated, adding to commit..."
  git add src/types/database.types.ts
fi
`;

  fs.writeFileSync(hookPath, hookContent);
  
  // 실행 권한 부여 (Windows에서는 무시됨)
  try {
    execSync(`chmod +x ${hookPath}`);
  } catch {
    // Windows에서는 실패하지만 무시
  }
  
  console.log(chalk.green('✅ Git hook 설정 완료!'));
}

// 메인 실행
async function main() {
  const args = process.argv.slice(2);
  const isCheck = args.includes('--check');
  const setupHook = args.includes('--setup-hook');
  
  if (!checkSupabaseCLI()) {
    process.exit(1);
  }
  
  if (setupHook) {
    setupGitHook();
    return;
  }
  
  if (isCheck) {
    // 체크 모드: 변경사항이 있는지만 확인
    console.log(chalk.blue('🔍 타입 변경사항 확인 중...'));
    
    try {
      const currentContent = fs.readFileSync(TYPES_PATH, 'utf8');
      const command = `supabase gen types typescript --project-id ${SUPABASE_PROJECT_ID}`;
      const newTypes = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
      
      if (currentContent !== newTypes) {
        console.log(chalk.yellow('⚠️  Supabase 스키마가 변경되었습니다.'));
        console.log(chalk.yellow('   npm run db:types를 실행하여 타입을 업데이트하세요.'));
        
        // CI 환경에서는 자동 업데이트
        if (process.env.CI) {
          fs.writeFileSync(TYPES_PATH, newTypes);
          console.log(chalk.green('✅ CI 환경: 타입 자동 업데이트 완료'));
        }
      } else {
        console.log(chalk.green('✅ 타입이 최신 상태입니다.'));
      }
    } catch (error) {
      console.error(chalk.red('❌ 타입 체크 실패:'), error.message);
      process.exit(1);
    }
  } else {
    // 일반 모드: 타입 생성
    generateTypes();
  }
}

main().catch(console.error);
