/**

* COMMAND HANDLER LOGGING TEMPLATE
*
* Use this as a template for adding logger to all command handlers.
* This shows the exact pattern to follow for consistent logging.
 */

// ================================================================
// BEFORE: Original Handler (Without Logger)
// ================================================================

/*

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SomeEntity } from '../entities/some.entity';
import { SomeService } from '../services/some.service';
import { CreateSomeCommand } from './create-some.command';

@CommandHandler(CreateSomeCommand)
export class CreateSomeCommandHandler implements ICommandHandler<CreateSomeCommand, SomeEntity> {
  constructor(private readonly someService: SomeService) {}

  async execute(command: CreateSomeCommand): Promise<SomeEntity> {
    return this.someService.create(command.data);
  }
}

*/

// ================================================================
// AFTER: Handler With Logger (Use This Pattern)
// ================================================================

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { SomeEntity } from '../entities/some.entity';
import { SomeService } from '../services/some.service';
import { CreateSomeCommand } from './create-some.command';

@CommandHandler(CreateSomeCommand)
export class CreateSomeCommandHandler implements ICommandHandler<CreateSomeCommand, SomeEntity> {
  constructor(
    private readonly someService: SomeService,
    private readonly logger: CustomLogger,
  ) {
    // Set context for this handler - appears in all logs from here
    this.logger.setContext(CreateSomeCommandHandler.name);
  }

  async execute(command: CreateSomeCommand): Promise<SomeEntity> {
    // Log the start of command processing
    this.logger.log('Executing command', {
      commandType: CreateSomeCommand.name,
      dataId: command.data.id,
    });

    try {
      // Execute the actual business logic
      const result = await this.someService.create(command.data);

      // Log successful completion
      this.logger.log('Command executed successfully', {
        commandType: CreateSomeCommand.name,
        resultId: result.id,
        duration: 'via LoggingInterceptor',
      });

      return result;
    } catch (error) {
      // Log any errors that occur
      this.logger.error('Failed to execute command', error, {
        commandType: CreateSomeCommand.name,
        commandData: command.data,
      });

      // Re-throw so error handling continues
      throw error;
    }
  }
}

// ================================================================
// VARIATIONS BY COMMAND TYPE
// ================================================================

// VARIATION 1: Query Handler (Similar to Command)
/*
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { GetSomeByIdQuery } from './get-some-by-id.query';

@QueryHandler(GetSomeByIdQuery)
export class GetSomeByIdQueryHandler implements IQueryHandler<GetSomeByIdQuery> {
  constructor(
    private readonly someService: SomeService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(GetSomeByIdQueryHandler.name);
  }

  async execute(query: GetSomeByIdQuery): Promise<SomeEntity> {
    this.logger.debug('Executing query', { queryType: GetSomeByIdQuery.name, id: query.id });

    try {
      const result = await this.someService.getById(query.id);
      return result;
    } catch (error) {
      this.logger.error('Query failed', error, { queryId: query.id });
      throw error;
    }
  }
}
*/

// VARIATION 2: Event Handler (For Observability)
/*
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { SomeEventCreatedEvent } from './some-event-created.event';

@EventsHandler(SomeEventCreatedEvent)
export class SomeEventCreatedHandler implements IEventHandler<SomeEventCreatedEvent> {
  constructor(
    private readonly someService: SomeService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(SomeEventCreatedHandler.name);
  }

  async handle(event: SomeEventCreatedEvent): Promise<void> {
    this.logger.log('Processing event', {
      eventType: SomeEventCreatedEvent.name,
      aggregateId: event.aggregateId,
    });

    try {
      await this.someService.processEvent(event);
      this.logger.log('Event processed successfully', {
        eventType: SomeEventCreatedEvent.name,
      });
    } catch (error) {
      this.logger.error('Failed to process event', error, {
        eventType: SomeEventCreatedEvent.name,
        aggregateId: event.aggregateId,
      });
      throw error;
    }
  }
}
*/

// ================================================================
// SPECIAL CASES & PATTERNS
// ================================================================

// CASE 1: Handler with Repository (Include Data Operation Logging)
/*
@CommandHandler(UpdateSomeCommand)
export class UpdateSomeCommandHandler implements ICommandHandler<UpdateSomeCommand> {
  constructor(
    private readonly someRepository: Repository<SomeEntity>,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(UpdateSomeCommandHandler.name);
  }

  async execute(command: UpdateSomeCommand): Promise<SomeEntity> {
    this.logger.log('Updating entity', { entityId: command.data.id });

    try {
      // Log data access
      const existing = await this.someRepository.findOne(command.data.id);
      if (!existing) {
        this.logger.warn('Entity not found', { entityId: command.data.id });
        throw new NotFoundException();
      }

      // Log update
      const updated = await this.someRepository.save({
        ...existing,
        ...command.data,
      });

      this.logger.log('Entity updated', { entityId: updated.id });
      return updated;
    } catch (error) {
      this.logger.error('Failed to update entity', error, {
        entityId: command.data.id,
      });
      throw error;
    }
  }
}
*/

// CASE 2: Handler with External Service Call (Track Performance)
/*
@CommandHandler(SendMessageCommand)
export class SendMessageCommandHandler implements ICommandHandler<SendMessageCommand> {
  constructor(
    private readonly externalService: ExternalService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(SendMessageCommandHandler.name);
  }

  async execute(command: SendMessageCommand): Promise<void> {
    this.logger.log('Sending message to external service', {
      recipientId: command.message.recipientId,
      messageType: command.message.type,
    });

    const startTime = Date.now();
    try {
      await this.externalService.send(command.message);
      const duration = Date.now() - startTime;

      this.logger.log('Message sent successfully', {
        recipientId: command.message.recipientId,
        duration: `${duration}ms`,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Failed to send message', error, {
        recipientId: command.message.recipientId,
        duration: `${duration}ms`,
      });
      throw error;
    }
  }
}
*/

// CASE 3: Handler with Conditional Logic (Log Branches)
/*
@CommandHandler(ProcessGateCommand)
export class ProcessGateCommandHandler implements ICommandHandler<ProcessGateCommand> {
  constructor(
    private readonly gateService: GateService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(ProcessGateCommandHandler.name);
  }

  async execute(command: ProcessGateCommand): Promise<void> {
    this.logger.log('Processing gate command', {
      gateId: command.gateId,
      action: command.action,
    });

    try {
      if (command.action === 'open') {
        this.logger.debug('Opening gate', { gateId: command.gateId });
        await this.gateService.open(command.gateId);
      } else if (command.action === 'close') {
        this.logger.debug('Closing gate', { gateId: command.gateId });
        await this.gateService.close(command.gateId);
      } else {
        this.logger.warn('Unknown gate action', {
          gateId: command.gateId,
          action: command.action,
        });
        throw new BadRequestException(`Unknown action: ${command.action}`);
      }

      this.logger.log('Gate command processed', { gateId: command.gateId });
    } catch (error) {
      this.logger.error('Failed to process gate command', error, {
        gateId: command.gateId,
        action: command.action,
      });
      throw error;
    }
  }
}
*/

// ================================================================
// LOGGING LEVELS REFERENCE
// ================================================================

/*

this.logger.log()      → INFO level - Normal operations, successful actions
this.logger.error()    → ERROR level - Failures, exceptions, errors to investigate
this.logger.warn()     → WARN level - Unusual conditions, potential issues
this.logger.debug()    → DEBUG level - Detailed information for developers
this.logger.verbose()  → VERBOSE level - Very detailed information (rarely needed)

When to use each:

1. logger.log() - Use for:
   * Command execution started
   * Command completed successfully
   * Important business events
   * State changes

2. logger.error() - Use for:
   * Exceptions and errors
   * Failed operations
   * Invalid data conditions
   * System errors

3. logger.warn() - Use for:
   * Unusual conditions
   * Deprecated operations
   * Performance concerns
   * Recoverable errors

4. logger.debug() - Use for:
   * Internal decision points
   * Conditional branches taken
   * Value transformations
   * Performance metrics

*/

// ================================================================
// FIND & REPLACE TEMPLATE
// ================================================================

/*

Use this shell script to add logger to all handlers faster:

# !/bin/bash

# For each handler file, add these changes

# 1. Add import after other imports

sed -i "1,/^import/a import { CustomLogger } from '@app/logger';" *.handler.ts

# 2. Add logger to constructor

sed -i "s/constructor(private readonly/constructor(private readonly logger: CustomLogger,\n    private readonly/" *.handler.ts

# 3. Add setContext in constructor

sed -i "/constructor(/a \ \ \ \ this.logger.setContext(\ \ \ \ CustomLogger.name)" *.handler.ts

# 4. Add logger.log at execute start

sed -i "/async execute/a \ \ \ \ this.logger.log('Executing command', { commandType: execute.name });" *.handler.ts

# 5. Wrap in try-catch with logger.error

# This needs manual review - too complex for sed

*/

// ================================================================
// BATCH UPDATE STRATEGY
// ================================================================

/*

For updating multiple handlers at once:

1. Per-Service Approach (Recommended):
   a. Update handlers in specific service first
   b. Test that service
   c. Move to next service

   Order:
   1. src/core-service/command/**/*.handler.ts (23 files)
   2. src/bff-service/command/**/*.handler.ts (12 files)
   3. src/db-service/command/**/*.handler.ts (if any)

2. Find Target Files:
   find src -name "*.handler.ts" | wc -l
   find src -name "*.handler.ts" | sort

3. Update One-By-One:
   * Copy template above
   * Adjust for specific handler
   * Test compilation: npx tsc --noEmit
   * Commit: git add && git commit

4. Verify All:
   grep -r "this.logger.setContext" src --include="*.handler.ts" | wc -l
   Should match number of handlers

*/

// ================================================================
// TESTING: Verify Logger Works in Handler
// ================================================================

/*

After adding logger to a handler:

1. Build: npm run build
2. Test manually:
   * Make request that triggers handler
   * Check service logs
   * Verify: "Executing command" appears in logs
   * Verify no TypeScript errors

3. Sample test request (if exposed via API):
   curl -X POST <http://localhost:3000/api/create-something> \
     -H "Content-Type: application/json" \
     -d '{"data":true}'

4. Check Docker logs:
   docker logs bff-gate | grep "Executing command"

   # Should see: "[INFO] [handler-name] Executing command..."

*/

// ================================================================
// SUMMARY: 3-STEP PATTERN
// ================================================================

/*

Every command handler should follow this 3-step pattern:

STEP 1: Add imports
   import { CustomLogger } from '@app/logger';

STEP 2: Inject logger in constructor
   constructor(
     private readonly someDependency: SomeDependency,
     private readonly logger: CustomLogger,  // ← ADD THIS
   ) {
     this.logger.setContext(ClassName.name);  // ← ADD THIS
   }

STEP 3: Wrap execute in try/catch with logging
   async execute(command: SomeCommand): Promise<Result> {
     this.logger.log('Executing command', { ... });  // ← START
     try {
       const result = await this.someService.execute(command);
       this.logger.log('Command succeeded', { ... });  // ← SUCCESS
       return result;
     } catch (error) {
       this.logger.error('Command failed', error, { ... });  // ← ERROR
       throw error;
     }
   }

That's it! Follow this pattern for consistent, best-practice logging.

*/
