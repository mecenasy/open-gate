import { registerAs } from '@nestjs/config';

export interface GrpcConfig {
  grpcUrl: string;
  grpcPort: number;
  grpcClientUrl: string;
}

export const grpcConfig = registerAs(
  'grpc',
  (): GrpcConfig => ({
    grpcUrl: process.env.GRPC_URL ?? '',
    grpcPort: parseInt(process.env.GRPC_PORT ?? '50051', 10),
    grpcClientUrl: process.env.GRPC_CLIENT_URL ?? '',
  }),
);
