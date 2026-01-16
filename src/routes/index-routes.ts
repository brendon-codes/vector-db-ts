import { Router } from 'express';
import {
  createIndexHandler,
  deleteIndexHandler,
  getIndexHandler,
} from '#controllers/index-controller.js';

export const createIndexRoutes = () => {
  const router = Router();

  router.post('/', createIndexHandler);
  router.get('/:name', getIndexHandler);
  router.delete('/:name', deleteIndexHandler);

  return router;
};
