'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Modal, Button, Input } from '@/components/ui';
import { PLATFORM_FIELDS } from '../constants';
import { parseConfig } from '../helpers';
import type { SelectedPlatform } from '../interfaces';
import { usePlatformCredentialsUpdate } from '../hooks/use-platform-credentials-update';

interface PlatformConfigModalProps {
  selected: SelectedPlatform | null;
  onClose: () => void;
}

type FormValues = Record<string, string>;

const FORM_ID = 'platform-config-form';

export function PlatformConfigModal({ selected, onClose }: PlatformConfigModalProps) {
  const t = useTranslations('fetcherSettings');
  const { updateCredentials, isSaving } = usePlatformCredentialsUpdate();

  const fields = selected ? (PLATFORM_FIELDS[selected.platform] ?? []) : [];

  const { register, handleSubmit, reset } = useForm<FormValues>({ defaultValues: {} });

  useEffect(() => {
    if (!selected) return;
    const parsed = parseConfig(selected.configJson);
    const initial = Object.fromEntries(fields.map((f) => [f, String(parsed[f] ?? '')]));
    reset(initial);
  }, [selected, fields, reset]);

  const onSubmit = async (values: FormValues) => {
    if (!selected) return;
    await updateCredentials(selected.platform, values);
    onClose();
  };

  const title = selected
    ? t('modalTitle', { platform: t(`platforms.${selected.platform}` as Parameters<typeof t>[0]) })
    : '';

  return (
    <Modal
      isOpen={!!selected}
      onClose={onClose}
      title={title}
      className="max-w-lg"
      footer={
        <>
          <Button variant="blue" size="sm" onClick={onClose} disabled={isSaving}>
            {t('cancel')}
          </Button>
          <Button variant="blue" size="sm" form={FORM_ID} type="submit" disabled={isSaving}>
            {isSaving ? t('saving') : t('save')}
          </Button>
        </>
      }
    >
      <form
        id={FORM_ID}
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5 overflow-y-auto max-h-[60vh]"
      >
        {fields.map((field) => (
          <Input
            key={field}
            id={`cred-${field}`}
            label={t(`fields.${field}` as Parameters<typeof t>[0])}
            {...register(field)}
          />
        ))}
      </form>
    </Modal>
  );
}
