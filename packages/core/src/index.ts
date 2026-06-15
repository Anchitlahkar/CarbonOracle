// Result Type Pattern
export type Result<T, E = Error> = 
  | { success: true; value: T }
  | { success: false; error: E };

export const ok = <T>(value: T): Result<T, never> => ({
  success: true,
  value,
});

export const fail = <E = Error>(error: E): Result<never, E> => ({
  success: false,
  error,
});

// Domain Event Base Interface
export interface DomainEvent<TPayload = unknown> {
  id: string;
  timestamp: Date;
  type: string;
  payload: TPayload;
}

// Base Error types
export abstract class AppError extends Error {
  public abstract readonly code: string;
  public readonly timestamp: Date = new Date();

  constructor(message: string, public readonly details?: unknown) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  public readonly code = 'VALIDATION_ERROR';
}

export class AuthenticationError extends AppError {
  public readonly code = 'AUTHENTICATION_ERROR';
}

export class AuthorizationError extends AppError {
  public readonly code = 'AUTHORIZATION_ERROR';
}

export class NotFoundError extends AppError {
  public readonly code = 'NOT_FOUND_ERROR';
}

export class BusinessRuleError extends AppError {
  public readonly code = 'BUSINESS_RULE_ERROR';
}

export class InfrastructureError extends AppError {
  public readonly code = 'INFRASTRUCTURE_ERROR';
}

// Common Logger Interface
export interface ILogger {
  info(message: string, context?: unknown): void;
  warn(message: string, context?: unknown): void;
  error(message: string, error?: unknown, context?: unknown): void;
  debug?(message: string, context?: unknown): void;
}

// Common Configuration Interface
export interface AppConfig {
  env: 'development' | 'production' | 'test';
  port: number;
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey?: string;
  };
  gemini: {
    apiKey: string;
  };
}
