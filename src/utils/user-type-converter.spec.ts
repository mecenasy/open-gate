import { UserType as ProtoUserType } from 'src/proto/user';
import { UserType as JsUserType } from 'src/db-service/user/user-type';
import {
  jsToProtoUserType,
  protoToJsUserType,
  jsToProtoUserTypes,
  protoToJsUserTypes,
  isValidJsUserType,
  isValidProtoUserType,
} from './user-type-converter';

describe('user-type-converter', () => {
  describe('jsToProtoUserType', () => {
    it.each([
      [JsUserType.Admin, ProtoUserType.ADMIN],
      [JsUserType.SuperUser, ProtoUserType.SUPER_USER],
      [JsUserType.Member, ProtoUserType.MEMBER],
      [JsUserType.User, ProtoUserType.USER],
      [JsUserType.Owner, ProtoUserType.OWNER],
    ])('should convert %s to %s', (js, proto) => {
      expect(jsToProtoUserType(js)).toBe(proto);
    });

    it('should throw for unknown value', () => {
      expect(() => jsToProtoUserType('unknown' as JsUserType)).toThrow();
    });
  });

  describe('protoToJsUserType', () => {
    it.each([
      [ProtoUserType.ADMIN, JsUserType.Admin],
      [ProtoUserType.SUPER_USER, JsUserType.SuperUser],
      [ProtoUserType.MEMBER, JsUserType.Member],
      [ProtoUserType.USER, JsUserType.User],
      [ProtoUserType.OWNER, JsUserType.Owner],
      [ProtoUserType.UNRECOGNIZED, JsUserType.Unrecognized],
    ])('should convert %s to %s', (proto, js) => {
      expect(protoToJsUserType(proto)).toBe(js);
    });

    it('should throw for unknown proto value', () => {
      expect(() => protoToJsUserType(999 as ProtoUserType)).toThrow();
    });
  });

  describe('jsToProtoUserTypes (array)', () => {
    it('should convert array of JS types', () => {
      expect(jsToProtoUserTypes([JsUserType.Admin, JsUserType.User])).toEqual([
        ProtoUserType.ADMIN,
        ProtoUserType.USER,
      ]);
    });

    it('should return empty array for empty input', () => {
      expect(jsToProtoUserTypes([])).toEqual([]);
    });
  });

  describe('protoToJsUserTypes (array)', () => {
    it('should convert array of proto types', () => {
      expect(protoToJsUserTypes([ProtoUserType.ADMIN, ProtoUserType.MEMBER])).toEqual([
        JsUserType.Admin,
        JsUserType.Member,
      ]);
    });
  });

  describe('isValidJsUserType', () => {
    it('should return true for valid types', () => {
      expect(isValidJsUserType('admin')).toBe(true);
      expect(isValidJsUserType('user')).toBe(true);
    });

    it('should return false for invalid types', () => {
      expect(isValidJsUserType('superadmin')).toBe(false);
      expect(isValidJsUserType('')).toBe(false);
    });
  });

  describe('isValidProtoUserType', () => {
    it('should return true for valid proto enum values (0-3)', () => {
      expect(isValidProtoUserType(0)).toBe(true);
      expect(isValidProtoUserType(3)).toBe(true);
    });

    it('should return false for values outside 0-3', () => {
      expect(isValidProtoUserType(-1)).toBe(false);
      expect(isValidProtoUserType(4)).toBe(false);
    });
  });
});
