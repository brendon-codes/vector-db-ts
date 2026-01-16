import type { CreateIndexRequest, IndexResponse } from '#types/api-types.js';
import type { IndexListItem } from '#types/storage-types.js';
import {
  deleteIndexFiles,
  readIndexConfig,
  readIndexList,
  writeIndexConfig,
  writeIndexList,
} from './storage-service.js';

export const createIndex = async (dataDir: string, request: CreateIndexRequest) => {
  const indexes = await readIndexList(dataDir);

  const exists = indexes.some((idx) => idx.name === request.name);
  if (exists) {
    return { success: false, error: 'Index already exists' };
  }

  const indexConfig = {
    name: request.name,
    dimension: request.dimension,
    metric: request.metric,
    spec: request.spec,
  } as const;

  const indexListItem = {
    ...indexConfig,
    status: {
      ready: true,
      state: 'Ready',
    },
  } as const;

  await writeIndexConfig(dataDir, request.name, indexConfig);
  await writeIndexList(dataDir, [...indexes, indexListItem]);

  return { success: true, index: indexListItem };
};

export const getIndex = async (dataDir: string, name: string) => {
  const config = await readIndexConfig(dataDir, name);

  if (!config) {
    return null;
  }

  const response = {
    ...config,
    status: {
      ready: true,
      state: 'Ready',
    },
  } as IndexResponse;

  return response;
};

export const deleteIndex = async (dataDir: string, name: string) => {
  const indexes = await readIndexList(dataDir);
  const exists = indexes.some((idx) => idx.name === name);

  if (!exists) {
    return { success: false, error: 'Index not found' };
  }

  const updatedIndexes = indexes.filter((idx) => idx.name !== name);
  await writeIndexList(dataDir, updatedIndexes);
  await deleteIndexFiles(dataDir, name);

  return { success: true };
};

export const listIndexes = async (dataDir: string) => {
  const indexes = await readIndexList(dataDir);
  return indexes;
};
