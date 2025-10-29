
export const deduplicateTexts = async (newEmbedding, model) => {
  try {
    // Perform a vector search to find the most semantically similar documents
    const results = await model.aggregate([
      {
        $vectorSearch: {
          index: "vectorIndex", // must match your Atlas Search vector index name
          path: "embedding",
          queryVector: newEmbedding,
          similarity: "cosine",
          numCandidates: 100,
          limit: 1,
        },
      },
      {
        $project: {
          text: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ]);

    // Check if any retrieved doc is highly similar (e.g., similarity > 0.9)
    if (results.length > 0 && results[0].score > 0.9) {
      return {
        isDuplicate: true,
        reason: `Semantic duplicate of: "${results[0].text.slice(0, 80)}..."`,
      };
    }

    return { isDuplicate: false };
  } catch (error) {
    console.error("❌ VectorSearch Deduplication Error:", error);
    return { isDuplicate: false, reason: "Error during vector deduplication" };
  }
};
