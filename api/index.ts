import { Request, Response } from 'express';
import app from '../backend/src/index.js';

/**
 * Vercel Serverless Function entrypoint.
 * This function bridges the Express app from the backend to Vercel's serverless environment.
 */
export default async function handler(req: Request, res: Response) {
  // Ensure the Express app handles the request/response cycle
  return app(req, res);
}
