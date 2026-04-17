import { registerAs } from '@nestjs/config';

export interface AppConfig {
  port: number | undefined;
  appUrl: string;
  devMode: boolean;
  clientUrl: string;
  adminPassword: string;
  adminEmail: string;
  adminPhone: string;
  registrationTokenTtl: number;
}

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    port: process.env.PORT ? parseInt(process.env.PORT ?? '') : undefined,
    appUrl: process.env.APP_URL || '',
    devMode: process.env.MODE === 'dev',
    clientUrl: process.env.CLIENT_URL || '',
    adminPassword: process.env.ADMIN_PASSWORD || '',
    adminEmail: process.env.ADMIN_EMAIL || '',
    adminPhone: process.env.ADMIN_PHONE || '',
    registrationTokenTtl: process.env.REGISTRATION_TOKEN_TTL ? parseInt(process.env.REGISTRATION_TOKEN_TTL) : 600,
  }),
);
