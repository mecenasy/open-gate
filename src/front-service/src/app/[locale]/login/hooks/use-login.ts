'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useMutation } from '@apollo/client/react';
import { useRouter } from '@/components/navigation/navigation';
import { graphql } from '@/app/gql';
import { AuthStatus } from '@/app/gql/graphql';
import { createLoginSchema, type LoginFormValues } from '../schemas/login.schema';

const LOGIN_MUTATION = graphql(`
  mutation Login($input: LoginType!) {
    loginUser(input: $input) {
      status
    }
  }
`);

interface VerifyRequest {
  email: string;
  type: AuthStatus;
}

export const useLogin = (onVerifyNeeded: (request: VerifyRequest) => void) => {
  const tValidation = useTranslations('validation');
  const t = useTranslations('login');
  const router = useRouter();
  const [loginUser, { loading }] = useMutation(LOGIN_MUTATION);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(createLoginSchema(tValidation)),
  });

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null);
    try {
      const result = await loginUser({ variables: { input: data } });
      const status = result.data?.loginUser.status;

      if (status === AuthStatus.Login) {
        reset();
        router.replace('/');
        return;
      }

      if (status === AuthStatus.Logout) {
        setServerError(t('loginWrong'));
        return;
      }

      onVerifyNeeded({ email: data.email, type: status as AuthStatus });
    } catch (err) {
      setServerError((err as Error).message);
    }
  });

  return {
    register,
    errors,
    onSubmit,
    loading,
    serverError,
  };
};
