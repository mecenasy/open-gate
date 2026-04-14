import { Injectable } from '@nestjs/common';
import { Platform } from 'src/notify-service/types/platform';
import { UnifiedMessage } from 'src/notify-service/types/unified-message';

@Injectable()
export abstract class Attachment {
  platform: Platform;

  abstract download(data: UnifiedMessage, tenantId?: string): Promise<Buffer>;
}
