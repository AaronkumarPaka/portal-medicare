import express from 'express';
import cors from 'cors';
import path from 'path';
import agenciesRouter from './routes/agencies';
import providersRouter from './routes/providers';
import { upload } from './middleware/upload';

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

app.use('/api/agencies', agenciesRouter);
app.use('/api/providers', providersRouter);

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
