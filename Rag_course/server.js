import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Routes from "./chatbot.route.js";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  "dbName": "Rag_course"
})
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

app.use("/api", Routes);


app.get("/", (req, res) => res.send("RAG Ingestion Server Running "));

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
