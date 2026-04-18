'use client';

import { useTranslations } from 'next-intl';
import { Button, Table } from '@/components/ui';
import type { TableColumn } from '@/components/ui';
import type { UserSummary } from '../interfaces';
import { StatusBadge } from './StatusBadge';
import { RoleBadge } from './RoleBadge';

interface UsersTableProps {
  users: UserSummary[];
  onRowClick: (user: UserSummary) => void;
  onRemove: (id: string) => void;
}

export function UsersTable({ users, onRowClick, onRemove }: UsersTableProps) {
  const t = useTranslations('users');

  const columns: TableColumn<UserSummary>[] = [
    {
      key: 'name',
      header: t('colName'),
      render: (_, row) => `${row.name} ${row.surname}`,
    },
    { key: 'email', header: t('colEmail') },
    { key: 'phone', header: t('colPhone') },
    {
      key: 'status',
      header: t('colStatus'),
      render: (val) => <StatusBadge value={val as string} />,
    },
    {
      key: 'type',
      header: t('colRole'),
      render: (val) => <RoleBadge value={val as string} />,
    },
    {
      key: 'id',
      header: '',
      align: 'right',
      render: (val) => (
        <span onClick={(e) => e.stopPropagation()}>
          <Button variant="red" size="sm" onClick={() => onRemove(val as string)}>
            {t('delete')}
          </Button>
        </span>
      ),
    },
  ];

  return (
    <Table<UserSummary>
      columns={columns}
      data={users}
      keyExtractor={(row) => row.id}
      emptyMessage={t('empty')}
      onRowClick={onRowClick}
    />
  );
}
