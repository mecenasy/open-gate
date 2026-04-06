import { registerAs } from '@nestjs/config';

export interface SessionConfig {
  cookieSecret: string;
  allowedOrigin: string;
  sessionSecret: string;
  sessionName: string;
  sessionDomain: string;
  sessionMaxAge: number;
  sessionHttpOnly: boolean;
  sessionSecure: boolean;
  sessionFolder: string;
  sessionSameSite: 'lax' | 'strict' | 'none';
}

export const sessionConfig = registerAs(
  'session',
  (): SessionConfig => ({
    cookieSecret: process.env.COOKIE_SECRET ?? '',
    allowedOrigin: process.env.ALLOWED_ORIGIN ?? '',
    sessionSecret: process.env.SESSION_SECRET ?? '',
    sessionName: process.env.SESSION_NAME ?? '',
    sessionDomain: process.env.SESSION_DOMAIN ?? '',
    sessionMaxAge: Number(process.env.SESSION_MAX_AGE ?? 60000),
    sessionHttpOnly: process.env.SESSION_HTTP_ONLY === 'true',
    sessionSecure: process.env.SESSION_SECURE === 'true',
    sessionFolder: process.env.SESSION_FOLDER ?? '',
    sessionSameSite: process.env.SESSION_SAME_SITE as 'lax' | 'strict' | 'none',
  }),
);
