/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any; }
};

export type AcceptAdaptiveLoginType = {
  __typename?: 'AcceptAdaptiveLoginType';
  active: Scalars['Boolean']['output'];
};

export type AcceptType = {
  __typename?: 'AcceptType';
  dataUrl: Scalars['String']['output'];
  status: AuthStatus | '%future added value';
};

export enum AuthStatus {
  Accept2fa = 'accept2fa',
  Adaptive = 'adaptive',
  ChangePassword = 'changePassword',
  Email = 'email',
  ForgotPassword = 'forgotPassword',
  Login = 'login',
  Logout = 'logout',
  New = 'new',
  Refresh = 'refresh',
  Reject2fa = 'reject2fa',
  ResetPassword = 'resetPassword',
  Sms = 'sms',
  Tfa = 'tfa'
}

export type ChangePasswordType = {
  newPassword: Scalars['String']['input'];
  oldPassword: Scalars['String']['input'];
};

export type CreateUserType = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
  phone: Scalars['String']['input'];
  surname: Scalars['String']['input'];
  type: Scalars['String']['input'];
};

export type ForgotPasswordType = {
  email: Scalars['String']['input'];
};

export type GetAllUsersType = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};

export type GetUserType = {
  id: Scalars['String']['input'];
};

export type LoginStatusType = {
  __typename?: 'LoginStatusType';
  message?: Maybe<Scalars['String']['output']>;
  phoneId?: Maybe<Scalars['String']['output']>;
  status: AuthStatus | '%future added value';
  user?: Maybe<UserStatusType>;
};

export type LoginType = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  accept2fa: AcceptType;
  adaptiveLogin: AcceptAdaptiveLoginType;
  changePassword: StatusType;
  createUser: UserType;
  forgotPassword: StatusType;
  loginUser: StatusType;
  logoutUser: StatusType;
  optionPasskey: Scalars['JSON']['output'];
  optionPasskeyVerify: StatusType;
  qrChallenge: QrChallengeType;
  qrConfirm: StatusType;
  qrLogin: StatusType;
  qrOption: Scalars['JSON']['output'];
  qrReject: StatusType;
  registerOptionPasskey: Scalars['JSON']['output'];
  registerOptionPasskeyVerify: StatusType;
  reject2fa: StatusType;
  removePasskey: RemovePasskeyType;
  removeUser: SuccessResponseType;
  resetPassword: StatusType;
  updateUser: UserSummaryType;
  updateUserRole: UserSummaryType;
  updateUserStatus: UserSummaryType;
  verify2fa: StatusType;
  verify2faCode: StatusType;
  verifyMfa: StatusType;
};


export type MutationChangePasswordArgs = {
  input: ChangePasswordType;
};


export type MutationCreateUserArgs = {
  input: CreateUserType;
};


export type MutationForgotPasswordArgs = {
  input: ForgotPasswordType;
};


export type MutationLoginUserArgs = {
  input: LoginType;
};


export type MutationOptionPasskeyVerifyArgs = {
  data: Scalars['JSON']['input'];
};


export type MutationQrChallengeArgs = {
  nonce: Scalars['String']['input'];
};


export type MutationQrConfirmArgs = {
  challenge: Scalars['String']['input'];
  data: Scalars['JSON']['input'];
};


export type MutationQrLoginArgs = {
  challenge: Scalars['String']['input'];
  nonce: Scalars['String']['input'];
};


export type MutationQrOptionArgs = {
  challenge: Scalars['String']['input'];
  nonce: Scalars['String']['input'];
};


export type MutationQrRejectArgs = {
  challenge: Scalars['String']['input'];
};


export type MutationRegisterOptionPasskeyVerifyArgs = {
  data: Scalars['JSON']['input'];
};


export type MutationRemovePasskeyArgs = {
  id: Scalars['String']['input'];
};


export type MutationRemoveUserArgs = {
  input: GetUserType;
};


export type MutationResetPasswordArgs = {
  input: ResetPasswordType;
};


export type MutationUpdateUserArgs = {
  input: UpdateUserType;
};


export type MutationUpdateUserRoleArgs = {
  input: UpdateUserRoleType;
};


export type MutationUpdateUserStatusArgs = {
  input: UpdateUserStatusType;
};


export type MutationVerify2faArgs = {
  code: Scalars['String']['input'];
};


export type MutationVerify2faCodeArgs = {
  input: Verify2faCodeType;
};


export type MutationVerifyMfaArgs = {
  input: VerifyCodeType;
};

export type PassKeyType = {
  __typename?: 'PassKeyType';
  createAt: Scalars['String']['output'];
  credentialID: Scalars['String']['output'];
  deviceName: Scalars['String']['output'];
  id: Scalars['String']['output'];
};

export type QrChallengeType = {
  __typename?: 'QrChallengeType';
  challenge: Scalars['String']['output'];
  dataUrl: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  getPasskeys: Array<PassKeyType>;
  loginStatus: LoginStatusType;
  user: UserSummaryType;
  users: UsersListType;
  verifyToken: VerifyTokenType;
};


export type QueryUserArgs = {
  input: GetUserType;
};


export type QueryUsersArgs = {
  input?: InputMaybe<GetAllUsersType>;
};


export type QueryVerifyTokenArgs = {
  token: Scalars['String']['input'];
};

export type RemovePasskeyType = {
  __typename?: 'RemovePasskeyType';
  status: Scalars['Boolean']['output'];
};

export type ResetPasswordType = {
  password: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

export type StatusType = {
  __typename?: 'StatusType';
  status: AuthStatus | '%future added value';
};

export type SuccessResponseType = {
  __typename?: 'SuccessResponseType';
  success: Scalars['Boolean']['output'];
};

export type UpdateUserRoleType = {
  id: Scalars['ID']['input'];
  type: UserRole | '%future added value';
};

export type UpdateUserStatusType = {
  id: Scalars['ID']['input'];
  status: UserStatus | '%future added value';
};

export type UpdateUserType = {
  email?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  surname?: InputMaybe<Scalars['String']['input']>;
};

export enum UserRole {
  Admin = 'Admin',
  Member = 'Member',
  Owner = 'Owner',
  SuperUser = 'SuperUser',
  User = 'User'
}

export enum UserStatus {
  Active = 'Active',
  Banned = 'Banned',
  Pending = 'Pending',
  Suspended = 'Suspended'
}

export type UserStatusType = {
  __typename?: 'UserStatusType';
  admin: Scalars['Boolean']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  is2faEnabled: Scalars['Boolean']['output'];
  isAdaptiveLoginEnabled: Scalars['Boolean']['output'];
};

export type UserSummaryType = {
  __typename?: 'UserSummaryType';
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  phone: Scalars['String']['output'];
  status: UserStatus | '%future added value';
  surname: Scalars['String']['output'];
  type: UserRole | '%future added value';
};

export type UserType = {
  __typename?: 'UserType';
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
};

export type UsersListType = {
  __typename?: 'UsersListType';
  total: Scalars['Int']['output'];
  users: Array<UserSummaryType>;
};

export type Verify2faCodeType = {
  code: Scalars['String']['input'];
  email: Scalars['String']['input'];
};

export type VerifyCodeType = {
  code: Scalars['Float']['input'];
  email: Scalars['String']['input'];
};

export type VerifyTokenType = {
  __typename?: 'VerifyTokenType';
  verify: Scalars['Boolean']['output'];
};

export type QrRejectMutationVariables = Exact<{
  challenge: Scalars['String']['input'];
}>;


export type QrRejectMutation = { __typename?: 'Mutation', qrReject: { __typename?: 'StatusType', status: AuthStatus } };

export type QrOptionMutationVariables = Exact<{
  challenge: Scalars['String']['input'];
  nonce: Scalars['String']['input'];
}>;


export type QrOptionMutation = { __typename?: 'Mutation', qrOption: any };

export type QrVerifyMutationVariables = Exact<{
  challenge: Scalars['String']['input'];
  data: Scalars['JSON']['input'];
}>;


export type QrVerifyMutation = { __typename?: 'Mutation', qrConfirm: { __typename?: 'StatusType', status: AuthStatus } };

export type AcceptTfaMutationVariables = Exact<{ [key: string]: never; }>;


export type AcceptTfaMutation = { __typename?: 'Mutation', accept2fa: { __typename?: 'AcceptType', status: AuthStatus, dataUrl: string } };

export type RejectTfaMutationVariables = Exact<{ [key: string]: never; }>;


export type RejectTfaMutation = { __typename?: 'Mutation', reject2fa: { __typename?: 'StatusType', status: AuthStatus } };

export type Verify2faMutationVariables = Exact<{
  code: Scalars['String']['input'];
}>;


export type Verify2faMutation = { __typename?: 'Mutation', verify2fa: { __typename?: 'StatusType', status: AuthStatus } };

export type AcceptAdaptiveLoginMutationVariables = Exact<{ [key: string]: never; }>;


export type AcceptAdaptiveLoginMutation = { __typename?: 'Mutation', adaptiveLogin: { __typename?: 'AcceptAdaptiveLoginType', active: boolean } };

export type StatusQueryVariables = Exact<{ [key: string]: never; }>;


export type StatusQuery = { __typename?: 'Query', loginStatus: { __typename?: 'LoginStatusType', status: AuthStatus, phoneId?: string | null, user?: { __typename?: 'UserStatusType', id: string, email: string, is2faEnabled: boolean, isAdaptiveLoginEnabled: boolean, admin: boolean } | null } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logoutUser: { __typename?: 'StatusType', status: AuthStatus } };

export type LoginMutationVariables = Exact<{
  input: LoginType;
}>;


export type LoginMutation = { __typename?: 'Mutation', loginUser: { __typename?: 'StatusType', status: AuthStatus } };

export type QrChallengeMutationVariables = Exact<{
  nonce: Scalars['String']['input'];
}>;


export type QrChallengeMutation = { __typename?: 'Mutation', qrChallenge: { __typename?: 'QrChallengeType', challenge: string, dataUrl: string } };

export type QrLoginMutationVariables = Exact<{
  challenge: Scalars['String']['input'];
  nonce: Scalars['String']['input'];
}>;


export type QrLoginMutation = { __typename?: 'Mutation', qrLogin: { __typename?: 'StatusType', status: AuthStatus } };

export type RegisterMutationVariables = Exact<{
  input: CreateUserType;
}>;


export type RegisterMutation = { __typename?: 'Mutation', createUser: { __typename?: 'UserType', id: string, email: string } };

export type GetUsersQueryVariables = Exact<{
  input?: InputMaybe<GetAllUsersType>;
}>;


export type GetUsersQuery = { __typename?: 'Query', users: { __typename?: 'UsersListType', total: number, users: Array<{ __typename?: 'UserSummaryType', id: string, name: string, surname: string, email: string, phone: string, status: UserStatus, type: UserRole }> } };

export type UpdateUserMutationVariables = Exact<{
  input: UpdateUserType;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser: { __typename?: 'UserSummaryType', id: string, name: string, surname: string, email: string, phone: string, status: UserStatus, type: UserRole } };

export type UpdateUserStatusMutationVariables = Exact<{
  input: UpdateUserStatusType;
}>;


export type UpdateUserStatusMutation = { __typename?: 'Mutation', updateUserStatus: { __typename?: 'UserSummaryType', id: string, name: string, surname: string, email: string, phone: string, status: UserStatus, type: UserRole } };

export type UpdateUserRoleMutationVariables = Exact<{
  input: UpdateUserRoleType;
}>;


export type UpdateUserRoleMutation = { __typename?: 'Mutation', updateUserRole: { __typename?: 'UserSummaryType', id: string, name: string, surname: string, email: string, phone: string, status: UserStatus, type: UserRole } };

export type RemoveUserMutationVariables = Exact<{
  input: GetUserType;
}>;


export type RemoveUserMutation = { __typename?: 'Mutation', removeUser: { __typename?: 'SuccessResponseType', success: boolean } };

export type VerifyMfaMutationVariables = Exact<{
  input: VerifyCodeType;
}>;


export type VerifyMfaMutation = { __typename?: 'Mutation', verifyMfa: { __typename?: 'StatusType', status: AuthStatus } };

export type Verify2faCodeMutationVariables = Exact<{
  input: Verify2faCodeType;
}>;


export type Verify2faCodeMutation = { __typename?: 'Mutation', verify2faCode: { __typename?: 'StatusType', status: AuthStatus } };

export type GetPasskeyOptionsMutationVariables = Exact<{ [key: string]: never; }>;


export type GetPasskeyOptionsMutation = { __typename?: 'Mutation', optionPasskey: any };

export type VerifyPasskeyMutationVariables = Exact<{
  input: Scalars['JSON']['input'];
}>;


export type VerifyPasskeyMutation = { __typename?: 'Mutation', optionPasskeyVerify: { __typename?: 'StatusType', status: AuthStatus } };

export type GetPasskeysQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPasskeysQuery = { __typename?: 'Query', getPasskeys: Array<{ __typename?: 'PassKeyType', id: string, createAt: string, deviceName: string, credentialID: string }> };

export type RemovePasskeyMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type RemovePasskeyMutation = { __typename?: 'Mutation', removePasskey: { __typename?: 'RemovePasskeyType', status: boolean } };

export type RegisterOptionPasskeyMutationVariables = Exact<{ [key: string]: never; }>;


export type RegisterOptionPasskeyMutation = { __typename?: 'Mutation', registerOptionPasskey: any };

export type VerifyRegistrationMutationVariables = Exact<{
  input: Scalars['JSON']['input'];
}>;


export type VerifyRegistrationMutation = { __typename?: 'Mutation', registerOptionPasskeyVerify: { __typename?: 'StatusType', status: AuthStatus } };


export const QrRejectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"QrReject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"challenge"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"qrReject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"challenge"},"value":{"kind":"Variable","name":{"kind":"Name","value":"challenge"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<QrRejectMutation, QrRejectMutationVariables>;
export const QrOptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"QrOption"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"challenge"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"nonce"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"qrOption"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"challenge"},"value":{"kind":"Variable","name":{"kind":"Name","value":"challenge"}}},{"kind":"Argument","name":{"kind":"Name","value":"nonce"},"value":{"kind":"Variable","name":{"kind":"Name","value":"nonce"}}}]}]}}]} as unknown as DocumentNode<QrOptionMutation, QrOptionMutationVariables>;
export const QrVerifyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"QrVerify"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"challenge"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSON"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"qrConfirm"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"challenge"},"value":{"kind":"Variable","name":{"kind":"Name","value":"challenge"}}},{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<QrVerifyMutation, QrVerifyMutationVariables>;
export const AcceptTfaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AcceptTfa"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accept2fa"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"dataUrl"}}]}}]}}]} as unknown as DocumentNode<AcceptTfaMutation, AcceptTfaMutationVariables>;
export const RejectTfaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RejectTfa"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reject2fa"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<RejectTfaMutation, RejectTfaMutationVariables>;
export const Verify2faDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Verify2fa"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"code"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"verify2fa"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"code"},"value":{"kind":"Variable","name":{"kind":"Name","value":"code"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<Verify2faMutation, Verify2faMutationVariables>;
export const AcceptAdaptiveLoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AcceptAdaptiveLogin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adaptiveLogin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"active"}}]}}]}}]} as unknown as DocumentNode<AcceptAdaptiveLoginMutation, AcceptAdaptiveLoginMutationVariables>;
export const StatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loginStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"phoneId"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"is2faEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"isAdaptiveLoginEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"admin"}}]}}]}}]}}]} as unknown as DocumentNode<StatusQuery, StatusQueryVariables>;
export const LogoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Logout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logoutUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<LogoutMutation, LogoutMutationVariables>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loginUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const QrChallengeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"QrChallenge"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"nonce"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"qrChallenge"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"nonce"},"value":{"kind":"Variable","name":{"kind":"Name","value":"nonce"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"challenge"}},{"kind":"Field","name":{"kind":"Name","value":"dataUrl"}}]}}]}}]} as unknown as DocumentNode<QrChallengeMutation, QrChallengeMutationVariables>;
export const QrLoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"QrLogin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"challenge"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"nonce"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"qrLogin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"challenge"},"value":{"kind":"Variable","name":{"kind":"Name","value":"challenge"}}},{"kind":"Argument","name":{"kind":"Name","value":"nonce"},"value":{"kind":"Variable","name":{"kind":"Name","value":"nonce"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<QrLoginMutation, QrLoginMutationVariables>;
export const RegisterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Register"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateUserType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]} as unknown as DocumentNode<RegisterMutation, RegisterMutationVariables>;
export const GetUsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUsers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"GetAllUsersType"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"users"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"users"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"surname"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]} as unknown as DocumentNode<GetUsersQuery, GetUsersQueryVariables>;
export const UpdateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"surname"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<UpdateUserMutation, UpdateUserMutationVariables>;
export const UpdateUserStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateUserStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserStatusType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUserStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"surname"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<UpdateUserStatusMutation, UpdateUserStatusMutationVariables>;
export const UpdateUserRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateUserRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserRoleType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUserRole"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"surname"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<UpdateUserRoleMutation, UpdateUserRoleMutationVariables>;
export const RemoveUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetUserType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<RemoveUserMutation, RemoveUserMutationVariables>;
export const VerifyMfaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"VerifyMfa"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"VerifyCodeType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"verifyMfa"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<VerifyMfaMutation, VerifyMfaMutationVariables>;
export const Verify2faCodeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Verify2faCode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Verify2faCodeType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"verify2faCode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<Verify2faCodeMutation, Verify2faCodeMutationVariables>;
export const GetPasskeyOptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GetPasskeyOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"optionPasskey"}}]}}]} as unknown as DocumentNode<GetPasskeyOptionsMutation, GetPasskeyOptionsMutationVariables>;
export const VerifyPasskeyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"VerifyPasskey"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSON"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"optionPasskeyVerify"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<VerifyPasskeyMutation, VerifyPasskeyMutationVariables>;
export const GetPasskeysDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPasskeys"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getPasskeys"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createAt"}},{"kind":"Field","name":{"kind":"Name","value":"deviceName"}},{"kind":"Field","name":{"kind":"Name","value":"credentialID"}}]}}]}}]} as unknown as DocumentNode<GetPasskeysQuery, GetPasskeysQueryVariables>;
export const RemovePasskeyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemovePasskey"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removePasskey"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<RemovePasskeyMutation, RemovePasskeyMutationVariables>;
export const RegisterOptionPasskeyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RegisterOptionPasskey"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"registerOptionPasskey"}}]}}]} as unknown as DocumentNode<RegisterOptionPasskeyMutation, RegisterOptionPasskeyMutationVariables>;
export const VerifyRegistrationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"VerifyRegistration"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSON"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"registerOptionPasskeyVerify"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<VerifyRegistrationMutation, VerifyRegistrationMutationVariables>;