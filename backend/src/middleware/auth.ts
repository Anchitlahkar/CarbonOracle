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
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' || !isProduction;
  const enableMockAuth = process.env.ENABLE_MOCK_AUTH === 'true';
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Development fallback stub - strictly enabled via flag
    if (isDevelopment && enableMockAuth && (!supabase || process.env.NODE_ENV === 'test')) {
      console.warn('[AUTH_RESTORE] Missing token. Fallback to mock test user (dev mock mode allowed)');
      req.user = { id: 'test-user-id', email: 'test@carbonsense.com' };
      return next();
    }
    console.error('[AUTH_REFRESH_FAILED] Authorization header with Bearer token is required');
    return res.status(401).json({ data: null, error: 'Authorization header with Bearer token is required' });
  }

  const rawToken = authHeader.split(' ')[1] || '';
  const token = rawToken.replace(/^["']|["']$/g, '').trim();

  try {
    const isMockToken = token === 'mock-jwt-token' || token.startsWith('mock-');
    if (isMockToken) {
      if (!isDevelopment || !enableMockAuth) {
        console.error('[AUTH_REFRESH_FAILED] Mock token submitted but mock auth is disabled.');
        return res.status(401).json({ data: null, error: 'Unauthorized: Mock tokens are disallowed in this environment' });
      }
      console.log('[AUTH_SIGNED_IN] Authenticated mock user via mock-jwt-token');
      req.user = { id: 'test-user-id', email: 'test@carbonsense.com' };
      return next();
    }

    if (!supabase) {
      if (isProduction) {
        console.error('[AUTH_REFRESH_FAILED] Auth service misconfigured in production (Supabase client not initialized)');
        return res.status(500).json({ data: null, error: 'Auth service misconfigured in production' });
      }
      if (isDevelopment && enableMockAuth) {
        console.warn('[AUTH_RESTORE] Supabase client uninitialized. Fallback to mock user.');
        req.user = { id: 'test-user-id', email: 'test@carbonsense.com' };
        return next();
      }
      console.error('[AUTH_REFRESH_FAILED] Auth service uninitialized and mock mode disabled');
      return res.status(500).json({ data: null, error: 'Auth service uninitialized' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('[AUTH_REFRESH_FAILED] Invalid or expired auth session:', error);
      return res.status(401).json({ data: null, error: 'Invalid or expired auth session' });
    }

    req.user = {
      id: user.id,
      email: user.email,
    };
    console.log(`[AUTH_SIGNED_IN] User validated via Supabase: ${user.id}`);
    next();
  } catch (err: any) {
    console.error('[AUTH_REFRESH_FAILED] Server validation error:', err);
    return res.status(500).json({ data: null, error: 'Server validation error' });
  }
}
export default authMiddleware;
