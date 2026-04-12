import { Type } from 'src/proto/notify';
import { Type as AppType } from '../notify-service/types/unified-message';

export class TypeTransformer {
  static toGrpc(type: AppType): Type {
    const typeMap: Record<AppType, Type> = {
      [AppType.Text]: Type.Text,
      [AppType.Image]: Type.Image,
      [AppType.Audio]: Type.Audio,
      [AppType.Poll]: Type.Poll,
      [AppType.Reaction]: Type.MessageReaction,
    };
    return typeMap[type] ?? Type.Text;
  }

  static fromGrpc(type: Type): AppType {
    const typeMap: Record<Type, AppType> = {
      [Type.Text]: AppType.Text,
      [Type.Image]: AppType.Image,
      [Type.Audio]: AppType.Audio,
      [Type.Poll]: AppType.Poll,
      [Type.MessageReaction]: AppType.Reaction,
      [Type.UNRECOGNIZED]: AppType.Text,
    };
    return typeMap[type] ?? AppType.Text;
  }
}
