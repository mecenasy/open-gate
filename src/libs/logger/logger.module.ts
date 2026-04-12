/**
 * Logger Module
 * Provides CustomLogger as a global provider for dependency injection
 */

import { Global, Module } from '@nestjs/common';
import { CustomLogger } from './custom-logger.service';

@Global()
@Module({
  providers: [
    {
      provide: 'LOGGER',
      useValue: new CustomLogger(),
    },
    CustomLogger,
  ],
  exports: [CustomLogger, 'LOGGER'],
})
export class LoggerModule {}
