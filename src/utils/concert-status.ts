// Twoje enumy

import { UserStatus } from 'src/db-service/user/status';
import { Status } from 'src/proto/user';

/**
 * Konwersja: Liczba (DB/Proto) -> String (API)
 */
export function protoToUserStatus(status: Status): UserStatus {
  switch (status) {
    case Status.PENDING:
      return UserStatus.Pending;
    case Status.ACTIVE:
      return UserStatus.Active;
    case Status.SUSPENDED:
      return UserStatus.Suspended;
    case Status.BANNED:
      return UserStatus.Banned;
    default:
      throw new Error(`unknown Status value:`);
  }
}

/**
 * Konwersja: String (API) -> Liczba (DB/Proto)
 */
export function userStatusToProto(userStatus: UserStatus): Status {
  switch (userStatus) {
    case UserStatus.Pending:
      return Status.PENDING;
    case UserStatus.Active:
      return Status.ACTIVE;
    case UserStatus.Suspended:
      return Status.SUSPENDED;
    case UserStatus.Banned:
      return Status.BANNED;
    default:
      throw new Error(`unknown UserStatus string: `);
  }
}
