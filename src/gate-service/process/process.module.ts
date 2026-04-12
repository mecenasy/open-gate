import { Module } from '@nestjs/common';
import { MessageModule } from './message/message.module';
import { AudioModule } from './audio/audio.module';
import { CommandModule } from './command/command.module';
import { SignalModule } from './pre-process/signal.module';
import { AttachmentsProcessor } from './pre-process/attachment.procesor';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule, MessageModule, AudioModule, CommandModule, SignalModule],
  providers: [AttachmentsProcessor],
})
export class ProcessModule {}
