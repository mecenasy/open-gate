# Database Management Skill

## Overview

This skill covers database operations, TypeORM setup, migrations, and data persistence patterns in Open Gate.

## Database Architecture

### Primary Database

- **Type**: PostgreSQL
- **ORM**: TypeORM
- **Config**: `typeorm.config.ts`
- **Managed by**: DB Service

### Caching Layer

- **Type**: Redis
- **Use cases**: Session storage, query caching, rate limiting
- **TTL**: Service-specific configuration

## TypeORM Setup

### Configuration

Located in `typeorm.config.ts`:

```typescript
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [/*...*/],
  migrations: ['src/db-service/migrations/*.ts'],
  synchronize: false, // Always use migrations
  logging: process.env.NODE_ENV === 'development',
};
```

### Environment Variables

```env
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=open_gate
```

## Working with Entities

### Entity Definition

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  avatar: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isActive: boolean;
}
```

### Entity Relationships

```typescript
@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @ManyToOne(() => User, (user) => user.posts, { eager: false })
  @JoinColumn({ name: 'userId' })
  author: User;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;
}

// Reverse relationship
@Entity('users')
export class User {
  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];
}
```

### Indexes for Performance

```typescript
@Entity('users')
@Index('idx_email', ['email'])
@Index('idx_created_at', ['createdAt'])
export class User {
  // ...
}
```

## Migration Management

### Migration Workflow

**Generate migrations from entities:**

```bash
npm run migration:generate -- src/db-service/migrations/AddUserTable
```

**Run pending migrations:**

```bash
npm run migration:run
```

**Revert last migration:**

```bash
npm run migration:revert
```

**Production migration:**

```bash
npm run migration:run:prod
```

### Creating Migrations Manually

```typescript
// src/db-service/migrations/1704067200000-CreateUsersTable.ts
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersTable1704067200000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      })
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
```

## Repository Pattern

### Creating Repositories

```typescript
@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>
  ) {}

  async findById(id: string): Promise<User> {
    return this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User> {
    return this.repository.findOne({ where: { email } });
  }

  async save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findAll(page = 1, limit = 20): Promise<[User[], number]> {
    return this.repository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }
}
```

### Using in Modules

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserRepository, UserService],
  exports: [UserRepository],
})
export class UserModule {}
```

## Transactions

### Database Transactions

For multi-step operations that must succeed or fail together:

```typescript
@Injectable()
export class UserService {
  constructor(private readonly dataSource: DataSource) {}

  async transferCredits(fromUserId: string, toUserId: string, amount: number) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Deduct from source user
      await queryRunner.manager.decrement(User, { id: fromUserId }, 'credits', amount);

      // Add to destination user
      await queryRunner.manager.increment(User, { id: toUserId }, 'credits', amount);

      // Create transaction record
      await queryRunner.manager.save(Transaction, {
        fromUserId,
        toUserId,
        amount,
        status: 'completed',
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
```

## Query Optimization

### Eager vs Lazy Loading

```typescript
// Eager loading - fetch relations immediately
const user = await this.repository.findOne({
  where: { id: userId },
  relations: ['posts', 'profile'],
});

// Lazy loading - fetch only when accessed
const user = await this.repository.findOne({
  where: { id: userId },
});
// Access relations later
const posts = await user.posts; // Query runs here
```

### Query Builder for Complex Queries

```typescript
const users = await this.repository
  .createQueryBuilder('user')
  .leftJoinAndSelect('user.posts', 'post')
  .where('user.isActive = :active', { active: true })
  .andWhere('post.createdAt > :date', { date: new Date('2024-01-01') })
  .orderBy('user.createdAt', 'DESC')
  .take(20)
  .skip(0)
  .getManyAndCount();
```

### Database Indexing

```typescript
// On frequently queried columns
@Index()
@Column()
email: string;

// Composite indexes
@Index(['userId', 'postId'])
@Entity()
export class Like {}
```

## Backup and Recovery

### Backup Database

```bash
# From Docker
docker compose exec postgres pg_dump -U postgres open_gate > backup.sql

# Restore
docker compose exec -T postgres psql -U postgres open_gate < backup.sql
```

### Migration Safety

1. Always test migrations locally first
2. Back up production database before applying migrations
3. Have rollback plan ready
4. Test migrations on staging environment

## Best Practices

### 1. Always Use Migrations

- Never use `synchronize: true` in production
- Track all schema changes in migrations
- Version control migration files

### 2. Connection Pooling

```typescript
// typeorm.config.ts
export const dataSourceOptions: DataSourceOptions = {
  // ...
  maxQueryExecutionTime: 1000, // log slow queries
  pool: {
    min: 2,
    max: 10,
  },
};
```

### 3. Testing Database Operations

```typescript
describe('UserRepository', () => {
  let repository: UserRepository;
  let typeORM: DataSource;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(testDbConfig)],
    }).compile();

    typeORM = module.get(DataSource);
    repository = module.get(UserRepository);

    // Run migrations
    await typeORM.runMigrations();
  });

  it('should find user by email', async () => {
    const user = new User({ email: 'test@example.com' });
    await repository.save(user);

    const found = await repository.findByEmail('test@example.com');
    expect(found).toBeDefined();
  });

  afterEach(async () => {
    await typeORM.dropDatabase();
  });
});
```

### 4. Performance Monitoring

- Monitor slow queries
- Use database query logs in development
- Profile queries with EXPLAIN ANALYZE
- Add appropriate indexes

### 5. Data Validation

```typescript
@Entity('users')
export class User {
  @Column({ length: 255 })
  email: string; // Max length enforced at DB level

  @Column({ type: 'int', default: 0 })
  age: number; // Type safety at DB level
}
```

## Troubleshooting

### Connection Issues

1. Verify PostgreSQL is running
2. Check credentials in `.env`
3. Validate network connectivity in Docker Compose

### Migration Failures

1. Check migration file syntax
2. Verify database state
3. Run migrations in correct order
4. Back up before retrying

### Query Performance Issues

1. Check indexes on frequently queried columns
2. Use EXPLAIN ANALYZE to identify bottlenecks
3. Consider query optimization or denormalization

## Related Documentation

- [Backend Architecture](SKILL-backend-architecture.md) - Service structure
- [CQRS Pattern](SKILL-cqrs-pattern.md) - Data operation patterns
- [Docker Deployment](SKILL-docker-deployment.md) - Database containerization
