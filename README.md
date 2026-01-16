# Pinecone Compatible Vector DB Server

A Pinecone compatible vector database webservice implemented in TypeScript with Bun runtime.
This service provides a filesystem based storage backend that implements the Pinecone API specification for vector similarity search.

## Features

- Pinecone-compatible REST API
- File-based storage (no external database required)
- Support for multiple similarity metrics (cosine, euclidean, dot product)
- Full CRUD operations for indexes and vectors
- Atomic file operations for data integrity
- Comprehensive test coverage
- TypeScript strict mode with full type safety
- Fast execution with Bun runtime

## Prerequisites

- [Bun](https://bun.sh/) 1.0 or later
- Node.js 18+ (for compatibility)

## Installation

```shell
bun install
```

## Configuration

Create a `.env` file based on `.env.example`:

```shell
PINECONE_API_KEY=your-api-key-here
PORT=3000
DATA_DIR=./data
```

## Usage

### Development

```shell
bun run dev
```

### Production

```shell
bun run build
bun run start
```

### Testing

```shell
bun test              # Run all tests
bun run typecheck     # Type check
bun run lint          # Lint code
bun run lint:fix      # Auto-fix lint issues
```

## API Endpoints

All requests require authentication via `Authorization: Bearer {api_key}` header.

### Index Operations

#### Create Index

```shell
POST /indexes
```

Request body:

```json
{
  "name": "test-index",
  "dimension": 1536,
  "metric": "cosine",
  "spec": {
    "serverless": {
      "cloud": "aws",
      "region": "us-east-1"
    }
  }
}
```

Response (201):
```json
{
  "name": "test-index",
  "dimension": 1536,
  "metric": "cosine",
  "spec": {
    "serverless": {
      "cloud": "aws",
      "region": "us-east-1"
    }
  },
  "status": {
    "ready": true,
    "state": "Ready"
  }
}
```

#### Get Index

```shell
GET /indexes/{name}
```

Response (200):

```json
{
  "name": "test-index",
  "dimension": 1536,
  "metric": "cosine",
  "spec": {
    "serverless": {
      "cloud": "aws",
      "region": "us-east-1"
    }
  },
  "status": {
    "ready": true,
    "state": "Ready"
  }
}
```

#### Delete Index

```shell
DELETE /indexes/{name}
```

Response (200):
```json
{
  "message": "Index deleted successfully"
}
```

### Vector Operations

#### Upsert Vectors

```shell
POST /indexes/{name}/vectors/upsert
```

Request body:

```json
{
  "vectors": [
    {
      "id": "vec1",
      "values": [0.1, 0.2, 0.3, ...],
      "metadata": {
        "text": "Example document"
      }
    }
  ],
  "namespace": ""
}
```

Response (200):
```json
{
  "upsertedCount": 1
}
```

#### Query Vectors

```shell
POST /indexes/{name}/query
```

Request body:

```json
{
  "vector": [0.1, 0.2, 0.3, ...],
  "topK": 5,
  "namespace": "",
  "includeMetadata": true,
  "includeValues": false
}
```

Response (200):

```json
{
  "matches": [
    {
      "id": "vec1",
      "score": 0.95,
      "metadata": {
        "text": "Example document"
      }
    }
  ],
  "namespace": ""
}
```

## Example Usage

```typescript
// Create an index
const createResponse = await fetch('http://localhost:3000/indexes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-api-key'
  },
  body: JSON.stringify({
    name: 'my-index',
    dimension: 1536,
    metric: 'cosine',
    spec: {
      serverless: {
        cloud: 'aws',
        region: 'us-east-1'
      }
    }
  })
});

// Upsert vectors
const upsertResponse = await fetch('http://localhost:3000/indexes/my-index/vectors/upsert', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-api-key'
  },
  body: JSON.stringify({
    vectors: [
      {
        id: 'doc1',
        values: [0.1, 0.2, ...], // 1536 dimensions
        metadata: { text: 'Document content' }
      }
    ]
  })
});

// Query vectors
const queryResponse = await fetch('http://localhost:3000/indexes/my-index/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-api-key'
  },
  body: JSON.stringify({
    vector: [0.1, 0.2, ...], // 1536 dimensions
    topK: 5,
    includeMetadata: true
  })
});
```

## Storage Structure

```
data/
├── indexes.json           # List of all indexes
└── {index-name}/
    ├── config.json        # Index configuration
    └── vectors.json       # Stored vectors
```

## Similarity Metrics

- **cosine**: Cosine similarity (range: -1 to 1, higher is more similar)
- **euclidean**: Euclidean distance converted to similarity (range: 0 to 1)
- **dotproduct**: Dot product similarity (range: unbounded)

## Architecture

The service follows a clean architecture pattern:

- **Controllers**: HTTP request handlers with input validation
- **Services**: Business logic for index and vector operations
- **Storage**: Atomic file I/O operations
- **Utils**: Pure functions for vector math and validation
- **Middleware**: Authentication and error handling

## License

MIT
