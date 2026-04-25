'use client';

import { useTranslations } from 'next-intl';
import { Table } from '@/components/ui';
import type { TableColumn } from '@/components/ui';
import { formatDateTime } from '../helpers';
import type { PlanSummary, SubscriptionChangeEntry } from '../interfaces';

interface SubscriptionHistoryTableProps {
  history: SubscriptionChangeEntry[];
  plans: PlanSummary[];
}

interface HistoryRow extends Record<string, unknown> {
  id: string;
  initiatedAt: string;
  kind: string;
  oldPlanName: string;
  newPlanName: string;
}

export function SubscriptionHistoryTable({ history, plans }: SubscriptionHistoryTableProps) {
  const t = useTranslations('billing');

  if (history.length === 0) return null;

  const planName = (id?: string | null) => {
    if (!id) return '—';
    return plans.find((p) => p.id === id)?.name ?? id;
  };

  const rows: HistoryRow[] = history.map((h) => ({
    id: h.id,
    initiatedAt: h.initiatedAt,
    kind: h.kind,
    oldPlanName: planName(h.oldPlanId),
    newPlanName: planName(h.newPlanId),
  }));

  const columns: TableColumn<HistoryRow>[] = [
    {
      key: 'initiatedAt',
      header: t('historyDate'),
      render: (v) => formatDateTime(String(v)),
    },
    {
      key: 'kind',
      header: t('historyKind'),
      render: (v) => t(`kind_${String(v)}` as Parameters<typeof t>[0]),
    },
    { key: 'oldPlanName', header: t('historyOldPlan') },
    { key: 'newPlanName', header: t('historyNewPlan') },
  ];

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold text-text">{t('historyTitle')}</h2>
      <Table columns={columns} data={rows} keyExtractor={(r) => r.id} />
    </section>
  );
}
