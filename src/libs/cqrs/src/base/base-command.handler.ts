import { ICommand } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';

export abstract class BaseCommandHandler<TCommand extends ICommand, TResult = void> {
  protected readonly logger: CustomLogger;

  constructor(logger: CustomLogger) {
    this.logger = logger;
    this.logger.setContext(this.constructor.name);
  }

  protected run<T>(label: string, fn: () => Promise<T>, meta?: Record<string, unknown>): Promise<T> {
    this.logger.log(`Executing ${label}`, meta);
    return fn().catch((error: unknown) => {
      this.logger.error(`Error in ${label}`, error, meta);
      throw error;
    });
  }

  abstract execute(command: TCommand): Promise<TResult>;
}
