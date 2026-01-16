import type { NextFunction, Request, Response } from 'express';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
};
