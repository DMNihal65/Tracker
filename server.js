import express from 'express';
import cors from 'cors';
import progressHandler from './api/progress.js';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Mock Vercel function signature
const adaptHandler = (handler) => (req, res) => {
    return handler(req, res);
};

app.all('/api/progress', adaptHandler(progressHandler));

app.listen(port, () => {
    console.log(`Local API server running at http://localhost:${port}`);
});
