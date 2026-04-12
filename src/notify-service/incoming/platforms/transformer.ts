import { Injectable } from '@nestjs/common';
import { Platform } from 'src/notify-service/types/platform';
import { UnifiedMessage } from 'src/notify-service/types/unified-message';

@Injectable()
export abstract class Transform {
  platform: Platform;

  abstract transform(data: any): Promise<UnifiedMessage>;
}
