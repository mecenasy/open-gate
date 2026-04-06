import { AuthenticationResponseJSON, verifyAuthenticationResponse } from '@simplewebauthn/server';
import { GetPasskeyResponse } from 'src/proto/passkey';

export const verification = async (
  response: AuthenticationResponseJSON,
  clientUrl: string,
  challenge: string,
  passkey: GetPasskeyResponse,
) => {
  return await verifyAuthenticationResponse({
    response,
    expectedChallenge: challenge,
    expectedOrigin: clientUrl,
    expectedRPID: clientUrl.replace('https://', ''),
    credential: {
      id: passkey.credentialID ?? '',
      publicKey: new Uint8Array(passkey.publicKey ?? []),
      counter: passkey.counter ?? 0,
    },
  });
};
