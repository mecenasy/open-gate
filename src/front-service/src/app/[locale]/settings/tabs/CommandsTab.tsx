'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Input, Modal, Select, Table, Textarea, TagInput, MultiSelect, Toggle } from '@/components/ui';
import type { TableColumn, SelectOption } from '@/components/ui';
import { useTenantCommandConfigs } from '@/hooks/use-tenant-command-configs';
import type { TenantCommandConfigSummary } from '@/hooks/use-tenant-command-configs';

// ── constants ─────────────────────────────────────────────────────────────────

const USER_TYPE_VALUES = {
  Owner: 'owner',
  Admin: 'admin',
  SuperUser: 'super_user',
  Member: 'member',
  User: 'user',
} as const;

const ROLE_BADGE: Record<string, { dot: string; pill: string }> = {
  owner: { dot: 'bg-rose-700', pill: 'bg-rose-800/20 text-rose-500 border border-rose-800/30' },
  super_user: { dot: 'bg-red-500', pill: 'bg-red-500/15 text-red-400 border border-red-500/20' },
  admin: { dot: 'bg-orange-400', pill: 'bg-orange-500/15 text-orange-400 border border-orange-500/20' },
  member: { dot: 'bg-blue-500', pill: 'bg-blue-500/15 text-blue-400 border border-blue-500/30' },
  user: { dot: 'bg-slate-500', pill: 'bg-slate-500/20 text-slate-400 border border-slate-400/50' },
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

// ── helpers ───────────────────────────────────────────────────────────────────

function parseJson<T>(json?: string | null, fallback: T = {} as T): T {
  if (!json) return fallback;
  try { return JSON.parse(json) as T; } catch { return fallback; }
}

function toKeysJson(keys: string[]): string | undefined {
  return keys.length > 0 ? JSON.stringify(Object.fromEntries(keys.map((k) => [k, true]))) : undefined;
}

function getDescription(i18n: Record<string, string>, lang = 'en'): string {
  return i18n[lang] ?? i18n['en'] ?? Object.values(i18n)[0] ?? '';
}

// ── small components ──────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const cfg = ROLE_BADGE[role] ?? { dot: 'bg-slate-500', pill: 'bg-slate-500/20 text-slate-400 border border-slate-400/50' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {role}
    </span>
  );
}

function KeyBadges({ record }: { record: Record<string, boolean> }) {
  const keys = Object.keys(record);
  if (keys.length === 0) return <span className="text-muted text-xs">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {keys.map((k) => (
        <span key={k} className="bg-surface border border-border rounded px-1.5 py-0.5 text-xs text-muted">{k}</span>
      ))}
    </div>
  );
}

// ── multilingual description editor ──────────────────────────────────────────

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

  const handleChange = (lang: string, text: string) => {
    onChange({ ...value, [lang]: text });
  };

  const handleRemove = (lang: string) => {
    const next = { ...value };
    delete next[lang];
    onChange(next);
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
              onChange={(e) => handleChange(lang, e.target.value)}
              rows={2}
            />
          </div>
          <button
            type="button"
            onClick={() => handleRemove(lang)}
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

// ── main component ────────────────────────────────────────────────────────────

export function CommandsTab() {
  const t = useTranslations('commands');

  const {
    configs, isLoading, selectedConfig, openModal, closeModal,
    onUpsert, onToggleActive, onDelete,
    isUpserting, isAddModalOpen, openAddModal, closeAddModal,
  } = useTenantCommandConfigs();

  // ── add state ──
  const [addName, setAddName] = useState('');
  const [addActions, setAddActions] = useState<string[]>([]);
  const [addParams, setAddParams] = useState<string[]>([]);
  const [addUserTypes, setAddUserTypes] = useState<string[]>([]);
  const [addActive, setAddActive] = useState(true);
  const [addDescriptions, setAddDescriptions] = useState<Record<string, string>>({});

  // ── edit state ──
  const [editActions, setEditActions] = useState<string[]>([]);
  const [editParams, setEditParams] = useState<string[]>([]);
  const [editUserTypes, setEditUserTypes] = useState<string[]>([]);
  const [editActive, setEditActive] = useState(true);
  const [editDescriptions, setEditDescriptions] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedConfig) {
      setEditActions(Object.keys(parseJson<Record<string, boolean>>(selectedConfig.actionsJson)));
      setEditParams(Object.keys(parseJson<Record<string, boolean>>(selectedConfig.parametersOverrideJson)));
      setEditUserTypes(selectedConfig.userTypes ?? []);
      setEditActive(selectedConfig.active);
      setEditDescriptions(parseJson<Record<string, string>>(selectedConfig.descriptionI18nJson));
    }
  }, [selectedConfig]);

  const USER_TYPE_OPTIONS: SelectOption<string>[] = [
    { value: USER_TYPE_VALUES.Owner, label: t('roleOwner') },
    { value: USER_TYPE_VALUES.SuperUser, label: t('roleSuperUser') },
    { value: USER_TYPE_VALUES.Admin, label: t('roleAdmin') },
    { value: USER_TYPE_VALUES.Member, label: t('roleMember') },
    { value: USER_TYPE_VALUES.User, label: t('roleUser') },
  ];

  const resetAdd = () => {
    setAddName('');
    setAddActions([]);
    setAddParams([]);
    setAddUserTypes([]);
    setAddActive(true);
    setAddDescriptions({});
  };

  const onSubmitAdd = async () => {
    if (!addName.trim()) return;
    await onUpsert({
      commandName: addName.trim(),
      active: addActive,
      userTypes: addUserTypes,
      actionsJson: toKeysJson(addActions),
      parametersOverrideJson: toKeysJson(addParams),
      descriptionI18nJson: Object.keys(addDescriptions).length > 0 ? JSON.stringify(addDescriptions) : undefined,
    });
    resetAdd();
    closeAddModal();
  };

  const onSubmitEdit = async () => {
    if (!selectedConfig) return;
    await onUpsert({
      commandName: selectedConfig.commandName,
      active: editActive,
      userTypes: editUserTypes,
      actionsJson: toKeysJson(editActions),
      parametersOverrideJson: toKeysJson(editParams),
      descriptionI18nJson: Object.keys(editDescriptions).length > 0 ? JSON.stringify(editDescriptions) : undefined,
    });
    closeModal();
  };

  const columns: TableColumn<TenantCommandConfigSummary>[] = [
    { key: 'commandName', header: t('colName') },
    {
      key: 'actionsJson', header: t('colActions'),
      render: (val) => <KeyBadges record={parseJson<Record<string, boolean>>(val as string)} />,
    },
    {
      key: 'userTypes', header: t('colUserTypes'),
      render: (val) => (
        <div className="flex flex-wrap gap-1">
          {(val as string[]).length === 0
            ? <span className="text-muted text-xs">—</span>
            : (val as string[]).map((r) => <RoleBadge key={r} role={r} />)}
        </div>
      ),
    },
    {
      key: 'descriptionI18nJson', header: t('colDescription'),
      render: (val) => {
        const desc = getDescription(parseJson<Record<string, string>>(val as string));
        return desc ? (
          <span className="text-xs text-muted line-clamp-1 max-w-50">{desc}</span>
        ) : (
          <span className="text-muted text-xs">—</span>
        );
      },
    },
    {
      key: 'active', header: t('colActive'),
      render: (val, row) => (
        <span onClick={(e) => e.stopPropagation()}>
          <Toggle checked={val as boolean} onChange={(checked) => onToggleActive(row, checked)} />
        </span>
      ),
    },
    {
      key: 'commandName', header: '', align: 'right',
      render: (val) => (
        <span onClick={(e) => e.stopPropagation()}>
          <Button variant="red" size="sm" onClick={() => onDelete(val as string)}>{t('delete')}</Button>
        </span>
      ),
    },
  ];

  const sharedFormFields = (
    name: string | undefined,
    onNameChange: ((v: string) => void) | undefined,
    actions: string[], setActions: (v: string[]) => void,
    params: string[], setParams: (v: string[]) => void,
    userTypes: string[], setUserTypes: (v: string[]) => void,
    active: boolean, setActive: (v: boolean) => void,
    descriptions: Record<string, string>, setDescriptions: (v: Record<string, string>) => void,
  ) => (
    <div className="flex flex-col gap-4">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          {onNameChange !== undefined ? (
            <Input label={t('fieldCommand')} value={name ?? ''} onChange={(e) => onNameChange(e.target.value)} />
          ) : (
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">{t('fieldCommand')}</label>
              <p className="text-sm font-medium text-text">{name}</p>
            </div>
          )}
        </div>
        <div className="flex-1">
          <MultiSelect label={t('fieldPermissions')} value={userTypes} onChange={setUserTypes} options={USER_TYPE_OPTIONS} />
        </div>
        <div className="pb-1">
          <label className="block text-xs font-medium text-muted mb-1.5">{t('fieldActive')}</label>
          <Toggle checked={active} onChange={setActive} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <TagInput label={t('fieldActions')} value={actions} onChange={setActions} />
        <TagInput label={t('fieldParameters')} value={params} onChange={setParams} />
      </div>
      <DescriptionEditor
        value={descriptions}
        onChange={setDescriptions}
        label={t('fieldDescriptions')}
        addLangLabel={t('addLanguage')}
        langLabel={t('fieldLanguage')}
      />
    </div>
  );

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
        <Table<TenantCommandConfigSummary>
          columns={columns}
          data={configs ?? []}
          keyExtractor={(row) => row.id}
          emptyMessage={t('empty')}
          onRowClick={openModal}
        />
      )}

      {/* Add modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        title={t('addModalTitle')}
        className="max-w-3xl! overflow-y-auto"
        footer={
          <>
            <Button variant="blue" size="sm" onClick={closeAddModal}>{t('cancel')}</Button>
            <Button variant="green" size="sm" onClick={onSubmitAdd} disabled={isUpserting || !addName.trim()}>
              {isUpserting ? t('adding') : t('add')}
            </Button>
          </>
        }
      >
        {sharedFormFields(
          addName, setAddName,
          addActions, setAddActions,
          addParams, setAddParams,
          addUserTypes, setAddUserTypes,
          addActive, setAddActive,
          addDescriptions, setAddDescriptions,
        )}
      </Modal>

      {/* Edit modal */}
      <Modal
        isOpen={!!selectedConfig}
        onClose={closeModal}
        title={t('editModalTitle')}
        className="max-w-3xl! overflow-y-auto"
        footer={
          <>
            <Button variant="blue" size="sm" onClick={closeModal}>{t('cancel')}</Button>
            <Button variant="green" size="sm" onClick={onSubmitEdit} disabled={isUpserting}>
              {isUpserting ? t('saving') : t('save')}
            </Button>
          </>
        }
      >
        {sharedFormFields(
          selectedConfig?.commandName, undefined,
          editActions, setEditActions,
          editParams, setEditParams,
          editUserTypes, setEditUserTypes,
          editActive, setEditActive,
          editDescriptions, setEditDescriptions,
        )}
      </Modal>
    </div>
  );
}
