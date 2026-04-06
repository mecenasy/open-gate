import { CommandAction as EntityCommandAction } from '../grpc-service/command/enums/command-action.enum';
import { CommandAction as ProtoCommandAction } from '../proto/command';

export function protoToEntityCommandAction(protoAction: ProtoCommandAction): EntityCommandAction {
  switch (protoAction) {
    case ProtoCommandAction.OPEN:
      return EntityCommandAction.OPEN;
    case ProtoCommandAction.CLOSE:
      return EntityCommandAction.CLOSE;
    case ProtoCommandAction.EXECUTE:
      return EntityCommandAction.EXECUTE;
    case ProtoCommandAction.CANCEL:
      return EntityCommandAction.CANCEL;
    case ProtoCommandAction.RESTART:
      return EntityCommandAction.RESTART;
    case ProtoCommandAction.STOP:
      return EntityCommandAction.STOP;
    case ProtoCommandAction.START:
      return EntityCommandAction.START;
    default:
      return EntityCommandAction.OPEN; // Default fallback
  }
}

export function entityToProtoCommandAction(entityAction: EntityCommandAction): ProtoCommandAction {
  switch (entityAction) {
    case EntityCommandAction.OPEN:
      return ProtoCommandAction.OPEN;
    case EntityCommandAction.CLOSE:
      return ProtoCommandAction.CLOSE;
    case EntityCommandAction.EXECUTE:
      return ProtoCommandAction.EXECUTE;
    case EntityCommandAction.CANCEL:
      return ProtoCommandAction.CANCEL;
    case EntityCommandAction.RESTART:
      return ProtoCommandAction.RESTART;
    case EntityCommandAction.STOP:
      return ProtoCommandAction.STOP;
    case EntityCommandAction.START:
      return ProtoCommandAction.START;
    default:
      return ProtoCommandAction.OPEN; // Default fallback
  }
}
