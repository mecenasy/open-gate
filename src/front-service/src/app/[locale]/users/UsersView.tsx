'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui';
import { useUsersList } from './hooks/use-users-list';
import { useUserEdit } from './hooks/use-user-edit';
import { UsersTable } from './components/UsersTable';
import { UserFormModal } from './components/UserFormModal';
import type { UserSummary } from './interfaces';

export function UsersView() {
  const t = useTranslations('users');
  const { users, isLoading } = useUsersList();
  const { removeUser } = useUserEdit();
  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold text-text">{t('title')}</h1>
        <Button variant="green" onClick={() => setIsAddOpen(true)}>
          {t('addButton')}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <div className="w-6 h-6 rounded-full border-2 border-border border-t-blue-500 animate-spin" />
        </div>
      ) : (
        <UsersTable
          users={users ?? []}
          onRowClick={setSelectedUser}
          onRemove={removeUser}
        />
      )}

      <UserFormModal
        mode="add"
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />

      <UserFormModal
        mode="edit"
        isOpen={!!selectedUser}
        selectedUser={selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
}
