import express from 'express';
import type { Request } from 'express';
import { loadConfig } from '#config/env.js';
import { createAuthMiddleware } from '#middleware/auth.js';
import { errorHandler } from '#middleware/error-handler.js';
import { createIndexRoutes } from '#routes/index-routes.js';
import { createVectorRoutes } from '#routes/vector-routes.js';
import { initializeDataDir } from '#services/storage-service.js';

const config = loadConfig();
initializeDataDir(config.dataDir);

const app = express();

app.use(express.json());

app.use((_req, res, next) => {
  res.header('Content-Type', 'application/json');
  next();
});

app.use((req, _res, next) => {
  (req as Request & { dataDir: string }).dataDir = config.dataDir;
  next();
});

app.use(createAuthMiddleware(config.apiKey));

app.use('/indexes', createIndexRoutes());
app.use('/indexes', createVectorRoutes());

app.use(errorHandler);

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Vector DB server running on port ${config.port}`);
});
