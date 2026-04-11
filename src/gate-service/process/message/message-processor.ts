import { Process, Processor } from '@nestjs/bull';
import { type Job } from 'bull';
import { QueueMessageData } from '../../common/types/queue-message-data';
import { SofCommandEvent } from '../../command/events/sof-command.event';
import { QueueType } from '@app/redis';
import { MessageContextService } from '../services/message-context.service';
import { CommandParserService } from '../services/command-parser.service';
import { NotificationEvent } from 'src/gate-service/notification/events/notification.event';
import { ProcessorBase } from '../processor-base';
import { keys } from 'src/gate-service/message-keys/keys';

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
    let userMessage: string;
    const { context } = job.data;

    if (job.data.data) {
      const {
        data: { dataMessage },
      } = job.data;
      userMessage = dataMessage?.message ?? '';
    } else {
      userMessage = job.data?.message ?? '';
    }

    this.logger.debug(`Analyzing message ${context.phone}`);

    try {
      const messages = await this.messageContextService.getOrCreateConversation(context);

      messages.push({
        role: 'user',
        content: userMessage ?? '',
      });

      const chatCompletion = await this.groqService.createChatCompletion(messages);

      messages.push({
        role: 'assistant',
        content: chatCompletion,
      });

      await this.messageContextService.saveConversation(context, messages);

      const command = this.commandParserService.parseCommand(chatCompletion);
      const lockKey = `lock:${command.command}.${command.data}`;

      const isLocked = await this.cache.getFromCache({ identifier: lockKey, prefix: 'command' });

      if (isLocked) {
        this.eventService.emit(new NotificationEvent(context.phone, await this.getMessage('message-command-locked')));
        return;
      }

      await this.cache.saveInCache<boolean>({
        identifier: lockKey,
        prefix: 'command',
        data: true,
        EX: 120,
        NX: true,
      });

      this.logger.debug(`Command for ${context.phone}: ${JSON.stringify(command)}`);

      this.eventService.emit(new SofCommandEvent<number>(command, context));
    } catch (error) {
      this.eventService.emit(new NotificationEvent(context.phone, await this.getMessage(keys.messageProcessorKey)));
      this.logger.error(`Error processing message for ${context.phone}:`, error);
    }
  }
}
