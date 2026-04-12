import { Process, Processor } from '@nestjs/bull';
import { type Job } from 'bull';
import { QueueMessageData } from '../../common/types/queue-message-data';
import { QueueType } from '@app/redis';
import { NotificationEvent } from 'src/gate-service/notification/events/notification.event';
import { ProcessorBase } from '../processor-base';
import { Command, COMMAND_SERVICE_NAME, CommandServiceClient } from 'src/proto/command';
import { OnModuleInit } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { SofCommandEvent } from 'src/gate-service/command/events/sof-command.event';
import { IdentifyMessageEvent } from '../pre-process/events/identifier-message.event';
import { MessageType } from '../pre-process/types';
import { keys } from 'src/gate-service/message-keys/keys';
import { LanguageToolService } from 'src/gate-service/language-tool/language-tool.service';
import { UserContext } from 'src/gate-service/context/user-context';
import { CommandType } from 'src/gate-service/common/types/command';

@Processor(QueueType.Command)
export class CommandProcessor extends ProcessorBase implements OnModuleInit {
  commandGrpc: CommandServiceClient;

  isCommand = /^\/([^\s]+)/;
  isSimpleCommand = /^\/?([^\s]+)$/;
  constructor(private readonly langService: LanguageToolService) {
    super();
  }

  onModuleInit() {
    super.onModuleInit();
    this.commandGrpc = this.grpcClient.getService<CommandServiceClient>(COMMAND_SERVICE_NAME);
  }

  @Process(QueueType.Command)
  async analyzeCommand(job: Job<QueueMessageData>) {
    const { data, context } = job.data;
    const messageToProcess = data?.content ?? '';

    try {
      const command = await this.getCommand(messageToProcess);
      if (!command) {
        const command = await this.getCommandByMatches(messageToProcess);

        if (command) {
          this.processCommand(messageToProcess, command, context, job);
        }
      } else {
        this.processCommand(messageToProcess, command, context, job);
      }
    } catch (error) {
      this.eventService.emit(new NotificationEvent(context.phone, await this.getMessage(keys.commandProcessorKey)));
      this.logger.error('Error generating speech:', error);
    }
  }

  private processCommand(
    messageToProcess: string,
    command: Omit<Command, 'id' | 'createdAt' | 'updatedAt'>,
    context: UserContext,
    job: Job<QueueMessageData>,
  ) {
    if (this.isSimpleCommand.exec(messageToProcess)) {
      this.eventService.emit(new SofCommandEvent({ command: command.command as CommandType }, context));
    } else {
      this.eventService.emit(new IdentifyMessageEvent(job.data.data, { ...context, messageType: MessageType.Message }));
    }
  }

  async getCommandByMatches(text: string) {
    const matches = await this.langService.check(text);

    if (matches) {
      const command = await lastValueFrom(this.commandGrpc.getCommandFromMatches({ matches }));

      if (!command.status || !command.data) {
        throw new Error('Command not found');
      }

      await this.saveCommandInCache(command.data);

      return command.data;
    }
    throw new Error('Command not found');
  }

  async getCommandFromCache(command: string) {
    const token = await this.cache.getFromCache<string>({
      identifier: `token`,
      prefix: 'commands',
      path: command,
    });

    if (token) {
      return await this.cache.getFromCache<Command>({
        identifier: `data`,
        prefix: 'commands',
        path: token,
      });
    }
  }

  async getCommand(message: string): Promise<Command | null> {
    const commandMatch = this.isCommand.exec(message)?.[1].toLocaleLowerCase();

    if (!commandMatch) {
      throw new Error('Command not found');
    }
    const foundedCommand = await this.getCommandFromCache(commandMatch);

    if (foundedCommand) {
      return foundedCommand;
    }

    const command = await lastValueFrom(this.commandGrpc.getCommand({ name: commandMatch }));

    if (!command.status || !command.data) {
      throw new Error('Command not found');
    }

    await this.saveCommandInCache(command.data);

    return command.data;
  }

  private async saveCommandInCache(command: Command) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { createdAt, updatedAt, id, ...data } = command;
    await this.cache.saveInCache({
      identifier: `data:` + data.command,
      prefix: 'commands',
      data,
      EX: 24 * 60 * 60,
    });
    await this.cache.saveInCache({
      identifier: `token:` + data.command,
      prefix: 'commands',
      path: data.command,
      data: data.command,
      EX: 24 * 60 * 60,
    });
    await this.cache.saveInCache({
      identifier: `token:` + data.name,
      prefix: 'commands',
      data: data.command,
      EX: 24 * 60 * 60,
    });
  }
}
