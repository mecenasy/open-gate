import { registerAs } from '@nestjs/config';

export interface Config {
  grpcUrl: string;
}

export const config = registerAs(
  'grpc',
  (): Config => ({
    grpcUrl: process.env.DB_GRPC_URL ?? '',
  }),
);
