import { describe, expect, test } from 'bun:test';
import {
  areAllVectorsValid,
  isValidDimension,
  isValidIndexName,
  isValidMetadata,
  isValidTopK,
  isValidVectorLength,
} from '#utils/validation.js';

describe('isValidIndexName', () => {
  test('accepts valid lowercase alphanumeric with hyphens', () => {
    expect(isValidIndexName('test-index-123')).toBe(true);
  });

  test('rejects empty string', () => {
    expect(isValidIndexName('')).toBe(false);
  });

  test('rejects name longer than 45 characters', () => {
    expect(isValidIndexName('a'.repeat(46))).toBe(false);
  });

  test('accepts name with exactly 45 characters', () => {
    expect(isValidIndexName('a'.repeat(45))).toBe(true);
  });

  test('rejects uppercase letters', () => {
    expect(isValidIndexName('TestIndex')).toBe(false);
  });

  test('rejects special characters', () => {
    expect(isValidIndexName('test_index')).toBe(false);
    expect(isValidIndexName('test.index')).toBe(false);
    expect(isValidIndexName('test@index')).toBe(false);
  });

  test('accepts hyphens', () => {
    expect(isValidIndexName('test-index')).toBe(true);
  });
});

describe('isValidDimension', () => {
  test('accepts positive integers', () => {
    expect(isValidDimension(1)).toBe(true);
    expect(isValidDimension(1536)).toBe(true);
  });

  test('rejects zero', () => {
    expect(isValidDimension(0)).toBe(false);
  });

  test('rejects negative numbers', () => {
    expect(isValidDimension(-1)).toBe(false);
  });

  test('rejects floats', () => {
    expect(isValidDimension(1.5)).toBe(false);
  });
});

describe('isValidTopK', () => {
  test('accepts positive integers', () => {
    expect(isValidTopK(1)).toBe(true);
    expect(isValidTopK(5)).toBe(true);
  });

  test('rejects zero', () => {
    expect(isValidTopK(0)).toBe(false);
  });

  test('rejects negative numbers', () => {
    expect(isValidTopK(-1)).toBe(false);
  });

  test('rejects floats', () => {
    expect(isValidTopK(1.5)).toBe(false);
  });
});

describe('isValidVectorLength', () => {
  test('returns true when lengths match', () => {
    expect(isValidVectorLength([1, 2, 3], 3)).toBe(true);
  });

  test('returns false when lengths do not match', () => {
    expect(isValidVectorLength([1, 2, 3], 4)).toBe(false);
    expect(isValidVectorLength([1, 2, 3], 2)).toBe(false);
  });
});

describe('isValidMetadata', () => {
  test('accepts plain objects', () => {
    expect(isValidMetadata({ text: 'hello' })).toBe(true);
    expect(isValidMetadata({})).toBe(true);
  });

  test('rejects null', () => {
    expect(isValidMetadata(null)).toBe(false);
  });

  test('rejects arrays', () => {
    expect(isValidMetadata([])).toBe(false);
    expect(isValidMetadata([1, 2, 3])).toBe(false);
  });

  test('rejects primitives', () => {
    expect(isValidMetadata('string')).toBe(false);
    expect(isValidMetadata(123)).toBe(false);
    expect(isValidMetadata(true)).toBe(false);
  });
});

describe('areAllVectorsValid', () => {
  test('returns true when all vectors have correct dimension', () => {
    const vectors = [{ values: [1, 2, 3] }, { values: [4, 5, 6] }];
    expect(areAllVectorsValid(vectors, 3)).toBe(true);
  });

  test('returns false when any vector has incorrect dimension', () => {
    const vectors = [{ values: [1, 2, 3] }, { values: [4, 5] }];
    expect(areAllVectorsValid(vectors, 3)).toBe(false);
  });

  test('returns true for empty array', () => {
    expect(areAllVectorsValid([], 3)).toBe(true);
  });
});
