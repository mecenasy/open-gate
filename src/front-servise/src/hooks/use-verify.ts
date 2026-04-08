import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { verificationSchema } from '../components/schemas/schemas';
import { useRouter } from '../components/navigation/navigation';
import { useTranslations } from 'next-intl';
import { useMutation } from '@apollo/client/react';
import { graphql } from '@/app/gql';
import { AuthStatus } from '@/app/gql/graphql';

type VerificationFormValues = z.infer<ReturnType<typeof verificationSchema>>;

const getUrl = (type?: AuthStatus) => {
  switch (type) {
    case AuthStatus.Tfa:
    case AuthStatus.Sms:
    case AuthStatus.Email:
      return '/api/auth/verify-otp';

    default:
      return '';
  }
};
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

export const useVerify = (
  login: string,
  verifyType?: AuthStatus,
  callBack?: (status: AuthStatus) => void,
  token?: string,
) => {
  const router = useRouter();
  const t = useTranslations('login');
  const tSchemas = useTranslations('schemas');
  const [verifyMfa, verifyMfaMeta] = useMutation(VERIFY_MFA_MUTATION, { refetchQueries: ['Status'] });
  const [verify2fa, verify2faMeta] = useMutation(VERIFY_2FA_MUTATION, { refetchQueries: ['Status'] });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema(tSchemas)),
  });

  const verify = async (email: string, code: string, token: string = '') => {
    switch (verifyType) {
      case AuthStatus.Sms:
      case AuthStatus.Email: {
        const result = await verifyMfa({ variables: { input: { email, code: +code } } });
        return result.data?.verifyMfa;
      }
      case AuthStatus.Tfa: {
        const result = await verify2fa({ variables: { input: { email, code } } });
        return result.data?.verify2faCode;
      }
      default:
        return;
    }
  };

  const onSubmit = async ({ code }: VerificationFormValues) => {
    try {
      const result = await verify(login, code, token);
      callBack?.(result?.status as AuthStatus);
      router.replace('/');
    } catch (error) {
      console.error('Verification failed:', error);
      alert(t('verifyWrong'));
    }
  };

  return {
    register,
    onSubmit: handleSubmit(onSubmit),
    errors,
    isPending: verifyMfaMeta.loading || verify2faMeta.loading,
  };
};
