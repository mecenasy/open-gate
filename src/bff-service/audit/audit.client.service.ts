import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { DbGrpcKey } from '@app/db-grpc';
import type { AuditActionType, AuditEntry } from '@app/audit';
import { TENANT_SERVICE_NAME, type TenantServiceClient } from 'src/proto/tenant';

interface RecordInput {
  tenantId: string | null;
  userId: string;
  action: AuditActionType | string;
  payload?: Record<string, unknown> | null;
  correlationId?: string | null;
}

@Injectable()
export class AuditClientService implements OnModuleInit {
  private readonly logger = new Logger(AuditClientService.name);
  private grpc!: TenantServiceClient;

  constructor(@Inject(DbGrpcKey) private readonly grpcClient: ClientGrpc) {}

  onModuleInit() {
    this.grpc = this.grpcClient.getService<TenantServiceClient>(TENANT_SERVICE_NAME);
  }

  /**
   * Fire-and-forget: never blocks the caller. Errors are swallowed —
   * an audit miss is preferable to a failed mutation.
   */
  async record(input: RecordInput): Promise<void> {
    try {
      await lastValueFrom(
        this.grpc.recordAuditEntry({
          tenantId: input.tenantId ?? '',
          userId: input.userId,
          action: input.action,
          payloadJson: input.payload ? JSON.stringify(input.payload) : '',
          ip: '',
          userAgent: '',
          correlationId: input.correlationId ?? '',
        }),
      );
    } catch (err) {
      this.logger.warn(`audit.record failed: ${(err as Error).message}`);
    }
  }

  async listForTenant(tenantId: string, limit = 100): Promise<AuditEntry[]> {
    const res = await lastValueFrom(this.grpc.getTenantAuditLog({ tenantId, limit }));
    return (res.entries ?? []).map((e) => ({
      id: e.id,
      tenantId: e.tenantId || null,
      userId: e.userId,
      action: e.action,
      payloadJson: e.payloadJson ? (JSON.parse(e.payloadJson) as Record<string, unknown>) : null,
      correlationId: e.correlationId || null,
      createdAt: e.createdAt,
    }));
  }
}
