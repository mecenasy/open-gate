'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Button, Input, Modal, Table, Textarea, TagInput, MultiSelect, Toggle } from '@/components/ui';
import type { TableColumn, SelectOption } from '@/components/ui';
import { useCommands } from '@/hooks/use-commands';
import type { CommandSummary } from '@/hooks/use-commands';

// UserType db enum values (key → value: 'owner', 'admin', 'super_user', 'member', 'user')
const ROLE_VALUES = {
  Owner: 'owner',
  Admin: 'admin',
  SuperUser: 'super_user',
  Member: 'member',
  User: 'user',
} as const;

// ── badge config — keyed by UserType value ────────────────────────────────────

const ROLE_BADGE: Record<string, { dot: string; pill: string }> = {
  owner: {
    dot: 'bg-rose-700',
    pill: 'bg-rose-800/20 text-rose-500 border border-rose-800/30',
  },
  super_user: {
    dot: 'bg-red-500',
    pill: 'bg-red-500/15 text-red-400 border border-red-500/20',
  },
  admin: {
    dot: 'bg-orange-400',
    pill: 'bg-orange-500/15 text-orange-400 border border-orange-500/20',
  },
  member: {
    dot: 'bg-blue-500',
    pill: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  },
  user: {
    dot: 'bg-slate-500',
    pill: 'bg-slate-500/20 text-slate-400 border border-slate-400/50',
  },
};

function RoleBadge({ role }: { role: string }) {
  const cfg = ROLE_BADGE[role] ?? {
    dot: 'bg-slate-500',
    pill: 'bg-slate-500/20 text-slate-400 border border-slate-400/50',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {role}
    </span>
  );
}

function KeyBadges({ record }: { record: Record<string, boolean> }) {
  const keys = Object.keys(record || {});
  if (keys.length === 0) return <span className="text-muted text-xs">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {keys.map((k) => (
        <span key={k} className="bg-surface border border-border rounded px-1.5 py-0.5 text-xs text-muted">
          {k}
        </span>
      ))}
    </div>
  );
}

// ── form type ─────────────────────────────────────────────────────────────────

type CommandForm = {
  name: string;
  description: string;
};

// ── page ──────────────────────────────────────────────────────────────────────

export default function CommandsPage() {
  const t = useTranslations('commands');

  const {
    commands,
    isLoading,
    selectedCommand,
    openModal,
    closeModal,
    onUpdateCommand,
    onRemoveCommand,
    onToggleActive,
    isUpdatingCommand,
    isAddModalOpen,
    openAddModal,
    closeAddModal,
    onCreateCommand,
    isCreatingCommand,
  } = useCommands();

  // ── controlled state for tag inputs + multi-select ──────────────────────────

  const [editActions, setEditActions] = useState<string[]>([]);
  const [editParams, setEditParams] = useState<string[]>([]);
  const [editRoles, setEditRoles] = useState<string[]>([]);
  const [editActive, setEditActive] = useState(true);

  const [addActions, setAddActions] = useState<string[]>([]);
  const [addParams, setAddParams] = useState<string[]>([]);
  const [addRoles, setAddRoles] = useState<string[]>([]);
  const [addActive] = useState(true);

  // ── forms ─────────────────────────────────────────────────────────────────

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommandForm>();

  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    formState: { errors: errorsAdd },
  } = useForm<CommandForm>();

  // ── populate edit form ────────────────────────────────────────────────────

  useEffect(() => {
    if (selectedCommand) {
      reset({ name: selectedCommand.name, description: selectedCommand.description });
      setEditActions(Object.keys(selectedCommand.actions || {}));
      setEditParams(Object.keys(selectedCommand.parameters || {}));
      setEditRoles(selectedCommand.roleNames);
      setEditActive(selectedCommand.active);
    }
  }, [selectedCommand, reset]);

  // ── submit handlers ───────────────────────────────────────────────────────

  // value = UserType db enum value sent to API, label = human-readable key shown in UI
  const ROLE_OPTIONS: SelectOption<string>[] = [
    { value: ROLE_VALUES.Owner, label: t('roleOwner') },
    { value: ROLE_VALUES.SuperUser, label: t('roleSuperUser') },
    { value: ROLE_VALUES.Admin, label: t('roleAdmin') },
    { value: ROLE_VALUES.Member, label: t('roleMember') },
    { value: ROLE_VALUES.User, label: t('roleUser') },
  ];

  const toRecord = (keys: string[]): Record<string, boolean> =>
    Object.fromEntries(keys.map((k) => [k, true]));

  const onSubmitEdit = async (data: CommandForm) => {
    await onUpdateCommand({
      name: data.name,
      description: data.description,
      active: editActive,
      actions: toRecord(editActions),
      parameters: toRecord(editParams),
      roleNames: editRoles,
    });
    closeModal();
  };

  const onSubmitAdd = async (data: CommandForm) => {
    await onCreateCommand({
      name: data.name,
      description: data.description,
      actions: toRecord(addActions),
      parameters: toRecord(addParams),
      roleNames: addRoles,
    });
    resetAdd();
    setAddActions([]);
    setAddParams([]);
    setAddRoles([]);
    closeAddModal();
  };

  // ── table columns ─────────────────────────────────────────────────────────

  const columns: TableColumn<CommandSummary>[] = [
    { key: 'name', header: t('colName') },
    {
      key: 'actions',
      header: t('colActions'),
      render: (val) => <KeyBadges record={val as Record<string, boolean>} />,
    },
    {
      key: 'parameters',
      header: t('colParameters'),
      render: (val) => <KeyBadges record={val as Record<string, boolean>} />,
    },
    {
      key: 'roleNames',
      header: t('colPermissions'),
      render: (val) => (
        <div className="flex flex-wrap gap-1">
          {(val as string[]).length === 0
            ? <span className="text-muted text-xs">—</span>
            : (val as string[]).map((r) => <RoleBadge key={r} role={r} />)
          }
        </div>
      ),
    },
    {
      key: 'active',
      header: t('colActive'),
      render: (val, row) => (
        <span onClick={(e) => e.stopPropagation()}>
          <Toggle
            checked={val as boolean}
            onChange={(checked) => onToggleActive(row.id, checked)}
          />
        </span>
      ),
    },
    {
      key: 'id',
      header: '',
      align: 'right',
      render: (val) => (
        <span onClick={(e) => e.stopPropagation()}>
          <Button variant="red" size="sm" onClick={() => onRemoveCommand(val as string)}>
            {t('delete')}
          </Button>
        </span>
      ),
    },
  ];

  // ── modal shared form section ─────────────────────────────────────────────

  const renderModalFields = (
    mode: 'edit' | 'add',
    reg: typeof register,
    errs: typeof errors,
    actions: string[],
    setActions: (v: string[]) => void,
    params: string[],
    setParams: (v: string[]) => void,
    roles: string[],
    setRoles: (v: string[]) => void,
    active: boolean,
    setActive?: (v: boolean) => void,
  ) => (
    <div className="flex flex-col gap-4">
      {/* row 1: name · permissions · active */}
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Input
            label={t('fieldName')}
            error={errs.name?.message}
            {...reg('name', { required: t('required') })}
          />
        </div>
        <div className="flex-1">
          <MultiSelect
            label={t('fieldPermissions')}
            value={roles}
            onChange={setRoles}
            options={ROLE_OPTIONS}
          />
        </div>
        <div className="pb-1">
          <label className="block text-xs font-medium text-muted mb-1.5">{t('fieldActive')}</label>
          <Toggle
            checked={active}
            onChange={setActive}
          />
        </div>
      </div>

      {/* row 2: actions tag input */}
      <TagInput
        label={t('fieldActions')}
        value={actions}
        onChange={setActions}
      />

      {/* row 3: parameters tag input */}
      <TagInput
        label={t('fieldParameters')}
        value={params}
        onChange={setParams}
      />

      {/* row 4: description */}
      <Textarea
        label={t('fieldDescription')}
        error={errs.description?.message}
        {...reg('description')}
      />
    </div>
  );

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold text-text">{t('title')}</h1>
        <Button variant="green" onClick={openAddModal}>
          {t('addButton')}
        </Button>
      </div>

      {/* table */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <div className="w-6 h-6 rounded-full border-2 border-border border-t-blue-500 animate-spin" />
        </div>
      ) : (
        <Table<CommandSummary>
          columns={columns}
          data={commands ?? []}
          keyExtractor={(row) => row.id}
          emptyMessage={t('empty')}
          onRowClick={openModal}
        />
      )}

      {/* add modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        title={t('addModalTitle')}
        className="max-w-3xl! overflow-y-auto"
        footer={
          <>
            <Button variant="blue" size="sm" onClick={closeAddModal}>{t('cancel')}</Button>
            <Button
              variant="green"
              size="sm"
              form="add-command-form"
              type="submit"
              disabled={isCreatingCommand}
            >
              {isCreatingCommand ? t('adding') : t('add')}
            </Button>
          </>
        }
      >
        <form id="add-command-form" onSubmit={handleSubmitAdd(onSubmitAdd)}>
          {renderModalFields(
            'add', registerAdd, errorsAdd,
            addActions, setAddActions,
            addParams, setAddParams,
            addRoles, setAddRoles,
            addActive,
          )}
        </form>
      </Modal>

      {/* edit modal */}
      <Modal
        isOpen={!!selectedCommand}
        onClose={closeModal}
        title={t('editModalTitle')}
        className="max-w-3xl! overflow-y-auto"
        footer={
          <>
            <Button variant="blue" size="sm" onClick={closeModal}>{t('cancel')}</Button>
            <Button
              variant="green"
              size="sm"
              form="edit-command-form"
              type="submit"
              disabled={isUpdatingCommand}
            >
              {isUpdatingCommand ? t('saving') : t('save')}
            </Button>
          </>
        }
      >
        <form id="edit-command-form" onSubmit={handleSubmit(onSubmitEdit)}>
          {renderModalFields(
            'edit', register, errors,
            editActions, setEditActions,
            editParams, setEditParams,
            editRoles, setEditRoles,
            editActive, setEditActive,
          )}
        </form>
      </Modal>
    </div>
  );
}
