import { Module } from '@nestjs/common';
import { AuditClientService } from './audit.client.service';
import { AuditResolver } from './audit.resolver';

@Module({
  providers: [AuditClientService, AuditResolver],
  exports: [AuditClientService],
})
export class AuditBffModule {}
