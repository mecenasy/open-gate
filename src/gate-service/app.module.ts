import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { HttpModule } from '@nestjs/axios';
import { NotificationModule } from './notification/notification.module';
import { ProcessModule } from './process/process.module';
import { CommandModule } from './command/command.module';

@Module({
  imports: [HttpModule, CommonModule, NotificationModule, ProcessModule, CommandModule],
  controllers: [AppController],
  providers: [
    AppService,
    // SignalBridgeService,
  ],
})
export class AppModule {}
