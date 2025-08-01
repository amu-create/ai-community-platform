import { env } from '@/lib/env';

// 로그 레벨
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

// 로그 컨텍스트
interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  url?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  [key: string]: any;
}

// 로그 엔트리
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
}

// 로거 인터페이스
interface ILogger {
  error(message: string, error?: Error, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  debug(message: string, context?: LogContext): void;
}

// 로그 포맷터
class LogFormatter {
  static format(entry: LogEntry): string {
    const { timestamp, level, message, context, error } = entry;
    const levelName = LogLevel[level];
    
    let formatted = `[${timestamp}] ${levelName}: ${message}`;
    
    if (context) {
      formatted += ` | Context: ${JSON.stringify(context)}`;
    }
    
    if (error) {
      formatted += ` | Error: ${JSON.stringify(error)}`;
    }
    
    return formatted;
  }
  
  static json(entry: LogEntry): string {
    return JSON.stringify(entry);
  }
}

// 콘솔 로거
class ConsoleLogger implements ILogger {
  private minLevel: LogLevel;
  
  constructor(minLevel: LogLevel = LogLevel.INFO) {
    this.minLevel = minLevel;
  }
  
  private log(level: LogLevel, message: string, error?: Error, context?: LogContext) {
    if (level > this.minLevel) return;
    
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };
    
    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
      };
    }
    
    const formatted = env.NODE_ENV === 'production'
      ? LogFormatter.json(entry)
      : LogFormatter.format(entry);
    
    switch (level) {
      case LogLevel.ERROR:
        console.error(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
    }
  }
  
  error(message: string, error?: Error, context?: LogContext) {
    this.log(LogLevel.ERROR, message, error, context);
  }
  
  warn(message: string, context?: LogContext) {
    this.log(LogLevel.WARN, message, undefined, context);
  }
  
  info(message: string, context?: LogContext) {
    this.log(LogLevel.INFO, message, undefined, context);
  }
  
  debug(message: string, context?: LogContext) {
    this.log(LogLevel.DEBUG, message, undefined, context);
  }
}

// 파일 로거 (서버 사이드 전용)
class FileLogger implements ILogger {
  private consoleLogger: ConsoleLogger;
  
  constructor() {
    this.consoleLogger = new ConsoleLogger();
  }
  
  private async writeToFile(entry: LogEntry) {
    if (typeof window !== 'undefined') return; // 클라이언트에서는 실행 안 함
    
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const logDir = path.join(process.cwd(), 'logs');
      const logFile = path.join(logDir, `${entry.timestamp.split('T')[0]}.log`);
      
      // 로그 디렉토리 생성
      await fs.mkdir(logDir, { recursive: true });
      
      // 로그 파일에 추가
      await fs.appendFile(logFile, LogFormatter.json(entry) + '\n', 'utf-8');
    } catch (error) {
      console.error('Failed to write log to file:', error);
    }
  }
  
  async error(message: string, error?: Error, context?: LogContext) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      message,
      context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
      } : undefined,
    };
    
    this.consoleLogger.error(message, error, context);
    await this.writeToFile(entry);
  }
  
  async warn(message: string, context?: LogContext) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      message,
      context,
    };
    
    this.consoleLogger.warn(message, context);
    await this.writeToFile(entry);
  }
  
  async info(message: string, context?: LogContext) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      message,
      context,
    };
    
    this.consoleLogger.info(message, context);
    await this.writeToFile(entry);
  }
  
  async debug(message: string, context?: LogContext) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.DEBUG,
      message,
      context,
    };
    
    this.consoleLogger.debug(message, context);
    await this.writeToFile(entry);
  }
}

// 로거 팩토리
class LoggerFactory {
  private static instance: ILogger;
  
  static getLogger(): ILogger {
    if (!this.instance) {
      const logLevel = env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
      
      // 서버 사이드에서는 파일 로거 사용
      if (typeof window === 'undefined' && env.NODE_ENV === 'production') {
        this.instance = new FileLogger();
      } else {
        this.instance = new ConsoleLogger(logLevel);
      }
    }
    
    return this.instance;
  }
}

// 로거 인스턴스
export const logger = LoggerFactory.getLogger();

// 성능 로깅 유틸리티
export class PerformanceLogger {
  private static timers = new Map<string, number>();
  
  static start(label: string) {
    this.timers.set(label, performance.now());
  }
  
  static end(label: string, context?: LogContext) {
    const startTime = this.timers.get(label);
    if (!startTime) {
      logger.warn(`Performance timer '${label}' was not started`);
      return;
    }
    
    const duration = performance.now() - startTime;
    this.timers.delete(label);
    
    logger.info(`Performance: ${label}`, {
      ...context,
      duration: Math.round(duration * 100) / 100, // 소수점 2자리
      unit: 'ms',
    });
    
    return duration;
  }
}

// API 로깅 미들웨어
export function logRequest(
  request: Request,
  response: Response,
  duration: number,
  error?: Error
) {
  const context: LogContext = {
    url: request.url,
    method: request.method,
    statusCode: response.status,
    duration,
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.headers.get('x-forwarded-for') || undefined,
  };
  
  if (error) {
    logger.error(`API Error: ${request.method} ${request.url}`, error, context);
  } else if (response.status >= 400) {
    logger.warn(`API Warning: ${request.method} ${request.url}`, context);
  } else {
    logger.info(`API Request: ${request.method} ${request.url}`, context);
  }
}

// 구조화된 로깅 헬퍼
export const log = {
  // 사용자 활동 로깅
  userAction: (action: string, userId: string, details?: any) => {
    logger.info(`User Action: ${action}`, {
      userId,
      action,
      details,
    });
  },
  
  // 보안 이벤트 로깅
  security: (event: string, context: LogContext) => {
    logger.warn(`Security Event: ${event}`, {
      ...context,
      securityEvent: event,
    });
  },
  
  // 비즈니스 이벤트 로깅
  business: (event: string, context: LogContext) => {
    logger.info(`Business Event: ${event}`, {
      ...context,
      businessEvent: event,
    });
  },
  
  // 데이터베이스 쿼리 로깅
  database: (operation: string, table: string, duration: number, error?: Error) => {
    const context: LogContext = {
      operation,
      table,
      duration,
    };
    
    if (error) {
      logger.error(`Database Error: ${operation} on ${table}`, error, context);
    } else {
      logger.debug(`Database Query: ${operation} on ${table}`, context);
    }
  },
  
  // 외부 API 호출 로깅
  externalApi: (service: string, endpoint: string, duration: number, error?: Error) => {
    const context: LogContext = {
      service,
      endpoint,
      duration,
    };
    
    if (error) {
      logger.error(`External API Error: ${service} - ${endpoint}`, error, context);
    } else {
      logger.info(`External API Call: ${service} - ${endpoint}`, context);
    }
  },
};
