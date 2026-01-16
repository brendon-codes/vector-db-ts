export const isValidIndexName = (name: string) => {
  if (name.length === 0 || name.length > 45) {
    return false;
  }

  const validPattern = /^[a-z0-9-]+$/;
  return validPattern.test(name);
};

export const isValidDimension = (dimension: number) => {
  return Number.isInteger(dimension) && dimension > 0;
};

export const isValidTopK = (topK: number) => {
  return Number.isInteger(topK) && topK >= 1;
};

export const isValidVectorLength = (vector: ReadonlyArray<number>, expectedDimension: number) => {
  return vector.length === expectedDimension;
};

export const isValidMetadata = (metadata: unknown): metadata is Record<string, unknown> => {
  return typeof metadata === 'object' && metadata !== null && !Array.isArray(metadata);
};

export const areAllVectorsValid = (
  vectors: ReadonlyArray<{ readonly values: ReadonlyArray<number> }>,
  expectedDimension: number
) => {
  for (const vector of vectors) {
    if (!isValidVectorLength(vector.values, expectedDimension)) {
      return false;
    }
  }
  return true;
};
