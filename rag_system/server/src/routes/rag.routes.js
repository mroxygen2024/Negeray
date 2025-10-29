import express from 'express';
import { trainText, chatRAG } from '../controllers/rag.controller.js';

const router = express.Router();

router.post('/train', trainText);
router.post('/chat', chatRAG);

export default router;
