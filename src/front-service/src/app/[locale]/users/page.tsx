'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Modal, Select, Table } from '@/components/ui';
import type { TableColumn, SelectOption } from '@/components/ui';
import { UserRole, UserStatus } from '@/app/gql/graphql';
import { useUsers } from '@/hooks/use-users';
import type { UserSummary } from '@/hooks/use-users';

// ── badge config ──────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, { label: string; dot: string; pill: string }> = {
  [UserStatus.Active]: {
    label: 'Active',
    dot: 'bg-emerald-400',
    pill: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  },
  [UserStatus.Pending]: {
    label: 'Pending',
    dot: 'bg-amber-400',
    pill: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  },
  [UserStatus.Suspended]: {
    label: 'Suspended',
    dot: 'bg-orange-400',
    pill: 'bg-orange-500/15 text-orange-400 border border-orange-500/20',
  },
  [UserStatus.Banned]: {
    label: 'Banned',
    dot: 'bg-slate-500',
    pill: 'bg-slate-500/20 text-slate-400 light:text-slate-600 border border-slate-400/50',
  },
};

const ROLE_BADGE: Record<string, { label: string; dot: string; pill: string }> = {
  [UserRole.Owner]: {
    label: 'Owner',
    dot: 'bg-rose-700',
    pill: 'bg-rose-800/20 text-rose-500 border border-rose-800/30',
  },
  [UserRole.SuperUser]: {
    label: 'SuperUser',
    dot: 'bg-red-500',
    pill: 'bg-red-500/15 text-red-400 border border-red-500/20',
  },
  [UserRole.Admin]: {
    label: 'Admin',
    dot: 'bg-orange-400',
    pill: 'bg-orange-500/15 text-orange-400 border border-orange-500/20',
  },
  [UserRole.Member]: {
    label: 'Member',
    dot: 'bg-blue-500',
    pill: 'bg-blue-500/15 text-blue-400 light:text-blue-600 border border-blue-500/30',
  },
  [UserRole.User]: {
    label: 'User',
    dot: 'bg-slate-500',
    pill: 'bg-slate-500/20 text-slate-400 light:text-slate-600 border border-slate-400/50',
  },
};

function StatusBadge({ value }: { value: string }) {
  const cfg = STATUS_BADGE[value] ?? { label: value, dot: 'bg-slate-500', pill: 'bg-slate-500/20 text-slate-400 light:text-slate-600 border border-slate-400/50' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function RoleBadge({ value }: { value: string }) {
  const cfg = ROLE_BADGE[value] ?? { label: value, dot: 'bg-slate-500', pill: 'bg-slate-500/20 text-slate-400 light:text-slate-600 border border-slate-400/50' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ── enums ────────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: SelectOption<UserStatus>[] = [
  { value: UserStatus.Pending, label: 'Pending' },
  { value: UserStatus.Active, label: 'Active' },
  { value: UserStatus.Suspended, label: 'Suspended' },
  { value: UserStatus.Banned, label: 'Banned' },
];

const ROLE_OPTIONS: SelectOption<UserRole>[] = [
  { value: UserRole.Owner, label: 'Owner' },
  { value: UserRole.Admin, label: 'Admin' },
  { value: UserRole.SuperUser, label: 'SuperUser' },
  { value: UserRole.Member, label: 'Member' },
  { value: UserRole.User, label: 'User' },
];

// ── types ─────────────────────────────────────────────────────────────────────

type EditUserForm = {
  name: string;
  surname: string;
  email: string;
  phone: string;
  status: UserStatus;
  type: UserRole;
};

type AddUserForm = {
  name: string;
  surname: string;
  email: string;
  phone: string;
  phoneOwner?: string;
  status: UserStatus;
  type: UserRole;
};

// ── page ──────────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const {
    users,
    isLoading,
    selectedUser,
    openModal,
    closeModal,
    onUpdateUser,
    onUpdateStatus,
    onUpdateRole,
    onRemoveUser,
    isUpdatingUser,
    isAddModalOpen,
    openAddModal,
    closeAddModal,
    onCreateUser,
    isCreatingUser,
  } = useUsers();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EditUserForm>();

  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    watch: watchAdd,
    setValue: setValueAdd,
    formState: { errors: errorsAdd },
  } = useForm<AddUserForm>({
    defaultValues: {
      status: UserStatus.Active,
      type: UserRole.User,
    },
  });

  const watchedAddStatus = watchAdd('status');
  const watchedAddType = watchAdd('type');

  const watchedStatus = watch('status');
  const watchedType = watch('type');

  useEffect(() => {
    if (selectedUser) {
      reset({
        name: selectedUser.name,
        surname: selectedUser.surname,
        email: selectedUser.email,
        phone: selectedUser.phone,
        status: selectedUser.status as UserStatus,
        type: selectedUser.type as UserRole,
      });
    }
  }, [selectedUser, reset]);

  const onSubmitAdd = async (data: AddUserForm) => {
    await onCreateUser(data);
    resetAdd();
    closeAddModal();
  };

  const onSubmit = async (data: EditUserForm) => {
    if (!selectedUser) return;
    const mutations: Promise<unknown>[] = [
      onUpdateUser(data),
    ];
    if (data.status !== selectedUser.status) {
      mutations.push(onUpdateStatus(selectedUser.id, data.status) as Promise<unknown>);
    }
    if (data.type !== selectedUser.type) {
      mutations.push(onUpdateRole(selectedUser.id, data.type) as Promise<unknown>);
    }
    await Promise.all(mutations);
    closeModal();
  };

  const columns: TableColumn<UserSummary>[] = [
    {
      key: 'name',
      header: 'Imię i nazwisko',
      render: (_, row) => `${row.name} ${row.surname}`,
    },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Telefon' },
    {
      key: 'status',
      header: 'Status',
      render: (val) => <StatusBadge value={val as string} />,
    },
    {
      key: 'type',
      header: 'Rola',
      render: (val) => <RoleBadge value={val as string} />,
    },
    {
      key: 'id',
      header: '',
      align: 'right',
      render: (val) => (
        <span onClick={(e) => e.stopPropagation()}>
          <Button
            variant="red"
            size="sm"
            onClick={() => onRemoveUser(val as string)}
          >
            Usuń
          </Button>
        </span>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold text-text">Użytkownicy</h1>
        <Button variant="green" onClick={openAddModal}>
          + Dodaj użytkownika
        </Button>
      </div>

      {/* table */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <div className="w-6 h-6 rounded-full border-2 border-border border-t-blue-500 animate-spin" />
        </div>
      ) : (
        <Table<UserSummary>
          columns={columns}
          data={users ?? []}
          keyExtractor={(row) => row.id}
          emptyMessage="Brak użytkowników"
          onRowClick={openModal}
        />
      )}

      {/* add modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        title="Dodaj użytkownika"
        footer={
          <>
            <Button variant="blue" size="sm" onClick={closeAddModal}>
              Anuluj
            </Button>
            <Button
              variant="green"
              size="sm"
              form="add-user-form"
              type="submit"
              disabled={isCreatingUser}
            >
              {isCreatingUser ? 'Dodawanie…' : 'Dodaj'}
            </Button>
          </>
        }
      >
        <form
          id="add-user-form"
          onSubmit={handleSubmitAdd(onSubmitAdd)}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Imię"
              error={errorsAdd.name?.message}
              {...registerAdd('name', { required: 'Wymagane' })}
            />
            <Input
              label="Nazwisko"
              error={errorsAdd.surname?.message}
              {...registerAdd('surname', { required: 'Wymagane' })}
            />
          </div>
          <Input
            label="Email"
            type="email"
            error={errorsAdd.email?.message}
            {...registerAdd('email', { required: 'Wymagane' })}
          />
          <Input
            label="Telefon"
            error={errorsAdd.phone?.message}
            {...registerAdd('phone')}
          />
          <Input
            label="Telefon do osoby decyzyjnej"
            {...registerAdd('phoneOwner')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select<UserStatus>
              label="Status"
              value={watchedAddStatus}
              options={STATUS_OPTIONS}
              onChange={(v) => setValueAdd('status', v)}
            />
            <Select<UserRole>
              label="Rola"
              value={watchedAddType}
              options={ROLE_OPTIONS}
              onChange={(v) => setValueAdd('type', v)}
            />
          </div>
        </form>
      </Modal>

      {/* edit modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={closeModal}
        title="Edytuj użytkownika"
        footer={
          <>
            <Button variant="blue" size="sm" onClick={closeModal}>
              Anuluj
            </Button>
            <Button
              variant="green"
              size="sm"
              form="edit-user-form"
              type="submit"
              disabled={isUpdatingUser}
            >
              {isUpdatingUser ? 'Zapisywanie…' : 'Zapisz'}
            </Button>
          </>
        }
      >
        <form
          id="edit-user-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Imię"
              error={errors.name?.message}
              {...register('name', { required: 'Wymagane' })}
            />
            <Input
              label="Nazwisko"
              error={errors.surname?.message}
              {...register('surname', { required: 'Wymagane' })}
            />
          </div>
          <Input
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register('email', { required: 'Wymagane' })}
          />
          <Input
            label="Telefon"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select<UserStatus>
              label="Status"
              value={watchedStatus}
              options={STATUS_OPTIONS}
              onChange={(v) => setValue('status', v)}
            />
            <Select<UserRole>
              label="Rola"
              value={watchedType}
              options={ROLE_OPTIONS}
              onChange={(v) => setValue('type', v)}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
