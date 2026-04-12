import { Platform } from 'src/proto/notify';
import { Platform as AppPlatform } from '../notify-service/types/platform';

export class PlatformTransformer {
  static toGrpc(platform: AppPlatform): Platform {
    switch (platform) {
      case AppPlatform.Signal:
        return Platform.Signal;
      case AppPlatform.Whatsapp:
        return Platform.Whatsapp;
      case AppPlatform.Messenger:
        return Platform.Messenger;
      default:
        return Platform.Signal;
    }
  }

  static fromGrpc(platform: Platform): AppPlatform {
    switch (platform) {
      case Platform.Signal:
        return AppPlatform.Signal;
      case Platform.Whatsapp:
        return AppPlatform.Whatsapp;
      case Platform.Messenger:
        return AppPlatform.Messenger;
      default:
        return AppPlatform.Signal;
    }
  }
}
