/**
 * Computes cosine similarity between two numeric vectors
 */
export const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Fast keyword token overlap similarity (fallback when neural model is loading or disabled)
 */
export const tokenJaccardSimilarity = (strA = '', strB = '') => {
  const wordsA = new Set(strA.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean));
  const wordsB = new Set(strB.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let intersection = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) intersection++;
  }
  const union = new Set([...wordsA, ...wordsB]).size;
  return intersection / union;
};

// Singleton pipeline holder for client-side Transformers.js
let extractorPromise = null;

export const getEmbeddingExtractor = async () => {
  if (extractorPromise) return extractorPromise;

  extractorPromise = (async () => {
    try {
      const { pipeline, env } = await import('@xenova/transformers');
      // Set local caching and disable remote telemetry
      env.allowLocalModels = false;
      env.useBrowserCache = true;

      const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        quantized: true,
      });
      return extractor;
    } catch (err) {
      console.warn('Transformers.js model loading bypassed or failed, using robust NLP fallback:', err.message);
      return null;
    }
  })();

  return extractorPromise;
};
