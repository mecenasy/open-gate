import * as Joi from 'joi';

interface ValidationResult {
  error?: Joi.ValidationError;
  value: Record<string, unknown>;
}

interface ValidatedEnv {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Environment Variables Validation Schema
 * Validates all environment variables at application startup
 * If validation fails, the application will not start with clear error messages
 */
export const envValidationSchema = Joi.object({
  // ============ Environment & Mode ============
  NODE_ENV: Joi.string()
    .valid('development', 'staging', 'production', 'test')
    .default('development')
    .description('Node environment'),
  MODE: Joi.string().valid('dev', 'production').default('dev').description('Application mode'),

  // ============ Service Ports ============
  PORT: Joi.number().port().default(3000).description('Fallback HTTP port'),
  BFF_PORT: Joi.number().port().default(3001).description('BFF service port'),
  GATE_PORT: Joi.number().port().default(3002).description('Gate/Core service port'),
  NOTIFY_PORT: Joi.number().port().default(3003).description('Notify service port'),
  GRPC_PORT: Joi.number().port().default(50052).description('gRPC server port'),

  // ============ Application URLs ============
  APP_URL: Joi.string().uri().default('http://localhost:3001').description('Application base URL'),
  CLIENT_URL: Joi.string().uri().default('http://localhost:4002').description('Frontend client URL'),
  ALLOWED_ORIGIN: Joi.string().default('http://localhost:4002').description('CORS allowed origin'),

  // ============ Admin Credentials (Dev Only) ============
  ADMIN_PASSWORD: Joi.string().min(8).default('Change_Me_123!').description('Default admin password'),
  ADMIN_EMAIL: Joi.string().email().default('admin@example.com').description('Default admin email'),
  ADMIN_PHONE: Joi.string().default('+48000000000').description('Default admin phone'),

  // ============ Cookie & Session Configuration ============
  COOKIE_SECRET: Joi.string().min(32).required().description('Secret for signing cookies (must be at least 32 chars)'),
  SESSION_SECRET: Joi.string()
    .min(32)
    .required()
    .description('Secret for session encryption (must be at least 32 chars)'),
  SESSION_NAME: Joi.string().default('session_auth').description('Session cookie name'),
  SESSION_DOMAIN: Joi.string()
    .allow('')
    .default('localhost')
    .description('Session cookie domain (empty = scoped to request origin)'),
  SESSION_MAX_AGE: Joi.number().integer().positive().default(86400000).description('Session max age in ms'),
  SESSION_HTTP_ONLY: Joi.string()
    .valid('true', 'false')
    .default('true')
    .description('HttpOnly flag for session cookie'),
  SESSION_SECURE: Joi.string().valid('true', 'false').default('false').description('Secure flag for session cookie'),
  SESSION_FOLDER: Joi.string().default('sessions_dev').description('Session storage folder'),
  SESSION_SAME_SITE: Joi.string()
    .valid('lax', 'strict', 'none')
    .default('lax')
    .description('SameSite attribute for session cookie'),

  // ============ Database Configuration ============
  DATABASE_URL: Joi.string()
    .uri()
    .when('DATABASE_HOST', {
      is: Joi.string().required(),
      then: Joi.string().optional(),
      otherwise: Joi.string().required(),
    })
    .description('PostgreSQL connection URL (or use DATABASE_HOST/USER/PASSWORD)'),
  DATABASE_HOST: Joi.string().default('localhost').description('Database host'),
  DATABASE_PORT: Joi.number().port().default(5432).description('Database port'),
  DATABASE_USER: Joi.string().default('postgres').description('Database username'),
  DATABASE_PASSWORD: Joi.string().default('postgres').description('Database password'),
  DATABASE_DB: Joi.string().default('db_auth').description('Database name'),
  DATABASE_SYNC: Joi.string()
    .valid('true', 'false', '1', '0')
    .default('true')
    .description('Enable database auto-sync (TypeORM synchronize)'),

  // ============ Redis Configuration ============
  REDIS_URL: Joi.string()
    .uri({ scheme: ['redis', 'rediss'] })
    .required()
    .description('Redis connection URL (required for session & cache storage)'),
  REDIS_HOST: Joi.string().default('localhost').description('Redis host'),
  REDIS_PORT: Joi.number().port().default(6379).description('Redis port'),
  REDIS_PASSWORD: Joi.string().default('').description('Redis password'),

  // ============ gRPC Service URLs ============
  DB_GRPC_URL: Joi.string().default('db-service:50051').description('DB gRPC service URL'),
  GATE_GRPC_URL: Joi.string().default('core-service:50053').description('Core/Gate gRPC service URL'),
  NOTIFY_GRPC_URL: Joi.string().default('notify-service:50052').description('Notify gRPC service URL'),

  // ============ Email Configuration (SMTP) ============
  SMTP_HOST: Joi.string().hostname().default('localhost').description('SMTP server host'),
  SMTP_PORT: Joi.number().port().default(587).description('SMTP server port'),
  SMTP_USER: Joi.string().default('').description('SMTP username'),
  SMTP_PASSWORD: Joi.string().default('').description('SMTP password'),
  SMTP_FROM: Joi.string().email().default('noreply@example.com').description('Sender email address'),

  // ============ SMS/Messaging Configuration (Twilio) ============
  TWILO_SID: Joi.string().default('').description('Twilio Account SID'),
  TWILO_TOKEN: Joi.string().default('').description('Twilio Auth Token'),
  TWILO_PHONE: Joi.string()
    .pattern(/^\+\d{1,15}$/)
    .default('+1234567890')
    .description('Twilio phone number for SMS'),

  // ============ Signal Bridge Configuration ============
  SIGNAL_API_URL: Joi.string().uri().default('http://signal-api:8080').description('Signal bridge API URL'),
  SIGNAL_ACCOUNT: Joi.string().default('+48000000000').description('Signal bot account number'),

  // ============ LLM & AI Services ============
  GROQ_API_KEY: Joi.string().default('').description('Groq API key for LLM inference'),
  OPENAI_API_KEY: Joi.string().default('').description('OpenAI API key (not currently used)'),

  // ============ Third-Party Services ============
  POSTMAN_API_KEY: Joi.string().default('').description('Postman API key for collection sync'),
  POSTMAN_COLLECTION_ID: Joi.string().default('').description('Postman collection ID'),

  // ============ Registration Token ============
  REGISTRATION_TOKEN_TTL: Joi.number()
    .integer()
    .positive()
    .default(600)
    .description('Registration verification token TTL in seconds (default: 600 = 10 min)'),

  // ============ Logging & Debugging ============
  DEV_MODE: Joi.string()
    .valid('true', 'false')
    .default('false')
    .description('Development mode (enables extra logging/debugging)'),
  SERVICE_ID: Joi.string().default('unknown-service').description('Service identifier for logging'),
}).unknown(true);

/**
 * Validates environment variables against the schema
 * Throws an error with detailed messages if validation fails
 *
 * @returns validated environment object with proper types
 */
export function validateEnv(config: Record<string, unknown>): ValidatedEnv {
  const result = envValidationSchema.validate(config, {
    abortEarly: false,
    stripUnknown: false,
    allowUnknown: true,
  }) as ValidationResult;

  if (result.error) {
    const errorMessages = result.error.details
      .map((detail) => `  - ${detail.path.join('.')}: ${detail.message}`)
      .join('\n');

    throw new Error(`\n❌ Environment Validation Failed:\n${errorMessages}`);
  }

  return (result.value as ValidatedEnv) || {};
}
