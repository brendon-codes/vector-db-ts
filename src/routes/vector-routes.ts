import { Router } from 'express';
import { queryVectorsHandler, upsertVectorsHandler } from '#controllers/vector-controller.js';

export const createVectorRoutes = () => {
  const router = Router();

  router.post('/:name/vectors/upsert', upsertVectorsHandler);
  router.post('/:name/query', queryVectorsHandler);

  return router;
};
