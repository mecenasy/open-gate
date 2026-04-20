'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useMutation } from '@apollo/client/react';
import { graphql } from '@/app/gql';
import { createRegisterSchema, type RegisterFormValues } from '../schemas/register.schema';

const REGISTER_MUTATION = graphql(`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      success
    }
  }
`);

export const useRegister = () => {
  const tValidation = useTranslations('validation');
  const t = useTranslations('register');
  const [registerMutation, { loading }] = useMutation(REGISTER_MUTATION);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(createRegisterSchema(tValidation)),
  });

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null);
    try {
      const { confirmPassword: _, ...rest } = data;
      await registerMutation({ variables: { input: rest } });
      setSubmittedEmail(data.email);
      reset();
    } catch {
      setServerError(t('registerWrong'));
    }
  });

  return {
    register,
    errors,
    onSubmit,
    loading,
    serverError,
    submittedEmail,
  };
};
