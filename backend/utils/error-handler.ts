import { NextFunction, Request, Response } from 'express';

interface CustomError extends Error {
  statusCode?: number;
  errors?: string[];
}

export function errorHandler(
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errors = err.errors || [];

  res.status(statusCode).json({
    success: false,
    message,
    errors
  });
}