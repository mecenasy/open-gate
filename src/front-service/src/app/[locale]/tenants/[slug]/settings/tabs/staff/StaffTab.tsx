'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Select, Table } from '@/components/ui';
import type { SelectOption, TableColumn } from '@/components/ui';
import { ROLE_LABEL_KEYS, STAFF_ROLES } from '../../constants';
import { useStaffMutations } from '../../hooks/use-staff-mutations';
import type { TenantStaffEntry } from '../../interfaces';
import { AddStaffModal } from './AddStaffModal';

interface StaffTabProps {
  tenantId: string;
  staff: TenantStaffEntry[];
}

interface StaffRow extends Record<string, unknown> {
  userId: string;
  role: string;
  remove: never;
}

export function StaffTab({ tenantId, staff }: StaffTabProps) {
  const t = useTranslations('tenantSettings.staff');
  const { addStaff, removeStaff, changeRole, isAdding, isRemoving, isChanging } = useStaffMutations(tenantId);
  const [addOpen, setAddOpen] = useState(false);

  const roleOptions: SelectOption<string>[] = STAFF_ROLES.map((r) => ({
    value: r,
    label: t(ROLE_LABEL_KEYS[r] as Parameters<typeof t>[0]),
  }));

  const rows: StaffRow[] = staff.map((s) => ({
    userId: s.userId,
    role: s.role.toLowerCase(),
    remove: undefined as never,
  }));

  const columns: TableColumn<StaffRow>[] = [
    { key: 'userId', header: t('userId') },
    {
      key: 'role',
      header: t('role'),
      render: (_v, row) => (
        <Select<string>
          value={row.role}
          options={roleOptions}
          disabled={isChanging}
          onChange={(role) => void changeRole(row.userId, role)}
        />
      ),
    },
    {
      key: 'remove',
      header: '',
      align: 'right',
      render: (_v, row) => (
        <Button
          type="button"
          size="sm"
          variant="green"
          disabled={isRemoving}
          onClick={() => void removeStaff(row.userId)}
        >
          {t('remove')}
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{t('desc')}</p>
        <Button type="button" variant="blue" onClick={() => setAddOpen(true)}>
          {t('addStaff')}
        </Button>
      </div>

      <Table columns={columns} data={rows} keyExtractor={(r) => r.userId} emptyMessage={t('empty')} />

      <AddStaffModal
        isOpen={addOpen}
        isAdding={isAdding}
        roleOptions={roleOptions}
        onClose={() => setAddOpen(false)}
        onConfirm={async (userId, role) => {
          await addStaff(userId, role);
          setAddOpen(false);
        }}
      />
    </div>
  );
}
