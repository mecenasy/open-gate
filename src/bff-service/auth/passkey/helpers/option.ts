import { generateAuthenticationOptions } from '@simplewebauthn/server';

export const generateOption = async (clientUrl: string) => {
  return await generateAuthenticationOptions({
    rpID: clientUrl?.replace('https://', '').replace('http://', '').replace(':4002', ''),
    allowCredentials: [],
    userVerification: 'required',
  });
};
