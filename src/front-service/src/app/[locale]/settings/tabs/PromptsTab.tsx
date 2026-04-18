'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Button, Modal, Select, Table, Textarea } from '@/components/ui';
import type { TableColumn, SelectOption } from '@/components/ui';
import { PromptUserType } from '@/app/gql/graphql';
import { usePrompts } from '@/hooks/use-prompts';
import type { PromptSummary, PromptOverrideForm } from '@/hooks/use-prompts';

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

const LANG_OPTIONS: SelectOption<string>[] = [
  { value: 'en', label: 'English' },
  { value: 'pl', label: 'Polski' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
  { value: 'it', label: 'Italiano' },
  { value: 'uk', label: 'Українська' },
];

function getDescription(i18n: Record<string, string>, lang = 'en'): string {
  return i18n[lang] ?? i18n['en'] ?? Object.values(i18n)[0] ?? '';
}

function UserTypeBadge({ value, label }: { value: string; label: string }) {
  const cfg = USER_TYPE_BADGE[value] ?? { dot: 'bg-slate-500', pill: 'bg-slate-500/20 text-slate-400 light:text-slate-600 border border-slate-400/50' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {label}
    </span>
  );
}

type DescriptionEditorProps = {
  value: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
  label: string;
  addLangLabel: string;
  langLabel: string;
};

function DescriptionEditor({ value, onChange, label, addLangLabel, langLabel }: DescriptionEditorProps) {
  const [newLang, setNewLang] = useState('en');
  const usedLangs = Object.keys(value);
  const availableLangs = LANG_OPTIONS.filter((o) => !usedLangs.includes(o.value));

  const handleAdd = () => {
    if (!newLang || value[newLang] !== undefined) return;
    onChange({ ...value, [newLang]: '' });
    const next = availableLangs.find((o) => o.value !== newLang);
    if (next) setNewLang(next.value);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="block text-xs font-medium text-muted">{label}</label>
      {usedLangs.map((lang) => (
        <div key={lang} className="flex items-start gap-2">
          <span className="mt-2 text-xs font-mono uppercase text-muted w-8 shrink-0">{lang}</span>
          <div className="flex-1">
            <Textarea
              value={value[lang]}
              onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
              rows={2}
            />
          </div>
          <button
            type="button"
            onClick={() => { const next = { ...value }; delete next[lang]; onChange(next); }}
            className="mt-2 text-xs text-rose-400 hover:text-rose-300 shrink-0"
          >
            ✕
          </button>
        </div>
      ))}
      {availableLangs.length > 0 && (
        <div className="flex items-center gap-2 mt-1">
          <div className="w-40">
            <Select<string> label={langLabel} value={newLang} options={availableLangs} onChange={setNewLang} />
          </div>
          <div className="pt-5">
            <Button variant="blue" size="sm" onClick={handleAdd}>{addLangLabel}</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function PromptsTab() {
  const t = useTranslations('prompts');

  const {
    prompts, isLoading, commandOptions, selectedPrompt, openModal, closeModal,
    onUpdatePrompt, isUpdatingPrompt,
    isAddModalOpen, openAddModal, closeAddModal, onCreatePrompt, isCreatingPrompt,
  } = usePrompts();

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<PromptOverrideForm>({ defaultValues: { descriptionI18n: {} } });
  const { register: registerAdd, handleSubmit: handleSubmitAdd, reset: resetAdd, watch: watchAdd, setValue: setValueAdd, formState: { errors: errorsAdd } } = useForm<PromptOverrideForm>({ defaultValues: { userType: PromptUserType.User, descriptionI18n: {} } });

  const watchedUserType = watch('userType');
  const watchedCommandId = watch('commandId');
  const watchedDescriptionI18n = watch('descriptionI18n');
  const watchedAddUserType = watchAdd('userType');
  const watchedAddCommandId = watchAdd('commandId');
  const watchedAddDescriptionI18n = watchAdd('descriptionI18n');

  const USER_TYPE_OPTIONS: SelectOption<PromptUserType>[] = [
    { value: PromptUserType.Owner, label: t('userTypeOwner') },
    { value: PromptUserType.SuperUser, label: t('userTypeSuperUser') },
    { value: PromptUserType.Admin, label: t('userTypeAdmin') },
    { value: PromptUserType.Member, label: t('userTypeMember') },
    { value: PromptUserType.User, label: t('userTypeUser') },
  ];

  const COMMAND_OPTIONS: SelectOption<string>[] = [
    { value: '', label: t('commandGeneral') },
    ...commandOptions,
  ];

  useEffect(() => {
    if (selectedPrompt) {
      reset({
        commandId: selectedPrompt.commandId ?? '',
        descriptionI18n: selectedPrompt.descriptionI18n ?? {},
        userType: selectedPrompt.userType as PromptUserType,
        prompt: selectedPrompt.prompt,
      });
    }
  }, [selectedPrompt, reset]);

  const onSubmitAdd = async (data: PromptOverrideForm) => { await onCreatePrompt(data); resetAdd({ descriptionI18n: {} }); closeAddModal(); };
  const onSubmit = async (data: PromptOverrideForm) => { await onUpdatePrompt(data); closeModal(); };

  const columns: TableColumn<PromptSummary>[] = [
    {
      key: 'commandName', header: t('colCommandName'),
      render: (val) => <span className="text-muted">{(val as string) ?? t('commandGeneral')}</span>,
    },
    {
      key: 'descriptionI18n', header: t('colDescription'),
      render: (val) => {
        const desc = val ? getDescription(val as Record<string, string>) : '';
        return desc
          ? <span className="text-xs text-muted line-clamp-1 max-w-50">{desc}</span>
          : <span className="text-muted text-xs">—</span>;
      },
    },
    {
      key: 'userType', header: t('colUserType'),
      render: (val) => <UserTypeBadge value={val as string} label={t(USER_TYPE_LABEL_KEY[val as string] as Parameters<typeof t>[0])} />,
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
          <div className="grid grid-cols-2 gap-4 shrink-0">
            <Select<string>
              label={t('fieldCommandName')}
              value={watchedAddCommandId ?? ''}
              options={COMMAND_OPTIONS}
              onChange={(v) => setValueAdd('commandId', v || undefined)}
            />
            <Select<PromptUserType>
              label={t('fieldUserType')}
              value={watchedAddUserType}
              options={USER_TYPE_OPTIONS}
              onChange={(v) => setValueAdd('userType', v)}
            />
          </div>
          <DescriptionEditor
            value={watchedAddDescriptionI18n ?? {}}
            onChange={(v) => setValueAdd('descriptionI18n', v)}
            label={t('fieldDescriptions')}
            addLangLabel={t('addLanguage')}
            langLabel={t('fieldLanguage')}
          />
          <Textarea grow label={t('fieldPrompt')} error={errorsAdd.prompt?.message} {...registerAdd('prompt', { required: t('required') })} />
        </form>
      </Modal>

      <Modal isOpen={!!selectedPrompt} onClose={closeModal} title={t('editModalTitle')} className="max-w-3xl! min-h-[calc(100vh-290px)] overflow-y-auto"
        footer={
          <>
            <Button variant="blue" size="sm" onClick={closeModal}>{t('cancel')}</Button>
            <Button variant="green" size="sm" form="edit-prompt-form" type="submit" disabled={isUpdatingPrompt}>
              {isUpdatingPrompt ? t('saving') : t('save')}
            </Button>
          </>
        }
      >
        <form id="edit-prompt-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 flex-1 min-h-0">
          <div className="grid grid-cols-2 gap-4 shrink-0">
            <Select<string>
              label={t('fieldCommandName')}
              value={watchedCommandId ?? ''}
              options={COMMAND_OPTIONS}
              onChange={(v) => setValue('commandId', v || undefined)}
            />
            <Select<PromptUserType>
              label={t('fieldUserType')}
              value={watchedUserType}
              options={USER_TYPE_OPTIONS}
              onChange={(v) => setValue('userType', v)}
            />
          </div>
          <DescriptionEditor
            value={watchedDescriptionI18n ?? {}}
            onChange={(v) => setValue('descriptionI18n', v)}
            label={t('fieldDescriptions')}
            addLangLabel={t('addLanguage')}
            langLabel={t('fieldLanguage')}
          />
          <Textarea grow label={t('fieldPrompt')} error={errors.prompt?.message} {...register('prompt', { required: t('required') })} />
        </form>
      </Modal>
    </div>
  );
}
