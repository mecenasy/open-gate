import { AsyncLocalStorage } from 'async_hooks';
import { Injectable } from '@nestjs/common';
import { ICorrelationService } from '@app/handler';

export { CORRELATION_SERVICE_TOKEN } from '@app/handler';

const correlationStorage = new AsyncLocalStorage<string>();

@Injectable()
export class CorrelationService implements ICorrelationService {
  run(correlationId: string, fn: () => void): void {
    correlationStorage.run(correlationId, fn);
  }

  getId(): string | undefined {
    return correlationStorage.getStore();
  }
}
