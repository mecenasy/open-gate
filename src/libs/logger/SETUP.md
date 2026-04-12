# Logger Setup Guide for Each Service

This guide shows how to set up and use the custom logger in each of the four microservices.

## Overview

The logger should be configured in each service's `main.ts` and `app.module.ts`. Follow the patterns below for:

1. **BFF Service** (GraphQL gateway port 3000)
2. **Core Service** (Business logic port 3001)
3. **Notify Service** (External notifications port 3002)
4. **DB Service** (Database migrations)

## 1. BFF Service Setup

### app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { LoggerModule } from '@app/logger';
import { GraphQLModule } from '@nestjs/graphql';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    LoggerModule,
    GraphQLModule.forRoot({
      // ... config
    }),
    // ... other modules
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import { CustomLogger } from '@app/logger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new CustomLogger({ 
      serviceId: 'bff-service',
      environment: process.env.NODE_ENV,
    }),
  });

  // Apply middleware for correlation IDs
  app.use((req: any, res: any, next: any) => {
    const correlationId = req.headers['x-correlation-id'] || require('uuid').v4();
    req.context = { correlationId };
    res.setHeader('x-correlation-id', correlationId);
    next();
  });

  await app.listen(3000);
  console.log('BFF Service running on http://localhost:3000');
}

bootstrap();
```

### Usage in Resolvers

```typescript
import { Resolver, Query, Mutation, Context } from '@nestjs/graphql';
import { CustomLogger } from '@app/logger';

@Resolver()
export class UserResolver {
  constructor(
    private userService: UserService,
    private logger: CustomLogger,
  ) {
    this.logger.setContext(UserResolver.name);
  }

  @Query(() => User, { nullable: true })
  async user(
    @Args('id') id: number,
    @Context() context: any,
  ): Promise<User> {
    this.logger
      .setCorrelationId(context.correlationId)
      .setUserId(context.user?.id);

    this.logger.log('User query requested', { requestedId: id });

    try {
      const user = await this.userService.getUser(id);
      this.logger.log('User query completed', { userId: user.id });
      return user;
    } catch (error) {
      this.logger.error('User query failed', error);
      throw new GraphQLError(error.message);
    }
  }
}
```

## 2. Core Service Setup

### app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { LoggerModule } from '@app/logger';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    LoggerModule,
    CqrsModule,
    TypeOrmModule.forRoot({
      // ... config
    }),
    // ... other modules
  ],
})
export class AppModule {}
```

### main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { CustomLogger } from '@app/logger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new CustomLogger({ 
    serviceId: 'core-service',
    environment: process.env.NODE_ENV,
  });

  const app = await NestFactory.create(AppModule, { logger });

  // gRPC microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'core',
      protoPath: 'proto/core.proto',
      url: 'localhost:50051',
    },
  });

  logger.log('Core Service starting...');
  await app.startAllMicroservices();
  logger.log('Core Service running on :50051');
}

bootstrap();
```

### Usage in Command Handlers

```typescript
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';

export class CreateUserCommand {
  constructor(public data: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private userRepository: UserRepository,
    private logger: CustomLogger,
  ) {
    this.logger.setContext(CreateUserCommandHandler.name);
  }

  async execute(command: CreateUserCommand): Promise<User> {
    this.logger.log('CreateUserCommand received', { email: command.data.email });

    try {
      // Check duplicate
      const existing = await this.userRepository.findByEmail(command.data.email);
      if (existing) {
        this.logger.warn('Duplicate user creation attempt', {
          email: command.data.email,
          existingId: existing.id,
        });
        throw new ConflictException('User already exists');
      }

      // Create user
      const user = await this.userRepository.save(command.data);
      this.logger.log('User created successfully', { userId: user.id });

      return user;
    } catch (error) {
      this.logger.error('CreateUserCommand failed', error);
      throw error;
    }
  }
}
```

### Usage in Repositories

```typescript
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CustomLogger } from '@app/logger';
import { User } from './entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    private repository: Repository<User>,
    private logger: CustomLogger,
  ) {
    this.logger.setContext(UserRepository.name);
  }

  async findById(id: number): Promise<User> {
    const start = Date.now();
    const query = `SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL`;

    try {
      const user = await this.repository.findOne({ where: { id } });
      const duration = Date.now() - start;

      this.logger.logDbQuery(query, duration);
      return user;
    } catch (error) {
      const duration = Date.now() - start;
      this.logger.error('Database query failed', error, { table: 'users', duration });
      throw error;
    }
  }

  async save(user: User): Promise<User> {
    const start = Date.now();

    try {
      const saved = await this.repository.save(user);
      const duration = Date.now() - start;

      this.logger.logDbQuery('INSERT INTO users...', duration);
      return saved;
    } catch (error) {
      const duration = Date.now() - start;

      if (error.code === 'ER_DUP_ENTRY') {
        this.logger.warn('Duplicate entry in users table', { email: user.email });
      } else {
        this.logger.error('Failed to save user', error, { duration });
      }

      throw error;
    }
  }
}
```

## 3. Notify Service Setup

### app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { LoggerModule } from '@app/logger';
import { MailerModule } from '@nestjs-modules/mailer';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    LoggerModule,
    MailerModule.forRoot({
      // ... SMTP config
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
      },
    }),
    // ... other modules
  ],
})
export class AppModule {}
```

### main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { CustomLogger } from '@app/logger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new CustomLogger({ 
    serviceId: 'notify-service',
    environment: process.env.NODE_ENV,
  });

  const app = await NestFactory.create(AppModule, { logger });

  // gRPC microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'notify',
      protoPath: 'proto/notify.proto',
      url: 'localhost:50052',
    },
  });

  logger.log('Notify Service starting...');
  await app.startAllMicroservices();
  logger.log('Notify Service running on :50052');
}

bootstrap();
```

### Usage in Services

```typescript
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { CustomLogger } from '@app/logger';

@Injectable()
export class EmailService {
  constructor(
    private mailer: MailerService,
    private logger: CustomLogger,
  ) {
    this.logger.setContext(EmailService.name);
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const start = Date.now();
    const messageId = require('uuid').v4();

    this.logger.log('Sending verification email', { to, messageId });

    try {
      await this.mailer.sendMail({
        to,
        subject: 'Verify your email',
        template: 'verification',
        context: { token },
      });

      const duration = Date.now() - start;
      this.logger.logApiCall('MAIL', 'sendMail', 200, duration, { messageId });
    } catch (error) {
      const duration = Date.now() - start;

      if (error.message.includes('ECONNREFUSED')) {
        this.logger.error(
          'SMTP connection refused',
          error,
          { smtpHost: process.env.SMTP_HOST, duration }
        );
      } else if (error.message.includes('Invalid email')) {
        this.logger.warn('Invalid email address', { to, messageId });
      } else {
        this.logger.error('Email sending failed', error, { to, messageId, duration });
      }

      throw error;
    }
  }

  async sendSmsNotification(phoneNumber: string, message: string): Promise<void> {
    const start = Date.now();

    this.logger.log('Sending SMS notification', { phoneNumber });

    try {
      // Twilio API call
      await this.twilioClient.messages.create({
        from: process.env.TWILIO_FROM,
        to: phoneNumber,
        body: message,
      });

      const duration = Date.now() - start;
      this.logger.logApiCall(
        'POST',
        'https://api.twilio.com/messages',
        200,
        duration
      );
    } catch (error) {
      const duration = Date.now() - start;

      if (error.code === 21211) { // Invalid phone number
        this.logger.warn('Invalid phone number', { phoneNumber });
      } else if (error.code === 20429) { // Rate limited
        this.logger.warn('Twilio rate limited', { duration });
      } else {
        this.logger.error('SMS sending failed', error, { phoneNumber, duration });
      }

      throw error;
    }
  }
}
```

### Usage in Queue Processors

```typescript
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { CustomLogger } from '@app/logger';

@Processor('emails')
export class EmailProcessor {
  constructor(private emailService: EmailService, private logger: CustomLogger) {
    this.logger.setContext(EmailProcessor.name);
  }

  @Process('send')
  async handleEmailJob(job: Job<{ to: string; template: string }>): Promise<void> {
    const start = Date.now();
    const { to, template } = job.data;

    this.logger.log('Processing email job', { jobId: job.id, to, template });

    try {
      await this.emailService.sendVerificationEmail(to, 'token');

      const duration = Date.now() - start;
      this.logger.log('Email job completed', { jobId: job.id, duration });
    } catch (error) {
      const duration = Date.now() - start;

      this.logger.error('Email job failed', error, {
        jobId: job.id,
        attempts: job.attemptsMade,
        duration,
      });

      // Retry or fail
      throw error;
    }
  }
}
```

## 4. DB Service Setup

### main.ts (if needed - usually just migrations)

```typescript
import { CustomLogger } from '@app/logger';

const logger = new CustomLogger({
  serviceId: 'db-service',
  environment: process.env.NODE_ENV,
});

logger.log('Running migrations...');
// Run TypeORM migrations
```

## Common Integration Points

### Middleware for Correlation ID (BFF Service)

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuid } from 'uuid';
import { CustomLogger } from '@app/logger';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(private logger: CustomLogger) {}

  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = (req.headers['x-correlation-id'] as string) || uuid();
    
    // Store in request context
    req['context'] = { correlationId };
    
    // Set header for response
    res.setHeader('x-correlation-id', correlationId);
    
    // Set logger correlation ID
    this.logger.setCorrelationId(correlationId);

    next();
  }
}
```

### Global Exception Filter

```typescript
import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomLogger } from '@app/logger';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private logger: CustomLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Log the exception
    this.logger.error('Unhandled exception', exception as Error, {
      path: request.url,
      method: request.method,
    });

    // Send response
    response.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

### Interceptor for Request/Response Logging (Optional)

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CustomLogger } from '@app/logger';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private logger: CustomLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const { method, url } = context.switchToHttp().getRequest();
    const start = Date.now();

    this.logger.debug(`[${method}] ${url} - Request started`);

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - start;
        this.logger.debug(`[${method}] ${url} - Response sent (${duration}ms)`);
      }),
    );
  }
}
```

## Testing Setup

```typescript
import { Test } from '@nestjs/testing';
import { CustomLogger } from '@app/logger';
import { UserService } from './user.service';

describe('UserService with Logger', () => {
  let service: UserService;
  let logger: jest.Mocked<CustomLogger>;

  beforeEach(async () => {
    logger = {
      setContext: jest.fn().mockReturnThis(),
      setUserId: jest.fn().mockReturnThis(),
      setCorrelationId: jest.fn().mockReturnThis(),
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
      logApiCall: jest.fn(),
      logGrpcCall: jest.fn(),
      logDbQuery: jest.fn(),
      child: jest.fn(),
    } as any;

    const module = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: CustomLogger, useValue: logger },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should log on success', async () => {
    const result = await service.getUser(1);

    expect(logger.log).toHaveBeenCalled();
  });

  it('should log on error', async () => {
    try {
      await service.getUser(999);
    } catch (error) {
      expect(logger.error).toHaveBeenCalled();
    }
  });
});
```

## Migration Strategy

1. **Phase 1**: Set up logger in all services (main.ts, app.module.ts)
2. **Phase 2**: Replace console.* in core business logic (services, repositories)
3. **Phase 3**: Add correlation ID tracking across gRPC calls
4. **Phase 4**: Remove all remaining console.* calls
5. **Phase 5**: Monitor logs in production

See [MIGRATION.md](./MIGRATION.md) for detailed find/replace patterns.

## References

- [Logger README](./README.md) - Overview and features
- [MIGRATION.md](./MIGRATION.md) - Step-by-step migration guide
- [SMART-ERROR-LOGGING.md](./SMART-ERROR-LOGGING.md) - Strategic logging patterns
- [api/](./../../) - API documentation
