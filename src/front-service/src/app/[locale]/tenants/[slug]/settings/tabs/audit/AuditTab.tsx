'use client';

import { useTranslations } from 'next-intl';
import { Table } from '@/components/ui';
import type { TableColumn } from '@/components/ui';
import { useAuditLog } from '../../hooks/use-audit-log';
import type { AuditEntry } from '../../interfaces';

interface AuditTabProps {
  tenantId: string;
}

interface AuditRow extends Record<string, unknown> {
  id: string;
  createdAt: string;
  action: string;
  userId: string;
  payload: string;
}

function formatPayload(payload: Record<string, unknown> | null | undefined): string {
  if (!payload) return '—';
  return Object.entries(payload)
    .map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : String(v)}`)
    .join(', ');
}

export function AuditTab({ tenantId }: AuditTabProps) {
  const t = useTranslations('tenantSettings.audit');
  const { entries, isLoading, error } = useAuditLog(tenantId);

  if (error) return <p className="text-sm text-red-400">{t('loadError')}</p>;
  if (isLoading && entries.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-5 h-5 rounded-full border-2 border-border border-t-blue-500 animate-spin" />
      </div>
    );
  }

  const rows: AuditRow[] = entries.map((e: AuditEntry) => ({
    id: e.id,
    createdAt: new Date(e.createdAt).toLocaleString(),
    action: e.action,
    userId: e.userId,
    payload: formatPayload(e.payload),
  }));

  const columns: TableColumn<AuditRow>[] = [
    { key: 'createdAt', header: t('when') },
    {
      key: 'action',
      header: t('action'),
      render: (v) => <span className="font-mono text-xs">{String(v)}</span>,
    },
    {
      key: 'userId',
      header: t('user'),
      render: (v) => <span className="font-mono text-xs text-muted">{String(v).slice(0, 8)}…</span>,
    },
    {
      key: 'payload',
      header: t('payload'),
      render: (v) => <span className="font-mono text-xs text-muted">{String(v)}</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">{t('desc')}</p>
      <Table columns={columns} data={rows} keyExtractor={(r) => r.id} emptyMessage={t('empty')} />
    </div>
  );
}
