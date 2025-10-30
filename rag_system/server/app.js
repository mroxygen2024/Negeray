import express from 'express';
import cors from 'cors';
import embeddingRoutes from './src/routes/rag.routes.js';
import morgan from 'morgan';

const app = express();

app.use(cors(
    { origin: 'https://ask-csec.vercel.app' } 
));
app.use(morgan('dev'));
app.use(express.json());
app.use('/api', embeddingRoutes);

app.get('/', (req, res) => {    
    res.send('RAG System is running');
});

export default app;
