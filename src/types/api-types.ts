import type { MetricType } from '#types/config-types.js';
import type { ServerlessSpec } from '#types/storage-types.js';

export type PineconeVector = {
  readonly id: string;
  readonly values: ReadonlyArray<number>;
  readonly metadata?: Record<string, unknown>;
};

export type CreateIndexRequest = {
  readonly name: string;
  readonly dimension: number;
  readonly metric: MetricType;
  readonly spec: ServerlessSpec;
};

export type IndexResponse = {
  readonly name: string;
  readonly dimension: number;
  readonly metric: MetricType;
  readonly spec: ServerlessSpec;
  readonly status: {
    readonly ready: boolean;
    readonly state: string;
  };
};

export type UpsertRequest = {
  readonly vectors: ReadonlyArray<PineconeVector>;
  readonly namespace?: string;
};

export type UpsertResponse = {
  readonly upsertedCount: number;
};

export type QueryRequest = {
  readonly vector: ReadonlyArray<number>;
  readonly topK: number;
  readonly namespace?: string;
  readonly includeMetadata?: boolean;
  readonly includeValues?: boolean;
};

export type ScoredVector = {
  readonly id: string;
  readonly score: number;
  readonly values?: ReadonlyArray<number>;
  readonly metadata?: Record<string, unknown>;
};

export type QueryResponse = {
  readonly matches: ReadonlyArray<ScoredVector>;
  readonly namespace: string;
};
