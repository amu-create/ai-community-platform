// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  pagination?: PaginationInfo;
  requestId?: string;
}

// API 에러 타입
export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
  details?: any;
}

// 페이지네이션 정보
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

// API 요청 옵션
export interface ApiRequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

// API 클라이언트 클래스
export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;
  
  constructor(baseUrl: string = '', defaultHeaders: HeadersInit = {}) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = defaultHeaders;
  }
  
  private async request<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const {
      timeout = 30000,
      retries = 0,
      retryDelay = 1000,
      headers = {},
      ...fetchOptions
    } = options;
    
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          ...this.defaultHeaders,
          ...headers,
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json() as ApiResponse<T>;
      
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'API request failed');
      }
      
      return data.data as T;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      // 재시도 로직
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return this.request(endpoint, { ...options, retries: retries - 1 });
      }
      
      throw error;
    }
  }
  
  async get<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }
  
  async post<T>(
    endpoint: string,
    body?: any,
    options?: ApiRequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
  
  async put<T>(
    endpoint: string,
    body?: any,
    options?: ApiRequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }
  
  async patch<T>(
    endpoint: string,
    body?: any,
    options?: ApiRequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }
  
  async delete<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// 기본 API 클라이언트 인스턴스
export const apiClient = new ApiClient('/api');

// 특정 서비스용 클라이언트
export const resourcesApi = new ApiClient('/api/resources');
export const postsApi = new ApiClient('/api/posts');
export const usersApi = new ApiClient('/api/users');
export const authApi = new ApiClient('/api/auth');
