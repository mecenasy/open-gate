
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { verificationSchema } from '../components/schemas/schemas';
import { useTranslations } from 'next-intl';
import { useMutation } from '@apollo/client/react';
import { graphql } from '@/app/gql';

type VerificationFormValues = z.infer<ReturnType<typeof verificationSchema>>;

const VERIFY_MFA_MUTATION = graphql(`
  mutation Verify2fa($code:  String!) {
    verify2fa(code: $code) {
      status
    }
  }
`);

export const use2fa = (login: string, onSuccess: () => void) => {
  const t = useTranslations('settings');
  const tSchemas = useTranslations('schemas');

  const [verify2fa, { loading }] = useMutation(VERIFY_MFA_MUTATION, {
    refetchQueries: ['Status']
  });


  const { register, handleSubmit, formState: { errors } } = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema(tSchemas)),
  });

  const onSubmit = async (data: VerificationFormValues) => {
    try {
      await verify2fa({ variables: { code: data.code } });
      onSuccess();
    } catch {
      alert(t('wrongCode'));
    }
  };

  return {
    register,
    errors,
    onSubmit: handleSubmit(onSubmit),
    isPending: loading,
  };
}