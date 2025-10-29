
import { encode } from "gpt-tokenizer";
export const limitContextLength = (chunks, maxTokens = 1024) => {
let totalTokens = 0;
const selectedChunks = [];

chunks.sort((a, b) => b.score - a.score);
for (const chunk of chunks) {
const tokenCount = encode(chunk.text).length;
if (totalTokens + tokenCount > maxTokens) break;
selectedChunks.push(chunk);
totalTokens += tokenCount;
}

return selectedChunks;
};