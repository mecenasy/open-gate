import { IncrementMonthlyMessageCountHandler } from './increment-monthly-message-count.handler';
import { ResetAllMonthlyMessageCountsHandler } from './reset-all-monthly-message-counts.handler';
import { InsertSmsSyncLogHandler } from './insert-sms-sync-log.handler';
import { InsertPendingPurchaseHandler } from './insert-pending-purchase.handler';
import { AttachPendingPurchaseHandler } from './attach-pending-purchase.handler';
import { DeletePendingPurchaseHandler } from './delete-pending-purchase.handler';

export const phoneProcurementCommandHandlers = [
  IncrementMonthlyMessageCountHandler,
  ResetAllMonthlyMessageCountsHandler,
  InsertSmsSyncLogHandler,
  InsertPendingPurchaseHandler,
  AttachPendingPurchaseHandler,
  DeletePendingPurchaseHandler,
];
