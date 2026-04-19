'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui';
import { useCommandsList } from './hooks/use-commands-list';
import { useCommandUpsert } from './hooks/use-command-upsert';
import { useCommandDelete } from './hooks/use-command-delete';
import { CommandsTable } from './components/CommandsTable';
import { CommandFormModal } from './components/CommandFormModal';
import type { CommandConfigSummary } from './interfaces';

export function CommandsTab() {
  const t = useTranslations('commands');
  const { configs, isLoading } = useCommandsList();
  const { toggleActive } = useCommandUpsert();
  const { deleteCommand } = useCommandDelete();

  const [selectedConfig, setSelectedConfig] = useState<CommandConfigSummary | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <div className="mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-base font-semibold text-text">{t('title')}</h2>
        <Button variant="green" onClick={() => setIsAddOpen(true)}>{t('addButton')}</Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <div className="w-6 h-6 rounded-full border-2 border-border border-t-blue-500 animate-spin" />
        </div>
      ) : (
        <CommandsTable
          configs={configs ?? []}
          onRowClick={setSelectedConfig}
          onToggleActive={toggleActive}
          onDelete={deleteCommand}
        />
      )}

      <CommandFormModal
        mode="add"
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />

      <CommandFormModal
        mode="edit"
        isOpen={!!selectedConfig}
        selectedConfig={selectedConfig}
        onClose={() => setSelectedConfig(null)}
      />
    </div>
  );
}
