import { Injectable } from '@nestjs/common';
import { Platform } from 'src/notify-service/types/platform';
import { UnifiedMessage } from 'src/notify-service/types/unified-message';

export interface TransformContext {
  tenantId?: string;
}

@Injectable()
export abstract class Transform {
  platform: Platform;

  abstract transform(data: any, ctx?: TransformContext): Promise<UnifiedMessage>;
}
