'use client';

import { useTranslations } from 'next-intl';
import { Button, Table, Toggle } from '@/components/ui';
import type { TableColumn } from '@/components/ui';
import { getDescription, parseJson } from '../helpers';
import type { CommandConfigSummary } from '../interfaces';
import { KeyBadges } from './KeyBadges';
import { RoleBadge } from './RoleBadge';

interface CommandsTableProps {
  configs: CommandConfigSummary[];
  onRowClick: (config: CommandConfigSummary) => void;
  onToggleActive: (config: CommandConfigSummary, active: boolean) => void;
  onDelete: (commandName: string) => void;
}

export function CommandsTable({ configs, onRowClick, onToggleActive, onDelete }: CommandsTableProps) {
  const t = useTranslations('commands');

  const columns: TableColumn<CommandConfigSummary>[] = [
    { key: 'commandName', header: t('colName') },
    {
      key: 'actionsJson',
      header: t('colActions'),
      render: (val) => <KeyBadges record={parseJson<Record<string, boolean>>(val as string)} />,
    },
    {
      key: 'userTypes',
      header: t('colUserTypes'),
      render: (val) => (
        <div className="flex flex-wrap gap-1">
          {(val as string[]).length === 0
            ? <span className="text-muted text-xs">—</span>
            : (val as string[]).map((r) => <RoleBadge key={r} role={r} />)}
        </div>
      ),
    },
    {
      key: 'descriptionI18nJson',
      header: t('colDescription'),
      render: (val) => {
        const desc = getDescription(parseJson<Record<string, string>>(val as string));
        return desc
          ? <span className="text-xs text-muted line-clamp-1 max-w-50">{desc}</span>
          : <span className="text-muted text-xs">—</span>;
      },
    },
    {
      key: 'active',
      header: t('colActive'),
      render: (val, row) => (
        <span onClick={(e) => e.stopPropagation()}>
          <Toggle checked={val as boolean} onChange={(checked) => onToggleActive(row, checked)} />
        </span>
      ),
    },
    {
      key: 'commandName',
      header: '',
      align: 'right',
      render: (val) => (
        <span onClick={(e) => e.stopPropagation()}>
          <Button variant="red" size="sm" onClick={() => onDelete(val as string)}>{t('delete')}</Button>
        </span>
      ),
    },
  ];

  return (
    <Table<CommandConfigSummary>
      columns={columns}
      data={configs}
      keyExtractor={(row) => row.id}
      emptyMessage={t('empty')}
      onRowClick={onRowClick}
    />
  );
}
