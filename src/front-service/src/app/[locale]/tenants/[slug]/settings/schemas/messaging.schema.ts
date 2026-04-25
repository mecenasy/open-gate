import { z } from 'zod';
import { MESSAGING_CHANNELS, SMS_PROVIDERS } from '../constants';

export type MessagingSchemaT = ReturnType<typeof createMessagingSchema>;

export const createMessagingSchema = (t: (key: string) => string) =>
  z.object({
    defaultSmsProvider: z.enum(SMS_PROVIDERS),
    priorityChannels: z
      .array(z.enum(MESSAGING_CHANNELS))
      .refine((arr) => arr.includes('sms') || arr.includes('email'), {
        message: t('errorChannelsRequireSmsOrEmail'),
      }),
    rateLimitPerMinute: z.number().int().min(1, t('errorRateLimit')),
  });

export type MessagingFormValues = z.infer<MessagingSchemaT>;
