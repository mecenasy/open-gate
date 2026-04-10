import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SofCommand } from './commands/impl/sof-command';
import { Handler } from '@app/handler';
import { Status } from '../status/status';
import { SOF_COMMAND_KEY } from '../common/decorators/sof-handler.decorator';
import { DiscoveryService } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { CommandType } from '../common/types/command';

@Injectable()
export class SofDispatcher<T> implements OnModuleInit {
  private handlers = new Map<CommandType, Handler<SofCommand<T>, Status>>();
  private logger: Logger;

  constructor(private readonly discoveryService: DiscoveryService) {
    this.logger = new Logger(SofDispatcher.name);
  }

  async dispatch(command: SofCommand<T>) {
    const handler = this.handlers.get(command.type);
    if (!handler) throw new Error(`Missing handler: ${command.type}`);

    return await handler.execute(command);
  }

  register(type: CommandType, handler: Handler<SofCommand<T>, Status>) {
    this.handlers.set(type, handler);
  }

  onModuleInit() {
    const providers = this.discoveryService.getProviders() as Array<InstanceWrapper<Handler<SofCommand<T>, Status>>>;

    providers.forEach((wrapper) => {
      const { instance } = wrapper;
      if (!instance) return;

      const commandType = Reflect.getMetadata(SOF_COMMAND_KEY, instance.constructor) as CommandType;

      if (commandType) {
        this.handlers.set(commandType, instance);
        this.logger.log(`Registered handler for sof command: ${commandType}`);
      }
    });
  }
}
