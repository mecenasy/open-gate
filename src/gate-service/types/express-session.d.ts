import { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/server';
import 'express-session';

declare module 'express-session' {
  interface SessionData extends Session {
    user_id?: string;
    isRegister?: boolean;
    currentChallenge?: PublicKeyCredentialCreationOptionsJSON['challenge'];
    csrfToken?: string;
  }
}
