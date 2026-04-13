import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { CommonModule } from './common/common.module';
import { CsrfModule } from './csrf/csrf.module';
import { CsrfInterceptor } from './csrf/csrf.interceptor';
import { NotifyModule } from './notify/notify.module';
import { AuthModule } from './auth/auth.module';
import { PromptsModule } from './prompts/prompts.module';
import { CommandModule } from './command/command.module';
import { CoreConfigModule } from './core-config/core-config.module';
import { LoggerModule } from '@app/logger';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute for general endpoints
      },
      {
        name: 'auth',
        ttl: 60000, // 1 minute
        limit: 5, // 5 requests per minute for auth endpoints
      },
      {
        name: 'public',
        ttl: 60000, // 1 minute
        limit: 30, // 30 requests per minute for public endpoints
      },
    ]),
    LoggerModule,
    UserModule,
    CommonModule,
    AuthModule,
    NotifyModule,
    PromptsModule,
    CommandModule,
    CoreConfigModule,
    CsrfModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CsrfInterceptor,
    },
  ],
})
export class AppModule {}
