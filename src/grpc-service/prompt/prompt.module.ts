import { Module } from '@nestjs/common';
import { PromptGrpcController } from './prompt.controller';
import { PromptService } from './prompt.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prompt } from './entity/prompt.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Prompt])],
  controllers: [PromptGrpcController],
  providers: [PromptService],
  exports: [PromptService],
})
export class PromptModule {}
