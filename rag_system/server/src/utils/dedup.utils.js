
export const deduplicateTexts = async (newEmbedding, model) => {
  try {
    const results = await model.aggregate([
      {
        $vectorSearch: {
          index: "vectorIndex", 
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

    
    if (results.length > 0 && results[0].score > 0.9) {
      return {
        isDuplicate: true,
        reason: `Semantic duplicate of: "${results[0].text.slice(0, 80)}..."`,
      };
    }

    return { isDuplicate: false };
  } catch (error) {
    // console.error("❌ VectorSearch Deduplication Error:", error);
    return { isDuplicate: false, reason: "Error during vector deduplication" };
  }
};
