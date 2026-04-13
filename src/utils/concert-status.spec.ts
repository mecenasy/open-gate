import { Status } from 'src/proto/user';
import { UserStatus } from 'src/db-service/user/status';
import { protoToUserStatus, userStatusToProto } from './concert-status';

describe('concert-status converters', () => {
  describe('protoToUserStatus', () => {
    it.each([
      [Status.PENDING, UserStatus.Pending],
      [Status.ACTIVE, UserStatus.Active],
      [Status.SUSPENDED, UserStatus.Suspended],
      [Status.BANNED, UserStatus.Banned],
    ])('should convert proto Status %s to UserStatus %s', (proto, expected) => {
      expect(protoToUserStatus(proto)).toBe(expected);
    });

    it('should throw for unknown proto status', () => {
      expect(() => protoToUserStatus(999 as Status)).toThrow();
    });
  });

  describe('userStatusToProto', () => {
    it.each([
      [UserStatus.Pending, Status.PENDING],
      [UserStatus.Active, Status.ACTIVE],
      [UserStatus.Suspended, Status.SUSPENDED],
      [UserStatus.Banned, Status.BANNED],
    ])('should convert UserStatus %s to proto Status %s', (js, expected) => {
      expect(userStatusToProto(js)).toBe(expected);
    });

    it('should throw for unknown UserStatus', () => {
      expect(() => userStatusToProto('unknown' as UserStatus)).toThrow();
    });
  });

  describe('round-trip', () => {
    it.each(Object.values(UserStatus))('should round-trip UserStatus %s', (status) => {
      expect(protoToUserStatus(userStatusToProto(status))).toBe(status);
    });
  });
});
