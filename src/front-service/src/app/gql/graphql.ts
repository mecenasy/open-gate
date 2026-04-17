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

export type AddCommandType = {
  actions?: InputMaybe<Scalars['JSON']['input']>;
  command: Scalars['String']['input'];
  description: Scalars['String']['input'];
  name: Scalars['String']['input'];
  parameters?: InputMaybe<Scalars['JSON']['input']>;
  roleNames: Array<Scalars['String']['input']>;
};

export type AddPromptType = {
  commandName: Scalars['String']['input'];
  description: Scalars['String']['input'];
  key: Scalars['String']['input'];
  prompt: Scalars['String']['input'];
  userType: PromptUserType | '%future added value';
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

export type CommandResponseType = {
  __typename?: 'CommandResponseType';
  data?: Maybe<CommandType>;
  message: Scalars['String']['output'];
  status: Scalars['Boolean']['output'];
};

export type CommandType = {
  __typename?: 'CommandType';
  actions?: Maybe<Scalars['JSON']['output']>;
  active: Scalars['Boolean']['output'];
  createdAt: Scalars['String']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  parameters?: Maybe<Scalars['JSON']['output']>;
  roleNames: Array<Scalars['String']['output']>;
  updatedAt: Scalars['String']['output'];
};

export type CommandsListType = {
  __typename?: 'CommandsListType';
  data: Array<CommandType>;
  limit: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  page: Scalars['Int']['output'];
  status: Scalars['Boolean']['output'];
  total: Scalars['Int']['output'];
};

export type ConfigResponseType = {
  __typename?: 'ConfigResponseType';
  data?: Maybe<ConfigType>;
  message: Scalars['String']['output'];
  status: Scalars['Boolean']['output'];
};

export type ConfigType = {
  __typename?: 'ConfigType';
  createdAt: Scalars['String']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  key: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type ConfigsListType = {
  __typename?: 'ConfigsListType';
  data: Array<ConfigType>;
  message: Scalars['String']['output'];
  status: Scalars['Boolean']['output'];
};

export type CreateSimpleUserType = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  phone: Scalars['String']['input'];
  phoneOwner?: InputMaybe<Scalars['String']['input']>;
  status: UserStatus | '%future added value';
  surname: Scalars['String']['input'];
  type: UserRole | '%future added value';
};

export type CreateTenantInput = {
  slug: Scalars['String']['input'];
};

export type CreateTenantResult = {
  __typename?: 'CreateTenantResult';
  id: Scalars['String']['output'];
  schemaName: Scalars['String']['output'];
  slug: Scalars['String']['output'];
};

export type CreateUserType = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password?: InputMaybe<Scalars['String']['input']>;
  phone: Scalars['String']['input'];
  phoneOwner?: InputMaybe<Scalars['String']['input']>;
  surname: Scalars['String']['input'];
  type: Scalars['String']['input'];
};

export type CsrfTokenType = {
  __typename?: 'CsrfTokenType';
  csrfToken: Scalars['String']['output'];
};

export type ForgotPasswordType = {
  email: Scalars['String']['input'];
};

export type GetAllByPermissionType = {
  activeOnly?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  page?: Scalars['Int']['input'];
  roleName: Scalars['String']['input'];
};

export type GetAllCommandsType = {
  actionFilter?: InputMaybe<Scalars['JSON']['input']>;
  activeOnly?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Int']['input'];
  page?: Scalars['Int']['input'];
};

export type GetAllPromptsType = {
  limit?: Scalars['Int']['input'];
  page?: Scalars['Int']['input'];
  userType?: InputMaybe<PromptUserType | '%future added value'>;
};

export type GetAllUsersType = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};

export type GetByPermissionType = {
  id?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  roleName: Scalars['String']['input'];
};

export type GetCommandType = {
  id?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type GetFeatureConfigType = {
  key: Scalars['String']['input'];
};

export type GetPromptByIdType = {
  id: Scalars['String']['input'];
};

export type GetPromptByKeyType = {
  key: Scalars['String']['input'];
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
  addCommand: CommandResponseType;
  addPrompt: PromptResponseType;
  changePassword: StatusType;
  confirmRegistration: SuccessResponseType;
  createSimpleUser: UserType;
  createTenant: CreateTenantResult;
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
  register: SuccessResponseType;
  registerOptionPasskey: Scalars['JSON']['output'];
  registerOptionPasskeyVerify: StatusType;
  reject2fa: StatusType;
  removeCommand: CommandResponseType;
  removePasskey: RemovePasskeyType;
  removePrompt: PromptSuccessType;
  removeUser: SuccessResponseType;
  resetPassword: StatusType;
  toggleActiveStatus: CommandResponseType;
  updateCommand: CommandResponseType;
  updateConfig: ConfigResponseType;
  updatePrompt: PromptResponseType;
  updateTenantCustomization: MutationResult;
  updateUser: UserSummaryType;
  updateUserRole: UserSummaryType;
  updateUserStatus: UserSummaryType;
  upsertPlatformCredentials: MutationResult;
  upsertTenantCommandConfig: MutationResult;
  upsertTenantPromptOverride: MutationResult;
  verify2fa: StatusType;
  verify2faCode: StatusType;
  verifyMfa: StatusType;
};


export type MutationAddCommandArgs = {
  input: AddCommandType;
};


export type MutationAddPromptArgs = {
  input: AddPromptType;
};


export type MutationChangePasswordArgs = {
  input: ChangePasswordType;
};


export type MutationConfirmRegistrationArgs = {
  token: Scalars['String']['input'];
};


export type MutationCreateSimpleUserArgs = {
  input: CreateSimpleUserType;
};


export type MutationCreateTenantArgs = {
  input: CreateTenantInput;
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


export type MutationRegisterArgs = {
  input: RegisterInput;
};


export type MutationRegisterOptionPasskeyVerifyArgs = {
  data: Scalars['JSON']['input'];
};


export type MutationRemoveCommandArgs = {
  input: RemoveCommandType;
};


export type MutationRemovePasskeyArgs = {
  id: Scalars['String']['input'];
};


export type MutationRemovePromptArgs = {
  input: RemovePromptType;
};


export type MutationRemoveUserArgs = {
  input: GetUserType;
};


export type MutationResetPasswordArgs = {
  input: ResetPasswordType;
};


export type MutationToggleActiveStatusArgs = {
  input: ToggleActiveStatusType;
};


export type MutationUpdateCommandArgs = {
  input: UpdateCommandType;
};


export type MutationUpdateConfigArgs = {
  input: UpdateConfigType;
};


export type MutationUpdatePromptArgs = {
  input: UpdatePromptType;
};


export type MutationUpdateTenantCustomizationArgs = {
  input: UpdateCustomizationInput;
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


export type MutationUpsertPlatformCredentialsArgs = {
  input: UpsertPlatformCredentialsInput;
};


export type MutationUpsertTenantCommandConfigArgs = {
  input: UpsertTenantCommandConfigInput;
};


export type MutationUpsertTenantPromptOverrideArgs = {
  input: UpsertTenantPromptOverrideInput;
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

export type MutationResult = {
  __typename?: 'MutationResult';
  message: Scalars['String']['output'];
  status: Scalars['Boolean']['output'];
};

export type PassKeyType = {
  __typename?: 'PassKeyType';
  createAt: Scalars['String']['output'];
  credentialID: Scalars['String']['output'];
  deviceName: Scalars['String']['output'];
  id: Scalars['String']['output'];
};

export type PromptResponseType = {
  __typename?: 'PromptResponseType';
  data?: Maybe<PromptType>;
  message: Scalars['String']['output'];
  status: Scalars['Boolean']['output'];
};

export type PromptSimplyType = {
  __typename?: 'PromptSimplyType';
  commandName: Scalars['String']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  key: Scalars['String']['output'];
  userType: PromptUserType | '%future added value';
};

export type PromptSuccessType = {
  __typename?: 'PromptSuccessType';
  success: Scalars['Boolean']['output'];
};

export type PromptType = {
  __typename?: 'PromptType';
  commandName: Scalars['String']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  key: Scalars['String']['output'];
  prompt: Scalars['String']['output'];
  userType: PromptUserType | '%future added value';
};

export enum PromptUserType {
  Admin = 'ADMIN',
  Member = 'MEMBER',
  Owner = 'OWNER',
  SuperUser = 'SUPER_USER',
  Unrecognized = 'UNRECOGNIZED',
  User = 'USER'
}

export type PromptsListType = {
  __typename?: 'PromptsListType';
  data: Array<PromptSimplyType>;
  message: Scalars['String']['output'];
  status: Scalars['Boolean']['output'];
  total: Scalars['Int']['output'];
};

export type QrChallengeType = {
  __typename?: 'QrChallengeType';
  challenge: Scalars['String']['output'];
  dataUrl: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  command: CommandResponseType;
  commandByPermission: CommandResponseType;
  commands: CommandsListType;
  commandsByPermission: CommandsListType;
  coreConfigs: ConfigsListType;
  csrfToken: CsrfTokenType;
  featureConfig: ConfigsListType;
  featureConfigs: ConfigsListType;
  getPasskeys: Array<PassKeyType>;
  loginStatus: LoginStatusType;
  promptById: PromptResponseType;
  promptByKey: PromptResponseType;
  prompts: PromptsListType;
  tenantCommandConfigs: Array<TenantCommandConfigType>;
  tenantFeatures: TenantFeaturesType;
  tenantPromptOverrides: Array<TenantPromptOverrideType>;
  tenants: Array<TenantType>;
  user: UserSummaryType;
  users: UsersListType;
  verifyToken: VerifyTokenType;
};


export type QueryCommandArgs = {
  input: GetCommandType;
};


export type QueryCommandByPermissionArgs = {
  input: GetByPermissionType;
};


export type QueryCommandsArgs = {
  input?: InputMaybe<GetAllCommandsType>;
};


export type QueryCommandsByPermissionArgs = {
  input: GetAllByPermissionType;
};


export type QueryFeatureConfigArgs = {
  input: GetFeatureConfigType;
};


export type QueryPromptByIdArgs = {
  input: GetPromptByIdType;
};


export type QueryPromptByKeyArgs = {
  input: GetPromptByKeyType;
};


export type QueryPromptsArgs = {
  input?: InputMaybe<GetAllPromptsType>;
};


export type QueryTenantCommandConfigsArgs = {
  tenantId: Scalars['String']['input'];
};


export type QueryTenantPromptOverridesArgs = {
  tenantId: Scalars['String']['input'];
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

export type RegisterInput = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
  phone: Scalars['String']['input'];
  surname: Scalars['String']['input'];
  tenantSlug: Scalars['String']['input'];
};

export type RemoveCommandType = {
  id: Scalars['ID']['input'];
};

export type RemovePasskeyType = {
  __typename?: 'RemovePasskeyType';
  status: Scalars['Boolean']['output'];
};

export type RemovePromptType = {
  id: Scalars['ID']['input'];
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

export type TenantCommandConfigType = {
  __typename?: 'TenantCommandConfigType';
  active: Scalars['Boolean']['output'];
  commandId: Scalars['String']['output'];
  commandName: Scalars['String']['output'];
  id: Scalars['String']['output'];
  parametersOverrideJson?: Maybe<Scalars['String']['output']>;
};

export type TenantFeaturesType = {
  __typename?: 'TenantFeaturesType';
  enableAnalytics: Scalars['Boolean']['output'];
  enableCommandScheduling: Scalars['Boolean']['output'];
  enableGate: Scalars['Boolean']['output'];
  enableMessenger: Scalars['Boolean']['output'];
  enablePayment: Scalars['Boolean']['output'];
  enableSignal: Scalars['Boolean']['output'];
  enableWhatsApp: Scalars['Boolean']['output'];
  maxUsersPerTenant: Scalars['Int']['output'];
};

export type TenantPromptOverrideType = {
  __typename?: 'TenantPromptOverrideType';
  commandId?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  prompt: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
  userType: Scalars['String']['output'];
};

export type TenantType = {
  __typename?: 'TenantType';
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  schemaName: Scalars['String']['output'];
  slug: Scalars['String']['output'];
};

export type ToggleActiveStatusType = {
  active: Scalars['Boolean']['input'];
  id: Scalars['ID']['input'];
};

export type UpdateCommandType = {
  actions?: InputMaybe<Scalars['JSON']['input']>;
  active?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  parameters?: InputMaybe<Scalars['JSON']['input']>;
  roleNames?: Array<Scalars['String']['input']>;
};

export type UpdateConfigType = {
  key: Scalars['String']['input'];
  value: Scalars['String']['input'];
};

export type UpdateCustomizationInput = {
  customizationJson: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};

export type UpdatePromptType = {
  commandName?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  key?: InputMaybe<Scalars['String']['input']>;
  prompt?: InputMaybe<Scalars['String']['input']>;
  userType?: InputMaybe<PromptUserType | '%future added value'>;
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

export type UpsertPlatformCredentialsInput = {
  configJson: Scalars['String']['input'];
  platform: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};

export type UpsertTenantCommandConfigInput = {
  active: Scalars['Boolean']['input'];
  commandId: Scalars['String']['input'];
  parametersOverrideJson?: InputMaybe<Scalars['String']['input']>;
  tenantId: Scalars['String']['input'];
};

export type UpsertTenantPromptOverrideInput = {
  commandId?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  prompt: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
  userType: Scalars['String']['input'];
};

export enum UserRole {
  Admin = 'Admin',
  Member = 'Member',
  Owner = 'Owner',
  SuperUser = 'SuperUser',
  Unrecognized = 'Unrecognized',
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
  owner: Scalars['Boolean']['output'];
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

export type FeatureConfigsQueryVariables = Exact<{ [key: string]: never; }>;


export type FeatureConfigsQuery = { __typename?: 'Query', featureConfigs: { __typename?: 'ConfigsListType', status: boolean, message: string, data: Array<{ __typename?: 'ConfigType', key: string, description: string }> } };

export type GetFeatureConfigQueryVariables = Exact<{
  input: GetFeatureConfigType;
}>;


export type GetFeatureConfigQuery = { __typename?: 'Query', featureConfig: { __typename?: 'ConfigsListType', status: boolean, message: string, data: Array<{ __typename?: 'ConfigType', key: string, value: string, description: string }> } };

export type UpdateFeatureConfigMutationVariables = Exact<{
  input: UpdateConfigType;
}>;


export type UpdateFeatureConfigMutation = { __typename?: 'Mutation', updateConfig: { __typename?: 'ConfigResponseType', status: boolean, message: string, data?: { __typename?: 'ConfigType', key: string, value: string } | null } };

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

export type FeatureConfigsTabQueryVariables = Exact<{ [key: string]: never; }>;


export type FeatureConfigsTabQuery = { __typename?: 'Query', featureConfigs: { __typename?: 'ConfigsListType', status: boolean, message: string, data: Array<{ __typename?: 'ConfigType', key: string, description: string }> } };

export type GetFeatureConfigTabQueryVariables = Exact<{
  input: GetFeatureConfigType;
}>;


export type GetFeatureConfigTabQuery = { __typename?: 'Query', featureConfig: { __typename?: 'ConfigsListType', status: boolean, message: string, data: Array<{ __typename?: 'ConfigType', key: string, value: string, description: string }> } };

export type UpdateFeatureConfigTabMutationVariables = Exact<{
  input: UpdateConfigType;
}>;


export type UpdateFeatureConfigTabMutation = { __typename?: 'Mutation', updateConfig: { __typename?: 'ConfigResponseType', status: boolean, message: string, data?: { __typename?: 'ConfigType', key: string, value: string } | null } };

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


export type StatusQuery = { __typename?: 'Query', loginStatus: { __typename?: 'LoginStatusType', status: AuthStatus, phoneId?: string | null, user?: { __typename?: 'UserStatusType', id: string, email: string, owner: boolean, is2faEnabled: boolean, isAdaptiveLoginEnabled: boolean, admin: boolean } | null } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logoutUser: { __typename?: 'StatusType', status: AuthStatus } };

export type GetCommandsQueryVariables = Exact<{
  input?: InputMaybe<GetAllCommandsType>;
}>;


export type GetCommandsQuery = { __typename?: 'Query', commands: { __typename?: 'CommandsListType', status: boolean, message: string, total: number, data: Array<{ __typename?: 'CommandType', id: string, name: string, description: string, active: boolean, actions?: any | null, parameters?: any | null, roleNames: Array<string> }> } };

export type AddCommandMutationVariables = Exact<{
  input: AddCommandType;
}>;


export type AddCommandMutation = { __typename?: 'Mutation', addCommand: { __typename?: 'CommandResponseType', status: boolean, message: string, data?: { __typename?: 'CommandType', id: string, name: string, description: string, active: boolean, actions?: any | null, parameters?: any | null, roleNames: Array<string> } | null } };

export type UpdateCommandMutationVariables = Exact<{
  input: UpdateCommandType;
}>;


export type UpdateCommandMutation = { __typename?: 'Mutation', updateCommand: { __typename?: 'CommandResponseType', status: boolean, message: string, data?: { __typename?: 'CommandType', id: string } | null } };

export type ToggleActiveStatusMutationVariables = Exact<{
  input: ToggleActiveStatusType;
}>;


export type ToggleActiveStatusMutation = { __typename?: 'Mutation', toggleActiveStatus: { __typename?: 'CommandResponseType', status: boolean, message: string, data?: { __typename?: 'CommandType', id: string, active: boolean } | null } };

export type RemoveCommandMutationVariables = Exact<{
  input: RemoveCommandType;
}>;


export type RemoveCommandMutation = { __typename?: 'Mutation', removeCommand: { __typename?: 'CommandResponseType', status: boolean, message: string } };

export type CoreConfigsQueryVariables = Exact<{ [key: string]: never; }>;


export type CoreConfigsQuery = { __typename?: 'Query', coreConfigs: { __typename?: 'ConfigsListType', status: boolean, message: string, data: Array<{ __typename?: 'ConfigType', key: string, value: string, description: string }> } };

export type UpdateConfigMutationVariables = Exact<{
  input: UpdateConfigType;
}>;


export type UpdateConfigMutation = { __typename?: 'Mutation', updateConfig: { __typename?: 'ConfigResponseType', status: boolean, message: string, data?: { __typename?: 'ConfigType', key: string, value: string } | null } };

export type LoginMutationVariables = Exact<{
  input: LoginType;
}>;


export type LoginMutation = { __typename?: 'Mutation', loginUser: { __typename?: 'StatusType', status: AuthStatus } };

export type GetPromptsQueryVariables = Exact<{
  input?: InputMaybe<GetAllPromptsType>;
}>;


export type GetPromptsQuery = { __typename?: 'Query', prompts: { __typename?: 'PromptsListType', status: boolean, message: string, total: number, data: Array<{ __typename?: 'PromptSimplyType', id: string, key: string, description: string, commandName: string, userType: PromptUserType }> } };

export type GetPromptByIdQueryVariables = Exact<{
  input: GetPromptByIdType;
}>;


export type GetPromptByIdQuery = { __typename?: 'Query', promptById: { __typename?: 'PromptResponseType', status: boolean, message: string, data?: { __typename?: 'PromptType', id: string, key: string, description: string, commandName: string, userType: PromptUserType, prompt: string } | null } };

export type AddPromptMutationVariables = Exact<{
  input: AddPromptType;
}>;


export type AddPromptMutation = { __typename?: 'Mutation', addPrompt: { __typename?: 'PromptResponseType', status: boolean, message: string, data?: { __typename?: 'PromptType', id: string, key: string, description: string, commandName: string, userType: PromptUserType, prompt: string } | null } };

export type UpdatePromptMutationVariables = Exact<{
  input: UpdatePromptType;
}>;


export type UpdatePromptMutation = { __typename?: 'Mutation', updatePrompt: { __typename?: 'PromptResponseType', status: boolean, message: string, data?: { __typename?: 'PromptType', id: string, key: string, description: string, commandName: string, userType: PromptUserType, prompt: string } | null } };

export type RemovePromptMutationVariables = Exact<{
  input: RemovePromptType;
}>;


export type RemovePromptMutation = { __typename?: 'Mutation', removePrompt: { __typename?: 'PromptSuccessType', success: boolean } };

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
  input: RegisterInput;
}>;


export type RegisterMutation = { __typename?: 'Mutation', register: { __typename?: 'SuccessResponseType', success: boolean } };

export type TenantFeaturesQueryVariables = Exact<{ [key: string]: never; }>;


export type TenantFeaturesQuery = { __typename?: 'Query', tenantFeatures: { __typename?: 'TenantFeaturesType', enableSignal: boolean, enableWhatsApp: boolean, enableMessenger: boolean, enableGate: boolean, enablePayment: boolean, enableCommandScheduling: boolean, enableAnalytics: boolean, maxUsersPerTenant: number } };

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

export type CreateSimpleUserMutationVariables = Exact<{
  input: CreateSimpleUserType;
}>;


export type CreateSimpleUserMutation = { __typename?: 'Mutation', createSimpleUser: { __typename?: 'UserType', id: string, email: string } };

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


export const FeatureConfigsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FeatureConfigs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"featureConfigs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<FeatureConfigsQuery, FeatureConfigsQueryVariables>;
export const GetFeatureConfigDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetFeatureConfig"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetFeatureConfigType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"featureConfig"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<GetFeatureConfigQuery, GetFeatureConfigQueryVariables>;
export const UpdateFeatureConfigDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateFeatureConfig"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateConfigType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateConfig"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateFeatureConfigMutation, UpdateFeatureConfigMutationVariables>;
export const QrRejectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"QrReject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"challenge"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"qrReject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"challenge"},"value":{"kind":"Variable","name":{"kind":"Name","value":"challenge"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<QrRejectMutation, QrRejectMutationVariables>;
export const QrOptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"QrOption"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"challenge"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"nonce"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"qrOption"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"challenge"},"value":{"kind":"Variable","name":{"kind":"Name","value":"challenge"}}},{"kind":"Argument","name":{"kind":"Name","value":"nonce"},"value":{"kind":"Variable","name":{"kind":"Name","value":"nonce"}}}]}]}}]} as unknown as DocumentNode<QrOptionMutation, QrOptionMutationVariables>;
export const QrVerifyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"QrVerify"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"challenge"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSON"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"qrConfirm"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"challenge"},"value":{"kind":"Variable","name":{"kind":"Name","value":"challenge"}}},{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<QrVerifyMutation, QrVerifyMutationVariables>;
export const FeatureConfigsTabDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FeatureConfigsTab"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"featureConfigs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<FeatureConfigsTabQuery, FeatureConfigsTabQueryVariables>;
export const GetFeatureConfigTabDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetFeatureConfigTab"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetFeatureConfigType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"featureConfig"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<GetFeatureConfigTabQuery, GetFeatureConfigTabQueryVariables>;
export const UpdateFeatureConfigTabDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateFeatureConfigTab"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateConfigType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateConfig"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateFeatureConfigTabMutation, UpdateFeatureConfigTabMutationVariables>;
export const AcceptTfaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AcceptTfa"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accept2fa"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"dataUrl"}}]}}]}}]} as unknown as DocumentNode<AcceptTfaMutation, AcceptTfaMutationVariables>;
export const RejectTfaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RejectTfa"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reject2fa"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<RejectTfaMutation, RejectTfaMutationVariables>;
export const Verify2faDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Verify2fa"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"code"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"verify2fa"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"code"},"value":{"kind":"Variable","name":{"kind":"Name","value":"code"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<Verify2faMutation, Verify2faMutationVariables>;
export const AcceptAdaptiveLoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AcceptAdaptiveLogin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adaptiveLogin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"active"}}]}}]}}]} as unknown as DocumentNode<AcceptAdaptiveLoginMutation, AcceptAdaptiveLoginMutationVariables>;
export const StatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loginStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"phoneId"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"owner"}},{"kind":"Field","name":{"kind":"Name","value":"is2faEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"isAdaptiveLoginEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"admin"}}]}}]}}]}}]} as unknown as DocumentNode<StatusQuery, StatusQueryVariables>;
export const LogoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Logout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logoutUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<LogoutMutation, LogoutMutationVariables>;
export const GetCommandsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCommands"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"GetAllCommandsType"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"commands"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"actions"}},{"kind":"Field","name":{"kind":"Name","value":"parameters"}},{"kind":"Field","name":{"kind":"Name","value":"roleNames"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]} as unknown as DocumentNode<GetCommandsQuery, GetCommandsQueryVariables>;
export const AddCommandDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddCommand"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddCommandType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addCommand"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"actions"}},{"kind":"Field","name":{"kind":"Name","value":"parameters"}},{"kind":"Field","name":{"kind":"Name","value":"roleNames"}}]}}]}}]}}]} as unknown as DocumentNode<AddCommandMutation, AddCommandMutationVariables>;
export const UpdateCommandDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCommand"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateCommandType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCommand"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateCommandMutation, UpdateCommandMutationVariables>;
export const ToggleActiveStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ToggleActiveStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ToggleActiveStatusType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"toggleActiveStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"active"}}]}}]}}]}}]} as unknown as DocumentNode<ToggleActiveStatusMutation, ToggleActiveStatusMutationVariables>;
export const RemoveCommandDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveCommand"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoveCommandType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeCommand"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<RemoveCommandMutation, RemoveCommandMutationVariables>;
export const CoreConfigsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CoreConfigs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"coreConfigs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<CoreConfigsQuery, CoreConfigsQueryVariables>;
export const UpdateConfigDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateConfig"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateConfigType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateConfig"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateConfigMutation, UpdateConfigMutationVariables>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loginUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const GetPromptsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPrompts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"GetAllPromptsType"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"prompts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"commandName"}},{"kind":"Field","name":{"kind":"Name","value":"userType"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]} as unknown as DocumentNode<GetPromptsQuery, GetPromptsQueryVariables>;
export const GetPromptByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPromptById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetPromptByIdType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"promptById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"commandName"}},{"kind":"Field","name":{"kind":"Name","value":"userType"}},{"kind":"Field","name":{"kind":"Name","value":"prompt"}}]}}]}}]}}]} as unknown as DocumentNode<GetPromptByIdQuery, GetPromptByIdQueryVariables>;
export const AddPromptDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddPrompt"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddPromptType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addPrompt"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"commandName"}},{"kind":"Field","name":{"kind":"Name","value":"userType"}},{"kind":"Field","name":{"kind":"Name","value":"prompt"}}]}}]}}]}}]} as unknown as DocumentNode<AddPromptMutation, AddPromptMutationVariables>;
export const UpdatePromptDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdatePrompt"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdatePromptType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePrompt"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"commandName"}},{"kind":"Field","name":{"kind":"Name","value":"userType"}},{"kind":"Field","name":{"kind":"Name","value":"prompt"}}]}}]}}]}}]} as unknown as DocumentNode<UpdatePromptMutation, UpdatePromptMutationVariables>;
export const RemovePromptDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemovePrompt"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemovePromptType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removePrompt"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<RemovePromptMutation, RemovePromptMutationVariables>;
export const QrChallengeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"QrChallenge"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"nonce"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"qrChallenge"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"nonce"},"value":{"kind":"Variable","name":{"kind":"Name","value":"nonce"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"challenge"}},{"kind":"Field","name":{"kind":"Name","value":"dataUrl"}}]}}]}}]} as unknown as DocumentNode<QrChallengeMutation, QrChallengeMutationVariables>;
export const QrLoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"QrLogin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"challenge"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"nonce"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"qrLogin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"challenge"},"value":{"kind":"Variable","name":{"kind":"Name","value":"challenge"}}},{"kind":"Argument","name":{"kind":"Name","value":"nonce"},"value":{"kind":"Variable","name":{"kind":"Name","value":"nonce"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<QrLoginMutation, QrLoginMutationVariables>;
export const RegisterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Register"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RegisterInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"register"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<RegisterMutation, RegisterMutationVariables>;
export const TenantFeaturesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TenantFeatures"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenantFeatures"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"enableSignal"}},{"kind":"Field","name":{"kind":"Name","value":"enableWhatsApp"}},{"kind":"Field","name":{"kind":"Name","value":"enableMessenger"}},{"kind":"Field","name":{"kind":"Name","value":"enableGate"}},{"kind":"Field","name":{"kind":"Name","value":"enablePayment"}},{"kind":"Field","name":{"kind":"Name","value":"enableCommandScheduling"}},{"kind":"Field","name":{"kind":"Name","value":"enableAnalytics"}},{"kind":"Field","name":{"kind":"Name","value":"maxUsersPerTenant"}}]}}]}}]} as unknown as DocumentNode<TenantFeaturesQuery, TenantFeaturesQueryVariables>;
export const GetUsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUsers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"GetAllUsersType"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"users"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"users"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"surname"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]} as unknown as DocumentNode<GetUsersQuery, GetUsersQueryVariables>;
export const UpdateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"surname"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<UpdateUserMutation, UpdateUserMutationVariables>;
export const UpdateUserStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateUserStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserStatusType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUserStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"surname"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<UpdateUserStatusMutation, UpdateUserStatusMutationVariables>;
export const UpdateUserRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateUserRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserRoleType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUserRole"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"surname"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<UpdateUserRoleMutation, UpdateUserRoleMutationVariables>;
export const RemoveUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetUserType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<RemoveUserMutation, RemoveUserMutationVariables>;
export const CreateSimpleUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateSimpleUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateSimpleUserType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createSimpleUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]} as unknown as DocumentNode<CreateSimpleUserMutation, CreateSimpleUserMutationVariables>;
export const VerifyMfaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"VerifyMfa"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"VerifyCodeType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"verifyMfa"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<VerifyMfaMutation, VerifyMfaMutationVariables>;
export const Verify2faCodeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Verify2faCode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Verify2faCodeType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"verify2faCode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<Verify2faCodeMutation, Verify2faCodeMutationVariables>;
export const GetPasskeyOptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GetPasskeyOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"optionPasskey"}}]}}]} as unknown as DocumentNode<GetPasskeyOptionsMutation, GetPasskeyOptionsMutationVariables>;
export const VerifyPasskeyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"VerifyPasskey"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSON"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"optionPasskeyVerify"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<VerifyPasskeyMutation, VerifyPasskeyMutationVariables>;
export const GetPasskeysDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPasskeys"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getPasskeys"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createAt"}},{"kind":"Field","name":{"kind":"Name","value":"deviceName"}},{"kind":"Field","name":{"kind":"Name","value":"credentialID"}}]}}]}}]} as unknown as DocumentNode<GetPasskeysQuery, GetPasskeysQueryVariables>;
export const RemovePasskeyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemovePasskey"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removePasskey"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<RemovePasskeyMutation, RemovePasskeyMutationVariables>;
export const RegisterOptionPasskeyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RegisterOptionPasskey"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"registerOptionPasskey"}}]}}]} as unknown as DocumentNode<RegisterOptionPasskeyMutation, RegisterOptionPasskeyMutationVariables>;
export const VerifyRegistrationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"VerifyRegistration"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSON"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"registerOptionPasskeyVerify"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<VerifyRegistrationMutation, VerifyRegistrationMutationVariables>;