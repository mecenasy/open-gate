import { generateAuthenticationOptions } from '@simplewebauthn/server';

export const generateOption = async (clientUrl: string) => {
  const url = new URL(clientUrl);
  const expectedRPID = url.hostname;

  return await generateAuthenticationOptions({
    rpID: expectedRPID,
    allowCredentials: [],
    userVerification: 'required',
  });
};
