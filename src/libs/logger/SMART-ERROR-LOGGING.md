# Smart Error Logging Strategy

## Executive Summary

This document outlines an intelligent error logging strategy for the Open Gate microservices architecture. It provides clear guidance on **WHAT** to log, **WHEN** to log, and **WHERE** to send logs to maximize debugging efficiency while maintaining security and performance.

## 1. Error Categorization Framework

### Error Types and Handling

```
┌─ Client Errors (400-499)
│  ├─ VALIDATION_ERROR (422) → Log details, omit internal stack
│  ├─ UNAUTHORIZED (401) → Log attempt, redact credentials
│  ├─ FORBIDDEN (403) → Log access attempt, include user ID
│  ├─ NOT_FOUND (404) → Log lookup details, omit sensitive data
│  └─ CONFLICT (409) → Log resource state, include IDs
│
├─ Server Errors (500-599)
│  ├─ INTERNAL_ERROR (500) → Log full details, stack trace
│  ├─ UNAVAILABLE (503) → Log service name, retry info
│  └─ TIMEOUT (504) → Log target service, duration
│
├─ gRPC Errors (0-16)
│  ├─ INVALID_ARGUMENT (3) → Log parameters
│  ├─ NOT_FOUND (5) → Log resource identifier
│  ├─ PERMISSION_DENIED (7) → Log user/service identity
│  └─ UNAVAILABLE (14) → Log target service status
│
├─ Database Errors
│  ├─ CONSTRAINT_VIOLATION → Log table/constraint
│  ├─ CONNECTION_ERROR → Log host/port, retry strategy
│  └─ QUERY_TIMEOUT → Log query type, duration
│
└─ External Service Errors (REST/API)
   ├─ CONNECTION_REFUSED → Log endpoint, retry strategy
   ├─ TIMEOUT → Log endpoint, timeout threshold
   └─ RATE_LIMITED → Log remaining quota, retry-after
```

## 2. What to Log at Each Layer

### Layer 1: Controller/Handler (Entry Point)

**Log:** Request boundaries and basic flow

```typescript
@Post('users')
@UseGuards(SessionGuard)
async createUser(@Body() input: CreateUserDto, @CurrentUser() user: User) {
  const correlationId = generateUUID();
  const logger = this.logger
    .setContext('UserController.createUser')
    .setCorrelationId(correlationId)
    .setUserId(user.id);

  logger.log('User creation request started', {
    userId: user.id,
    inputSize: JSON.stringify(input).length,
  });

  try {
    const result = await this.userService.createUser(input);
    logger.log('User created successfully', { createdUserId: result.id });
    return result;
  } catch (error) {
    logger.error('User creation failed', error, {
      userId: user.id,
      inputSnapshot: { email: input.email }, // Never log full input
    });
    throw error;
  }
}
```

**Why this pattern:**

- Captures request entry/exit points
- Sets correlation/user context for child calls
- Logs only essential data (sizes, not full payloads)
- Captures both success and failure outcomes

### Layer 2: Service/Business Logic

**Log:** Business logic decisions and errors

```typescript
@Injectable() 
export class UserService {
  constructor(private logger: CustomLogger) {
    this.logger.setContext(UserService.name);
  }

  async createUser(input: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      this.logger.warn('Duplicate user creation attempt', {
        email: input.email, // Safe to log email in warn
        existingUserId: existing.id,
      });
      throw new ConflictError('User already exists');
    }

    // Normalize data
    const userData = this.normalizeUserData(input);

    try {
      // Create user in database
      const user = await this.userRepository.save(userData);
      this.logger.log('User saved to database', { userId: user.id });

      // Send verification email
      await this.notifyService.sendVerificationEmail(user.id, user.email);
      this.logger.log('Verification email triggered', { userId: user.id });

      return user;
    } catch (error) {
      if (error.code === 'UNIQUE_CONSTRAINT_VIOLATION') {
        this.logger.error(
          'Duplicate user constraint violation',
          error,
          { email: input.email }
        );
      } else if (error.code === 'FOREIGN_KEY_VIOLATION') {
        this.logger.warn(
          'Foreign key constraint failed',
          { constraint: error.constraintName }
        );
      } else {
        this.logger.error('Unexpected error in user creation', error);
      }
      throw error;
    }
  }
}
```

**What to log:**

- Business logic branches (if/else paths)
- Validation failures with context
- Resource conflicts or duplicate attempts
- Service method entry/exit in critical paths
- Performance-impacting operations (queries, API calls)

### Layer 3: Repository/Database Layer

**Log:** Query performance and database errors

```typescript
@Injectable()
export class UserRepository {
  constructor(private logger: CustomLogger, private dataSource: DataSource) {
    this.logger.setContext(UserRepository.name);
  }

  async findByEmail(email: string): Promise<User | null> {
    const startTime = Date.now();
    const query = `SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL`;

    try {
      const user = await this.dataSource.query(query, [email]);
      const duration = Date.now() - startTime;

      if (duration > 1000) {
        this.logger.warn('Slow database query detected', {
          duration,
          table: 'users',
          reason: 'Consider indexing email column',
        });
      } else {
        this.logger.logDbQuery(query, duration);
      }

      return user[0] || null;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (error.code === 'ECONNREFUSED') {
        this.logger.error(
          'Database connection refused',
          error,
          { database: 'postgres', host: process.env.DB_HOST }
        );
      } else if (error.message.includes('TIMEOUT')) {
        this.logger.error(
          'Database query timeout',
          error,
          { timeout: process.env.DB_QUERY_TIMEOUT, duration }
        );
      } else {
        this.logger.error('Database query failed', error, { table: 'users' });
      }

      throw error;
    }
  }
}
```

**What to log:**

- Slow queries (> 1000ms) as warnings
- Query execution time for performance monitoring
- Database connection issues with retry strategy
- Transaction boundaries (begin/commit/rollback)
- Constraint violations with constraint name

### Layer 4: External Service Calls (gRPC/REST/Queue)

**Log:** Service-to-service communication

```typescript
// gRPC Call Example
async notifyUser(userId: number, message: string): Promise<void> {
  const startTime = Date.now();
  const metadata = new grpc.Metadata();
  metadata.set('x-correlation-id', this.logger['correlationId']);

  try {
    const response = await this.notifyServiceClient
      .sendNotification({ userId, message }, metadata)
      .toPromise();

    const duration = Date.now() - startTime;
    this.logger.logGrpcCall(
      'NotifyService',
      'sendNotification',
      0, // OK status
      duration,
      { userId, messageLength: message.length }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    const grpcCode = error.code || 13; // INTERNAL

    if (error.code === 14) { // UNAVAILABLE
      this.logger.warn(
        'Notify service unavailable',
        { duration, retryStrategy: 'exponential backoff' }
      );
    } else if (error.code === 4) { // DEADLINE_EXCEEDED
      this.logger.warn(
        'Notify service timeout',
        { duration, threshold: process.env.GRPC_TIMEOUT }
      );
    } else {
      this.logger.error('gRPC call failed', error, {
        service: 'NotifyService',
        method: 'sendNotification',
        grpcCode,
        duration,
      });
    }

    throw error;
  }
}

// REST API Call Example
async fetchUserData(userId: number): Promise<any> {
  const startTime = Date.now();
  const url = `${process.env.EXTERNAL_API_BASE}/users/${userId}`;

  try {
    const response = await this.httpClient.get(url).toPromise();
    const duration = Date.now() - startTime;

    this.logger.logApiCall('GET', url, response.status, duration);
    return response.data;
  } catch (error) {
    const duration = Date.now() - startTime;
    const statusCode = error.response?.status || 0;

    if (statusCode === 429) { // Too Many Requests
      this.logger.warn('API rate limited', {
        duration,
        retryAfter: error.response?.headers['retry-after'],
      });
    } else if (statusCode >= 500) {
      this.logger.error('External API error', error, {
        url,
        statusCode,
        duration,
      });
    } else {
      this.logger.error('API call failed', error, {
        url,
        statusCode,
        duration,
      });
    }

    throw error;
  }
}
```

**What to log:**

- Service name and method being called
- Request/response size (not full payloads)
- Call duration with performance thresholds
- Correlation ID/Request ID for tracing
- gRPC error codes, HTTP status codes
- Retry strategies and backoff timing

## 3. Logging Patterns by Service

### BFF Service (GraphQL Gateway)

```typescript
@UseGuards(SessionGuard)
@UseInterceptors(LoggingInterceptor) // Adds x-correlation-id
@Resolver()
export class UserResolver {
  constructor(
    private userService: UserService,
    private logger: CustomLogger,
  ) {
    this.logger.setContext(UserResolver.name);
  }

  @Query()
  async user(
    @Args('id') id: number,
    @Context() context: RequestContext,
  ): Promise<User> {
    this.logger
      .setCorrelationId(context.correlationId)
      .setUserId(context.user.id)
      .setRequestId(context.requestId);

    this.logger.log('User query requested', { requestedId: id });

    try {
      const user = await this.userService.getUser(id);
      return user;
    } catch (error) {
      this.logger.error('User query failed', error);
      throw new GraphQLError('Failed to fetch user');
    }
  }
}
```

### Core Service (Business Logic)

```typescript
@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private userRepository: UserRepository,
    private eventBus: EventBus,
    private logger: CustomLogger,
  ) {
    this.logger.setContext(CreateUserCommandHandler.name);
  }

  async execute(command: CreateUserCommand): Promise<User> {
    this.logger.log('Handling CreateUserCommand', { userId: command.userId });

    try {
      // Business logic...
      const user = await this.userRepository.save(command.data);

      // Publish domain event
      this.eventBus.publish(new UserCreatedEvent(user));
      this.logger.log('UserCreatedEvent published', { userId: user.id });

      return user;
    } catch (error) {
      this.logger.error('CreateUserCommand failed', error);
      throw error;
    }
  }
}
```

### Notify Service

```typescript
@Injectable()
export class EmailService {
  constructor(
    private mailer: MailerService,
    private logger: CustomLogger,
    private redis: Redis,
  ) {
    this.logger.setContext(EmailService.name);
  }

  async sendEmail(to: string, template: string, context: any): Promise<void> {
    const startTime = Date.now();
    const messageId = generateUUID();

    this.logger.log('Sending email', { to, template, messageId });

    try {
      const result = await this.mailer.sendMail({
        to,
        template,
        context: this.redactContext(context),
      });

      const duration = Date.now() - startTime;
      this.logger.logApiCall('MAIL SEND', to, 200, duration, { messageId });

      // Cache sent email for deduplication
      await this.redis.setex(`email:${messageId}`, 86400, '1');
    } catch (error) {
      const duration = Date.now() - startTime;

      if (error.message.includes('ECONNREFUSED')) {
        this.logger.error(
          'Email service connection failed',
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

  private redactContext(context: any): any {
    // Remove sensitive data before logging
    return {
      ...context,
      password: undefined,
      secret: undefined,
    };
  }
}
```

## 4. Correlation Tracing Across Services

### Request Flow with Correlation IDs

```
Client Request
    ↓
BFF Service [generates correlation-id]
    ├─ logs: "GraphQL query started" [correlation: abc123]
    ├─ calls Core Service (gRPC with metadata)
    │       ↓
    │   Core Service [receives correlation-id from metadata]
    │       ├─ logs: "Command handler started" [correlation: abc123]
    │       ├─ calls Notify Service (gRPC with metadata)
    │       │       ↓
    │       │   Notify Service [receives correlation-id from metadata]
    │       │       └─ logs: "Email sent" [correlation: abc123]
    │       │
    │       └─ logs: "Command completed" [correlation: abc123]
    │
    └─ logs: "GraphQL query completed" [correlation: abc123]
```

**Implementation:**

```typescript
// Middleware to add correlation ID to all requests
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(private logger: CustomLogger) {}

  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = req.headers['x-correlation-id'] || generateUUID();
    req.context = req.context || {};
    req.context.correlationId = correlationId;

    this.logger.setCorrelationId(correlationId);
    res.setHeader('x-correlation-id', correlationId);

    next();
  }
}

// gRPC Interceptor to pass correlation ID
export class GrpcCorrelationInterceptor implements GrpcInterceptor {
  intercept(target: any, propertyKey: any, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const metadata = args[1] || new grpc.Metadata();
      const correlationId = this.logger?.['correlationId'];

      if (correlationId) {
        metadata.set('x-correlation-id', correlationId);
      }

      return originalMethod.apply(this, [args[0], metadata, ...args.slice(2)]);
    };

    return descriptor;
  }
}
```

## 5. Performance Thresholds

Define what constitutes a "slow" operation:

| Operation | Threshold | Action |
|-----------|-----------|--------|
| Database Query | 1000ms | Log as WARN |
| API Call | 5000ms | Log as WARN |
| gRPC Call | 3000ms | Log as WARN |
| Memory Usage | 500MB | Log as WARN |
| Request Processing | 10000ms | Log as ERROR |

## 6. Sensitive Data Redaction

### Automatic Redaction

The logger automatically redacts:

- Passwords, tokens, API keys
- Credit card numbers
- Social security numbers
- Email addresses (optional)

### Manual Redaction

```typescript
// DON'T LOG
this.logger.log('User data', user.toJSON());

// DO LOG - selective
this.logger.log('User data', {
  id: user.id,
  email: '***', // Or exclude entirely
  createdAt: user.createdAt,
});

// Use a helper
private redact(data: any, fields: string[]): any {
  const copy = { ...data };
  fields.forEach(field => copy[field] = '[REDACTED]');
  return copy;
}
```

## 7. Error Response Pattern

**Never expose internal stack traces to clients!**

```typescript
// Global Exception Filter
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private logger: CustomLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // Log full error internally
    this.logger.error('Unhandled exception', exception as Error);

    // Send minimal response to client
    response.status(500).json({
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      path: request.url,
      // In production, don't include details
      ...(process.env.NODE_ENV !== 'production' && {
        details: exception instanceof Error ? exception.message : 'Unknown error',
      }),
    });
  }
}
```

## 8. Metrics Collection

Use logs for metrics:

```typescript
// Track error frequency
// [ERROR] User creation failed (1 per 100 attempts = 1% error rate)

// Track performance
// [WARN] Slow database query detected (avg 2000ms, threshold 1000ms)

// Track system health
// [WARN] Notify service unavailable (3 retries, circuit breaker enabled)
```

## 9. Log Aggregation & Monitoring

Set up log aggregation (ELK, Datadog, CloudWatch):

```typescript
// Log format for easy parsing
{
  timestamp: "2024-01-15T10:30:00Z",
  level: "ERROR",
  service: "core-service",
  correlationId: "abc123",
  userId: 42,
  message: "User creation failed",
  error: {
    type: "ValidationError",
    message: "Email already exists",
    statusCode: 409
  },
  duration: 125
}
```

## 10. Best Practices Checklist

- ✅ Always include `correlationId` for tracing
- ✅ Always set `context` for service/controller name
- ✅ Set `userId` when user-related action is performed
- ✅ Log both entry and exit of critical methods
- ✅ Include duration for external calls
- ✅ Log error type, not just error message
- ✅ Redact sensitive data automatically
- ✅ Never log full request/response bodies
- ✅ Use appropriate log levels (error vs warn vs debug)
- ✅ Test log output in development before production
- ✅ Monitor slow operations (> threshold)
- ✅ Aggregate logs for analysis and alerting

## 11. Testing

```typescript
describe('SmartErrorLogging', () => {
  it('should log DatabaseError with table name', () => {
    const error = new Error('Unique constraint violation');
    error.code = 'UNIQUE_CONSTRAINT_VIOLATION';
    error.table = 'users';

    const formatted = ErrorFormatter.format(error);
    expect(formatted.type).toBe('DatabaseError');
  });

  it('should redact sensitive data', () => {
    const data = { password: 'secret123', email: 'test@example.com' };
    const redacted = ErrorFormatter.redactSensitive(data);

    expect(redacted.password).toBe('[REDACTED]');
    expect(redacted.email).toBe('[REDACTED_EMAIL]');
  });

  it('should extract gRPC error codes', () => {
    const error = new Error('Permission denied');
    error.code = 7; // PERMISSION_DENIED

    const formatted = ErrorFormatter.format(error);
    expect(formatted.type).toBe('AuthorizationError');
  });
});
```

---

## Summary

Smart error logging means:

1. **What:** Log the right level of detail for each layer
2. **When:** Log at boundaries and before throwing
3. **Where:** Use appropriate log levels and destinations
4. **Who:** Include user/service context for tracing
5. **Why:** Make errors actionable for debugging

This strategy balances **observability** (knowing what's happening) with **security** (not leaking sensitive data) and **performance** (not overwhelming with noise).
