import { describe, it, expect, beforeEach, afterAll, jest } from '@jest/globals';
import { validateEnv, getEnv, getOptionalEnv, EnvError } from '@/lib/config/env';

// Mock environment variables
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
});

afterAll(() => {
  process.env = originalEnv;
});

describe('Environment Configuration', () => {
  describe('validateEnv', () => {
    it('should pass when all required env vars are set', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
      process.env.SUPABASE_SERVICE_KEY = 'service-key';
      process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

      expect(() => validateEnv()).not.toThrow();
    });

    it('should throw when required env vars are missing', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      
      expect(() => validateEnv()).toThrow(EnvError);
      expect(() => validateEnv()).toThrow(/Missing required environment variables/);
    });

    it('should warn about missing optional env vars in development', () => {
      process.env.NODE_ENV = 'development';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
      process.env.SUPABASE_SERVICE_KEY = 'service-key';
      process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
      delete process.env.OPENAI_API_KEY;

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      validateEnv();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Missing optional environment variables')
      );
      
      consoleSpy.mockRestore();
    });

    it('should throw if service key has public prefix in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
      process.env.SUPABASE_SERVICE_KEY = 'service-key';
      process.env.NEXT_PUBLIC_APP_URL = 'https://app.example.com';
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY = 'exposed-key';

      expect(() => validateEnv()).toThrow(EnvError);
      expect(() => validateEnv()).toThrow(/should not have NEXT_PUBLIC_ prefix/);
    });

    it('should warn about HTTP in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
      process.env.SUPABASE_SERVICE_KEY = 'service-key';
      process.env.NEXT_PUBLIC_APP_URL = 'http://app.example.com';

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      validateEnv();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('should use HTTPS in production')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('getEnv', () => {
    it('should return env value when set', () => {
      process.env.TEST_VAR = 'test-value';
      expect(getEnv('TEST_VAR')).toBe('test-value');
    });

    it('should throw when env var is not set', () => {
      delete process.env.TEST_VAR;
      expect(() => getEnv('TEST_VAR')).toThrow(EnvError);
      expect(() => getEnv('TEST_VAR')).toThrow(/Environment variable TEST_VAR is not set/);
    });
  });

  describe('getOptionalEnv', () => {
    it('should return env value when set', () => {
      process.env.OPTIONAL_VAR = 'optional-value';
      expect(getOptionalEnv('OPTIONAL_VAR')).toBe('optional-value');
    });

    it('should return undefined when not set', () => {
      delete process.env.OPTIONAL_VAR;
      expect(getOptionalEnv('OPTIONAL_VAR')).toBeUndefined();
    });

    it('should return default value when not set', () => {
      delete process.env.OPTIONAL_VAR;
      expect(getOptionalEnv('OPTIONAL_VAR', 'default')).toBe('default');
    });
  });
});
