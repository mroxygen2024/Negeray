import Input from '../models/input.model.js';
import { embedText } from '../utils/voyage.utils.js';
import { generateAnswer } from '../utils/gemini.utils.js';


export const trainText = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    const embedding = await embedText(text);

    const result = await Input.create({ text, embedding });
    res.json({ message: 'Text embedded and stored successfully',result: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to embed text' });
  }
};

export const queryText = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    const queryEmbedding = await embedText(text);

    const results = await Input.aggregate([
      {
        $vectorSearch: {
          index: 'vector_search',
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
};



export const chatRAG = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: 'Question is required' });

    const queryEmbedding = await embedText(question);

    const results = await Input.aggregate([
      {
        $vectorSearch: {
          index: 'vector_search',
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

    const context = results.map(r => r.text).join('\n');

    // Now send context + question to Gemini
    const prompt = `
You are an intelligent assistant. Use the following context to answer the question clearly and accurately.

Context:
${context}

Question: ${question}

If the answer is not found in the context, say "I don’t know based on the given data."
`;

    const answer = await generateAnswer(prompt);

    res.json({
      message: 'Chat response generated successfully',
      answer,
      sources: results
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chat RAG failed: ' + err.message });
  }
};
