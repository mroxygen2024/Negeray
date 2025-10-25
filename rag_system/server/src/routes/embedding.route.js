import { Router } from 'express';
import { trainText, queryText, chatRAG } from '../controllers/embedding.controller.js';

const router = Router();

router.post('/train', trainText);
router.post('/query', queryText);
router.post('/chat', chatRAG);

export default router;
