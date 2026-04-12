import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { HttpModule } from '@nestjs/axios';
import { NotificationModule } from './notification/notification.module';
import { ProcessModule } from './process/process.module';
import { CommandModule } from './command/command.module';
import { LoggerModule } from '@app/logger';
import { MessageBridgeModule } from './message-bridge/message-bridge.module';
@Module({
  imports: [
    LoggerModule,
    MessageBridgeModule,
    HttpModule,
    CommonModule,
    NotificationModule,
    ProcessModule,
    CommandModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
