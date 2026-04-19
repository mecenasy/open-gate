'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useMutation } from '@apollo/client/react';
import { graphql } from '@/app/gql';
import { verificationSchema } from '@/components/schemas/schemas';
import type * as z from 'zod';

type VerificationFormValues = z.infer<ReturnType<typeof verificationSchema>>;

const VERIFY_MFA_MUTATION = graphql(`
  mutation Verify2fa($code: String!) {
    verify2fa(code: $code) {
      status
    }
  }
`);

export const use2faVerify = (onSuccess: () => void) => {
  const t = useTranslations('settings');
  const tSchemas = useTranslations('schemas');
  const [serverError, setServerError] = useState<string | null>(null);

  const [verify2fa, { loading }] = useMutation(VERIFY_MFA_MUTATION, {
    refetchQueries: ['Status'],
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema(tSchemas)),
  });

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null);
    try {
      await verify2fa({ variables: { code: data.code } });
      onSuccess();
    } catch {
      setServerError(t('wrongCode'));
    }
  });

  return {
    register,
    errors,
    onSubmit,
    serverError,
    isPending: loading,
  };
};
