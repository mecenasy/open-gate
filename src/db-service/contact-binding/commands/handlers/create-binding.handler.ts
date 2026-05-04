import { CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CustomLogger } from '@app/logger';
import { BaseCommandHandler } from '@app/cqrs';
import { ContactBinding, ContactBindingSendStatus, ContactBindingStatus } from '@app/entities';
import { CreateBindingCommand } from '../impl/create-binding.command';
import { generateBindingToken } from '../../token.util';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_TOKEN_RETRIES = 5;
const PG_UNIQUE_VIOLATION = '23505';

@CommandHandler(CreateBindingCommand)
export class CreateBindingHandler extends BaseCommandHandler<CreateBindingCommand, ContactBinding> {
  constructor(
    @InjectRepository(ContactBinding)
    private readonly repo: Repository<ContactBinding>,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(command: CreateBindingCommand): Promise<ContactBinding> {
    return this.run('CreateBinding', async () => {
      const ttl = command.ttlMs > 0 ? command.ttlMs : SEVEN_DAYS_MS;
      const expiresAt = new Date(Date.now() + ttl);

      // Token UNIQUE catches the rare collision; retry until distinct.
      for (let attempt = 0; attempt < MAX_TOKEN_RETRIES; attempt++) {
        try {
          return await this.repo.save(
            this.repo.create({
              tenantId: command.tenantId,
              userId: command.userId,
              phoneE164: command.phoneE164,
              token: generateBindingToken(),
              platform: command.platform,
              source: command.source,
              status: ContactBindingStatus.Pending,
              sendStatus: ContactBindingSendStatus.Pending,
              expiresAt,
            }),
          );
        } catch (err) {
          if (isTokenCollision(err)) continue;
          throw err;
        }
      }
      throw new Error('Could not generate unique binding token after retries');
    });
  }
}

function isTokenCollision(err: unknown): boolean {
  if (!(err instanceof QueryFailedError)) return false;
  const driverError = (err as QueryFailedError & { driverError?: { code?: string; constraint?: string } }).driverError;
  return driverError?.code === PG_UNIQUE_VIOLATION && driverError?.constraint === 'UQ_contact_bindings_token';
}
