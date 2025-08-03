#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// 필수 환경 변수 정의
const requiredEnvVars = {
  // Public (클라이언트에서 사용)
  public: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ],
  // Private (서버에서만 사용)
  private: [
    'SUPABASE_JWT_SECRET',
    'OPENAI_API_KEY',
  ],
  // Optional but recommended
  optional: [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'GITHUB_ID',
    'GITHUB_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
  ]
};

// .env.local 파일 읽기
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error(chalk.red('❌ .env.local 파일을 찾을 수 없습니다!'));
    console.log(chalk.yellow('📝 .env.local.example을 복사하여 .env.local을 생성하세요.'));
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return env;
}

// 환경 변수 검증
function validateEnv() {
  console.log(chalk.blue('🔍 환경 변수 검증 시작...\n'));
  
  const env = loadEnvFile();
  let hasErrors = false;
  let hasWarnings = false;

  // 필수 Public 변수 체크
  console.log(chalk.cyan('📢 Public 환경 변수 (클라이언트):'));
  requiredEnvVars.public.forEach(varName => {
    if (env[varName]) {
      console.log(chalk.green(`  ✅ ${varName}`));
    } else {
      console.log(chalk.red(`  ❌ ${varName} - 누락됨!`));
      hasErrors = true;
    }
  });

  console.log('');

  // 필수 Private 변수 체크
  console.log(chalk.cyan('🔒 Private 환경 변수 (서버):'));
  requiredEnvVars.private.forEach(varName => {
    if (env[varName]) {
      console.log(chalk.green(`  ✅ ${varName}`));
    } else {
      console.log(chalk.red(`  ❌ ${varName} - 누락됨!`));
      hasErrors = true;
    }
  });

  console.log('');

  // 선택적 변수 체크
  console.log(chalk.cyan('📌 선택적 환경 변수:'));
  requiredEnvVars.optional.forEach(varName => {
    if (env[varName]) {
      console.log(chalk.green(`  ✅ ${varName}`));
    } else {
      console.log(chalk.yellow(`  ⚠️  ${varName} - 설정되지 않음`));
      hasWarnings = true;
    }
  });

  console.log('');

  // 추가 검증
  console.log(chalk.cyan('🔍 추가 검증:'));
  
  // Supabase URL 형식 확인
  if (env.NEXT_PUBLIC_SUPABASE_URL && !env.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://')) {
    console.log(chalk.yellow('  ⚠️  NEXT_PUBLIC_SUPABASE_URL은 https://로 시작해야 합니다'));
    hasWarnings = true;
  } else {
    console.log(chalk.green('  ✅ Supabase URL 형식 정상'));
  }

  // JWT Secret 길이 확인
  if (env.SUPABASE_JWT_SECRET && env.SUPABASE_JWT_SECRET.length < 32) {
    console.log(chalk.yellow('  ⚠️  SUPABASE_JWT_SECRET이 너무 짧습니다 (32자 이상 권장)'));
    hasWarnings = true;
  } else {
    console.log(chalk.green('  ✅ JWT Secret 길이 정상'));
  }

  console.log('\n' + chalk.blue('━'.repeat(50)) + '\n');

  // 결과 출력
  if (hasErrors) {
    console.log(chalk.red('❌ 환경 변수 검증 실패!'));
    console.log(chalk.red('   필수 환경 변수가 누락되었습니다.\n'));
    process.exit(1);
  } else if (hasWarnings) {
    console.log(chalk.yellow('⚠️  환경 변수 검증 완료 (경고 있음)'));
    console.log(chalk.yellow('   선택적 환경 변수가 설정되지 않았습니다.\n'));
  } else {
    console.log(chalk.green('✅ 환경 변수 검증 성공!'));
    console.log(chalk.green('   모든 환경 변수가 올바르게 설정되었습니다.\n'));
  }

  // Vercel 배포 체크리스트
  console.log(chalk.magenta('📋 Vercel 배포 체크리스트:'));
  console.log(chalk.gray('   다음 환경 변수들을 Vercel 대시보드에 설정하세요:'));
  [...requiredEnvVars.public, ...requiredEnvVars.private].forEach(varName => {
    console.log(chalk.gray(`   - ${varName}`));
  });
}

// 환경 변수 동기화 (예제 파일 업데이트)
function syncEnvExample() {
  const env = loadEnvFile();
  const examplePath = path.join(__dirname, '..', '.env.local.example');
  
  let exampleContent = '# AI Community Platform Environment Variables\n\n';
  
  // Public 변수
  exampleContent += '# Supabase Configuration (Public)\n';
  requiredEnvVars.public.forEach(varName => {
    if (varName.includes('SUPABASE')) {
      exampleContent += `${varName}=${env[varName] || 'your_' + varName.toLowerCase()}\n`;
    } else {
      exampleContent += `${varName}=your_${varName.toLowerCase()}\n`;
    }
  });
  
  exampleContent += '\n# Supabase Configuration (Private)\n';
  requiredEnvVars.private.filter(v => v.includes('SUPABASE')).forEach(varName => {
    exampleContent += `${varName}=your_${varName.toLowerCase()}\n`;
  });
  
  exampleContent += '\n# AI Configuration\n';
  requiredEnvVars.private.filter(v => v.includes('OPENAI')).forEach(varName => {
    exampleContent += `${varName}=your_${varName.toLowerCase()}\n`;
  });
  
  exampleContent += '\n# Authentication (Optional)\n';
  requiredEnvVars.optional.forEach(varName => {
    exampleContent += `${varName}=your_${varName.toLowerCase()}\n`;
  });
  
  exampleContent += '\n# Feature Flags\n';
  exampleContent += 'FEATURE_AI_RECOMMENDATIONS=true\n';
  exampleContent += 'FEATURE_CONTENT_ANALYSIS=true\n';
  exampleContent += 'FEATURE_USER_ACTIVITY_TRACKING=true\n';
  
  fs.writeFileSync(examplePath, exampleContent);
  console.log(chalk.green('\n✅ .env.local.example 파일이 업데이트되었습니다.'));
}

// 메인 실행
const command = process.argv[2];

if (command === 'sync') {
  syncEnvExample();
} else {
  validateEnv();
}
