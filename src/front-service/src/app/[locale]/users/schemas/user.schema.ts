import * as z from 'zod';
import { UserRole, UserStatus } from '@/app/gql/graphql';

export const createUserSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, t('required')),
    surname: z.string().min(1, t('required')),
    email: z.email(t('emailInvalid')),
    phone: z.string(),
    phoneOwner: z.string().optional(),
    status: z.enum(UserStatus),
    type: z.enum(UserRole),
  });

export type UserFormValues = z.infer<ReturnType<typeof createUserSchema>>;
