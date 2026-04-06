import { Process, Processor } from '@nestjs/bull';
import { type Job } from 'bull';
import { QueueMessageData } from '../../common/types/queue-message-data';
import { Logger } from '@nestjs/common';
import { EventService } from '../../common/event/event.service';
import { SofCommandEvent } from '../../command/events/sof-command.event';
import { QueueType } from 'src/gate-service/queue/types';
import { OnModuleInit } from '@nestjs/common';
import { MessageContextService } from '../services/message-context.service';
import { GroqService } from '../services/groq.service';
import { CommandParserService } from '../services/command-parser.service';
import { NotificationEvent } from 'src/gate-service/notification/events/notification.event';

@Processor(QueueType.Message)
export class MessageProcessor implements OnModuleInit {
  logger: Logger;

  constructor(
    private readonly messageContextService: MessageContextService,
    private readonly commandParserService: CommandParserService,
    private readonly groqService: GroqService,
    private readonly eventService: EventService,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  onModuleInit() {
    this.logger.log('MessageProcessor initialized');
  }

  @Process(QueueType.Message)
  async analizeMessage(job: Job<QueueMessageData>) {
    const {
      data: { dataMessage },
      context,
    } = job.data;
    const userMessage = dataMessage?.message;

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

      this.eventService.emit(new SofCommandEvent<number>(command, context));
    } catch (error) {
      this.eventService.emit(
        new NotificationEvent(
          context.phone,
          // TOTO: komunikat z bazy
          'Przepraszam, łapie zadyszkę, proszę wyslij komendę zamiast wiadomości. jezeli nie wiesz jaką, mogę ci wysłać samouczka jesli wyslesz mi słowo pomoc lub help',
        ),
      );
      this.logger.error(`Error processing message for ${context.phone}:`, error);
    }
  }
}
