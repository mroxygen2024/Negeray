import  Input from "../models/input.model.js";
import { embedText } from "../services/voyage.service.js";
import { generateAnswer } from "../services/gemini.service.js";
import { chunkText } from "../utils/chunking.utils.js";
import { deduplicateTexts } from "../utils/dedup.utils.js";
import { getCache, setCache } from "../utils/cache.utils.js";
import { encode } from "gpt-tokenizer";
import { limitContextLength } from "../utils/limitContext.utils.js";


export const trainText = async (req, res) => {
try {
const { text } = req.body;
if (!text?.trim()) return res.status(400).json({ error: "Text required" });


const tags = text
  .toLowerCase()
  .split(/\W+/)
  .filter((w) => w.length > 2);

const chunks = chunkText(text, 300, 50);
const saved = [];

for (const chunk of chunks) {
 
  const embedding = await embedText(chunk);

  const { isDuplicate } = await deduplicateTexts(embedding, Input);
  if (isDuplicate) continue;

  const tokenCount = encode(chunk).length;
  const doc = await Input.create({
    text: chunk,
    tags,
    embedding,
    tokenCount,
  });

  saved.push(doc);
}

res.json({
  success: true,
  message: ` Stored ${saved.length} unique chunks.`,
});


} catch (err) {
console.error(" Train Error:", err);
res.status(500).json({ error: "Failed to embed and store text" });
}
};


export const chatRAG = async (req, res) => {
try {
const { question } = req.body;
if (!question?.trim())
return res.status(400).json({ error: "Question required" });

const cacheKey = `answer_${question}`;
const cached = getCache(cacheKey);
if (cached) return res.json({ answer: cached, cached: true });

const queryEmbedding = await embedText(question);
const keywords = question.toLowerCase().split(/\s+/).filter(Boolean);
const filter = { tags: { $in: keywords } };

// Hybrid search: vector + metadata filter
let results = await Input.aggregate([
  {
    $vectorSearch: {
      index: "vectorIndex",
      path: "embedding",
      similarity: "cosine",
      queryVector: queryEmbedding,
      numCandidates: 100,
      limit: 10,
      filter,
    },
  },
  {
    $project: {
      _id: 0,
      text: 1,
      tags: 1,
      score: { $meta: "vectorSearchScore" },
    },
  },
]);

// Trim context length
const trimmed = limitContextLength(results, 1024);
const context = trimmed.map((c) => c.text).join("\n\n");

if (!context.trim())
  return res.json({ answer: "I don’t know", sources: [] });

const prompt = `You are an expert assistant. Use ONLY the context below to answer clearly.
Context:${context} Question:${question}
If the answer is not in the context, reply exactly with "I don’t know".
Answer:
`;

const rawAnswer = await generateAnswer(prompt);
const answer = rawAnswer?.trim() || "I don’t know";

setCache(cacheKey, answer);
res.json({ answer, sources: trimmed });


} catch (err) {
console.error("❌ Chat RAG Error:", err);
res.status(500).json({ error: "Chat RAG failed" });
}
};