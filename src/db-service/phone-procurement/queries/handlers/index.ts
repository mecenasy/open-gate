import { GetTenantPhoneByE164Handler } from './get-tenant-phone-by-e164.handler';
import { GetTenantPhoneByTenantHandler } from './get-tenant-phone-by-tenant.handler';
import { ListManagedPhoneNumbersHandler } from './list-managed-phone-numbers.handler';
import { HasSmsSyncLogHandler } from './has-sms-sync-log.handler';
import { GetPendingPurchaseHandler } from './get-pending-purchase.handler';
import { ListUnattachedPendingPurchasesHandler } from './list-unattached-pending-purchases.handler';

export const phoneProcurementQueryHandlers = [
  GetTenantPhoneByE164Handler,
  GetTenantPhoneByTenantHandler,
  ListManagedPhoneNumbersHandler,
  HasSmsSyncLogHandler,
  GetPendingPurchaseHandler,
  ListUnattachedPendingPurchasesHandler,
];
