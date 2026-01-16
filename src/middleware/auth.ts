import type { NextFunction, Request, Response } from 'express';

export const createAuthMiddleware = (apiKey: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: 'Missing Authorization header' });
      return;
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    if (token !== apiKey) {
      res.status(401).json({ error: 'Invalid API key' });
      return;
    }

    next();
  };
};
