import { Request, Response, NextFunction } from 'express';
import { createClient, SupabaseClient, User, AuthError } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../frontend/.env') });

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

const sanitizeHeaderValue = (val: string) => val.replace(/[^\x20-\x7E]/g, '').replace(/['",]/g, '').trim();

const supabaseUrl = sanitizeHeaderValue(process.env.SUPABASE_URL || '');
const supabaseServiceKey = sanitizeHeaderValue(process.env.SUPABASE_SERVICE_KEY || '');

let supabase: SupabaseClient | null = null;
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
}

const supabaseAnonKey = sanitizeHeaderValue(process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '');
let supabaseAnon: SupabaseClient | null = null;
if (supabaseUrl && supabaseAnonKey) {
  supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
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
      console.log('[BACKEND_AUTH_RESULT] Success: Missing token, fallback allowed in dev');
      req.user = { id: 'test-user-id', email: 'test@carbonsense.com' };
      return next();
    }
    console.error('[AUTH_REFRESH_FAILED] Authorization header with Bearer token is required');
    console.log('[BACKEND_AUTH_RESULT] Failure: Authorization header missing or malformed');
    return res.status(401).json({ data: null, error: 'Authorization header with Bearer token is required' });
  }

  const rawToken = authHeader.split(' ')[1] || '';
  const token = sanitizeHeaderValue(rawToken);

  try {
    const isMockToken = token === 'mock-jwt-token' || token.startsWith('mock-');
    if (isMockToken) {
      if (!isDevelopment || !enableMockAuth) {
        console.error('[AUTH_REFRESH_FAILED] Mock token submitted but mock auth is disabled.');
        console.log('[BACKEND_AUTH_RESULT] Failure: Mock token blocked');
        return res.status(401).json({ data: null, error: 'Unauthorized: Mock tokens are disallowed in this environment' });
      }
      console.log('[AUTH_SIGNED_IN] Authenticated mock user via mock-jwt-token');
      console.log('[BACKEND_AUTH_RESULT] Success: Mock token accepted');
      req.user = { id: 'test-user-id', email: 'test@carbonsense.com' };
      return next();
    }

    if (!supabase && !supabaseAnon) {
      if (isProduction) {
        console.error('[AUTH_REFRESH_FAILED] Auth service misconfigured in production (Supabase client not initialized)');
        console.log('[BACKEND_AUTH_RESULT] Failure: Supabase uninitialized in production');
        return res.status(500).json({ data: null, error: 'Auth service misconfigured in production' });
      }
      if (isDevelopment && enableMockAuth) {
        console.warn('[AUTH_RESTORE] Supabase client uninitialized. Fallback to mock user.');
        console.log('[BACKEND_AUTH_RESULT] Success: Supabase uninitialized, dev fallback allowed');
        req.user = { id: 'test-user-id', email: 'test@carbonsense.com' };
        return next();
      }
      console.error('[AUTH_REFRESH_FAILED] Auth service uninitialized and mock mode disabled');
      console.log('[BACKEND_AUTH_RESULT] Failure: Supabase uninitialized');
      return res.status(500).json({ data: null, error: 'Auth service uninitialized' });
    }

    let user: User | null = null;
    let authError: AuthError | unknown = null;

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.getUser(token);
        if (data && data.user) {
          user = data.user;
        } else {
          authError = error;
        }
      } catch (err) {
        authError = err;
      }
    }

    if (!user && supabaseAnon) {
      try {
        console.log('[AUTH_RESTORE] Service key validation failed/unavailable. Retrying validation with anon key...');
        const { data, error } = await supabaseAnon.auth.getUser(token);
        if (data && data.user) {
          user = data.user;
          authError = null; // Cleared error
        } else if (!authError) {
          authError = error;
        }
      } catch (err) {
        if (!authError) authError = err;
      }
    }

    if (authError || !user) {
      console.error('[AUTH_REFRESH_FAILED] Invalid or expired auth session:', authError);
      console.log(`[FAILED_REQUEST] Endpoint: ${req.originalUrl}`);
      console.log(`[FAILED_REQUEST] Error details:`, authError);
      console.log(`[BACKEND_AUTH_RESULT] Failure: Invalid or expired auth session. Error: ${(authError as Error)?.message || 'User not found'}`);
      return res.status(401).json({ data: null, error: 'Invalid or expired auth session', details: (authError as Error)?.message });
    }

    req.user = {
      id: user.id,
      email: user.email,
    };
    console.log(`[AUTH_SIGNED_IN] User validated via Supabase: ${user.id}`);
    console.log(`[BACKEND_AUTH_RESULT] Success: Authenticated user ${user.id}`);
    next();
  } catch (err: unknown) {
    console.error('[AUTH_REFRESH_FAILED] Server validation error:', err);
    console.log(`[BACKEND_AUTH_RESULT] Failure: Exception thrown during validation. Error: ${(err as Error).message}`);
    return res.status(500).json({ data: null, error: 'Server validation error' });
  }
}
export default authMiddleware;
