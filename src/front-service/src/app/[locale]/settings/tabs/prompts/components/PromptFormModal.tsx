'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Button, Modal, Select, Textarea } from '@/components/ui';
import type { SelectOption } from '@/components/ui';
import { PromptUserType } from '@/app/gql/graphql';
import { USER_TYPE_LABEL_KEYS, USER_TYPE_VALUES } from '../constants';
import type { CommandOption, PromptFormMode, PromptSummary } from '../interfaces';
import { createPromptSchema, type PromptFormValues } from '../schemas/prompt.schema';
import { usePromptUpsert } from '../hooks/use-prompt-upsert';
import { DescriptionEditor } from './DescriptionEditor';

interface PromptFormModalProps {
  mode: PromptFormMode;
  isOpen: boolean;
  commandOptions: CommandOption[];
  selectedPrompt?: PromptSummary | null;
  onClose: () => void;
}

const FORM_ID = 'prompt-form';

const defaultAddValues: PromptFormValues = {
  commandId: '',
  userType: PromptUserType.User,
  descriptionI18n: {},
  prompt: '',
};

export function PromptFormModal({
  mode,
  isOpen,
  commandOptions,
  selectedPrompt,
  onClose,
}: PromptFormModalProps) {
  const t = useTranslations('prompts');
  const { upsertPrompt, isSaving } = usePromptUpsert();
  const isEdit = mode === 'edit';

  const userTypeOptions: SelectOption<PromptUserType>[] = USER_TYPE_VALUES.map((value) => ({
    value,
    label: t(USER_TYPE_LABEL_KEYS[value] as Parameters<typeof t>[0]),
  }));

  const commandSelectOptions: SelectOption<string>[] = [
    { value: '', label: t('commandGeneral') },
    ...commandOptions,
  ];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PromptFormValues>({
    resolver: zodResolver(createPromptSchema(t)),
    defaultValues: defaultAddValues,
  });

  useEffect(() => {
    if (isEdit && selectedPrompt) {
      reset({
        commandId: selectedPrompt.commandId ?? '',
        userType: selectedPrompt.userType as PromptUserType,
        descriptionI18n: selectedPrompt.descriptionI18n ?? {},
        prompt: selectedPrompt.prompt,
      });
    }
    if (!isEdit) {
      reset(defaultAddValues);
    }
  }, [isEdit, selectedPrompt, reset]);

  const commandId = watch('commandId');
  const userType = watch('userType');
  const descriptionI18n = watch('descriptionI18n');

  const onSubmit = async (values: PromptFormValues) => {
    await upsertPrompt(values);
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
      className="max-w-3xl! min-h-[calc(100vh-290px)] overflow-y-auto"
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
      <form
        id={FORM_ID}
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 flex-1 min-h-0"
      >
        <div className="grid grid-cols-2 gap-4 shrink-0">
          <Select<string>
            label={t('fieldCommandName')}
            value={commandId ?? ''}
            options={commandSelectOptions}
            onChange={(v) => setValue('commandId', v || undefined)}
          />
          <Select<PromptUserType>
            label={t('fieldUserType')}
            value={userType}
            options={userTypeOptions}
            onChange={(v) => setValue('userType', v)}
          />
        </div>
        <DescriptionEditor
          value={descriptionI18n ?? {}}
          onChange={(v) => setValue('descriptionI18n', v)}
        />
        <Textarea
          grow
          label={t('fieldPrompt')}
          error={errors.prompt?.message}
          {...register('prompt')}
        />
      </form>
    </Modal>
  );
}
