import { UserType as ProtoUserType } from '../proto/user';
import { UserType as JsUserType } from '../grpc-service/user/user-type';

/**
 * Convert JavaScript UserType to Proto UserType
 */
export function jsToProtoUserType(jsUserType: JsUserType): ProtoUserType {
  switch (jsUserType) {
    case JsUserType.Admin:
      return 0; // ProtoUserType.ADMIN
    case JsUserType.SuperUser:
      return 1; // ProtoUserType.SUPER_USER
    case JsUserType.Member:
      return 2; // ProtoUserType.MEMBER
    case JsUserType.User:
      return 3; // ProtoUserType.USER
    default:
      throw new Error(`Unknown UserType: ${String(jsUserType)}`);
  }
}

/**
 * Convert Proto UserType to JavaScript UserType
 */
export function protoToJsUserType(protoUserType: ProtoUserType): JsUserType {
  switch (protoUserType) {
    case ProtoUserType.ADMIN: // ProtoUserType.ADMIN
      return JsUserType.Admin;
    case ProtoUserType.SUPER_USER: // ProtoUserType.SUPER_USER
      return JsUserType.SuperUser;
    case ProtoUserType.MEMBER: // ProtoUserType.MEMBER
      return JsUserType.Member;
    case ProtoUserType.USER: // ProtoUserType.USER
      return JsUserType.User;
    case ProtoUserType.UNRECOGNIZED: // ProtoUserType.UNRECOGNIZED
    default:
      throw new Error(`Unknown Proto UserType: ${protoUserType}`);
  }
}

/**
 * Convert array of JavaScript UserType to array of Proto UserType
 */
export function jsToProtoUserTypes(jsUserTypes: JsUserType[]): ProtoUserType[] {
  return jsUserTypes.map(jsToProtoUserType);
}

/**
 * Convert array of Proto UserType to array of JavaScript UserType
 */
export function protoToJsUserTypes(protoUserTypes: ProtoUserType[]): JsUserType[] {
  return protoUserTypes.map(protoToJsUserType);
}

/**
 * Check if a value is a valid JavaScript UserType
 */
export function isValidJsUserType(value: string): value is JsUserType {
  return Object.values(JsUserType).includes(value as JsUserType);
}

/**
 * Check if a value is a valid Proto UserType
 */
export function isValidProtoUserType(value: number): value is ProtoUserType {
  return value >= 0 && value <= 3; // Valid enum values 0-3
}
