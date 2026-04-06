import { registerAs } from '@nestjs/config';

export interface SmtpConfig {
  port: number | undefined;
  host: string;
  password: string;
  user: string;
  from: string;
}

export const smtpConfig = registerAs(
  'smtp',
  (): SmtpConfig => ({
    port: parseInt(process.env.SMTP_PORT ?? '465'),
    host: process.env.SMTP_HOST ?? '',
    password: process.env.SMTP_PASSWORD ?? '',
    user: process.env.SMTP_USER ?? '',
    from: process.env.SMTP_FROM ?? '',
  }),
);
