import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PendingPhonePurchase, SmsSyncLog, TenantPhoneNumber } from '@app/entities';
import { PhoneProcurementController } from './phone-procurement.controller';
import { phoneProcurementCommandHandlers } from './commands/handlers';
import { phoneProcurementQueryHandlers } from './queries/handlers';

@Module({
  imports: [TypeOrmModule.forFeature([TenantPhoneNumber, SmsSyncLog, PendingPhonePurchase]), CqrsModule],
  controllers: [PhoneProcurementController],
  providers: [...phoneProcurementCommandHandlers, ...phoneProcurementQueryHandlers],
})
export class PhoneProcurementDbModule {}
