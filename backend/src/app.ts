import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { ENV } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import apiRoutes from './routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ENV.CORS_ORIGINS.length > 1
    ? (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
        if (!origin || ENV.CORS_ORIGINS.some((o) => origin === o || origin.endsWith('.vercel.app'))) cb(null, true);
        else cb(null, false);
      }
    : ENV.CORS_ORIGINS[0],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: ENV.RATE_LIMIT_WINDOW_MS,
  max: ENV.RATE_LIMIT_MAX_REQUESTS,
  message: 'Çok fazla istek gönderdiniz, lütfen daha sonra tekrar deneyin.',
});
app.use('/api/', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1', apiRoutes);

// Error handling
app.use(errorHandler);

export default app;
