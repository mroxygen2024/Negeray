// models/input.model.js
import mongoose from "mongoose";

const inputSchema = new mongoose.Schema({
  text: { type: String, required: true },
  tags: [String],
  embedding: { type: [Number], required: true },
  tokenCount: Number,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Input", inputSchema);
