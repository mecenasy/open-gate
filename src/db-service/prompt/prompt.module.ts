import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { PromptGrpcController } from './prompt.controller';
import { PromptService } from './prompt.service';
import { Prompt } from './entity/prompt.entity';
import { promptCommandHandlers } from './commands/handlers';
import { promptQueryHandlers } from './queries/handlers';

@Module({
  imports: [TypeOrmModule.forFeature([Prompt]), CqrsModule],
  controllers: [PromptGrpcController],
  providers: [PromptService, ...promptCommandHandlers, ...promptQueryHandlers],
  exports: [PromptService],
})
export class PromptModule {}
