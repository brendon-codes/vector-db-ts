import type { Request, Response } from 'express';
import { createIndex, deleteIndex, getIndex } from '#services/index-service.js';
import type { CreateIndexRequest } from '#types/api-types.js';
import { isValidDimension, isValidIndexName } from '#utils/validation.js';

export const createIndexHandler = async (req: Request, res: Response) => {
  const body = req.body as CreateIndexRequest;

  if (!body.name || !isValidIndexName(body.name)) {
    res.status(400).json({ error: 'Invalid index name' });
    return;
  }

  if (!body.dimension || !isValidDimension(body.dimension)) {
    res.status(400).json({ error: 'Invalid dimension' });
    return;
  }

  if (!body.metric || !['cosine', 'euclidean', 'dotproduct'].includes(body.metric)) {
    res.status(400).json({ error: 'Invalid metric' });
    return;
  }

  if (!body.spec?.serverless?.cloud || !body.spec?.serverless?.region) {
    res.status(400).json({ error: 'Invalid spec' });
    return;
  }

  const dataDir = (req as Request & { dataDir: string }).dataDir;
  const result = await createIndex(dataDir, body);

  if (!result.success) {
    res.status(409).json({ error: result.error });
    return;
  }

  res.status(201).json(result.index);
};

export const getIndexHandler = async (req: Request, res: Response) => {
  const { name } = req.params;

  if (!name || typeof name !== 'string' || !isValidIndexName(name)) {
    res.status(400).json({ error: 'Invalid index name' });
    return;
  }

  const dataDir = (req as Request & { dataDir: string }).dataDir;
  const index = await getIndex(dataDir, name);

  if (!index) {
    res.status(404).json({ error: 'Index not found' });
    return;
  }

  res.status(200).json(index);
};

export const deleteIndexHandler = async (req: Request, res: Response) => {
  const { name } = req.params;

  if (!name || typeof name !== 'string' || !isValidIndexName(name)) {
    res.status(400).json({ error: 'Invalid index name' });
    return;
  }

  const dataDir = (req as Request & { dataDir: string }).dataDir;
  const result = await deleteIndex(dataDir, name);

  if (!result.success) {
    res.status(404).json({ error: result.error });
    return;
  }

  res.status(200).json({ message: 'Index deleted successfully' });
};
