import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { existsSync, rmSync } from 'node:fs';

const TEST_API_KEY = 'test-api-key';
const TEST_DATA_DIR = './test-data';
const BASE_URL = 'http://localhost:3002';

let serverProcess: ReturnType<typeof Bun.spawn> | null = null;

beforeEach(async () => {
  if (existsSync(TEST_DATA_DIR)) {
    rmSync(TEST_DATA_DIR, { recursive: true });
  }

  serverProcess = Bun.spawn([process.execPath, 'src/main.ts'], {
    env: {
      PINECONE_API_KEY: TEST_API_KEY,
      PORT: '3002',
      DATA_DIR: TEST_DATA_DIR,
    },
  });

  await new Promise((resolve) => setTimeout(resolve, 500));

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

describe('Vector API', () => {
  test('upsert vectors successfully', async () => {
    const response = await fetch(`${BASE_URL}/indexes/test-index/vectors/upsert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_API_KEY}`,
      },
      body: JSON.stringify({
        vectors: [
          {
            id: 'v1',
            values: [1, 0, 0],
            metadata: { text: 'first vector' },
          },
          {
            id: 'v2',
            values: [0, 1, 0],
            metadata: { text: 'second vector' },
          },
        ],
      }),
    });

    expect(response.status).toBe(200);
    const data = (await response.json()) as { upsertedCount: number };
    expect(data.upsertedCount).toBe(2);
  });

  test('reject upsert with dimension mismatch', async () => {
    const response = await fetch(`${BASE_URL}/indexes/test-index/vectors/upsert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_API_KEY}`,
      },
      body: JSON.stringify({
        vectors: [
          {
            id: 'v1',
            values: [1, 0],
            metadata: { text: 'wrong dimension' },
          },
        ],
      }),
    });

    expect(response.status).toBe(400);
  });

  test('query vectors returns correct results', async () => {
    await fetch(`${BASE_URL}/indexes/test-index/vectors/upsert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_API_KEY}`,
      },
      body: JSON.stringify({
        vectors: [
          {
            id: 'v1',
            values: [1, 0, 0],
            metadata: { text: 'first' },
          },
          {
            id: 'v2',
            values: [0, 1, 0],
            metadata: { text: 'second' },
          },
          {
            id: 'v3',
            values: [0.7, 0.7, 0],
            metadata: { text: 'third' },
          },
        ],
      }),
    });

    const response = await fetch(`${BASE_URL}/indexes/test-index/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_API_KEY}`,
      },
      body: JSON.stringify({
        vector: [1, 0, 0],
        topK: 2,
        includeMetadata: true,
        includeValues: false,
      }),
    });

    expect(response.status).toBe(200);
    const data = (await response.json()) as {
      matches: Array<{ id: string; score: number; metadata?: { text: string }; values?: number[] }>;
    };
    expect(data.matches.length).toBe(2);
    expect(data.matches[0].id).toBe('v1');
    expect(data.matches[0].score).toBe(1.0);
    expect(data.matches[0].metadata?.text).toBe('first');
    expect(data.matches[0].values).toBeUndefined();
  });

  test('query vectors respects includeValues flag', async () => {
    await fetch(`${BASE_URL}/indexes/test-index/vectors/upsert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_API_KEY}`,
      },
      body: JSON.stringify({
        vectors: [
          {
            id: 'v1',
            values: [1, 0, 0],
            metadata: { text: 'first' },
          },
        ],
      }),
    });

    const response = await fetch(`${BASE_URL}/indexes/test-index/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_API_KEY}`,
      },
      body: JSON.stringify({
        vector: [1, 0, 0],
        topK: 1,
        includeMetadata: false,
        includeValues: true,
      }),
    });

    expect(response.status).toBe(200);
    const data = (await response.json()) as {
      matches: Array<{ values?: number[]; metadata?: { text: string } }>;
    };
    expect(data.matches[0].values).toEqual([1, 0, 0]);
    expect(data.matches[0].metadata).toBeUndefined();
  });

  test('query returns results sorted by score descending', async () => {
    await fetch(`${BASE_URL}/indexes/test-index/vectors/upsert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_API_KEY}`,
      },
      body: JSON.stringify({
        vectors: [
          {
            id: 'v1',
            values: [1, 0, 0],
            metadata: { text: 'first' },
          },
          {
            id: 'v2',
            values: [0, 1, 0],
            metadata: { text: 'second' },
          },
          {
            id: 'v3',
            values: [0.9, 0.1, 0],
            metadata: { text: 'third' },
          },
        ],
      }),
    });

    const response = await fetch(`${BASE_URL}/indexes/test-index/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_API_KEY}`,
      },
      body: JSON.stringify({
        vector: [1, 0, 0],
        topK: 3,
        includeMetadata: true,
      }),
    });

    const data = (await response.json()) as {
      matches: Array<{ score: number }>;
    };
    expect(data.matches[0].score).toBeGreaterThanOrEqual(data.matches[1].score);
    expect(data.matches[1].score).toBeGreaterThanOrEqual(data.matches[2].score);
  });

  test('upsert updates existing vectors', async () => {
    await fetch(`${BASE_URL}/indexes/test-index/vectors/upsert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_API_KEY}`,
      },
      body: JSON.stringify({
        vectors: [
          {
            id: 'v1',
            values: [1, 0, 0],
            metadata: { text: 'original' },
          },
        ],
      }),
    });

    await fetch(`${BASE_URL}/indexes/test-index/vectors/upsert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_API_KEY}`,
      },
      body: JSON.stringify({
        vectors: [
          {
            id: 'v1',
            values: [0, 1, 0],
            metadata: { text: 'updated' },
          },
        ],
      }),
    });

    const response = await fetch(`${BASE_URL}/indexes/test-index/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_API_KEY}`,
      },
      body: JSON.stringify({
        vector: [0, 1, 0],
        topK: 1,
        includeMetadata: true,
      }),
    });

    const data = (await response.json()) as {
      matches: Array<{ metadata?: { text: string } }>;
    };
    expect(data.matches[0].metadata?.text).toBe('updated');
  });

  test('reject query with invalid topK', async () => {
    const response = await fetch(`${BASE_URL}/indexes/test-index/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_API_KEY}`,
      },
      body: JSON.stringify({
        vector: [1, 0, 0],
        topK: 0,
      }),
    });

    expect(response.status).toBe(400);
  });

  test('reject operations on non-existent index', async () => {
    const response = await fetch(`${BASE_URL}/indexes/non-existent/vectors/upsert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_API_KEY}`,
      },
      body: JSON.stringify({
        vectors: [
          {
            id: 'v1',
            values: [1, 0, 0],
          },
        ],
      }),
    });

    expect(response.status).toBe(404);
  });
});
