import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { TenantContext } from './tenant.types.js';

@Injectable()
export class TenantService {
  private readonly storage = new AsyncLocalStorage<TenantContext>();

  getContext(): TenantContext | undefined {
    return this.storage.getStore();
  }

  getContextOrThrow(): TenantContext {
    const context = this.storage.getStore();
    if (!context) {
      throw new UnauthorizedException('Tenant context not available');
    }
    return context;
  }

  runInContext<T>(context: TenantContext, fn: () => T): T {
    return this.storage.run(context, fn);
  }
}
