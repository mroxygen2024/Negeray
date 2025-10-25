import mongoose from 'mongoose';

const inputSchema = new mongoose.Schema({
  text: { type: String, required: true },
  embedding: { type: [Number], required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Input', inputSchema);
