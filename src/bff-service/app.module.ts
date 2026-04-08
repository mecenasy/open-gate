import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
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
import { ConfigModule } from './config/config.module';

@Module({
  imports: [
    UserModule,
    CommonModule,
    AuthModule,
    NotifyModule,
    PromptsModule,
    CommandModule,
    ConfigModule,
    //  CsrfModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: CsrfInterceptor,
    // },
  ],
})
export class AppModule {}
