import { QrChallengeHandler } from './qr-challenge.handler';
import { QrConfirmHandler } from './qr-confirm.handler';
import { QrOptionHandler } from './qr-option.handler';
import { QrLoginHandler } from './qr-login.handler';
import { QrRejectHandler } from './qr-reject.handler';

export const qrCodeCommands = [QrChallengeHandler, QrConfirmHandler, QrOptionHandler, QrLoginHandler, QrRejectHandler];
