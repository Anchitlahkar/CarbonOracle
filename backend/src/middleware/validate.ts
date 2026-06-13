import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Express middleware to validate request body using a Zod schema.
 * Returns 400 Bad Request if validation fails, containing error details.
 * 
 * @param schema Zod schema definition for request body
 */
export const validateBody = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          data: null,
          error: `Validation error: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
        });
      }
      return res.status(400).json({
        data: null,
        error: 'Invalid request body format',
      });
    }
  };
};

export default validateBody;
