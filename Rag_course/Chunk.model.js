import mongoose from "mongoose";

const chunkSchema = new mongoose.Schema({
  text: { type: String, required: true },
  metadata: { type: Object },
  embedding: { type: [Number], required: true }
});

export default mongoose.model("Chunk", chunkSchema);
