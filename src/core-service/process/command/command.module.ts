import { Module } from '@nestjs/common';
import { CommandProcessor } from './command.processor';
import { GroqService } from '../services/groq.service';
import { LanguageToolService } from 'src/core-service/language-tool/language-tool.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [CommandProcessor, GroqService, LanguageToolService],
})
export class CommandModule {}
