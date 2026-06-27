import { getScoreColor, getTierColor } from './colors';

describe('colors.js', () => {
  describe('getScoreColor', () => {
    it('returns green for score >= 90', () => {
      expect(getScoreColor(90)).toBe('text-green-400');
      expect(getScoreColor(95)).toBe('text-green-400');
      expect(getScoreColor(100)).toBe('text-green-400');
    });

    it('returns blue for score >= 75 and < 90', () => {
      expect(getScoreColor(75)).toBe('text-blue-400');
      expect(getScoreColor(80)).toBe('text-blue-400');
      expect(getScoreColor(89)).toBe('text-blue-400');
    });

    it('returns yellow for score >= 60 and < 75', () => {
      expect(getScoreColor(60)).toBe('text-yellow-400');
      expect(getScoreColor(65)).toBe('text-yellow-400');
      expect(getScoreColor(74)).toBe('text-yellow-400');
    });

    it('returns red for score < 60', () => {
      expect(getScoreColor(59)).toBe('text-red-400');
      expect(getScoreColor(50)).toBe('text-red-400');
      expect(getScoreColor(0)).toBe('text-red-400');
      expect(getScoreColor(-10)).toBe('text-red-400');
    });

    it('returns gray for non-number inputs (NaN/undefined/null)', () => {
      expect(getScoreColor(undefined)).toBe('text-gray-400');
      expect(getScoreColor(null)).toBe('text-gray-400');
      expect(getScoreColor(NaN)).toBe('text-gray-400');
      expect(getScoreColor('foo')).toBe('text-gray-400');
    });
  });

  describe('getTierColor', () => {
    it('returns green for tier A', () => {
      expect(getTierColor('A')).toBe('bg-green-500 text-white');
    });

    it('returns blue for tier B', () => {
      expect(getTierColor('B')).toBe('bg-blue-500 text-white');
    });

    it('returns yellow for tier C', () => {
      expect(getTierColor('C')).toBe('bg-yellow-500 text-white');
    });

    it('returns orange for tier D', () => {
      expect(getTierColor('D')).toBe('bg-orange-500 text-white');
    });

    it('returns red for tier F and unknown values', () => {
      expect(getTierColor('F')).toBe('bg-red-500 text-white');
      expect(getTierColor('X')).toBe('bg-red-500 text-white');
      expect(getTierColor(undefined)).toBe('bg-red-500 text-white');
      expect(getTierColor(null)).toBe('bg-red-500 text-white');
    });
  });
});
