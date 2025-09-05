import { describe, it, expect } from 'vitest';
import { formatInches, parseInches } from '@/utils/format-inches';

describe('formatInches', () => {
  describe('Basic Formatting', () => {
    it('should format whole inches', () => {
      expect(formatInches(12)).toBe('12');
      expect(formatInches(24)).toBe('24');
      expect(formatInches(100)).toBe('100');
    });

    it('should format common fractions', () => {
      expect(formatInches(12.5)).toBe('12 1/2');
      expect(formatInches(24.25)).toBe('24 1/4');
      expect(formatInches(36.75)).toBe('36 3/4');
    });

    it('should format zero', () => {
      expect(formatInches(0)).toBe('0');
    });

    it('should format fractional inches without whole number', () => {
      expect(formatInches(0.5)).toBe('1/2');
      expect(formatInches(0.25)).toBe('1/4');
      expect(formatInches(0.75)).toBe('3/4');
    });
  });

  describe('Precision Handling', () => {
    it('should round to nearest common fraction', () => {
      expect(formatInches(12.12)).toBe('12 1/8'); // 0.125 is closest
      expect(formatInches(24.24)).toBe('24 1/4'); // 0.25 is closest
      expect(formatInches(36.76)).toBe('36 3/4'); // 0.75 is closest
    });

    it('should handle sixteenths', () => {
      expect(formatInches(1.0625)).toBe('1 1/16');
      expect(formatInches(2.1875)).toBe('2 3/16');
      expect(formatInches(3.3125)).toBe('3 5/16');
    });

    it('should handle very small fractions', () => {
      expect(formatInches(0.0625)).toBe('1/16');
      expect(formatInches(0.125)).toBe('1/8');
      expect(formatInches(0.1875)).toBe('3/16');
    });
  });

  describe('Show Whole Number Option', () => {
    it('should show whole number when true', () => {
      expect(formatInches(12.5, true)).toBe('12 1/2');
      expect(formatInches(24.25, true)).toBe('24 1/4');
    });

    it('should convert to improper fraction when false', () => {
      expect(formatInches(12.5, false)).toBe('200/16'); // 12.5 * 16 = 200
      expect(formatInches(1.25, false)).toBe('20/16'); // 1.25 * 16 = 20
    });
  });

  describe('Edge Cases', () => {
    it('should handle values very close to whole numbers', () => {
      expect(formatInches(11.99)).toBe('11 15/16'); // Closest fraction
      expect(formatInches(12.01)).toBe('12'); // Very close to 12
    });

    it('should handle values very close to common fractions', () => {
      expect(formatInches(0.499)).toBe('1/2');
      expect(formatInches(0.501)).toBe('1/2');
      expect(formatInches(0.749)).toBe('3/4');
      expect(formatInches(0.251)).toBe('1/4');
    });
  });

  describe('Practical Examples', () => {
    it('should format common crate dimensions', () => {
      expect(formatInches(48)).toBe('48');
      expect(formatInches(40)).toBe('40');
      expect(formatInches(36)).toBe('36');
    });

    it('should format panel thicknesses', () => {
      expect(formatInches(0.75)).toBe('3/4');
      expect(formatInches(0.5)).toBe('1/2');
      expect(formatInches(1.25)).toBe('1 1/4');
    });

    it('should format skid dimensions', () => {
      expect(formatInches(5)).toBe('5');
      expect(formatInches(4)).toBe('4');
      expect(formatInches(3.5)).toBe('3 1/2');
    });
  });
});

describe('parseInches', () => {
  describe('Decimal Parsing', () => {
    it('should parse decimal values', () => {
      expect(parseInches('12')).toBe(12);
      expect(parseInches('24.5')).toBe(24.5);
      expect(parseInches('36.75')).toBe(36.75);
    });

    it('should parse zero', () => {
      expect(parseInches('0')).toBe(0);
      expect(parseInches('0.0')).toBe(0);
    });
  });

  describe('Fraction Parsing', () => {
    it('should parse simple fractions', () => {
      expect(parseInches('1/2')).toBe(0.5);
      expect(parseInches('1/4')).toBe(0.25);
      expect(parseInches('3/4')).toBe(0.75);
    });

    it('should parse mixed numbers', () => {
      expect(parseInches('12 1/2')).toBe(12.5);
      expect(parseInches('24 1/4')).toBe(24.25);
      expect(parseInches('36 3/4')).toBe(36.75);
    });

    it('should parse sixteenths', () => {
      expect(parseInches('1/16')).toBe(0.0625);
      expect(parseInches('3/16')).toBe(0.1875);
      expect(parseInches('5/16')).toBe(0.3125);
    });
  });

  describe('Edge Cases', () => {
    it('should handle extra whitespace', () => {
      expect(parseInches('  12  ')).toBe(12);
      expect(parseInches('  12 1/2  ')).toBe(12.5);
      expect(parseInches('  1/2  ')).toBe(0.5);
    });

    it('should handle invalid input', () => {
      expect(parseInches('')).toBe(0);
      expect(parseInches('abc')).toBe(0);
      expect(parseInches('1/')).toBe(1); // Parses the '1' part
      expect(parseInches('/2')).toBe(0);
    });

    it('should handle improper fractions', () => {
      expect(parseInches('5/4')).toBe(1.25);
      expect(parseInches('9/8')).toBe(1.125);
      expect(parseInches('17/16')).toBe(1.0625);
    });
  });

  describe('Round Trip', () => {
    it('should parse and format consistently', () => {
      const values = [12, 12.5, 0.75, 24.25, 36.125];
      values.forEach((value) => {
        const formatted = formatInches(value);
        const parsed = parseInches(formatted);
        expect(parsed).toBeCloseTo(value, 2);
      });
    });
  });
});
