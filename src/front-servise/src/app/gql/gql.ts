/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
  '\n  mutation QrReject ($challenge: String!) {\n    qrReject(challenge: $challenge) {\n      status\n    }\n  }\n': typeof types.QrRejectDocument;
  '\n  mutation QrOption ($challenge: String!, $nonce: String!) {\n    qrOption(challenge: $challenge, nonce: $nonce)    \n  }\n': typeof types.QrOptionDocument;
  '\n  mutation QrVerify ($challenge: String!, $data: JSON!) {\n    qrConfirm(challenge: $challenge, data: $data) {\n      status\n    }    \n  }\n': typeof types.QrVerifyDocument;
  '\n  mutation AcceptTfa {\n    accept2fa {\n      status\n      dataUrl\n    }\n  }\n': typeof types.AcceptTfaDocument;
  '\n  mutation RejectTfa {\n    reject2fa {\n      status\n    }\n  }\n': typeof types.RejectTfaDocument;
  '\n  mutation Verify2fa($code: String!) {\n    verify2fa(code: $code) {\n      status\n    }\n  }\n': typeof types.Verify2faDocument;
  '\n  mutation AcceptAdaptiveLogin {\n    adaptiveLogin {\n      active\n    }\n  }\n': typeof types.AcceptAdaptiveLoginDocument;
  '\n  query Status {\n    loginStatus {\n      status\n      phoneId\n      user {\n        id\n        email\n        is2faEnabled\n        isAdaptiveLoginEnabled\n        admin\n      }\n    }\n  }\n': typeof types.StatusDocument;
  '\n  mutation Logout {\n    logoutUser {\n      status\n    }\n  }\n': typeof types.LogoutDocument;
  '\n  mutation Login($input: LoginType!) {\n    loginUser(input: $input) {\n      status\n    }\n  }\n': typeof types.LoginDocument;
  '\n  mutation QrChallenge($nonce: String!) {\n    qrChallenge(nonce: $nonce) {\n      challenge\n      dataUrl\n    }\n  }\n': typeof types.QrChallengeDocument;
  '\n  mutation QrLogin($challenge: String!, $nonce: String!) {\n    qrLogin(challenge: $challenge, nonce: $nonce) {\n      status\n    }\n  }\n': typeof types.QrLoginDocument;
  '\n  mutation Register($input: CreateUserType!) {\n    createUser(input: $input) {\n      id\n      email\n    }\n  }\n': typeof types.RegisterDocument;
  '\n  query GetUsers($input: GetAllUsersType) {\n    users(input: $input) {\n      users {\n        id\n        name\n        surname\n        email\n        phone\n        status\n        type\n      }\n      total\n    }\n  }\n': typeof types.GetUsersDocument;
  '\n  mutation UpdateUser($input: UpdateUserType!) {\n    updateUser(input: $input) {\n      id\n      name\n      surname\n      email\n      phone\n      status\n      type\n    }\n  }\n': typeof types.UpdateUserDocument;
  '\n  mutation UpdateUserStatus($input: UpdateUserStatusType!) {\n    updateUserStatus(input: $input) {\n      id\n      name\n      surname\n      email\n      phone\n      status\n      type\n    }\n  }\n': typeof types.UpdateUserStatusDocument;
  '\n  mutation UpdateUserRole($input: UpdateUserRoleType!) {\n    updateUserRole(input: $input) {\n      id\n      name\n      surname\n      email\n      phone\n      status\n      type\n    }\n  }\n': typeof types.UpdateUserRoleDocument;
  '\n  mutation RemoveUser($input: GetUserType!) {\n    removeUser(input: $input) {\n      success\n    }\n  }\n': typeof types.RemoveUserDocument;
  '\n  mutation VerifyMfa($input: VerifyCodeType!) {\n    verifyMfa(input: $input) {\n      status\n    }\n  }\n': typeof types.VerifyMfaDocument;
  '\n  mutation Verify2faCode($input: Verify2faCodeType!) {\n    verify2faCode(input: $input) {\n      status\n    }\n  }\n': typeof types.Verify2faCodeDocument;
  '\n  mutation GetPasskeyOptions {\n    optionPasskey\n  }\n': typeof types.GetPasskeyOptionsDocument;
  '\n  mutation VerifyPasskey($input: JSON!) {\n    optionPasskeyVerify(data: $input) {\n      status\n    }\n  }\n': typeof types.VerifyPasskeyDocument;
  '\n  query GetPasskeys {\n    getPasskeys {\n      id\n      createAt\n      deviceName\n      credentialID\n    }\n  }\n': typeof types.GetPasskeysDocument;
  '\n  mutation RemovePasskey($id: String!) {\n    removePasskey(id: $id) {\n      status\n    }\n  }\n': typeof types.RemovePasskeyDocument;
  '\n  mutation RegisterOptionPasskey {\n    registerOptionPasskey\n  }\n': typeof types.RegisterOptionPasskeyDocument;
  '\n  mutation VerifyRegistration($input: JSON!) {\n    registerOptionPasskeyVerify(data: $input) {\n      status\n    }\n  }\n': typeof types.VerifyRegistrationDocument;
};
const documents: Documents = {
  '\n  mutation QrReject ($challenge: String!) {\n    qrReject(challenge: $challenge) {\n      status\n    }\n  }\n':
    types.QrRejectDocument,
  '\n  mutation QrOption ($challenge: String!, $nonce: String!) {\n    qrOption(challenge: $challenge, nonce: $nonce)    \n  }\n':
    types.QrOptionDocument,
  '\n  mutation QrVerify ($challenge: String!, $data: JSON!) {\n    qrConfirm(challenge: $challenge, data: $data) {\n      status\n    }    \n  }\n':
    types.QrVerifyDocument,
  '\n  mutation AcceptTfa {\n    accept2fa {\n      status\n      dataUrl\n    }\n  }\n': types.AcceptTfaDocument,
  '\n  mutation RejectTfa {\n    reject2fa {\n      status\n    }\n  }\n': types.RejectTfaDocument,
  '\n  mutation Verify2fa($code: String!) {\n    verify2fa(code: $code) {\n      status\n    }\n  }\n':
    types.Verify2faDocument,
  '\n  mutation AcceptAdaptiveLogin {\n    adaptiveLogin {\n      active\n    }\n  }\n':
    types.AcceptAdaptiveLoginDocument,
  '\n  query Status {\n    loginStatus {\n      status\n      phoneId\n      user {\n        id\n        email\n        is2faEnabled\n        isAdaptiveLoginEnabled\n        admin\n      }\n    }\n  }\n':
    types.StatusDocument,
  '\n  mutation Logout {\n    logoutUser {\n      status\n    }\n  }\n': types.LogoutDocument,
  '\n  mutation Login($input: LoginType!) {\n    loginUser(input: $input) {\n      status\n    }\n  }\n':
    types.LoginDocument,
  '\n  mutation QrChallenge($nonce: String!) {\n    qrChallenge(nonce: $nonce) {\n      challenge\n      dataUrl\n    }\n  }\n':
    types.QrChallengeDocument,
  '\n  mutation QrLogin($challenge: String!, $nonce: String!) {\n    qrLogin(challenge: $challenge, nonce: $nonce) {\n      status\n    }\n  }\n':
    types.QrLoginDocument,
  '\n  mutation Register($input: CreateUserType!) {\n    createUser(input: $input) {\n      id\n      email\n    }\n  }\n':
    types.RegisterDocument,
  '\n  query GetUsers($input: GetAllUsersType) {\n    users(input: $input) {\n      users {\n        id\n        name\n        surname\n        email\n        phone\n        status\n        type\n      }\n      total\n    }\n  }\n':
    types.GetUsersDocument,
  '\n  mutation UpdateUser($input: UpdateUserType!) {\n    updateUser(input: $input) {\n      id\n      name\n      surname\n      email\n      phone\n      status\n      type\n    }\n  }\n':
    types.UpdateUserDocument,
  '\n  mutation UpdateUserStatus($input: UpdateUserStatusType!) {\n    updateUserStatus(input: $input) {\n      id\n      name\n      surname\n      email\n      phone\n      status\n      type\n    }\n  }\n':
    types.UpdateUserStatusDocument,
  '\n  mutation UpdateUserRole($input: UpdateUserRoleType!) {\n    updateUserRole(input: $input) {\n      id\n      name\n      surname\n      email\n      phone\n      status\n      type\n    }\n  }\n':
    types.UpdateUserRoleDocument,
  '\n  mutation RemoveUser($input: GetUserType!) {\n    removeUser(input: $input) {\n      success\n    }\n  }\n':
    types.RemoveUserDocument,
  '\n  mutation VerifyMfa($input: VerifyCodeType!) {\n    verifyMfa(input: $input) {\n      status\n    }\n  }\n':
    types.VerifyMfaDocument,
  '\n  mutation Verify2faCode($input: Verify2faCodeType!) {\n    verify2faCode(input: $input) {\n      status\n    }\n  }\n':
    types.Verify2faCodeDocument,
  '\n  mutation GetPasskeyOptions {\n    optionPasskey\n  }\n': types.GetPasskeyOptionsDocument,
  '\n  mutation VerifyPasskey($input: JSON!) {\n    optionPasskeyVerify(data: $input) {\n      status\n    }\n  }\n':
    types.VerifyPasskeyDocument,
  '\n  query GetPasskeys {\n    getPasskeys {\n      id\n      createAt\n      deviceName\n      credentialID\n    }\n  }\n':
    types.GetPasskeysDocument,
  '\n  mutation RemovePasskey($id: String!) {\n    removePasskey(id: $id) {\n      status\n    }\n  }\n':
    types.RemovePasskeyDocument,
  '\n  mutation RegisterOptionPasskey {\n    registerOptionPasskey\n  }\n': types.RegisterOptionPasskeyDocument,
  '\n  mutation VerifyRegistration($input: JSON!) {\n    registerOptionPasskeyVerify(data: $input) {\n      status\n    }\n  }\n':
    types.VerifyRegistrationDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation QrReject ($challenge: String!) {\n    qrReject(challenge: $challenge) {\n      status\n    }\n  }\n',
): (typeof documents)['\n  mutation QrReject ($challenge: String!) {\n    qrReject(challenge: $challenge) {\n      status\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation QrOption ($challenge: String!, $nonce: String!) {\n    qrOption(challenge: $challenge, nonce: $nonce)    \n  }\n',
): (typeof documents)['\n  mutation QrOption ($challenge: String!, $nonce: String!) {\n    qrOption(challenge: $challenge, nonce: $nonce)    \n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation QrVerify ($challenge: String!, $data: JSON!) {\n    qrConfirm(challenge: $challenge, data: $data) {\n      status\n    }    \n  }\n',
): (typeof documents)['\n  mutation QrVerify ($challenge: String!, $data: JSON!) {\n    qrConfirm(challenge: $challenge, data: $data) {\n      status\n    }    \n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation AcceptTfa {\n    accept2fa {\n      status\n      dataUrl\n    }\n  }\n',
): (typeof documents)['\n  mutation AcceptTfa {\n    accept2fa {\n      status\n      dataUrl\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation RejectTfa {\n    reject2fa {\n      status\n    }\n  }\n',
): (typeof documents)['\n  mutation RejectTfa {\n    reject2fa {\n      status\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation Verify2fa($code: String!) {\n    verify2fa(code: $code) {\n      status\n    }\n  }\n',
): (typeof documents)['\n  mutation Verify2fa($code: String!) {\n    verify2fa(code: $code) {\n      status\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation AcceptAdaptiveLogin {\n    adaptiveLogin {\n      active\n    }\n  }\n',
): (typeof documents)['\n  mutation AcceptAdaptiveLogin {\n    adaptiveLogin {\n      active\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query Status {\n    loginStatus {\n      status\n      phoneId\n      user {\n        id\n        email\n        is2faEnabled\n        isAdaptiveLoginEnabled\n        admin\n      }\n    }\n  }\n',
): (typeof documents)['\n  query Status {\n    loginStatus {\n      status\n      phoneId\n      user {\n        id\n        email\n        is2faEnabled\n        isAdaptiveLoginEnabled\n        admin\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation Logout {\n    logoutUser {\n      status\n    }\n  }\n',
): (typeof documents)['\n  mutation Logout {\n    logoutUser {\n      status\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation Login($input: LoginType!) {\n    loginUser(input: $input) {\n      status\n    }\n  }\n',
): (typeof documents)['\n  mutation Login($input: LoginType!) {\n    loginUser(input: $input) {\n      status\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation QrChallenge($nonce: String!) {\n    qrChallenge(nonce: $nonce) {\n      challenge\n      dataUrl\n    }\n  }\n',
): (typeof documents)['\n  mutation QrChallenge($nonce: String!) {\n    qrChallenge(nonce: $nonce) {\n      challenge\n      dataUrl\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation QrLogin($challenge: String!, $nonce: String!) {\n    qrLogin(challenge: $challenge, nonce: $nonce) {\n      status\n    }\n  }\n',
): (typeof documents)['\n  mutation QrLogin($challenge: String!, $nonce: String!) {\n    qrLogin(challenge: $challenge, nonce: $nonce) {\n      status\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation Register($input: CreateUserType!) {\n    createUser(input: $input) {\n      id\n      email\n    }\n  }\n',
): (typeof documents)['\n  mutation Register($input: CreateUserType!) {\n    createUser(input: $input) {\n      id\n      email\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetUsers($input: GetAllUsersType) {\n    users(input: $input) {\n      users {\n        id\n        name\n        surname\n        email\n        phone\n        status\n        type\n      }\n      total\n    }\n  }\n',
): (typeof documents)['\n  query GetUsers($input: GetAllUsersType) {\n    users(input: $input) {\n      users {\n        id\n        name\n        surname\n        email\n        phone\n        status\n        type\n      }\n      total\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation UpdateUser($input: UpdateUserType!) {\n    updateUser(input: $input) {\n      id\n      name\n      surname\n      email\n      phone\n      status\n      type\n    }\n  }\n',
): (typeof documents)['\n  mutation UpdateUser($input: UpdateUserType!) {\n    updateUser(input: $input) {\n      id\n      name\n      surname\n      email\n      phone\n      status\n      type\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation UpdateUserStatus($input: UpdateUserStatusType!) {\n    updateUserStatus(input: $input) {\n      id\n      name\n      surname\n      email\n      phone\n      status\n      type\n    }\n  }\n',
): (typeof documents)['\n  mutation UpdateUserStatus($input: UpdateUserStatusType!) {\n    updateUserStatus(input: $input) {\n      id\n      name\n      surname\n      email\n      phone\n      status\n      type\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation UpdateUserRole($input: UpdateUserRoleType!) {\n    updateUserRole(input: $input) {\n      id\n      name\n      surname\n      email\n      phone\n      status\n      type\n    }\n  }\n',
): (typeof documents)['\n  mutation UpdateUserRole($input: UpdateUserRoleType!) {\n    updateUserRole(input: $input) {\n      id\n      name\n      surname\n      email\n      phone\n      status\n      type\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation RemoveUser($input: GetUserType!) {\n    removeUser(input: $input) {\n      success\n    }\n  }\n',
): (typeof documents)['\n  mutation RemoveUser($input: GetUserType!) {\n    removeUser(input: $input) {\n      success\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation VerifyMfa($input: VerifyCodeType!) {\n    verifyMfa(input: $input) {\n      status\n    }\n  }\n',
): (typeof documents)['\n  mutation VerifyMfa($input: VerifyCodeType!) {\n    verifyMfa(input: $input) {\n      status\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation Verify2faCode($input: Verify2faCodeType!) {\n    verify2faCode(input: $input) {\n      status\n    }\n  }\n',
): (typeof documents)['\n  mutation Verify2faCode($input: Verify2faCodeType!) {\n    verify2faCode(input: $input) {\n      status\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation GetPasskeyOptions {\n    optionPasskey\n  }\n',
): (typeof documents)['\n  mutation GetPasskeyOptions {\n    optionPasskey\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation VerifyPasskey($input: JSON!) {\n    optionPasskeyVerify(data: $input) {\n      status\n    }\n  }\n',
): (typeof documents)['\n  mutation VerifyPasskey($input: JSON!) {\n    optionPasskeyVerify(data: $input) {\n      status\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetPasskeys {\n    getPasskeys {\n      id\n      createAt\n      deviceName\n      credentialID\n    }\n  }\n',
): (typeof documents)['\n  query GetPasskeys {\n    getPasskeys {\n      id\n      createAt\n      deviceName\n      credentialID\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation RemovePasskey($id: String!) {\n    removePasskey(id: $id) {\n      status\n    }\n  }\n',
): (typeof documents)['\n  mutation RemovePasskey($id: String!) {\n    removePasskey(id: $id) {\n      status\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation RegisterOptionPasskey {\n    registerOptionPasskey\n  }\n',
): (typeof documents)['\n  mutation RegisterOptionPasskey {\n    registerOptionPasskey\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation VerifyRegistration($input: JSON!) {\n    registerOptionPasskeyVerify(data: $input) {\n      status\n    }\n  }\n',
): (typeof documents)['\n  mutation VerifyRegistration($input: JSON!) {\n    registerOptionPasskeyVerify(data: $input) {\n      status\n    }\n  }\n'];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;
