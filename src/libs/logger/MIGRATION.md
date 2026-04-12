# Logger Implementation Migration Guide

## Overview

This guide helps you migrate from `console.log/error/warn/debug` calls to the custom `CustomLogger` service. The custom logger provides intelligent error handling, context tracking, and correlation IDs for service-to-service tracing.

## Quick Start

### 1. Import Logger in Your Service

```typescript
import { Injectable } from '@nestjs/common';
import { CustomLogger } from '@app/logger';

@Injectable()
export class UserService {
  private logger = new CustomLogger();

  constructor() {
    this.logger.setContext(UserService.name);
  }
}
```

### 2. Replace console.* calls

#### Simple Logs

```typescript
// BEFORE
console.log('User created:', userId);

// AFTER
this.logger.log('User created', { userId });
```

#### Error Logging

```typescript
// BEFORE
console.error('Failed to create user:', error);

// AFTER
this.logger.error('Failed to create user', error, { userId, input });
```

#### Warnings

```typescript
// BEFORE
console.warn('Database connection slow');

// AFTER
this.logger.warn('Database connection slow', { duration: 5000 });
```

#### Debug (Development Only)

```typescript
// BEFORE
if (process.env.NODE_ENV === 'development') {
  console.log('Query:', query);
}

// AFTER
this.logger.debug('Query', { query });
```

## Common Patterns

### 1. Injecting Logger in NestJS

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { CustomLogger } from '@app/logger';

@Injectable()
export class MyService {
  constructor(private logger: CustomLogger) {
    this.logger.setContext(MyService.name);
  }

  doSomething() {
    this.logger.log('Starting process');
  }
}
```

### 2. Setting Context for Multiple Related Logs

```typescript
async handleRequest(userId: number) {
  const logger = this.logger.setUserId(userId);
  
  logger.log('Processing request started');
  // ... more code
  logger.log('Processing request completed');
  // All logs will include [user: <userId>]
}
```

### 3. Error Logging with Stack Traces

```typescript
try {
  const user = await this.userRepository.findById(id);
  if (!user) {
    throw new Error('User not found');
  }
} catch (error) {
  this.logger.error(
    'Failed to fetch user',
    error, // Full error object with stack trace
    { userId: id, requestId }
  );
}
```

### 4. API Call Logging with Performance Metrics

```typescript
async callExternalApi(url: string) {
  const start = Date.now();
  
  try {
    const response = await this.http.get(url).toPromise();
    const duration = Date.now() - start;
    
    this.logger.logApiCall('GET', url, response.status, duration);
    return response.data;
  } catch (error) {
    const duration = Date.now() - start;
    this.logger.logApiCall('GET', url, error.response?.status || 0, duration);
    throw error;
  }
}
```

### 5. gRPC Call Logging

```typescript
async callGrpcService(request: any) {
  const start = Date.now();
  
  try {
    const response = await this.coreServiceClient.someMethod(request).toPromise();
    const duration = Date.now() - start;
    
    this.logger.logGrpcCall('CoreService', 'someMethod', 0, duration);
    return response;
  } catch (error) {
    const duration = Date.now() - start;
    this.logger.logGrpcCall('CoreService', 'someMethod', error.code || 13, duration);
    throw error;
  }
}
```

### 6. Database Query Logging

```typescript
async findUser(id: number) {
  const start = Date.now();
  const query = `SELECT * FROM users WHERE id = ${id}`;
  
  try {
    const user = await this.userRepository.findById(id);
    const duration = Date.now() - start;
    
    this.logger.logDbQuery(query, duration);
    return user;
  } catch (error) {
    const duration = Date.now() - start;
    this.logger.logDbQuery(query, duration);
    throw error;
  }
}
```

## Logging Levels and When to Use

| Level | When to Use | Visible In |
|-------|-----------|-----------|
| `log()` | General information, successful operations | Production + Dev |
| `error()` | Exceptions, failures, critical issues | Production + Dev |
| `warn()` | Potential issues, deprecated usage | Production + Dev |
| `debug()` | Detailed diagnostic info | Development only |
| `verbose()` | Very detailed trace info | Development only |

## Intelligent Error Handling

The custom logger automatically:

1. **Detects Error Types**
   - Validation errors
   - Authentication/Authorization errors
   - Not found errors
   - Database errors
   - External API errors
   - gRPC errors
   - Timeout errors

2. **Extracts Status Codes**
   - HTTP status codes
   - gRPC error codes
   - Database error codes

3. **Formats Stack Traces**
   - Limits to 5 frames for readability
   - Hidden in production (shown in development)

4. **Redacts Sensitive Data**
   - Passwords, tokens, API keys
   - Credit card numbers
   - Automatically removed from logs

## Context and Tracing

### Correlation IDs (Service-to-Service)

Use correlation IDs to trace requests across multiple services:

```typescript
// In BFF Service (entry point)
const correlationId = generateUUID();
const logger = this.logger.setCorrelationId(correlationId);

// When calling Core Service via gRPC, add metadata:
const metadata = new grpc.Metadata();
metadata.set('x-correlation-id', correlationId);

// In Core Service, extract and set:
const correlationId = metadata.get('x-correlation-id')?.[0];
this.logger.setCorrelationId(correlationId);
```

### Request IDs (Single Request Tracking)

Track a single request lifecycle:

```typescript
@UseInterceptors(
  new RequestIdInterceptor() // Sets x-request-id header
)
export class UsersController {
  @Post()
  async create(@Headers('x-request-id') requestId: string) {
    this.logger.setRequestId(requestId);
    // All logs will include [request: <requestId>]
  }
}
```

### User IDs (User-Scoped Logging)

Track actions by specific users:

```typescript
async performAction(@CurrentUser() user: User) {
  this.logger.setUserId(user.id);
  this.logger.log('User performed action');
  // Log: [LOG] User performed action [user: 123]
}
```

## File Patterns to Find and Replace

### Using Find and Replace in VS Code

1. **Find console.log calls:**
   - Pattern: `console\.log\(`
   - Replace with: `this.logger.log(`

2. **Find console.error calls:**
   - Pattern: `console\.error\(`
   - Replace with: `this.logger.error(`

3. **Find console.warn calls:**
   - Pattern: `console\.warn\(`
   - Replace with: `this.logger.warn(`

4. **Find console.debug calls:**
   - Pattern: `console\.debug\(`
   - Replace with: `this.logger.debug(`

**Note:** Always review replacements! Some `console.*` calls in pipes, operators, or nested contexts may need manual adjustment.

## Step-by-Step Migration Plan

### Phase 1: Core Services (High Priority)

- [ ] `src/core-service/**/*.ts`
- [ ] `src/notify-service/**/*.ts`
- [ ] `src/libs/**/*.ts`

### Phase 2: Secondary Services (Medium Priority)

- [ ] `src/db-service/**/*.ts`
- [ ] `src/utils/**/*.ts`

### Phase 3: Testing (Low Priority)

- [ ] `test/**/*.ts`

## Testing Your Logs

### Unit Test Example

```typescript
describe('UserService', () => {
  let service: UserService;
  let logger: MockedLoggerService;

  beforeEach(() => {
    logger = createMock<CustomLogger>();
    service = new UserService(logger);
  });

  it('should log user creation', async () => {
    await service.createUser({ name: 'John' });
    
    expect(logger.log).toHaveBeenCalledWith(
      'User created',
      expect.objectContaining({ name: 'John' })
    );
  });
});
```

### Integration Test Example

```typescript
it('should log API call with metrics', async () => {
  const response = await service.callApi();
  
  // In your logs, you should see:
  // [LOG] GET /api/users 200 (45ms)
});
```

## Performance Considerations

- **Avoid large objects in logs** - Logs are truncated at 500 chars to prevent memory issues
- **Use debug/verbose wisely** - They don't log in production, so use them liberally
- **Sensitive data redaction** - Automatic but adds minimal overhead
- **Stack trace formatting** - Limited to 5 frames to reduce output size

## Troubleshooting

### Logger not appearing in Docker logs?

Make sure you're using `console.log/error` in the logger (which goes to stdout). Docker captures stdout automatically.

### Passwords appearing in logs?

Check that you're not manually stringify large objects. The logger redacts common patterns, but custom sensitive fields need manual handling:

```typescript
// BAD - passwords might leak
const userData = user.toJSON();
this.logger.log('User data', userData);

// GOOD - selective logging
this.logger.log('User data', { userId: user.id, email: user.email });
```

### Too many logs in production?

Use environment-based filtering:

```typescript
// Only log in development
if (process.env.NODE_ENV === 'development') {
  this.logger.debug('Detailed data', data);
}
```

## References

- [Logger Types](./logger.types.ts) - Type definitions
- [Error Formatter](./error-formatter.ts) - Error handling logic
- [Custom Logger Service](./custom-logger.service.ts) - Main implementation
- [Logger Constants](./logger.constants.ts) - Configuration and error codes
