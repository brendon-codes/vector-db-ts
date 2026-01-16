import type { Request, Response } from 'express';
import { readIndexConfig } from '#services/storage-service.js';
import { queryVectors, upsertVectors } from '#services/vector-service.js';
import type { QueryRequest, UpsertRequest } from '#types/api-types.js';
import { areAllVectorsValid, isValidIndexName, isValidTopK } from '#utils/validation.js';

export const upsertVectorsHandler = async (req: Request, res: Response) => {
  const { name } = req.params;
  const body = req.body as UpsertRequest;

  if (!name || typeof name !== 'string' || !isValidIndexName(name)) {
    res.status(400).json({ error: 'Invalid index name' });
    return;
  }

  if (!body.vectors || !Array.isArray(body.vectors) || body.vectors.length === 0) {
    res.status(400).json({ error: 'Vectors array is required and must not be empty' });
    return;
  }

  const dataDir = (req as Request & { dataDir: string }).dataDir;
  const config = await readIndexConfig(dataDir, name);

  if (!config) {
    res.status(404).json({ error: 'Index not found' });
    return;
  }

  if (!areAllVectorsValid(body.vectors, config.dimension)) {
    res.status(400).json({ error: `All vectors must have dimension ${config.dimension}` });
    return;
  }

  const result = await upsertVectors(dataDir, name, body.vectors);

  if (!result.success) {
    res.status(500).json({ error: result.error });
    return;
  }

  res.status(200).json({ upsertedCount: result.upsertedCount });
};

export const queryVectorsHandler = async (req: Request, res: Response) => {
  const { name } = req.params;
  const body = req.body as QueryRequest;

  if (!name || typeof name !== 'string' || !isValidIndexName(name)) {
    res.status(400).json({ error: 'Invalid index name' });
    return;
  }

  if (!body.vector || !Array.isArray(body.vector)) {
    res.status(400).json({ error: 'Query vector is required' });
    return;
  }

  if (!body.topK || !isValidTopK(body.topK)) {
    res.status(400).json({ error: 'Invalid topK value' });
    return;
  }

  const dataDir = (req as Request & { dataDir: string }).dataDir;
  const config = await readIndexConfig(dataDir, name);

  if (!config) {
    res.status(404).json({ error: 'Index not found' });
    return;
  }

  if (body.vector.length !== config.dimension) {
    res.status(400).json({ error: `Query vector must have dimension ${config.dimension}` });
    return;
  }

  const result = await queryVectors(dataDir, name, body, config.metric);

  res.status(200).json(result);
};
