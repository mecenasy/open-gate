'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui';
import type { ContactDraft } from '../interfaces';
import { ContactFormRow } from './ContactFormRow';

interface StepContactsProps {
  defaultContacts: ContactDraft[];
  isSubmitting: boolean;
  error: string | null;
  onBack: (contacts: ContactDraft[]) => void;
  onFinish: (contacts: ContactDraft[]) => void;
}

export function StepContacts({ defaultContacts, isSubmitting, error, onBack, onFinish }: StepContactsProps) {
  const t = useTranslations('tenantWizard');
  const [contacts, setContacts] = useState<ContactDraft[]>(defaultContacts);

  const addContact = (c: ContactDraft) => setContacts((list) => [...list, c]);
  const removeContact = (id: string) => setContacts((list) => list.filter((c) => c.id !== id));

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-text">{t('stepContactsTitle')}</h2>
      <p className="text-sm text-muted">{t('stepContactsDesc')}</p>

      <ContactFormRow onAdd={addContact} />

      {contacts.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {contacts.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between bg-surface border border-border rounded-xl px-4 py-2"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm text-text">
                  {c.name} {c.surname}
                </span>
                <span className="text-xs text-muted">
                  {[c.email, c.phone].filter(Boolean).join(' · ')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted uppercase">{t(`access${c.accessLevel === 'primary' ? 'Primary' : 'Secondary'}` as Parameters<typeof t>[0])}</span>
                <Button type="button" variant="red" size="sm" onClick={() => removeContact(c.id)}>
                  {t('contactRemove')}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted italic">{t('contactsEmpty')}</p>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex justify-between pt-4">
        <Button type="button" variant="green" onClick={() => onBack(contacts)} disabled={isSubmitting}>
          {t('back')}
        </Button>
        <Button type="button" variant="blue" onClick={() => onFinish(contacts)} disabled={isSubmitting}>
          {isSubmitting ? t('finishing') : t('finish')}
        </Button>
      </div>
    </div>
  );
}
