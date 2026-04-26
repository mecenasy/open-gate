'use client';

import { useEffect, useMemo } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Button, Input, Modal } from '@/components/ui';
import { PLATFORM_FIELDS, type PlatformKey } from './platform-fields';
import { createPlatformSchema, type PlatformFormValues } from './platform.schema';

interface PlatformConfigModalProps {
  isOpen: boolean;
  platform: PlatformKey | null;
  /** Pre-fills the form when the user re-opens an already-configured platform. */
  defaultConfig: Record<string, unknown> | null;
  onClose: () => void;
  onSave: (platform: PlatformKey, config: Record<string, unknown>) => void;
}

export function PlatformConfigModal({
  isOpen,
  platform,
  defaultConfig,
  onClose,
  onSave,
}: PlatformConfigModalProps) {
  const t = useTranslations('tenantWizard');
  const tField = useTranslations('tenantWizard.platformField');

  const fields = useMemo(() => (platform ? PLATFORM_FIELDS[platform] : []), [platform]);

  const schema = useMemo(
    () => (platform ? createPlatformSchema(platform, t) : null),
    [platform, t],
  );

  const defaultValues = useMemo<PlatformFormValues>(() => {
    if (!platform) return {};
    return Object.fromEntries(
      fields.map((f) => [f.name, (defaultConfig?.[f.name] as string | number | undefined) ?? '']),
    );
  }, [fields, defaultConfig, platform]);

  const form = useForm<PlatformFormValues>({
    resolver: schema ? (zodResolver(schema) as unknown as Resolver<PlatformFormValues>) : undefined,
    defaultValues,
  });

  // Reset when re-opening the modal for a different platform or after a
  // close — RHF keeps stale state otherwise and the user sees yesterday's
  // values when they re-tap the same tile.
  useEffect(() => {
    if (isOpen) form.reset(defaultValues);
  }, [isOpen, defaultValues, form]);

  if (!platform) return null;

  const submit = form.handleSubmit((values) => {
    onSave(platform, values);
  });

  const errors = form.formState.errors as Record<string, { message?: string } | undefined>;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t(`platform_${platform}` as Parameters<typeof t>[0])}
      footer={
        <div className="flex justify-between gap-4">
          <Button type="button" variant="green" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button form="platform-config-form" type="submit" variant="blue">
            {t('platformSave')}
          </Button>
        </div>
      }
    >
      <form id="platform-config-form" onSubmit={submit} className="flex flex-col gap-3">
        {fields.map((field) => (
          <Input
            key={field.name}
            type={field.type === 'password' ? 'password' : field.type === 'number' ? 'number' : 'text'}
            label={tField(field.labelKey as Parameters<typeof tField>[0])}
            placeholder={field.placeholder}
            error={errors[field.name]?.message}
            {...form.register(field.name)}
          />
        ))}
      </form>
    </Modal>
  );
}
