'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Button, Input, Modal, Select, Table, Textarea } from '@/components/ui';
import type { TableColumn, SelectOption } from '@/components/ui';
import { PromptUserType } from '@/app/gql/graphql';
import { usePrompts } from '@/hooks/use-prompts';
import type { PromptSummary } from '@/hooks/use-prompts';

const USER_TYPE_BADGE: Record<string, { dot: string; pill: string }> = {
  [PromptUserType.Owner]: { dot: 'bg-rose-700', pill: 'bg-rose-800/20 text-rose-500 border border-rose-800/30' },
  [PromptUserType.SuperUser]: { dot: 'bg-red-500', pill: 'bg-red-500/15 text-red-400 border border-red-500/20' },
  [PromptUserType.Admin]: { dot: 'bg-orange-400', pill: 'bg-orange-500/15 text-orange-400 border border-orange-500/20' },
  [PromptUserType.Member]: { dot: 'bg-blue-500', pill: 'bg-blue-500/15 text-blue-400 light:text-blue-600 border border-blue-500/30' },
  [PromptUserType.User]: { dot: 'bg-slate-500', pill: 'bg-slate-500/20 text-slate-400 light:text-slate-600 border border-slate-400/50' },
  [PromptUserType.Unrecognized]: { dot: 'bg-slate-500', pill: 'bg-slate-500/20 text-slate-400 light:text-slate-600 border border-slate-400/50' },
};

const USER_TYPE_LABEL_KEY: Record<string, string> = {
  [PromptUserType.Owner]: 'userTypeOwner',
  [PromptUserType.SuperUser]: 'userTypeSuperUser',
  [PromptUserType.Admin]: 'userTypeAdmin',
  [PromptUserType.Member]: 'userTypeMember',
  [PromptUserType.User]: 'userTypeUser',
  [PromptUserType.Unrecognized]: 'userTypeUnrecognized',
};

function UserTypeBadge({ value, label }: { value: string; label: string }) {
  const cfg = USER_TYPE_BADGE[value] ?? { dot: 'bg-slate-500', pill: 'bg-slate-500/20 text-slate-400 light:text-slate-600 border border-slate-400/50' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {label}
    </span>
  );
}

type PromptForm = {
  key: string;
  description: string;
  commandName: string;
  userType: PromptUserType;
  prompt: string;
};

export function PromptsTab() {
  const t = useTranslations('prompts');

  const {
    prompts, isLoading, selectedPrompt, openModal, closeModal,
    onUpdatePrompt, onRemovePrompt, isUpdatingPrompt,
    isAddModalOpen, openAddModal, closeAddModal, onCreatePrompt, isCreatingPrompt,
    fullPromptLoading, fullPromptText,
  } = usePrompts();

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<PromptForm>();
  const { register: registerAdd, handleSubmit: handleSubmitAdd, reset: resetAdd, watch: watchAdd, setValue: setValueAdd, formState: { errors: errorsAdd } } = useForm<PromptForm>({ defaultValues: { userType: PromptUserType.User } });

  const watchedUserType = watch('userType');
  const watchedAddUserType = watchAdd('userType');

  const USER_TYPE_OPTIONS: SelectOption<PromptUserType>[] = [
    { value: PromptUserType.Owner, label: t('userTypeOwner') },
    { value: PromptUserType.SuperUser, label: t('userTypeSuperUser') },
    { value: PromptUserType.Admin, label: t('userTypeAdmin') },
    { value: PromptUserType.Member, label: t('userTypeMember') },
    { value: PromptUserType.User, label: t('userTypeUser') },
  ];

  useEffect(() => {
    if (selectedPrompt) {
      reset({ key: selectedPrompt.key, description: selectedPrompt.description, commandName: selectedPrompt.commandName, userType: selectedPrompt.userType as PromptUserType, prompt: selectedPrompt.prompt });
    }
  }, [selectedPrompt, reset]);

  useEffect(() => {
    if (fullPromptText) setValue('prompt', fullPromptText);
  }, [fullPromptText, setValue]);

  const onSubmitAdd = async (data: PromptForm) => { await onCreatePrompt(data); resetAdd(); closeAddModal(); };
  const onSubmit = async (data: PromptForm) => { await onUpdatePrompt(data); closeModal(); };

  const columns: TableColumn<PromptSummary>[] = [
    { key: 'key', header: t('colKey') },
    { key: 'description', header: t('colDescription') },
    { key: 'commandName', header: t('colCommandName') },
    {
      key: 'userType', header: t('colUserType'),
      render: (val) => <UserTypeBadge value={val as string} label={t(USER_TYPE_LABEL_KEY[val as string] as Parameters<typeof t>[0])} />,
    },
    {
      key: 'id', header: '', align: 'right',
      render: (val) => (
        <span onClick={(e) => e.stopPropagation()}>
          <Button variant="red" size="sm" onClick={() => onRemovePrompt(val as string)}>{t('delete')}</Button>
        </span>
      ),
    },
  ];

  return (
    <div className="mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-base font-semibold text-text">{t('title')}</h2>
        <Button variant="green" onClick={openAddModal}>{t('addButton')}</Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <div className="w-6 h-6 rounded-full border-2 border-border border-t-blue-500 animate-spin" />
        </div>
      ) : (
        <Table<PromptSummary> columns={columns} data={prompts ?? []} keyExtractor={(row) => row.id} emptyMessage={t('empty')} onRowClick={openModal} />
      )}

      <Modal isOpen={isAddModalOpen} onClose={closeAddModal} title={t('addModalTitle')} className="max-w-3xl! min-h-[calc(100vh-290px)] overflow-y-auto"
        footer={
          <>
            <Button variant="blue" size="sm" onClick={closeAddModal}>{t('cancel')}</Button>
            <Button variant="green" size="sm" form="add-prompt-form" type="submit" disabled={isCreatingPrompt}>
              {isCreatingPrompt ? t('adding') : t('add')}
            </Button>
          </>
        }
      >
        <form id="add-prompt-form" onSubmit={handleSubmitAdd(onSubmitAdd)} className="flex flex-col gap-4 flex-1 min-h-0">
          <div className="grid grid-cols-3 gap-4 shrink-0">
            <Input label={t('fieldKey')} error={errorsAdd.key?.message} {...registerAdd('key', { required: t('required') })} />
            <Input label={t('fieldCommandName')} error={errorsAdd.commandName?.message} {...registerAdd('commandName', { required: t('required') })} />
            <Select<PromptUserType> label={t('fieldUserType')} value={watchedAddUserType} options={USER_TYPE_OPTIONS} onChange={(v) => setValueAdd('userType', v)} />
          </div>
          <Input label={t('fieldDescription')} error={errorsAdd.description?.message} {...registerAdd('description', { required: t('required') })} />
          <Textarea grow label={t('fieldPrompt')} error={errorsAdd.prompt?.message} {...registerAdd('prompt', { required: t('required') })} />
        </form>
      </Modal>

      <Modal isOpen={!!selectedPrompt} onClose={closeModal} title={t('editModalTitle')} className="max-w-3xl! min-h-[calc(100vh-290px)] overflow-y-auto"
        footer={
          <>
            <Button variant="blue" size="sm" onClick={closeModal}>{t('cancel')}</Button>
            <Button variant="green" size="sm" form="edit-prompt-form" type="submit" disabled={isUpdatingPrompt || fullPromptLoading}>
              {isUpdatingPrompt ? t('saving') : t('save')}
            </Button>
          </>
        }
      >
        <form id="edit-prompt-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 flex-1 min-h-0">
          <div className="grid grid-cols-3 gap-4 shrink-0">
            <Input label={t('fieldKey')} error={errors.key?.message} {...register('key', { required: t('required') })} />
            <Input label={t('fieldCommandName')} error={errors.commandName?.message} {...register('commandName', { required: t('required') })} />
            <Select<PromptUserType> label={t('fieldUserType')} value={watchedUserType} options={USER_TYPE_OPTIONS} onChange={(v) => setValue('userType', v)} />
          </div>
          <Input label={t('fieldDescription')} error={errors.description?.message} {...register('description', { required: t('required') })} />
          {fullPromptLoading ? (
            <div className="flex-1 flex items-center gap-2 text-sm text-muted">
              <div className="w-4 h-4 rounded-full border-2 border-border border-t-blue-500 animate-spin" />
              {t('loadingPrompt')}
            </div>
          ) : (
            <Textarea grow label={t('fieldPrompt')} error={errors.prompt?.message} {...register('prompt', { required: t('required') })} />
          )}
        </form>
      </Modal>
    </div>
  );
}
