# Logger Library

Custom NestJS-compatible logger with intelligent error handling, correlation IDs, and service-to-service tracing.

## Features

✅ **NestJS Compatible** - Implements `LoggerService` interface  
✅ **Intelligent Error Detection** - Automatically categorizes validation, auth, gRPC, DB errors  
✅ **Sensitive Data Redaction** - Automatically hides passwords, tokens, API keys  
✅ **Correlation Tracing** - Track requests across microservices  
✅ **Performance Metrics** - Built-in logging for API/gRPC/DB calls  
✅ **Context Tracking** - User ID, Request ID, Service ID in every log  
✅ **Production Ready** - Stack traces hidden in production, colors disabled  

## Quick Start

### 1. Import Logger Module

In your `app.module.ts`:

```typescript
import { LoggerModule } from '@app/logger';

@Module({
  imports: [
    LoggerModule,
    // ... other modules
  ],
})
export class AppModule {}
```

### 2. Use in Services

```typescript
import { Injectable } from '@nestjs/common';
import { CustomLogger } from '@app/logger';

@Injectable()
export class UserService {
  constructor(private logger: CustomLogger) {
    this.logger.setContext(UserService.name);
  }

  async getUser(id: number) {
    this.logger.log('Fetching user', { userId: id });
    try {
      const user = await this.repository.findById(id);
      this.logger.log('User found', { userId: user.id });
      return user;
    } catch (error) {
      this.logger.error('Failed to fetch user', error, { userId: id });
      throw error;
    }
  }
}
```

### 3. Replace console.* calls

See [MIGRATION.md](./MIGRATION.md) for detailed migration guide.

## Documentation

| Document | Purpose |
|----------|---------|
| [logger.types.ts](./logger.types.ts) | Type definitions and interfaces |
| [logger.constants.ts](./logger.constants.ts) | Error codes, color codes, thresholds |
| [error-formatter.ts](./error-formatter.ts) | Error detection and formatting logic |
| [custom-logger.service.ts](./custom-logger.service.ts) | Main logger implementation |
| [logger.module.ts](./logger.module.ts) | NestJS module for DI |
| [MIGRATION.md](./MIGRATION.md) | Step-by-step migration guide (336 files) |
| [SMART-ERROR-LOGGING.md](./SMART-ERROR-LOGGING.md) | Strategic error logging patterns |

## Usage Examples

### Basic Logging

```typescript
// Info level
this.logger.log('User created', { userId: 123 });

// Warning level
this.logger.warn('High memory usage', { usage: '85%' });

// Error level
this.logger.error('Database connection failed', error);

// Debug level (dev only)
this.logger.debug('Query parameters', params);

// Verbose level (dev only)
this.logger.verbose('Processing user data', data);
```

### With Context

```typescript
// Set context for a logger instance
const logger = this.logger
  .setContext(UserService.name)
  .setUserId(user.id)
  .setCorrelationId(correlationId);

logger.log('Processing user request');
// Output: [LOG] Processing user request {UserService} [correlation: abc123] [user: 123]
```

### Performance Tracking

```typescript
// API calls
this.logger.logApiCall('GET', '/api/users', 200, 145); // duration in ms

// gRPC calls
this.logger.logGrpcCall('CoreService', 'createUser', 0, 250);

// Database queries
this.logger.logDbQuery('SELECT * FROM users WHERE id = 1', 34);
```

### Error Handling

```typescript
try {
  await this.operation();
} catch (error) {
  // Error is automatically categorized and formatted
  this.logger.error(
    'Operation failed',
    error, // Can pass Error object
    { context: 'additional data' }
  );
}
```

## Intelligent Error Detection

The logger automatically detects:

- **HTTP Errors**: 400, 401, 403, 404, 409, 422, 500, 502, 503, 504
- **gRPC Errors**: 0-16 (OK, CANCELLED, UNAVAILABLE, etc.)
- **Database Errors**: Constraint violations, connection errors, timeouts
- **Validation Errors**: Missing fields, invalid types
- **Authentication Errors**: Unauthorized, forbidden
- **External API Errors**: Rate limiting, timeouts, service down

## Sensitive Data Protection

Automatically redacted:

- Passwords
- Tokens and API keys
- Credit card numbers
- Email addresses (optional)

Manual redaction:

```typescript
const redacted = ErrorFormatter.redactSensitive({
  password: 'secret123',
  email: 'test@example.com'
});

// Result: { password: '[REDACTED]', email: '[REDACTED_EMAIL]' }
```

## Performance Thresholds

| Operation | Threshold | Action |
|-----------|-----------|--------|
| Database Query | 1000ms | Logged as WARN |
| API Call | 5000ms | Logged as WARN |
| gRPC Call | 3000ms | Logged as WARN |

## Correlation IDs for Tracing

Set correlation IDs to track requests across services:

```typescript
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = req.headers['x-correlation-id'] || generateUUID();
    this.logger.setCorrelationId(correlationId);
    res.setHeader('x-correlation-id', correlationId);
    next();
  }
}

// In gRPC calls:
const metadata = new grpc.Metadata();
metadata.set('x-correlation-id', correlationId);
await grpcClient.method(data, metadata).toPromise();
```

## Log Levels

| Level | Environment | Purpose |
|-------|-------------|---------|
| `log` | Prod + Dev | General information, standard flow |
| `error` | Prod + Dev | Errors and failures |
| `warn` | Prod + Dev | Warnings, potential issues |
| `debug` | Dev only | Detailed diagnostic info |
| `verbose` | Dev only | Very detailed trace info |

## Colors & Terminal Output

Colors automatically disabled in production:

```
Development Output (with colors)
[LOG] User created {UserService} [user: 123]
[ERROR] Database connection failed [correlation: abc123]
[WARN] Slow database query detected

Production Output (without colors)
[LOG] User created {UserService} [user: 123]
[ERROR] Database connection failed [correlation: abc123]
[WARN] Slow database query detected
```

## Testing

```typescript
import { CustomLogger } from '@app/logger';

describe('UserService', () => {
  let service: UserService;
  let logger: MockedLoggerService;

  beforeEach(() => {
    logger = createMock<CustomLogger>();
    service = new UserService(logger);
  });

  it('should log on error', async () => {
    try {
      await service.getUser(999);
    } catch (error) {
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to fetch user',
        expect.any(Error),
        expect.objectContaining({ userId: 999 })
      );
    }
  });
});
```

## Migration Timeline

See [MIGRATION.md](./MIGRATION.md) for:

- ✅ Before/after examples
- ✅ VS Code Find & Replace patterns
- ✅ Phase-by-phase migration plan (336 files total)
- ✅ Testing strategies

## Production Checklist

Before deploying to production:

- ✅ Review sensitive field redaction rules
- ✅ Configure log aggregation (ELK, Datadog, etc.)
- ✅ Set up alerts for ERROR level logs
- ✅ Verify correlation IDs flow across services
- ✅ Test log output in staging environment
- ✅ Verify stack traces are hidden in production
- ✅ Monitor log volume and storage

## API Reference

### CustomLogger Methods

```typescript
// Basic logging
log(message: string, context?: any): void
error(message: string, error?: Error, context?: any): void
warn(message: string, context?: any): void
debug(message: string, context?: any): void
verbose(message: string, context?: any): void

// Context management
setContext(context: string): CustomLogger
setCorrelationId(id: string): CustomLogger
setRequestId(id: string): CustomLogger
setUserId(id: string | number): CustomLogger

// Performance tracking
logApiCall(method: string, url: string, statusCode: number, duration: number, context?: any): void
logGrpcCall(service: string, method: string, statusCode: number, duration: number, context?: any): void
logDbQuery(query: string, duration: number, context?: any): void

// Advanced
child(context: string): CustomLogger
```

### ErrorFormatter Methods

```typescript
static format(error: any, context?: ErrorContext): FormattedError
static redactSensitive(value: any): any
static summary(formatted: FormattedError): string
```

## Common Patterns

### Pattern 1: Service with Logging

```typescript
@Injectable()
export class UserService {
  constructor(private logger: CustomLogger) {
    this.logger.setContext(UserService.name);
  }

  async createUser(input: CreateUserDto) {
    this.logger.log('Creating user', { email: input.email });
    // ... business logic
    this.logger.log('User created', { userId: result.id });
  }
}
```

### Pattern 2: Request Handler with Correlation

```typescript
@Post('users')
async create(
  @Body() input: CreateUserDto,
  @Headers('x-correlation-id') correlationId?: string
) {
  this.logger.setCorrelationId(correlationId || generateUUID());
  return await this.userService.createUser(input);
}
```

### Pattern 3: gRPC Service with Context

```typescript
@GrpcMethod('UserService', 'CreateUser')
async createUser(request: CreateUserRequest, metadata: grpc.Metadata) {
  const correlationId = metadata.get('x-correlation-id')?.[0];
  this.logger.setCorrelationId(correlationId);
  // ... business logic
}
```

## Troubleshooting

**Q: Logs not appearing in Docker?**  
A: Ensure logger writes to stdout. The implementation uses `console.log/error` which Docker captures automatically.

**Q: Performance impact?**  
A: Minimal. Logger is optimized for production with:

- Truncated stack traces (5 frames max)
- Disabled colors in production
- Debug/verbose logs skipped in production
- Automatic sensitive data redaction

**Q: How to test logging?**  
A: Mock the logger in unit tests. See Testing section above.

**Q: Include logger in app.module?**  
A: Yes, import `LoggerModule` as shown in Quick Start.

## License

UNLICENSED (same as main project)
