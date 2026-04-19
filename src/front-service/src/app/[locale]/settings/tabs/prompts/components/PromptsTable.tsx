'use client';

import { useTranslations } from 'next-intl';
import { Table } from '@/components/ui';
import type { TableColumn } from '@/components/ui';
import { USER_TYPE_LABEL_KEYS } from '../constants';
import { getDescription } from '../helpers';
import type { PromptSummary } from '../interfaces';
import { UserTypeBadge } from './UserTypeBadge';

interface PromptsTableProps {
  prompts: PromptSummary[];
  onRowClick: (prompt: PromptSummary) => void;
}

export function PromptsTable({ prompts, onRowClick }: PromptsTableProps) {
  const t = useTranslations('prompts');

  const columns: TableColumn<PromptSummary>[] = [
    {
      key: 'commandName',
      header: t('colCommandName'),
      render: (val) => <span className="text-muted">{(val as string) ?? t('commandGeneral')}</span>,
    },
    {
      key: 'descriptionI18n',
      header: t('colDescription'),
      render: (val) => {
        const desc = val ? getDescription(val as Record<string, string>) : '';
        return desc
          ? <span className="text-xs text-muted line-clamp-1 max-w-50">{desc}</span>
          : <span className="text-muted text-xs">—</span>;
      },
    },
    {
      key: 'userType',
      header: t('colUserType'),
      render: (val) => (
        <UserTypeBadge
          value={val as string}
          label={t(USER_TYPE_LABEL_KEYS[val as string] as Parameters<typeof t>[0])}
        />
      ),
    },
  ];

  return (
    <Table<PromptSummary>
      columns={columns}
      data={prompts}
      keyExtractor={(row) => row.id}
      emptyMessage={t('empty')}
      onRowClick={onRowClick}
    />
  );
}
