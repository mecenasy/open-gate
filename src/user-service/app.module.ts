import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { HttpModule } from '@nestjs/axios';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CsrfInterceptor } from './common/interceptors/csrf.interceptor';
import { QueueModule } from './queue/queue.module';
import { NotificationModule } from './notification/notification.module';
import { ProcessModule } from './process/process.module';
import { UserModule } from './user/user.module';
import { CommandModule } from './command/command.module';

@Module({
  imports: [HttpModule, CommonModule, QueueModule, NotificationModule, ProcessModule, UserModule, CommandModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CsrfInterceptor,
    },
    // SignalBridgeService,
  ],
})
export class AppModule {}
