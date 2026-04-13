import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SofCommand } from './commands/impl/sof-command';
import { Handler } from '@app/handler';
import { Status } from '../status/status';
import { SOF_COMMAND_KEY } from '../common/decorators/sof-handler.decorator';
import { DiscoveryService } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { CommandType } from '../common/types/command';
import { TenantCustomizationService } from '../common/customization/tenant-customization.service';

@Injectable()
export class SofDispatcher<T> implements OnModuleInit {
  private handlers = new Map<CommandType, Handler<SofCommand<T>, Status>>();
  private logger: Logger;

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly customizationService: TenantCustomizationService,
  ) {
    this.logger = new Logger(SofDispatcher.name);
  }

  async dispatch(command: SofCommand<T>) {
    const handler = this.handlers.get(command.type);
    if (!handler) throw new Error(`Missing handler: ${command.type}`);

    const customization = await this.customizationService.getForCurrentTenant();
    const timeout = customization.commands.timeout;

    return await Promise.race([
      handler.execute(command),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Command timeout after ${timeout}ms: ${command.type}`)), timeout),
      ),
    ]);
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
