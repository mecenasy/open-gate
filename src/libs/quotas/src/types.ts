export type QuotaKind = 'tenants' | 'staff' | 'platforms' | 'contacts' | 'customCommands';

export interface QuotaViolation {
  kind: QuotaKind;
  tenantId?: string;
  current: number;
  max: number;
}

export interface TenantUsageEntry {
  tenantId: string;
  staff: number;
  platforms: number;
  contacts: number;
  customCommands: number;
}

export interface UsageReport {
  billingUserId: string;
  tenants: number;
  perTenant: TenantUsageEntry[];
}
