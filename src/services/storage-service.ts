import { existsSync, mkdirSync } from 'node:fs';
import { rename } from 'node:fs/promises';
import { join } from 'node:path';
import type { IndexConfig, IndexListItem, VectorStorage } from '#types/storage-types.js';

const atomicWrite = async (path: string, content: string) => {
  const tempPath = `${path}.tmp`;
  await Bun.write(tempPath, content);
  await rename(tempPath, path);
};

export const initializeDataDir = (dataDir: string) => {
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  const indexesPath = join(dataDir, 'indexes.json');
  if (!existsSync(indexesPath)) {
    Bun.write(indexesPath, '[]');
  }
};

export const readIndexList = async (dataDir: string) => {
  const indexesPath = join(dataDir, 'indexes.json');

  if (!existsSync(indexesPath)) {
    return [] as ReadonlyArray<IndexListItem>;
  }

  const file = Bun.file(indexesPath);
  const content = await file.text();
  return JSON.parse(content) as ReadonlyArray<IndexListItem>;
};

export const writeIndexList = async (dataDir: string, indexes: ReadonlyArray<IndexListItem>) => {
  const indexesPath = join(dataDir, 'indexes.json');
  const content = JSON.stringify(indexes, null, 2);
  await atomicWrite(indexesPath, content);
};

export const readIndexConfig = async (dataDir: string, indexName: string) => {
  const configPath = join(dataDir, indexName, 'config.json');

  if (!existsSync(configPath)) {
    return null;
  }

  const file = Bun.file(configPath);
  const content = await file.text();
  return JSON.parse(content) as IndexConfig;
};

export const writeIndexConfig = async (dataDir: string, indexName: string, config: IndexConfig) => {
  const indexDir = join(dataDir, indexName);
  if (!existsSync(indexDir)) {
    mkdirSync(indexDir, { recursive: true });
  }

  const configPath = join(indexDir, 'config.json');
  const content = JSON.stringify(config, null, 2);
  await atomicWrite(configPath, content);
};

export const readVectors = async (dataDir: string, indexName: string) => {
  const vectorsPath = join(dataDir, indexName, 'vectors.json');

  if (!existsSync(vectorsPath)) {
    return { vectors: [] } as VectorStorage;
  }

  const file = Bun.file(vectorsPath);
  const content = await file.text();
  return JSON.parse(content) as VectorStorage;
};

export const writeVectors = async (dataDir: string, indexName: string, storage: VectorStorage) => {
  const indexDir = join(dataDir, indexName);
  if (!existsSync(indexDir)) {
    mkdirSync(indexDir, { recursive: true });
  }

  const vectorsPath = join(indexDir, 'vectors.json');
  const content = JSON.stringify(storage, null, 2);
  await atomicWrite(vectorsPath, content);
};

export const deleteIndexFiles = async (dataDir: string, indexName: string) => {
  const indexDir = join(dataDir, indexName);
  if (existsSync(indexDir)) {
    await Bun.$`rm -rf ${indexDir}`;
  }
};
