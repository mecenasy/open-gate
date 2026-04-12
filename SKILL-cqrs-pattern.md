# CQRS Pattern Skill

## Overview

Open Gate uses the Command Query Responsibility Segregation (CQRS) pattern in the Core Service to separate read and write operations, improving scalability and maintainability.

## Core Concepts

### Commands

Commands represent **write operations** that modify state:

```typescript
export class CreateUserCommand {
  constructor(public readonly data: CreateUserDto) {}
}

export class UpdateProfileCommand {
  constructor(
    public readonly userId: string,
    public readonly data: UpdateProfileDto
  ) {}
}

export class DeleteUserCommand {
  constructor(public readonly userId: string) {}
}
```

### Queries

Queries represent **read operations** that fetch data:

```typescript
export class GetUserQuery {
  constructor(public readonly userId: string) {}
}

export class ListUsersQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 20
  ) {}
}

export class SearchUsersQuery {
  constructor(public readonly searchTerm: string) {}
}
```

### Command Handlers

Implement business logic for commands:

```typescript
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const user = new User(command.data);
    return this.userRepository.save(user);
  }
}
```

### Query Handlers

Execute queries and return results:

```typescript
@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetUserQuery): Promise<User> {
    return this.userRepository.findById(query.userId);
  }
}
```

## Project Structure

```
core-service/
├── src/
│   ├── features/
│   │   ├── users/
│   │   │   ├── commands/
│   │   │   │   ├── create-user.command.ts
│   │   │   │   ├── update-user.command.ts
│   │   │   │   ├── delete-user.command.ts
│   │   │   │   ├── create-user.handler.ts
│   │   │   │   ├── update-user.handler.ts
│   │   │   │   └── delete-user.handler.ts
│   │   │   ├── queries/
│   │   │   │   ├── get-user.query.ts
│   │   │   │   ├── list-users.query.ts
│   │   │   │   ├── get-user.handler.ts
│   │   │   │   └── list-users.handler.ts
│   │   │   ├── users.module.ts
│   │   │   └── users.service.ts
│   │   └── ...
│   ├── cqrs/
│   │   ├── commands/
│   │   ├── queries/
│   │   ├── events/
│   │   └── saga/
│   └── ...
```

## Usage in Services

### In BFF Service

Dispatch commands/queries via gRPC to Core Service:

```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly coreClient: CoreServiceClient) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    // Call Core Service via gRPC
    return this.coreClient.createUser(dto);
  }

  @Get(':id')
  getUser(@Param('id') userId: string) {
    // Call Core Service via gRPC
    return this.coreClient.getUser({ userId });
  }
}
```

### In Core Service

Use command/query bus:

```typescript
@Injectable()
export class UsersService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    return this.commandBus.execute(new CreateUserCommand(dto));
  }

  async getUser(userId: string): Promise<User> {
    return this.queryBus.execute(new GetUserQuery(userId));
  }

  async listUsers(page: number, limit: number): Promise<PaginatedUsers> {
    return this.queryBus.execute(new ListUsersQuery(page, limit));
  }
}
```

## Event-Driven Architecture

### Events

Emit events after successful command execution:

```typescript
export class UserCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly data: CreateUserDto
  ) {}
}
```

### Event Handlers

React to domain events:

```typescript
@EventsHandler(UserCreatedEvent)
export class UserCreatedHandler implements IEventHandler<UserCreatedEvent> {
  constructor(private readonly notifyService: NotifyService) {}

  async handle(event: UserCreatedEvent) {
    // Send welcome email via Notify Service
    await this.notifyService.sendWelcomeEmail(event.email);
  }
}
```

## Best Practices

### 1. Clear Naming Convention

- Commands: Action-focused names (`CreateUserCommand`, `UpdateProfileCommand`)
- Queries: Result-focused names (`GetUserQuery`, `ListUsersQuery`)
- Handlers: Specific names (`CreateUserHandler`, `GetUserHandler`)

### 2. Single Responsibility

- Each command/query handler does one thing
- Move complex logic to dedicated services
- Keep handlers thin and focused

### 3. Error Handling

```typescript
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  async execute(command: CreateUserCommand): Promise<User> {
    try {
      // Validation
      if (!command.data.email) {
        throw new BadRequestException('Email is required');
      }

      // Check for duplicates
      const existing = await this.userRepository.findByEmail(command.data.email);
      if (existing) {
        throw new ConflictException('User already exists');
      }

      return this.userRepository.save(new User(command.data));
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`);
      throw error;
    }
  }
}
```

### 4. Pagination and Filtering

```typescript
export class ListUsersQuery {
  constructor(
    public readonly filter?: UserFilter,
    public readonly pagination?: PaginationOptions,
    public readonly sorting?: SortOptions
  ) {}
}
```

### 5. Testing Commands and Queries

```typescript
describe('CreateUserHandler', () => {
  let handler: CreateUserHandler;
  let repository: UserRepository;

  beforeEach(async => {
    repository = mock(UserRepository);
    handler = new CreateUserHandler(repository);
  });

  it('should create a user', async () => {
    const dto = { email: 'user@example.com', name: 'John' };
    const user = await handler.execute(new CreateUserCommand(dto));
    
    expect(repository.save).toHaveBeenCalledWith(dto);
    expect(user).toBeDefined();
  });
});
```

## Migration from Service-Based to CQRS

### Before (Service-based)

```typescript
@Service()
export class UserService {
  async create(dto: CreateUserDto) { }
  async update(id: string, dto: UpdateUserDto) { }
  async getById(id: string) { }
  async list() { }
}
```

### After (CQRS)

```typescript
@Injectable()
export class UserService {
  async create(dto: CreateUserDto) {
    return this.commandBus.execute(new CreateUserCommand(dto));
  }

  async update(id: string, dto: UpdateUserDto) {
    return this.commandBus.execute(new UpdateUserCommand(id, dto));
  }

  async getById(id: string) {
    return this.queryBus.execute(new GetUserQuery(id));
  }

  async list() {
    return this.queryBus.execute(new ListUsersQuery());
  }
}
```

## Related Documentation

- [Backend Architecture](SKILL-backend-architecture.md) - Service structure
- [Database Management](SKILL-database-management.md) - Data persistence
- [Development Guidelines](README.md#development-guidelines) - Code patterns
