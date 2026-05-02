/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Global, Module } from '@nestjs/common';
import { getGrpcOptions } from 'src/utils/get-proto-files';
import { BffGrpcKey } from './bff-grpc-key';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeConfigService } from './config/types.config.service';
import { Config } from './config/config';
import { join } from 'path';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: BffGrpcKey,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: TypeConfigService) => ({
          transport: Transport.GRPC,
          options: {
            ...getGrpcOptions(join(__dirname, '../../../proto')),
            url: configService.get<Config>('bff-grpc')?.grpcUrl,
            onLoadPackageDefinition: (pkg, server) => {
              new (require('@grpc/reflection').ReflectionService)(pkg).addToServer(server);
            },
          },
        }),
      },
    ]),
  ],
  providers: [
    {
      provide: TypeConfigService,
      useExisting: ConfigService,
    },
  ],
  exports: [ClientsModule, TypeConfigService],
})
export class BffGrpcModule {}
