import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);

  const status = (err as { status?: number }).status || 500;
  const message = (err as Error).message || 'Internal Server Error';

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: (err as Error).stack }),
  });
};
