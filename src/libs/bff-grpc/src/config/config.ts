import { registerAs } from '@nestjs/config';

export interface Config {
  grpcUrl: string;
}

export const config = registerAs(
  'bff-grpc',
  (): Config => ({
    grpcUrl: process.env.BFF_GRPC_URL ?? '',
  }),
);
