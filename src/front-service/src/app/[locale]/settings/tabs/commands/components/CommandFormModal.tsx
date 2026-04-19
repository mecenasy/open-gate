'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Button, Input, Modal, MultiSelect, TagInput, Toggle } from '@/components/ui';
import type { SelectOption } from '@/components/ui';
import { ROLE_LABEL_KEYS, USER_TYPE_VALUES } from '../constants';
import { parseJson, toKeysJson } from '../helpers';
import type { CommandConfigSummary, CommandFormMode } from '../interfaces';
import { createCommandSchema, type CommandFormValues } from '../schemas/command.schema';
import { useCommandUpsert } from '../hooks/use-command-upsert';
import { DescriptionEditor } from './DescriptionEditor';

interface CommandFormModalProps {
  mode: CommandFormMode;
  isOpen: boolean;
  selectedConfig?: CommandConfigSummary | null;
  onClose: () => void;
}

const FORM_ID = 'command-form';

const ROLE_VALUES = [
  USER_TYPE_VALUES.Owner,
  USER_TYPE_VALUES.SuperUser,
  USER_TYPE_VALUES.User,
  USER_TYPE_VALUES.Member,
] as const;

const defaultAddValues: CommandFormValues = {
  commandName: '',
  active: true,
  userTypes: [],
  actions: [],
  parameters: [],
  descriptions: {},
};

export function CommandFormModal({ mode, isOpen, selectedConfig, onClose }: CommandFormModalProps) {
  const t = useTranslations('commands');
  const { upsertCommand, isSaving } = useCommandUpsert();
  const isEdit = mode === 'edit';

  const roleOptions: SelectOption<string>[] = ROLE_VALUES.map((value) => ({
    value,
    label: t(ROLE_LABEL_KEYS[value] as Parameters<typeof t>[0]),
  }));

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CommandFormValues>({
    resolver: zodResolver(createCommandSchema(t)),
    defaultValues: defaultAddValues,
  });

  useEffect(() => {
    if (isEdit && selectedConfig) {
      reset({
        commandName: selectedConfig.commandName,
        active: selectedConfig.active,
        userTypes: selectedConfig.userTypes ?? [],
        actions: Object.keys(parseJson<Record<string, boolean>>(selectedConfig.actionsJson)),
        parameters: Object.keys(parseJson<Record<string, boolean>>(selectedConfig.parametersOverrideJson)),
        descriptions: parseJson<Record<string, string>>(selectedConfig.descriptionI18nJson),
      });
    }
    if (!isEdit) {
      reset(defaultAddValues);
    }
  }, [isEdit, selectedConfig, reset]);

  const commandName = watch('commandName');
  const active = watch('active');
  const userTypes = watch('userTypes');
  const actions = watch('actions');
  const parameters = watch('parameters');
  const descriptions = watch('descriptions');

  const onSubmit = async (values: CommandFormValues) => {
    await upsertCommand({
      commandName: values.commandName.trim(),
      active: values.active,
      userTypes: values.userTypes,
      actionsJson: toKeysJson(values.actions),
      parametersOverrideJson: toKeysJson(values.parameters),
      descriptionI18nJson:
        Object.keys(values.descriptions).length > 0 ? JSON.stringify(values.descriptions) : undefined,
    });
    onClose();
  };

  const title = isEdit ? t('editModalTitle') : t('addModalTitle');
  const submitLabel = isEdit
    ? isSaving ? t('saving') : t('save')
    : isSaving ? t('adding') : t('add');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      className="max-w-3xl! overflow-y-auto"
      footer={
        <>
          <Button variant="blue" size="sm" onClick={onClose} disabled={isSaving}>
            {t('cancel')}
          </Button>
          <Button variant="green" size="sm" form={FORM_ID} type="submit" disabled={isSaving}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            {isEdit ? (
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">{t('fieldCommand')}</label>
                <p className="text-sm font-medium text-text">{commandName}</p>
              </div>
            ) : (
              <Input
                label={t('fieldCommand')}
                error={errors.commandName?.message}
                {...register('commandName')}
              />
            )}
          </div>
          <div className="flex-1">
            <MultiSelect
              label={t('fieldPermissions')}
              value={userTypes}
              onChange={(v) => setValue('userTypes', v)}
              options={roleOptions}
            />
          </div>
          <div className="pb-1">
            <label className="block text-xs font-medium text-muted mb-1.5">{t('fieldActive')}</label>
            <Toggle checked={active} onChange={(v) => setValue('active', v)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TagInput label={t('fieldActions')} value={actions} onChange={(v) => setValue('actions', v)} />
          <TagInput label={t('fieldParameters')} value={parameters} onChange={(v) => setValue('parameters', v)} />
        </div>
        <DescriptionEditor value={descriptions} onChange={(v) => setValue('descriptions', v)} />
      </form>
    </Modal>
  );
}
