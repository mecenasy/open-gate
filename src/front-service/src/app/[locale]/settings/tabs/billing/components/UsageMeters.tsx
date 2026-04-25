'use client';

import { useTranslations } from 'next-intl';
import type { PlanSummary, UsageReport } from '../interfaces';

interface UsageMetersProps {
  usage: UsageReport | null;
  plan: PlanSummary | null;
}

interface MeterProps {
  label: string;
  current: number;
  max: number;
}

function Meter({ label, current, max }: MeterProps) {
  const ratio = max > 0 ? Math.min(1, current / max) : 0;
  const pct = Math.round(ratio * 100);
  const color =
    ratio >= 1 ? 'bg-red-500' : ratio >= 0.8 ? 'bg-amber-500' : 'bg-blue-500';

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className="font-mono text-text">
          {current} / {max}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-surface overflow-hidden">
        <div className={`h-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function UsageMeters({ usage, plan }: UsageMetersProps) {
  const t = useTranslations('billing');

  if (!usage || !plan) return null;

  const totals = usage.perTenant.reduce(
    (acc, e) => ({
      staff: acc.staff + e.staff,
      platforms: acc.platforms + e.platforms,
      contacts: acc.contacts + e.contacts,
      customCommands: acc.customCommands + e.customCommands,
    }),
    { staff: 0, platforms: 0, contacts: 0, customCommands: 0 },
  );

  return (
    <section className="bg-surface-raised border border-border rounded-2xl p-5 flex flex-col gap-4">
      <header>
        <h2 className="text-base font-semibold text-text">{t('usageTitle')}</h2>
        <p className="text-xs text-muted mt-0.5">{t('usageDesc')}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Meter label={t('limitTenants')} current={usage.tenants} max={plan.maxTenants} />
        <Meter
          label={t('limitStaffSum')}
          current={totals.staff}
          max={plan.maxStaffPerTenant * Math.max(1, usage.tenants)}
        />
        <Meter
          label={t('limitPlatformsSum')}
          current={totals.platforms}
          max={plan.maxPlatformsPerTenant * Math.max(1, usage.tenants)}
        />
        <Meter
          label={t('limitContactsSum')}
          current={totals.contacts}
          max={plan.maxContactsPerTenant * Math.max(1, usage.tenants)}
        />
      </div>

      {usage.perTenant.length > 0 && (
        <details className="text-xs text-muted">
          <summary className="cursor-pointer select-none">{t('perTenantBreakdown')}</summary>
          <ul className="mt-2 flex flex-col gap-2">
            {usage.perTenant.map((e) => (
              <li
                key={e.tenantId}
                className="bg-surface border border-border rounded-lg px-3 py-2 grid grid-cols-2 gap-1 font-mono"
              >
                <span className="col-span-2 text-text">{e.tenantId}</span>
                <span>
                  {t('limitStaff')}: {e.staff}/{plan.maxStaffPerTenant}
                </span>
                <span>
                  {t('limitPlatforms')}: {e.platforms}/{plan.maxPlatformsPerTenant}
                </span>
                <span>
                  {t('limitContacts')}: {e.contacts}/{plan.maxContactsPerTenant}
                </span>
                <span>
                  {t('limitCustomCommands')}: {e.customCommands}/{plan.maxCustomCommandsPerTenant}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
