import type { MetricType } from '#types/config-types.js';

const dotProduct = (a: ReadonlyArray<number>, b: ReadonlyArray<number>) => {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
};

const magnitude = (vector: ReadonlyArray<number>) => {
  let sumSquares = 0;
  for (const value of vector) {
    sumSquares += value * value;
  }
  return Math.sqrt(sumSquares);
};

export const cosineSimilarity = (a: ReadonlyArray<number>, b: ReadonlyArray<number>) => {
  const dot = dotProduct(a, b);
  const magA = magnitude(a);
  const magB = magnitude(b);

  if (magA === 0 || magB === 0) {
    return 0;
  }

  return dot / (magA * magB);
};

export const euclideanSimilarity = (a: ReadonlyArray<number>, b: ReadonlyArray<number>) => {
  let sumSquaredDiff = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sumSquaredDiff += diff * diff;
  }
  const distance = Math.sqrt(sumSquaredDiff);
  return 1 / (1 + distance);
};

export const dotProductSimilarity = (a: ReadonlyArray<number>, b: ReadonlyArray<number>) => {
  return dotProduct(a, b);
};

export const getSimilarityFunction = (metric: MetricType) => {
  switch (metric) {
    case 'cosine':
      return cosineSimilarity;
    case 'euclidean':
      return euclideanSimilarity;
    case 'dotproduct':
      return dotProductSimilarity;
  }
};
