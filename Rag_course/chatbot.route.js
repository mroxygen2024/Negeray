
import express from "express";
import multer from "multer";
import { PDFParse } from 'pdf-parse';
import Chunk from "./Chunk.model.js";
import { embedText } from "./voyage.utils.js";
import { generateAnswer } from './llm.utils.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

function chunkText(text, chunkSize = 500, overlap = 150) {
  const words = text.split(" ");
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    chunks.push(words.slice(i, i + chunkSize).join(" "));
  }
  return chunks;
}

 

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const dataBuffer = req.file.buffer;
     const parser = new PDFParse({ data: dataBuffer });

   const data = await parser.getText();

   
    const text = data.text.replace(/\n\s*\n/g, "\n").trim();

    if (!text) return res.status(400).json({ error: "No text found in PDF" });

    const chunks = chunkText(text);
    const docs = [];

    for (const chunk of chunks) {
      const embedding = await embedText(chunk);
      docs.push({ text: chunk, metadata: {}, embedding });
    }

    console.log(docs)

    await Chunk.insertMany(docs);
    res.json({ message: "PDF processed and stored successfully!", count: docs.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process PDF" });
  }
});







router.post('/query',  async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    const queryEmbedding = await embedText(text);

    const results = await Chunk.aggregate([
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'embedding',
          similarity: 'cosine',
          numCandidates: 100,
          queryVector: queryEmbedding,
          limit: 3
        }
      },
      {
        $project: {
          _id: 0,
          text: 1,
          score: { $meta: 'vectorSearchScore' }
        }
      }
    ]);

    res.json({ message: 'Query processed successfully', results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Vector search failed'+ err });
  }
});




router.post('/chat', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: 'Question is required' });

    // 1️⃣ Create embedding for the question
    const queryEmbedding = await embedText(question);

    // 2️⃣ Retrieve relevant chunks from MongoDB using $vectorSearch
    const results = await Chunk.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: 'embedding',
          queryVector: queryEmbedding,
          similarity: 'cosine',
          numCandidates: 10,
          limit: 3,  // top 3 relevant chunks
        },
      },
      {
        $project: {
          _id: 0,
          text: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ]);

    // 3️⃣ Combine text for LLM context
    const context = results.map(r => r.text).join('\n\n');

    // 4️⃣ Generate final answer using LLM
    const answer = await generateAnswer(context, question);

    res.json({
      message: 'Chat response generated successfully',
      answer,
      sources: results,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'RAG query failed: ' + err.message });
  }
});

export default router;