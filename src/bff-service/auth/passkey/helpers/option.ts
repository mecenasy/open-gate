import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { getRpId } from './get-rpid';

export const generateOption = async (origin: string | undefined, fallbackUrl: string) => {
  const rpID = getRpId(origin, fallbackUrl);

  return await generateAuthenticationOptions({
    rpID,
    allowCredentials: [],
    userVerification: 'required',
  });
};
