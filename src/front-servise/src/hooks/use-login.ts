import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { useRouter } from '../components/navigation/navigation';
import { useMutation } from '@apollo/client/react';
import { graphql } from '@/app/gql';
import { AuthStatus } from '@/app/gql/graphql';

const LOGIN_MUTATION = graphql(`
  mutation Login($input: LoginType!) {
    loginUser(input: $input) {
      status
    }
  }
`);

function useLoginSchema() {
  const t = useTranslations('validation');
  return z.object({
    email: z.string().email(t('emailInvalid')),
    password: z
      .string()
      .min(8, t('passwordMin'))
      .regex(/[A-Z]/, t('passwordUppercase'))
      .regex(/[a-z]/, t('passwordLowercase'))
      .regex(/[0-9]/, t('passwordDigit'))
      .regex(/[^A-Za-z0-9]/, t('passwordSpecial')),
  });
}

export const useLogin = (
  setVerifyType: (type: AuthStatus) => void,
  setErrorMessage: (message: string) => void,
  setLogin: (login: string) => void,
) => {
  const router = useRouter();
  const [loginUser, { loading }] = useMutation(LOGIN_MUTATION);
  const t = useTranslations('login');
  const schemas = useLoginSchema();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof schemas>>({
    resolver: zodResolver(schemas),
  });

  const onSubmit = async (data: z.infer<typeof schemas>) => {
    setLogin(data.email);

    try {
      const result = await loginUser({ variables: { input: data } });
      const status = result.data?.loginUser.status;

      if (status === AuthStatus.Login) {
        reset();
        router.replace('/');
        return;
      } else if (status === AuthStatus.Logout) {
        alert(t('loginWrong'));
        return;
      }

      setVerifyType(status as AuthStatus);
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  return {
    errors,
    register,
    onSubmit: handleSubmit(onSubmit),
    loading,
  };
};
