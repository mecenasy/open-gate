import { AuthenticationResponseJSON, verifyAuthenticationResponse } from '@simplewebauthn/server';
import { GetPasskeyResponse } from 'src/proto/passkey';
import { getRpId } from './get-rpid';

export const verification = async (
  response: AuthenticationResponseJSON,
  origin: string | undefined,
  fallbackUrl: string,
  challenge: string,
  passkey: GetPasskeyResponse,
) => {
  const expectedRPID = getRpId(origin, fallbackUrl);
  const expectedOrigin = origin || fallbackUrl;

  return await verifyAuthenticationResponse({
    response,
    expectedChallenge: challenge,
    expectedOrigin,
    expectedRPID,
    credential: {
      id: passkey.credentialID ?? '',
      publicKey: new Uint8Array(passkey.publicKey ?? []),
      counter: passkey.counter ?? 0,
    },
  });
};
