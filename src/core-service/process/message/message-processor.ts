import { Process, Processor } from '@nestjs/bull';
import { type Job } from 'bull';
import { QueueMessageData } from '../../common/types/queue-message-data';
import { SofCommandEvent } from '../../command/events/sof-command.event';
import { QueueType } from '@app/redis';
import { MessageContextService } from '../services/message-context.service';
import { CommandParserService } from '../services/command-parser.service';
import { NotificationEvent } from 'src/core-service/notification/events/notification.event';
import { ProcessorBase } from '../processor-base';
import { keys } from 'src/core-service/message-keys/keys';

@Processor(QueueType.Message)
export class MessageProcessor extends ProcessorBase {
  constructor(
    private readonly messageContextService: MessageContextService,
    private readonly commandParserService: CommandParserService,
  ) {
    super();
  }

  @Process(QueueType.Message)
  async analyzeMessage(job: Job<QueueMessageData>) {
    const { context, data } = job.data;

    this.logger.debug(`Analyzing message ${context.phone}`);

    try {
      const messages = await this.messageContextService.getOrCreateConversation({ phone: context.phone, type: context.type });

      messages.push({
        role: 'user',
        content: data.content ?? '',
      });

      const chatCompletion = await this.groqService.createChatCompletion(messages);

      messages.push({
        role: 'assistant',
        content: chatCompletion,
      });

      await this.messageContextService.saveConversation({ phone: context.phone, type: context.type }, messages);

      const command = this.commandParserService.parseCommand(chatCompletion);

      const lockKey = `lock:${command.command}.${command.data}`;

      const isLocked = await this.cache.getFromCache({ identifier: lockKey, prefix: 'command' });

      if (isLocked) {
        this.eventService.emit(
          new NotificationEvent({
            phone: context.phone,
            message: await this.getMessage('message-command-locked'),
            platform: data.platform,
          }),
        );
        return;
      }

      await this.cache.saveInCache<boolean>({
        identifier: lockKey,
        prefix: 'command',
        data: true,
        EX: 10,
        NX: true,
      });

      this.logger.debug(`Command for ${context.phone}: ${JSON.stringify(command)}`);

      this.eventService.emit(new SofCommandEvent<number>(command, context, data.platform));
    } catch (error) {
      this.eventService.emit(
        new NotificationEvent({
          phone: context.phone,
          message: await this.getMessage(keys.messageProcessorKey),
          platform: data.platform,
        }),
      );
      this.logger.error(`Error processing message for ${context.phone}:`, error);
    }
  }
}
