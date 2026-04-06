import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeConfigService } from '../configs/types.config.service';
import { GrpcProxyKey } from './constance';
import { join } from 'path';
import { getGrpcOptions } from './get-proto-files';
import { GrpcConfig } from './config/proxy.config';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: GrpcProxyKey,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: TypeConfigService) => ({
          transport: Transport.GRPC,
          options: {
            ...getGrpcOptions(join(__dirname, '../../../proto')),
            url: configService.get<GrpcConfig>('grpc')?.grpcClientUrl || '0.0.0.0:50051',
            onLoadPackageDefinition: (pkg, server) => {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access
              new (require('@grpc/reflection').ReflectionService)(
                pkg,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              ).addToServer(server);
            },
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
  providers: [
    TypeConfigService,
    {
      provide: TypeConfigService,
      useExisting: ConfigService,
    },
  ],
})
export class ProxyModule {}
