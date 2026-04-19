'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui';
import { usePromptsList } from './hooks/use-prompts-list';
import { PromptsTable } from './components/PromptsTable';
import { PromptFormModal } from './components/PromptFormModal';
import type { PromptSummary } from './interfaces';

export function PromptsTab() {
  const t = useTranslations('prompts');
  const { prompts, commandOptions, isLoading } = usePromptsList();
  const [selectedPrompt, setSelectedPrompt] = useState<PromptSummary | null>(null);
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
        <PromptsTable prompts={prompts} onRowClick={setSelectedPrompt} />
      )}

      <PromptFormModal
        mode="add"
        isOpen={isAddOpen}
        commandOptions={commandOptions}
        onClose={() => setIsAddOpen(false)}
      />

      <PromptFormModal
        mode="edit"
        isOpen={!!selectedPrompt}
        commandOptions={commandOptions}
        selectedPrompt={selectedPrompt}
        onClose={() => setSelectedPrompt(null)}
      />
    </div>
  );
}
