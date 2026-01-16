import type { Config } from '#types/config-types.js';

export const loadConfig = () => {
  const apiKey = process.env.PINECONE_API_KEY;
  const port = Number.parseInt(process.env.PORT ?? '3000', 10);
  const dataDir = process.env.DATA_DIR ?? './data';

  if (!apiKey) {
    throw new Error('PINECONE_API_KEY environment variable is required');
  }

  return {
    apiKey,
    port,
    dataDir,
  } as Config;
};
