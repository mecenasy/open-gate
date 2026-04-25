import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantAuditLog } from '@app/entities';

interface RecordInput {
  tenantId: string | null;
  userId: string;
  action: string;
  payload?: Record<string, unknown> | null;
  ip?: string | null;
  userAgent?: string | null;
  correlationId?: string | null;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(TenantAuditLog)
    private readonly repo: Repository<TenantAuditLog>,
  ) {}

  /**
   * Fire-and-forget audit write. Errors are logged but never thrown — audit
   * must never block the calling mutation.
   */
  async record(input: RecordInput): Promise<void> {
    try {
      await this.repo.save(
        this.repo.create({
          tenantId: input.tenantId,
          userId: input.userId,
          action: input.action,
          payloadJson: input.payload ?? null,
          ip: input.ip ?? null,
          userAgent: input.userAgent ?? null,
          correlationId: input.correlationId ?? null,
        }),
      );
    } catch (err) {
      this.logger.error(`Failed to write audit entry: ${(err as Error).message}`, (err as Error).stack);
    }
  }

  listForTenant(tenantId: string, limit = 100): Promise<TenantAuditLog[]> {
    return this.repo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
