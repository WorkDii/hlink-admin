import { describe, it, expect } from 'vitest';
import { accountant, wholeNumber } from './numth';

describe('Number formatting utilities', () => {
  describe('accountant', () => {
    it('should format numbers with comma separators', () => {
      expect(accountant(1234.56)).toBe('1,234.56');
      expect(accountant(1000)).toBe('1,000');
      expect(accountant(123)).toBe('123');
    });

    it('should handle decimal places correctly', () => {
      expect(accountant(1234.5)).toBe('1,234.5');
      expect(accountant(1234.00)).toBe('1,234');
      expect(accountant(1234.123)).toBe('1,234.12');
    });

    it('should handle edge cases', () => {
      expect(accountant(0)).toBe('0');
      expect(accountant(null)).toBe('0');
      expect(accountant(undefined)).toBe('0');
      expect(accountant('')).toBe('0');
      expect(accountant('invalid')).toBe('0');
    });

    it('should handle string numbers', () => {
      expect(accountant('1234.56')).toBe('1,234.56');
      expect(accountant('0')).toBe('0');
    });
  });

  describe('wholeNumber', () => {
    it('should format numbers as whole numbers with comma separators', () => {
      expect(wholeNumber(1234.56)).toBe('1,235');
      expect(wholeNumber(1234.4)).toBe('1,234');
      expect(wholeNumber(1000)).toBe('1,000');
      expect(wholeNumber(123)).toBe('123');
    });

    it('should round correctly', () => {
      expect(wholeNumber(1234.5)).toBe('1,235');
      expect(wholeNumber(1234.4)).toBe('1,234');
      expect(wholeNumber(1234.6)).toBe('1,235');
    });

    it('should handle edge cases', () => {
      expect(wholeNumber(0)).toBe('0');
      expect(wholeNumber(null)).toBe('0');
      expect(wholeNumber(undefined)).toBe('0');
      expect(wholeNumber('')).toBe('0');
      expect(wholeNumber('invalid')).toBe('0');
    });

    it('should handle string numbers', () => {
      expect(wholeNumber('1234.56')).toBe('1,235');
      expect(wholeNumber('0')).toBe('0');
    });
  });
});