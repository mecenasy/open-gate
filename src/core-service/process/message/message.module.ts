import { Module } from '@nestjs/common';
import { MessageProcessor } from './message-processor';
import { MessageContextService } from '../services/message-context.service';
import { GroqService } from '../services/groq.service';
import { CommandParserService } from '../services/command-parser.service';
import { TenantModule } from '@app/tenant';

@Module({
  imports: [TenantModule],
  providers: [MessageProcessor, MessageContextService, GroqService, CommandParserService],
})
export class MessageModule {}
