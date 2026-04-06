import { Module } from '@nestjs/common';
import { qrCodeCommands } from './commands/handler';
import { QrCodeCommandsResolver } from './qr-code-command-resolver';

@Module({
  providers: [...qrCodeCommands, QrCodeCommandsResolver],
})
export class QrCodeModule {}
