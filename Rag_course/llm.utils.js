import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const client = new OpenAI({ apiKey: process.env.LLM_API_KEY });

export const generateAnswer = async (context, question) => {
  const prompt = `
Use the following pieces of context to answer the question.
If the answer is not in the context, respond with "I don’t know."
Do not fabricate answers.

Context:
${context}

Question: ${question}
Answer:
`;

  const completion = await client.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0,
  });

  return completion.choices[0].message.content;
};
