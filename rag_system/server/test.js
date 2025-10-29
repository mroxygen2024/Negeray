// ---------------------------
// test.js - Hybrid Search with $vectorSearch
// ---------------------------

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { embedText } from "./src/services/voyage.service.js"; //embedding service
import cosineSimilarity from "compute-cosine-similarity";
import { encode } from "gpt-tokenizer";

dotenv.config();

const app = express();
app.use(express.json());

// ---------------------------
// 1️⃣ MongoDB Setup
// ---------------------------
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const docSchema = new mongoose.Schema({
  text: { type: String, required: true },
  tags: [String],
  category: { type: String, default: "general" },
  embedding: { type: [Number], required: true },
  createdAt: { type: Date, default: Date.now },
});

const Document = mongoose.model("Document", docSchema);

// ---------------------------
// 2️⃣ Embedding Helper
// ---------------------------
const getEmbedding = async (text) => {
  // Replace with Voyage/Gemini API call
  // return await embedText(text);
  return await embedText(text); // already using your voyage.service.js
};



export const deduplicateTexts = async (newText, newEmbedding, model) => {
// 2️ Semantic check 
  const allDocs = await model.find({}, { embedding: 1, text: 1 });
  for (const doc of allDocs) {
    const sim = cosineSimilarity(doc.embedding, newEmbedding);
    if (sim > 0.9)
      return { isDuplicate: true, reason: "Semantic duplicate of " + doc.text };
  }

  return { isDuplicate: false };

}


// export const chunkText = (text, chunkSize , overlap ) => {
//   const words = text.split(" ");
//   const chunks = [];

//   for (let i = 0; i < words.length; i += chunkSize - overlap) {
//     const chunk = words.slice(i, i + chunkSize).join(" ");
//     chunks.push(chunk);
//     if (i + chunkSize >= words.length) break;
//   }

//   return chunks;
// };

export const limitContextLength = (chunks, maxTokens) => {
  let totalTokens = 0;
  const selectedChunks = [];

  // Sort by score descending (most relevant first)
  chunks.sort((a, b) => b.score - a.score);

  for (const chunk of chunks) {
    const chunkTokens = encode(chunk.text).length;

    if (totalTokens + chunkTokens > maxTokens) break;

    selectedChunks.push(chunk);
    totalTokens += chunkTokens;
  }

  return selectedChunks;
};


// ---------------------------
// 3️⃣ Add Document Endpoint
// ---------------------------

app.post("/add-document", async (req, res) => {
  try {
    const { text, category = "general" } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    // Auto-generate tags from keywords
    const tags = text
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 2);

    const chunks = chunkText(text, 300, 50);
    const savedChunks = [];

    for (const chunk of chunks) {
      const embedding = await embedText(chunk);

      // Deduplicate before saving
      const dedup = await deduplicateTexts(chunk, embedding, Document);
      if (dedup.isDuplicate) continue;

      const doc = await Document.create({
        text: chunk,
        tags,
        category,
        embedding,
      });
      savedChunks.push(doc);
    }

    res.json({
      success: true,
      message: `Stored ${savedChunks.length} unique chunks.`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// ---------------------------
// 4️⃣ Hybrid Search Endpoint
// ---------------------------
app.post("/hybrid-search", async (req, res) => {
  try {
    const { query, metadata = {}, topK = 5 } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required" });

    // Extract tags from query
    const queryTags = query
      .toLowerCase()
      .split(/\W+/)
      .filter((word) => word.length > 2);

    // Get query embedding
    const queryEmbedding = await getEmbedding(query);

    // Build filter
    const filter = {};
    if (queryTags.length) filter.tags = { $in: queryTags };
    if (metadata.category) filter.category = metadata.category;

    // Perform hybrid vector search
    const results = await Document.aggregate([
      {
        $vectorSearch: {
          index: "vectorIndex", // must match Atlas Search index name
          path: "embedding",
          similarity: "cosine",
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: topK,
          filter: filter,
        },
      },
      {
        $project: {
          _id: 0,
          text: 1,
          category: 1,
          tags: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ]);

    //  Assume 'results' is from hybrid/vector search
    const maxTokens = 1024;
    const trimmedChunks = limitContextLength(results, maxTokens);

    // Merge the chunks for LLM prompt
    const context = trimmedChunks.map(c => c.text).join("\n\n");

//    ------- ---------------------------------------
    // Send 'context' + user query to LLM
//    ------- ---------------------------------------

    res.json({ success: true, query, results });
  } catch (err) {
    console.error("❌ Hybrid search error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------
// 5️⃣ Start Server
// ---------------------------
const PORT =  3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
