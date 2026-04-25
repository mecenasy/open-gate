'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Input } from '@/components/ui';
import type { CustomCommandDraft } from '../interfaces';
import { StepBudget } from './StepBudget';

interface StepCommandsProps {
  defaultCommands: CustomCommandDraft[];
  maxCommands: number;
  onBack: (drafts: CustomCommandDraft[]) => void;
  onNext: (drafts: CustomCommandDraft[]) => void;
}

export function StepCommands({ defaultCommands, maxCommands, onBack, onNext }: StepCommandsProps) {
  const t = useTranslations('tenantWizard');

  const [drafts, setDrafts] = useState<CustomCommandDraft[]>(defaultCommands);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const overLimit = drafts.length > maxCommands;
  const atLimit = drafts.length >= maxCommands;

  const addDraft = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t('errorNameRequired'));
      return;
    }
    if (drafts.some((d) => d.name === trimmed)) {
      setError(t('errorDuplicateName'));
      return;
    }
    setDrafts((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: trimmed, description: description.trim() },
    ]);
    setName('');
    setDescription('');
    setError('');
  };

  const removeDraft = (id: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-text">{t('stepCommandsTitle')}</h2>
        <p className="text-sm text-muted">{t('stepCommandsDesc')}</p>
        <StepBudget label={t('commandBudget')} current={drafts.length} max={maxCommands} />
        {overLimit && (
          <p className="text-xs text-amber-400">{t('commandLimitExceeded', { max: maxCommands })}</p>
        )}
      </div>

      <div className="bg-surface-raised border border-border rounded-xl p-4 flex flex-col gap-3">
        <Input
          label={t('commandName')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('commandNamePlaceholder')}
        />
        <Input
          label={t('commandDescription')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {error && <span className="text-xs text-red-400">{error}</span>}
        <div className="flex justify-end">
          <Button type="button" variant="blue" disabled={atLimit} onClick={addDraft}>
            {t('addCommand')}
          </Button>
        </div>
      </div>

      {drafts.length > 0 && (
        <ul className="flex flex-col gap-2">
          {drafts.map((d) => (
            <li
              key={d.id}
              className="flex items-center justify-between bg-surface border border-border rounded-xl px-4 py-2"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-text">{d.name}</span>
                {d.description && <span className="text-xs text-muted">{d.description}</span>}
              </div>
              <Button type="button" size="sm" variant="green" onClick={() => removeDraft(d.id)}>
                {t('remove')}
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex justify-between pt-4">
        <Button type="button" variant="green" onClick={() => onBack(drafts)}>
          {t('back')}
        </Button>
        <Button type="button" variant="blue" disabled={overLimit} onClick={() => onNext(drafts)}>
          {t('next')}
        </Button>
      </div>
    </div>
  );
}
