export type MetricType = 'cosine' | 'euclidean' | 'dotproduct';

export type Config = {
  readonly apiKey: string;
  readonly port: number;
  readonly dataDir: string;
};
