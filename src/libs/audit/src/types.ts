/**
 * Sensitive operations recorded in shared_config.tenant_audit_log.
 * String values stay stable across deployments — never rename, only add.
 */
export const AuditAction = {
  TenantCreated: 'tenant.created',
  TenantDeleted: 'tenant.deleted',
  TenantSetActive: 'tenant.setActive',
  TenantBillingTransferred: 'tenant.billingTransferred',
  TenantStaffAdded: 'tenant.staff.added',
  TenantStaffRemoved: 'tenant.staff.removed',
  TenantStaffRoleChanged: 'tenant.staff.roleChanged',
  TenantComplianceUpdated: 'tenant.compliance.updated',
  SubscriptionSelected: 'subscription.selected',
  SubscriptionCanceled: 'subscription.canceled',
} as const;

export type AuditActionType = (typeof AuditAction)[keyof typeof AuditAction];

export interface AuditRecordInput {
  tenantId: string | null;
  userId: string;
  action: AuditActionType | string;
  payload?: Record<string, unknown> | null;
  ip?: string | null;
  userAgent?: string | null;
  correlationId?: string | null;
}

export interface AuditEntry {
  id: string;
  tenantId: string | null;
  userId: string;
  action: string;
  payloadJson: Record<string, unknown> | null;
  correlationId: string | null;
  createdAt: string;
}
