import { describe, expect, test } from 'bun:test';
import {
  cosineSimilarity,
  dotProductSimilarity,
  euclideanSimilarity,
  getSimilarityFunction,
} from '#utils/vector-math.js';

describe('cosineSimilarity', () => {
  test('identical vectors return 1.0', () => {
    const result = cosineSimilarity([1, 0, 0], [1, 0, 0]);
    expect(result).toBe(1.0);
  });

  test('orthogonal vectors return 0.0', () => {
    const result = cosineSimilarity([1, 0, 0], [0, 1, 0]);
    expect(result).toBe(0.0);
  });

  test('opposite vectors return -1.0', () => {
    const result = cosineSimilarity([1, 0, 0], [-1, 0, 0]);
    expect(result).toBe(-1.0);
  });

  test('similar vectors return positive value', () => {
    const result = cosineSimilarity([0.7, 0.7, 0], [1, 0, 0]);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(1);
  });

  test('zero vector returns 0', () => {
    const result = cosineSimilarity([0, 0, 0], [1, 0, 0]);
    expect(result).toBe(0);
  });

  test('multi-dimensional vectors', () => {
    const a = [0.1, 0.2, 0.3, 0.4, 0.5];
    const b = [0.1, 0.2, 0.3, 0.4, 0.5];
    const result = cosineSimilarity(a, b);
    expect(result).toBe(1.0);
  });
});

describe('euclideanSimilarity', () => {
  test('identical vectors return 1.0', () => {
    const result = euclideanSimilarity([1, 0, 0], [1, 0, 0]);
    expect(result).toBe(1.0);
  });

  test('distant vectors return value less than 1.0', () => {
    const result = euclideanSimilarity([1, 0, 0], [0, 1, 0]);
    expect(result).toBeLessThan(1.0);
    expect(result).toBeGreaterThan(0);
  });

  test('multi-dimensional vectors', () => {
    const a = [1, 2, 3];
    const b = [1, 2, 3];
    const result = euclideanSimilarity(a, b);
    expect(result).toBe(1.0);
  });

  test('calculates correct similarity for known distance', () => {
    const result = euclideanSimilarity([0, 0], [3, 4]);
    const expectedDistance = 5;
    const expectedSimilarity = 1 / (1 + expectedDistance);
    expect(result).toBeCloseTo(expectedSimilarity, 5);
  });
});

describe('dotProductSimilarity', () => {
  test('identical unit vectors return 1.0', () => {
    const result = dotProductSimilarity([1, 0, 0], [1, 0, 0]);
    expect(result).toBe(1.0);
  });

  test('orthogonal vectors return 0.0', () => {
    const result = dotProductSimilarity([1, 0, 0], [0, 1, 0]);
    expect(result).toBe(0.0);
  });

  test('scaled vectors return scaled dot product', () => {
    const result = dotProductSimilarity([2, 0, 0], [3, 0, 0]);
    expect(result).toBe(6.0);
  });

  test('multi-dimensional vectors', () => {
    const result = dotProductSimilarity([1, 2, 3], [4, 5, 6]);
    expect(result).toBe(32);
  });
});

describe('getSimilarityFunction', () => {
  test('returns cosine function for cosine metric', () => {
    const fn = getSimilarityFunction('cosine');
    const result = fn([1, 0, 0], [1, 0, 0]);
    expect(result).toBe(1.0);
  });

  test('returns euclidean function for euclidean metric', () => {
    const fn = getSimilarityFunction('euclidean');
    const result = fn([1, 0, 0], [1, 0, 0]);
    expect(result).toBe(1.0);
  });

  test('returns dot product function for dotproduct metric', () => {
    const fn = getSimilarityFunction('dotproduct');
    const result = fn([1, 0, 0], [1, 0, 0]);
    expect(result).toBe(1.0);
  });
});
