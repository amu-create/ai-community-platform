const fs = require('fs');
const path = require('path');
const glob = require('glob');

// ValidationError 클래스 추가
const errorClasses = `
export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, 500, 'DATABASE_ERROR');
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string) {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class DuplicateError extends AppError {
  constructor(message: string) {
    super(message, 409, 'DUPLICATE_ERROR');
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400, 'BAD_REQUEST');
  }
}
`;

// errors.ts 파일에 추가
const errorsPath = path.join(process.cwd(), 'src/lib/errors.ts');
let errorsContent = fs.readFileSync(errorsPath, 'utf8');

if (!errorsContent.includes('DatabaseError')) {
  errorsContent += '\n' + errorClasses;
  fs.writeFileSync(errorsPath, errorsContent, 'utf8');
  console.log('✅ Added error classes to errors.ts');
}

// 모든 파일에서 AppError 사용을 적절한 Error 클래스로 변경
const files = glob.sync('src/**/*.ts', { cwd: process.cwd() });

files.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    
    // BAD_REQUEST -> BadRequestError
    content = content.replace(
      /new AppError\((.*?),\s*'BAD_REQUEST'\)/g,
      'new BadRequestError($1)'
    );
    
    // NOT_FOUND -> NotFoundError
    content = content.replace(
      /new AppError\((.*?),\s*'NOT_FOUND'\)/g,
      'new NotFoundError($1)'
    );
    
    // Import 문 업데이트
    if (content.includes('BadRequestError') && !content.includes('import.*BadRequestError')) {
      content = content.replace(
        /import \{ (.*?) \} from '@\/lib\/errors';/,
        (match, imports) => {
          const importList = imports.split(',').map(i => i.trim());
          if (!importList.includes('BadRequestError')) {
            importList.push('BadRequestError');
          }
          return `import { ${importList.join(', ')} } from '@/lib/errors';`;
        }
      );
    }
    
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
    }
  } catch (error) {
    // Skip if error
  }
});

// error-handler.ts에 asyncHandler 추가
const handlerPath = path.join(process.cwd(), 'src/lib/error-handler.ts');
let handlerContent = fs.readFileSync(handlerPath, 'utf8');

const asyncHandlerCode = `
export function asyncHandler(handler: Function) {
  return async (req: Request, context?: any) => {
    try {
      return await handler(req, context);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
`;

if (!handlerContent.includes('asyncHandler')) {
  handlerContent += '\n' + asyncHandlerCode;
  fs.writeFileSync(handlerPath, handlerContent, 'utf8');
  console.log('✅ Added asyncHandler to error-handler.ts');
}
