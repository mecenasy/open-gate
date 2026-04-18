'use client';

import { useState } from 'react';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { useMutation } from '@apollo/client/react';
import { useRouter } from '@/components/navigation/navigation';
import { graphql } from '@/app/gql';
import { AuthStatus } from '@/app/gql/graphql';
import { verificationSchema } from '@/components/schemas/schemas';

type VerificationFormValues = z.infer<ReturnType<typeof verificationSchema>>;

const VERIFY_MFA_MUTATION = graphql(`
  mutation VerifyMfa($input: VerifyCodeType!) {
    verifyMfa(input: $input) {
      status
    }
  }
`);

const VERIFY_2FA_MUTATION = graphql(`
  mutation Verify2faCode($input: Verify2faCodeType!) {
    verify2faCode(input: $input) {
      status
    }
  }
`);

export const useVerify = (email: string, verifyType?: AuthStatus) => {
  const router = useRouter();
  const t = useTranslations('login');
  const tSchemas = useTranslations('schemas');
  const [verifyMfa, verifyMfaMeta] = useMutation(VERIFY_MFA_MUTATION, { refetchQueries: ['Status'] });
  const [verify2fa, verify2faMeta] = useMutation(VERIFY_2FA_MUTATION, { refetchQueries: ['Status'] });
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema(tSchemas)),
  });

  const onSubmit = handleSubmit(async ({ code }) => {
    setServerError(null);
    try {
      switch (verifyType) {
        case AuthStatus.Sms:
        case AuthStatus.Email:
          await verifyMfa({ variables: { input: { email, code: +code } } });
          break;
        case AuthStatus.Tfa:
          await verify2fa({ variables: { input: { email, code } } });
          break;
        default:
          return;
      }
      router.replace('/');
    } catch {
      setServerError(t('verifyWrong'));
    }
  });

  return {
    register,
    errors,
    onSubmit,
    serverError,
    isPending: verifyMfaMeta.loading || verify2faMeta.loading,
  };
};
