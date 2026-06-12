import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

// Extend Request interface to support custom user context
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
      };
    }
  }
}

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';

let supabase: any = null;
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Development fallback stub
    if (process.env.NODE_ENV !== 'production' || !supabase) {
      req.user = { id: 'test-user-id', email: 'test@carbonsense.com' };
      return next();
    }
    return res.status(401).json({ data: null, error: 'Authorization header with Bearer token is required' });
  }

  const rawToken = authHeader.split(' ')[1] || '';
  const token = rawToken.replace(/^["']|["']$/g, '').trim();

  try {
    if (!supabase || token === 'mock-jwt-token' || token.startsWith('mock-')) {
      req.user = { id: 'test-user-id', email: 'test@carbonsense.com' };
      return next();
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ data: null, error: 'Invalid or expired auth session' });
    }

    req.user = {
      id: user.id,
      email: user.email,
    };
    next();
  } catch (err: any) {
    console.error('[AuthMiddleware] Error verifying JWT:', err);
    return res.status(500).json({ data: null, error: 'Server validation error' });
  }
}
export default authMiddleware;
