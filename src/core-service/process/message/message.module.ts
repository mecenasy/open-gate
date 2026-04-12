import { Module } from '@nestjs/common';
import { MessageProcessor } from './message-processor';
import { MessageContextService } from '../services/message-context.service';
import { GroqService } from '../services/groq.service';
import { CommandParserService } from '../services/command-parser.service';

@Module({
  providers: [MessageProcessor, MessageContextService, GroqService, CommandParserService],
})
export class MessageModule {}
