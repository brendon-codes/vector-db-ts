import type { PineconeVector, QueryRequest, ScoredVector } from '#types/api-types.js';
import type { MetricType } from '#types/config-types.js';
import type { StoredVector } from '#types/storage-types.js';
import { getSimilarityFunction } from '#utils/vector-math.js';
import { readIndexConfig, readVectors, writeVectors } from './storage-service.js';

export const upsertVectors = async (
  dataDir: string,
  indexName: string,
  vectors: ReadonlyArray<PineconeVector>
) => {
  const config = await readIndexConfig(dataDir, indexName);
  if (!config) {
    return { success: false, error: 'Index not found' };
  }

  const storage = await readVectors(dataDir, indexName);
  const existingVectors = storage.vectors;

  const vectorMap = new Map<string, StoredVector>();
  for (const vector of existingVectors) {
    vectorMap.set(vector.id, vector);
  }

  for (const vector of vectors) {
    vectorMap.set(vector.id, {
      id: vector.id,
      values: vector.values,
      metadata: vector.metadata,
    });
  }

  const updatedVectors = Array.from(vectorMap.values());
  await writeVectors(dataDir, indexName, { vectors: updatedVectors });

  return { success: true, upsertedCount: vectors.length };
};

export const queryVectors = async (
  dataDir: string,
  indexName: string,
  request: QueryRequest,
  metric: MetricType
) => {
  const storage = await readVectors(dataDir, indexName);
  const allVectors = storage.vectors;

  if (allVectors.length === 0) {
    return {
      matches: [] as ReadonlyArray<ScoredVector>,
      namespace: request.namespace ?? '',
    };
  }

  const similarityFn = getSimilarityFunction(metric);

  const scored = allVectors.map((v) => {
    const score = similarityFn(request.vector, v.values);
    return {
      id: v.id,
      score,
      values: request.includeValues ? v.values : undefined,
      metadata: request.includeMetadata ? v.metadata : undefined,
    } as ScoredVector;
  });

  const sorted = scored.sort((a, b) => b.score - a.score);
  const topK = sorted.slice(0, request.topK);

  return {
    matches: topK,
    namespace: request.namespace ?? '',
  };
};
