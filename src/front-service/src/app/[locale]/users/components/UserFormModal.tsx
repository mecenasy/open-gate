'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Button, Input, Modal, Select } from '@/components/ui';
import type { SelectOption } from '@/components/ui';
import { UserRole, UserStatus } from '@/app/gql/graphql';
import {
  ROLE_LABEL_KEYS,
  ROLE_VALUES,
  STATUS_LABEL_KEYS,
  STATUS_VALUES,
} from '../constants';
import type { UserFormMode, UserSummary } from '../interfaces';
import { createUserSchema, type UserFormValues } from '../schemas/user.schema';
import { useUserCreate } from '../hooks/use-user-create';
import { useUserEdit } from '../hooks/use-user-edit';

interface UserFormModalProps {
  mode: UserFormMode;
  isOpen: boolean;
  selectedUser?: UserSummary | null;
  onClose: () => void;
}

const FORM_ID = 'user-form';

const defaultAddValues: UserFormValues = {
  name: '',
  surname: '',
  email: '',
  phone: '',
  phoneOwner: '',
  status: UserStatus.Active,
  type: UserRole.User,
};

export function UserFormModal({ mode, isOpen, selectedUser, onClose }: UserFormModalProps) {
  const t = useTranslations('users');
  const { createUser, isCreating } = useUserCreate();
  const { updateUser, isUpdating } = useUserEdit();
  const isEdit = mode === 'edit';

  const statusOptions: SelectOption<UserStatus>[] = STATUS_VALUES.map((value) => ({
    value,
    label: t(STATUS_LABEL_KEYS[value]),
  }));

  const roleOptions: SelectOption<UserRole>[] = ROLE_VALUES.map((value) => ({
    value,
    label: t(ROLE_LABEL_KEYS[value]),
  }));

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(createUserSchema(t)),
    defaultValues: defaultAddValues,
  });

  useEffect(() => {
    if (isEdit && selectedUser) {
      reset({
        name: selectedUser.name,
        surname: selectedUser.surname,
        email: selectedUser.email,
        phone: selectedUser.phone,
        phoneOwner: '',
        status: selectedUser.status as UserStatus,
        type: selectedUser.type as UserRole,
      });
    }
    if (!isEdit) {
      reset(defaultAddValues);
    }
  }, [isEdit, selectedUser, reset]);

  const status = watch('status');
  const type = watch('type');

  const onSubmit = async (values: UserFormValues) => {
    if (isEdit) {
      if (!selectedUser) return;
      const { phoneOwner, ...rest } = values;
      void phoneOwner;
      await updateUser(selectedUser, rest);
    } else {
      await createUser(values);
    }
    onClose();
  };

  const submitting = isEdit ? isUpdating : isCreating;
  const title = isEdit ? t('editModalTitle') : t('addModalTitle');
  const submitLabel = isEdit
    ? submitting ? t('saving') : t('save')
    : submitting ? t('adding') : t('add');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="blue" size="sm" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button variant="green" size="sm" form={FORM_ID} type="submit" disabled={submitting}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label={t('fieldName')} error={errors.name?.message} {...register('name')} />
          <Input label={t('fieldSurname')} error={errors.surname?.message} {...register('surname')} />
        </div>
        <Input label={t('fieldEmail')} type="email" error={errors.email?.message} {...register('email')} />
        <Input label={t('fieldPhone')} error={errors.phone?.message} {...register('phone')} />
        {!isEdit && (
          <Input label={t('fieldPhoneOwner')} {...register('phoneOwner')} />
        )}
        <div className="grid grid-cols-2 gap-4">
          <Select<UserStatus>
            label={t('fieldStatus')}
            value={status}
            options={statusOptions}
            onChange={(v) => setValue('status', v)}
          />
          <Select<UserRole>
            label={t('fieldRole')}
            value={type}
            options={roleOptions}
            onChange={(v) => setValue('type', v)}
          />
        </div>
      </form>
    </Modal>
  );
}
