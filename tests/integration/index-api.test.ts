import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { existsSync, rmSync } from 'node:fs';

const TEST_API_KEY = 'test-api-key';
const TEST_DATA_DIR = './test-data';
const BASE_URL = 'http://localhost:3001';

let serverProcess: ReturnType<typeof Bun.spawn> | null = null;

beforeEach(async () => {
  if (existsSync(TEST_DATA_DIR)) {
    rmSync(TEST_DATA_DIR, { recursive: true });
  }

  serverProcess = Bun.spawn([process.execPath, 'src/main.ts'], {
    env: {
      PINECONE_API_KEY: TEST_API_KEY,
      PORT: '3001',
      DATA_DIR: TEST_DATA_DIR,
    },
  });

  await new Promise((resolve) => setTimeout(resolve, 500));
});

afterEach(() => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }

  if (existsSync(TEST_DATA_DIR)) {
    rmSync(TEST_DATA_DIR, { recursive: true });
  }
});

describe('Index API', () => {
  test('create index successfully', async () => {
    const response = await fetch(`${BASE_URL}/indexes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_API_KEY}`,
      },
      body: JSON.stringify({
        name: 'test-index',
        dimension: 3,
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1',
          },
        },
      }),
    });

    expect(response.status).toBe(201);
    const data = (await response.json()) as { name: string; dimension: number; metric: string };
    expect(data.name).toBe('test-index');
    expect(data.dimension).toBe(3);
    expect(data.metric).toBe('cosine');
  });

  test('reject create index without authentication', async () => {
    const response = await fetch(`${BASE_URL}/indexes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'test-index',
        dimension: 3,
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1',
          },
        },
      }),
    });

    expect(response.status).toBe(401);
  });

  test('reject create index with invalid API key', async () => {
    const response = await fetch(`${BASE_URL}/indexes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer wrong-key',
      },
      body: JSON.stringify({
        name: 'test-index',
        dimension: 3,
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1',
          },
        },
      }),
    });

    expect(response.status).toBe(401);
  });

  test('get index returns 404 for non-existent index', async () => {
    const response = await fetch(`${BASE_URL}/indexes/non-existent`, {
      headers: {
        Authorization: `Bearer ${TEST_API_KEY}`,
      },
    });

    expect(response.status).toBe(404);
  });

  test('get index returns 200 for existing index', async () => {
    await fetch(`${BASE_URL}/indexes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_API_KEY}`,
      },
      body: JSON.stringify({
        name: 'test-index',
        dimension: 3,
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1',
          },
        },
      }),
    });

    const response = await fetch(`${BASE_URL}/indexes/test-index`, {
      headers: {
        Authorization: `Bearer ${TEST_API_KEY}`,
      },
    });

    expect(response.status).toBe(200);
    const data = (await response.json()) as { name: string };
    expect(data.name).toBe('test-index');
  });

  test('delete index successfully', async () => {
    await fetch(`${BASE_URL}/indexes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_API_KEY}`,
      },
      body: JSON.stringify({
        name: 'test-index',
        dimension: 3,
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1',
          },
        },
      }),
    });

    const deleteResponse = await fetch(`${BASE_URL}/indexes/test-index`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${TEST_API_KEY}`,
      },
    });

    expect(deleteResponse.status).toBe(200);

    const getResponse = await fetch(`${BASE_URL}/indexes/test-index`, {
      headers: {
        Authorization: `Bearer ${TEST_API_KEY}`,
      },
    });

    expect(getResponse.status).toBe(404);
  });

  test('reject invalid index name', async () => {
    const response = await fetch(`${BASE_URL}/indexes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_API_KEY}`,
      },
      body: JSON.stringify({
        name: 'Invalid_Name',
        dimension: 3,
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1',
          },
        },
      }),
    });

    expect(response.status).toBe(400);
  });
});
