import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from '../components/navigation/navigation';
import { useTranslations } from 'next-intl';
import { useMutation } from '@apollo/client/react';
import { graphql } from '@/app/gql';

export const REGISTER_MUTATION = graphql(`
  mutation Register($input: CreateUserType!) {
    createUser(input: $input) {
      id
      email
    }
  }
`);

function useRegisterSchema() {
  const t = useTranslations('validation');
  const passwordSchema = z
    .string()
    .min(8, t('passwordMin'))
    .regex(/[A-Z]/, t('passwordUppercase'))
    .regex(/[a-z]/, t('passwordLowercase'))
    .regex(/[0-9]/, t('passwordDigit'))
    .regex(/[^A-Za-z0-9]/, t('passwordSpecial'));

  return z
    .object({
      email: z.string().email(t('emailInvalid')),
      name: z.string().min(2, t('fieldMin2')),
      surname: z.string().min(2, t('fieldMin2')),
      phone: z
        .string()
        .min(9, t('phoneMin'))
        .regex(/^\+?[0-9\s\-]+$/, t('phoneInvalid')),
      password: passwordSchema,
      confirmPassword: z.string(),
    })
    .refine((d) => d.password === d.confirmPassword, {
      message: t('passwordsMismatch'),
      path: ['confirmPassword'],
    });
}

export const useRegister = (setError: (message: string) => void) => {
  const [createUser, { loading }] = useMutation(REGISTER_MUTATION);
  const t = useTranslations('register');
  const schemas = useRegisterSchema();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof schemas>>({
    resolver: zodResolver(schemas),
  });

  const onSubmit = async (data: z.infer<typeof schemas>) => {
    try {
      const { confirmPassword: _, ...rest } = data;
      console.log('🚀 ~ onSubmit ~ rest:', rest);
      await createUser({ variables: { input: { ...rest, type: 'user' } } });

      reset();
      router.replace('/');
    } catch (error) {
      setError(t('registerWrong'));
    }
  };

  return {
    register,
    errors,
    onSubmit: handleSubmit(onSubmit),
    loading,
  };
};
