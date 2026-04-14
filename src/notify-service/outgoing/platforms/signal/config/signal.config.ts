import { registerAs } from '@nestjs/config';

export interface SignalConfig {
  apiUrl: string;
  account: string;
  tenantId: string;
}

export const signalConfig = registerAs(
  'signal',
  (): SignalConfig => ({
    apiUrl: process.env.SIGNAL_API_URL ?? 'http://signal_bridge:8080',
    account: process.env.SIGNAL_ACCOUNT ?? '',
    tenantId: process.env.SIGNAL_TENANT_ID ?? '',
  }),
);
