import { describe, it, expect } from '@jest/globals';
import { 
  formatDate, 
  formatRelativeTime, 
  truncateText,
  slugify,
  isValidUrl,
  isValidEmail,
  generateUsername
} from '@/lib/utils';

describe('Utils', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2025-08-03T12:00:00Z');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/2025/);
    });

    it('should handle string dates', () => {
      const formatted = formatDate('2025-08-03T12:00:00Z');
      expect(formatted).toMatch(/2025/);
    });

    it('should handle invalid dates', () => {
      const formatted = formatDate('invalid-date');
      expect(formatted).toBe('Invalid Date');
    });
  });

  describe('formatRelativeTime', () => {
    it('should format relative time correctly', () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const formatted = formatRelativeTime(yesterday);
      expect(formatted).toMatch(/1일 전|yesterday/);
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const longText = 'This is a very long text that needs to be truncated';
      const truncated = truncateText(longText, 20);
      expect(truncated).toBe('This is a very long...');
      expect(truncated.length).toBeLessThanOrEqual(23); // 20 + '...'
    });

    it('should not truncate short text', () => {
      const shortText = 'Short text';
      const truncated = truncateText(shortText, 20);
      expect(truncated).toBe(shortText);
    });

    it('should handle empty text', () => {
      expect(truncateText('', 20)).toBe('');
      expect(truncateText(null as any, 20)).toBe('');
      expect(truncateText(undefined as any, 20)).toBe('');
    });
  });

  describe('slugify', () => {
    it('should create slug from text', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('AI & Machine Learning')).toBe('ai-machine-learning');
      expect(slugify('Next.js 14 Tutorial')).toBe('nextjs-14-tutorial');
    });

    it('should handle Korean text', () => {
      expect(slugify('안녕하세요 세계')).toBe('안녕하세요-세계');
    });

    it('should handle special characters', () => {
      expect(slugify('Hello@World#2024!')).toBe('helloworld2024');
    });
  });

  describe('isValidUrl', () => {
    it('should validate URLs correctly', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('ftp://files.example.com')).toBe(true);
      expect(isValidUrl('https://sub.example.com/path?query=value')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('javascript:alert("XSS")')).toBe(false);
      expect(isValidUrl('//example.com')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('should validate emails correctly', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('user.name@example.com')).toBe(true);
      expect(isValidEmail('user+tag@example.co.kr')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user@@example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('generateUsername', () => {
    it('should generate username from email', () => {
      expect(generateUsername('user@example.com')).toBe('user');
      expect(generateUsername('john.doe@example.com')).toBe('john.doe');
    });

    it('should handle special cases', () => {
      expect(generateUsername('user+tag@example.com')).toBe('user');
      expect(generateUsername('123@example.com')).toMatch(/user\d+/);
    });

    it('should generate random username for invalid input', () => {
      const username = generateUsername('');
      expect(username).toMatch(/user\d+/);
    });
  });
});
