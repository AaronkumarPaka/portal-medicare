import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import agenciesRouter from './routes/agencies';
import providersRouter from './routes/providers';

const loadEnvFile = () => {
  const envPath = path.resolve(__dirname, '../.env');

  if (!fs.existsSync(envPath)) {
    return;
  }

  const contents = fs.readFileSync(envPath, 'utf8');

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();

    if (!key || process.env[key]) {
      continue;
    }

    const value = line.slice(separatorIndex + 1).trim().replace(/^"(.*)"$/, '$1');
    process.env[key] = value;
  }
};

loadEnvFile();

const app = express();
const port = Number(process.env.PORT || 4000);
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
  }),
);
app.use(express.json());
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

app.use('/api/agencies', agenciesRouter);
app.use('/api/providers', providersRouter);

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is not set. API requests that need Prisma will fail until backend/.env is configured.');
}

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
