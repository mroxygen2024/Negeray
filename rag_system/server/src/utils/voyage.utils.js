import { VoyageAIClient } from 'voyageai';

const voyage = new VoyageAIClient({
  apiKey: process.env.VOYAGE_API_KEY
});

export const embedText = async (text) => {
  const response = await voyage.embed({
    model: 'voyage-3-large',
    input: text
  });
  return response.data[0].embedding;
};
