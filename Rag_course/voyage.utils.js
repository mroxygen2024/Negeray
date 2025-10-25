import {VoyageAIClient} from "voyageai";
import dotenv from "dotenv";
dotenv.config();

const voyage = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY });

export const embedText = async (text) => {
  const res = await voyage.embed({
    model: "voyage-3.5-lite",
    input: text
  });
  return res.data[0].embedding;
};
