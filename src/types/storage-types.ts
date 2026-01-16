import type { MetricType } from '#types/config-types.js';

export type ServerlessSpec = {
  readonly serverless: {
    readonly cloud: string;
    readonly region: string;
  };
};

export type IndexConfig = {
  readonly name: string;
  readonly dimension: number;
  readonly metric: MetricType;
  readonly spec: ServerlessSpec;
};

export type StoredVector = {
  readonly id: string;
  readonly values: ReadonlyArray<number>;
  readonly metadata?: Record<string, unknown>;
};

export type VectorStorage = {
  readonly vectors: ReadonlyArray<StoredVector>;
};

export type IndexListItem = IndexConfig & {
  readonly status: {
    readonly ready: boolean;
    readonly state: string;
  };
};
