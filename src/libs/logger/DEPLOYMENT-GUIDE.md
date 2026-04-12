/**

* DEPLOYMENT GUIDE: Global Logger Integration
*
* This guide shows how to integrate the logger's global components
* into each microservice for comprehensive logging coverage.
*
* Components:
* * GlobalExceptionFilter: Catches ALL unhandled exceptions
* * LoggingInterceptor: Tracks request/response lifecycle with timing
* * CorrelationIdMiddleware: Adds tracing IDs for distributed debugging
*
* Implementation time: ~5 minutes per service
 */

// ============================================================================
// STEP 1: BFF SERVICE (main.ts)
// ============================================================================
/*
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter, LoggingInterceptor } from '@app/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;

  // 1. Enable CORS
  app.enableCors();

  // 2. Setup global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // 3. Setup logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  await app.listen(port);
  Logger.log(`BFF Service running on port ${port}`);
}

bootstrap();
*/

// ============================================================================
// STEP 2: CORE SERVICE (main.ts)
// ============================================================================
/*
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter, LoggingInterceptor } from '@app/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.CORE_SERVICE_PORT || 3001;

  // 1. Setup global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // 2. Setup logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  await app.listen(port);
  Logger.log(`Core Service running on port ${port}`);
}

bootstrap();
*/

// ============================================================================
// STEP 3: NOTIFY SERVICE (main.ts)
// ============================================================================
/*
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter, LoggingInterceptor } from '@app/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.NOTIFY_SERVICE_PORT || 3002;

  // 1. Setup global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // 2. Setup logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  await app.listen(port);
  Logger.log(`Notify Service running on port ${port}`);
}

bootstrap();
*/

// ============================================================================
// STEP 4: Adding Correlation ID Middleware (Optional but Recommended)
// ============================================================================
/*
In app.module.ts, add CorrelationIdMiddleware:

import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { CorrelationIdMiddleware } from '@app/logger';

@Module({
  imports: [...],
  controllers: [...],
  providers: [...],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIdMiddleware)
      .forRoutes('*'); // Apply to all routes
  }
}
*/

// ============================================================================
// MIGRATION CHECKLIST
// ============================================================================

/*

✅ COMPLETED:
  [x] Logger library created (src/libs/logger/)
  [x] LoggerModule added to all 3 services
  [x] Type definitions and constants
  [x] Error formatter with intelligent type detection
  [x] CustomLogger service with context tracking
  [x] Global exception filter created
  [x] Logging interceptor created
  [x] Correlation ID middleware created
  [x] 2 console.error calls replaced (notification handler, redis init)

📋 TODO - QUICK WINS (5 mins each):
  [ ] Add GlobalExceptionFilter to bff-service/main.ts (L20)
  [ ] Add LoggingInterceptor to bff-service/main.ts (L22)
  [ ] Add GlobalExceptionFilter to core-service/main.ts (L20)
  [ ] Add LoggingInterceptor to core-service/main.ts (L22)
  [ ] Add GlobalExceptionFilter to notify-service/main.ts (L20)
  [ ] Add LoggingInterceptor to notify-service/main.ts (L22)
  [ ] Add CorrelationIdMiddleware to bff-service/app.module.ts (optional, for tracing)
  [ ] Verify TypeScript compilation: npx tsc --noEmit

📦 TODO - STRATEGIC LOGGING (High-Impact):
  [ ] Add logger to core-service command handlers (23 files)
  [ ] Add logger to bff-service resolvers (5-10 files)
  [ ] Add logger to user/auth services (2 files)
  [ ] Add logger to notification handlers (3 files)
  [ ] Add logger to database service (db-service)

🔍 TODO - OPTIONAL ENHANCEMENTS:
  [ ] Setup health checks with logging
  [ ] Add performance metrics to slow operations
  [ ] Create dashboard for correlation ID tracing
  [ ] Setup log aggregation (ELK stack, DataDog, etc.)
  [ ] Configure log rotation for file outputs

*/

// ============================================================================
// EXAMPLE: Adding Logger to a Service
// ============================================================================

/*

BEFORE
------

import { Injectable } from '@nestjs/common';

@Injectable()
export class MyService {
  async doSomething(data: string): Promise<Result> {
    try {
      // ... business logic
      console.log('Success:', result);
      return result;
    } catch (error) {
      console.error('Failed:', error);
      throw error;
    }
  }
}

AFTER
-----

import { Injectable } from '@nestjs/common';
import { CustomLogger } from '@app/logger';

@Injectable()
export class MyService {
  constructor(private logger: CustomLogger) {
    this.logger.setContext(MyService.name);
  }

  async doSomething(data: string): Promise<Result> {
    this.logger.log('Processing data', { dataSize: data.length });

    try {
      // ... business logic
      
      this.logger.log('Data processed successfully', { resultId: result.id });
      return result;
    } catch (error) {
      this.logger.error('Failed to process data', error, { input: data });
      throw error;
    }
  }
}

*/

// ============================================================================
// EXAMPLE: Adding Logger to a Command Handler
// ============================================================================

/*

BEFORE
------

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateGateCommand } from './create-gate.command';

@CommandHandler(CreateGateCommand)
export class CreateGateCommandHandler implements ICommandHandler<CreateGateCommand> {
  constructor(private gateService: GateService) {}

  async execute(command: CreateGateCommand): Promise<Gate> {
    return this.gateService.create(command.data);
  }
}

AFTER
-----

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { CreateGateCommand } from './create-gate.command';

@CommandHandler(CreateGateCommand)
export class CreateGateCommandHandler implements ICommandHandler<CreateGateCommand> {
  constructor(
    private gateService: GateService,
    private logger: CustomLogger,
  ) {
    this.logger.setContext(CreateGateCommandHandler.name);
  }

  async execute(command: CreateGateCommand): Promise<Gate> {
    this.logger.log('Executing CreateGateCommand', {
      gateId: command.data.id
    });

    try {
      const result = await this.gateService.create(command.data);
      this.logger.log('Gate created successfully', { 
        gateId: result.id 
      });
      return result;
    } catch (error) {
      this.logger.error('Failed to create gate', error, { 
        attemptedGateId: command.data.id 
      });
      throw error;
    }
  }
}

*/

// ============================================================================
// PERFORMANCE OPTIMIZATION: Batch Logging Multiple Files
// ============================================================================

/*

SHELL COMMAND: Find and list all command handlers that need logging

  find src -name "*.handler.ts" | head -20

Then for each file, add:

  1. CustomLogger import from '@app/logger'
  2. Constructor injection
  3. this.logger.setContext(ClassName.name)
  4. this.logger.log() at start of execute()
  5. this.logger.error() in catch blocks

PATTERN for sed/batch replacement:
  sed -i "s/constructor(private logger:/constructor(private logger: CustomLogger, \/\/ injected/" *.handler.ts

*/

// ============================================================================
// TESTING: Verify Logger Works
// ============================================================================

/*

1. Start Docker containers:
   docker compose up

2. Check logger output in service logs:
   docker logs -f bff-gate
   docker logs -f core-service
   docker logs -f notify-service

3. Make a test request:
   curl <http://localhost:3000/api/health>

4. Expected log output:
   [2024-01-15 10:30:45] [INFO] [logging-interceptor] Request started
   [2024-01-15 10:30:45] [DEBUG] [GET /api/health] Request started
   [2024-01-15 10:30:45] [DEBUG] [GET /api/health] Request completed (5ms)

5. Test error logging with invalid request:
   curl <http://localhost:3000/api/non-existent>

6. Expected error log:
   [2024-01-15 10:30:50] [ERROR] [global-exception-filter] HTTP Exception: 404
   Context: { url: '/api/non-existent', method: 'GET', ... }

*/

// ============================================================================
// TROUBLESHOOTING
// ============================================================================

/*

Q: Logger not showing in Docker output?
A: 1. Check service is running: docker compose ps
   2. Check logger.log is writing to stdout (console)
   3. Verify CustomLogger is imported from @app/logger
   4. Check NODE_ENV is not suppressing logs

Q: Correlation IDs not flowing between services?
A: 1. Add CorrelationIdMiddleware to app.module (all services)
   2. Pass x-correlation-id header in service-to-service calls
   3. Use CustomLogger.setCorrelationId() when making gRPC calls

Q: Performance degradation after adding logging?
A: 1. Change log level from DEBUG to INFO in production
   2. Disable LoggingInterceptor for non-critical routes
   3. Add condition: if (!isProduction) this.logger.debug()

Q: Sensitive data appearing in logs?
A: 1. Review logger.constants.ts SENSITIVE_PATTERNS
   2. Add more patterns for your use case
   3. Call logger.error/log with sanitized data

*/
