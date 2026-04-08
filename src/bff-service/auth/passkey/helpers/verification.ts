import { AuthenticationResponseJSON, verifyAuthenticationResponse } from '@simplewebauthn/server';
import { GetPasskeyResponse } from 'src/proto/passkey';

export const verification = async (
  response: AuthenticationResponseJSON,
  clientUrl: string,
  challenge: string,
  passkey: GetPasskeyResponse,
) => {
  const url = new URL(clientUrl);
  const expectedRPID = url.hostname;

  return await verifyAuthenticationResponse({
    response,
    expectedChallenge: challenge,
    expectedOrigin: clientUrl,
    expectedRPID,
    credential: {
      id: passkey.credentialID ?? '',
      publicKey: new Uint8Array(passkey.publicKey ?? []),
      counter: passkey.counter ?? 0,
    },
  });
};
