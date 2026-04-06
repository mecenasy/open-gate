import { Provider } from './provider';

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
export const isSocialUser = (user: any): user is SocialUser => Boolean(user?.provider);

export interface SocialUser {
  email: string;
  provider: Provider;
  providerId: string;
  name: string;
}
