import express from 'express';
import cors from 'cors';
import embeddingRoutes from './src/routes/rag.routes.js';
import morgan from 'morgan';

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use('/api', embeddingRoutes);

export default app;
