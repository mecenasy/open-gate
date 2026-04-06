import { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/server';
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    user_id?: string;
    isRegister?: boolean;
    currentChallenge?: PublicKeyCredentialCreationOptionsJSON['challenge'];
  }
}
