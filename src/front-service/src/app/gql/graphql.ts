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

export type AddContactInput = {
  accessLevel: Scalars['String']['input'];
  email?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  surname?: InputMaybe<Scalars['String']['input']>;
  tenantId: Scalars['String']['input'];
};

export type AddCustomCommandInput = {
  actions?: InputMaybe<Scalars['JSON']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  parameters?: InputMaybe<Scalars['JSON']['input']>;
  tenantId: Scalars['String']['input'];
};

export type AddPromptType = {
  commandName: Scalars['String']['input'];
  description: Scalars['String']['input'];
  key: Scalars['String']['input'];
  prompt: Scalars['String']['input'];
  userType: PromptUserType | '%future added value';
};

export type AddTenantStaffInput = {
  role: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
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

export type BrandingInput = {
  fontSize?: InputMaybe<Scalars['String']['input']>;
  logoUrl?: InputMaybe<Scalars['String']['input']>;
  primaryColor?: InputMaybe<Scalars['String']['input']>;
  secondaryColor?: InputMaybe<Scalars['String']['input']>;
  tenantId: Scalars['String']['input'];
};

export type ChangePasswordType = {
  newPassword: Scalars['String']['input'];
  oldPassword: Scalars['String']['input'];
};

export type ChangeTenantStaffRoleInput = {
  role: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
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

export type CommandsConfigInput = {
  customPromptLibraryEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  maxRetries?: InputMaybe<Scalars['Int']['input']>;
  processingDelay?: InputMaybe<Scalars['Int']['input']>;
  tenantId: Scalars['String']['input'];
  timeout?: InputMaybe<Scalars['Int']['input']>;
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

export type ComplianceInput = {
  dataResidency?: InputMaybe<Scalars['String']['input']>;
  encryptionEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  tenantId: Scalars['String']['input'];
  webhookUrl?: InputMaybe<Scalars['String']['input']>;
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

export type ContactType = {
  __typename?: 'ContactType';
  accessLevel?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  surname?: Maybe<Scalars['String']['output']>;
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

export type DeleteTenantCommandConfigInput = {
  commandName: Scalars['String']['input'];
};

export type DeleteTenantInput = {
  slugConfirmation: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
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

export type MessagingInput = {
  defaultSmsProvider?: InputMaybe<Scalars['String']['input']>;
  priorityChannels?: InputMaybe<Array<Scalars['String']['input']>>;
  rateLimitPerMinute?: InputMaybe<Scalars['Int']['input']>;
  tenantId: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  accept2fa: AcceptType;
  adaptiveLogin: AcceptAdaptiveLoginType;
  addCommand: CommandResponseType;
  addContact: ContactType;
  addCustomCommand: CommandResponseType;
  addPrompt: PromptResponseType;
  addTenantStaff: MutationResult;
  cancelSubscription: Scalars['Boolean']['output'];
  changePassword: StatusType;
  changeTenantStaffRole: MutationResult;
  confirmRegistration: SuccessResponseType;
  createSimpleUser: UserType;
  createTenant: CreateTenantResult;
  createUser: UserType;
  deleteTenant: MutationResult;
  deleteTenantCommandConfig: MutationResult;
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
  removeContactFromTenant: MutationResult;
  removePasskey: RemovePasskeyType;
  removePrompt: PromptSuccessType;
  removeTenantStaff: MutationResult;
  removeUser: SuccessResponseType;
  resetPassword: StatusType;
  selectSubscription: UserSubscriptionType;
  setTenantActive: MutationResult;
  switchTenant: Scalars['Boolean']['output'];
  toggleActiveStatus: CommandResponseType;
  transferTenantBilling: MutationResult;
  updateCommand: CommandResponseType;
  updateConfig: ConfigResponseType;
  updateContact: ContactType;
  updateMyPlatformCredentials: MutationResult;
  updatePrompt: PromptResponseType;
  updateTenantBranding: MutationResult;
  updateTenantCommands: MutationResult;
  updateTenantCompliance: MutationResult;
  updateTenantCustomization: MutationResult;
  updateTenantFeatures: MutationResult;
  updateTenantMessaging: MutationResult;
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


export type MutationAddContactArgs = {
  input: AddContactInput;
};


export type MutationAddCustomCommandArgs = {
  input: AddCustomCommandInput;
};


export type MutationAddPromptArgs = {
  input: AddPromptType;
};


export type MutationAddTenantStaffArgs = {
  input: AddTenantStaffInput;
};


export type MutationChangePasswordArgs = {
  input: ChangePasswordType;
};


export type MutationChangeTenantStaffRoleArgs = {
  input: ChangeTenantStaffRoleInput;
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


export type MutationDeleteTenantArgs = {
  input: DeleteTenantInput;
};


export type MutationDeleteTenantCommandConfigArgs = {
  input: DeleteTenantCommandConfigInput;
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


export type MutationRemoveContactFromTenantArgs = {
  input: RemoveContactFromTenantInput;
};


export type MutationRemovePasskeyArgs = {
  id: Scalars['String']['input'];
};


export type MutationRemovePromptArgs = {
  input: RemovePromptType;
};


export type MutationRemoveTenantStaffArgs = {
  input: RemoveTenantStaffInput;
};


export type MutationRemoveUserArgs = {
  input: GetUserType;
};


export type MutationResetPasswordArgs = {
  input: ResetPasswordType;
};


export type MutationSelectSubscriptionArgs = {
  input: SelectSubscriptionInput;
};


export type MutationSetTenantActiveArgs = {
  input: SetTenantActiveInput;
};


export type MutationSwitchTenantArgs = {
  tenantId: Scalars['String']['input'];
};


export type MutationToggleActiveStatusArgs = {
  input: ToggleActiveStatusType;
};


export type MutationTransferTenantBillingArgs = {
  input: TransferTenantBillingInput;
};


export type MutationUpdateCommandArgs = {
  input: UpdateCommandType;
};


export type MutationUpdateConfigArgs = {
  input: UpdateConfigType;
};


export type MutationUpdateContactArgs = {
  input: UpdateContactInput;
};


export type MutationUpdateMyPlatformCredentialsArgs = {
  input: UpdateMyPlatformCredentialsInput;
};


export type MutationUpdatePromptArgs = {
  input: UpdatePromptType;
};


export type MutationUpdateTenantBrandingArgs = {
  input: BrandingInput;
};


export type MutationUpdateTenantCommandsArgs = {
  input: CommandsConfigInput;
};


export type MutationUpdateTenantComplianceArgs = {
  input: ComplianceInput;
};


export type MutationUpdateTenantCustomizationArgs = {
  input: UpdateCustomizationInput;
};


export type MutationUpdateTenantFeaturesArgs = {
  input: UpdateTenantFeaturesInput;
};


export type MutationUpdateTenantMessagingArgs = {
  input: MessagingInput;
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

export type PlanChangePreviewType = {
  __typename?: 'PlanChangePreviewType';
  currentPlan?: Maybe<SubscriptionPlanType>;
  deltaPriceCents: Scalars['Int']['output'];
  kind: Scalars['String']['output'];
  newPlan: SubscriptionPlanType;
  violations: Array<QuotaViolationType>;
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
  mySubscription?: Maybe<UserSubscriptionType>;
  myTenants: Array<TenantType>;
  myUsage: UsageReportType;
  previewPlanChange: PlanChangePreviewType;
  promptById: PromptResponseType;
  promptByKey: PromptResponseType;
  prompts: PromptsListType;
  subscriptionHistory: Array<SubscriptionChangeType>;
  subscriptionPlans: Array<SubscriptionPlanType>;
  tenantAuditLog: Array<TenantAuditLogEntryType>;
  tenantCommandConfigs: Array<TenantCommandConfigType>;
  tenantContacts: Array<ContactType>;
  tenantCustomization: TenantCustomizationFullType;
  tenantFeatures: TenantFeaturesType;
  tenantPlatformCredentials: Array<TenantPlatformCredentialType>;
  tenantPromptOverrides: Array<TenantPromptOverrideType>;
  tenantSlugAvailable: Scalars['Boolean']['output'];
  tenantStaff: Array<TenantStaffEntryType>;
  tenants: Array<TenantType>;
  tenantsIStaffAt: Array<TenantStaffMembershipType>;
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


export type QueryPreviewPlanChangeArgs = {
  newPlanId: Scalars['String']['input'];
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


export type QueryTenantAuditLogArgs = {
  tenantId: Scalars['String']['input'];
};


export type QueryTenantContactsArgs = {
  tenantId: Scalars['String']['input'];
};


export type QueryTenantCustomizationArgs = {
  tenantId: Scalars['String']['input'];
};


export type QueryTenantSlugAvailableArgs = {
  slug: Scalars['String']['input'];
};


export type QueryTenantStaffArgs = {
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

export type QuotaViolationType = {
  __typename?: 'QuotaViolationType';
  current: Scalars['Int']['output'];
  kind: Scalars['String']['output'];
  max: Scalars['Int']['output'];
  tenantId?: Maybe<Scalars['String']['output']>;
};

export type RegisterInput = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
  phone: Scalars['String']['input'];
  surname: Scalars['String']['input'];
};

export type RemoveCommandType = {
  id: Scalars['ID']['input'];
};

export type RemoveContactFromTenantInput = {
  contactId: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};

export type RemovePasskeyType = {
  __typename?: 'RemovePasskeyType';
  status: Scalars['Boolean']['output'];
};

export type RemovePromptType = {
  id: Scalars['ID']['input'];
};

export type RemoveTenantStaffInput = {
  tenantId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type ResetPasswordType = {
  password: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

export type SelectSubscriptionInput = {
  planId: Scalars['String']['input'];
};

export type SetTenantActiveInput = {
  active: Scalars['Boolean']['input'];
  tenantId: Scalars['String']['input'];
};

export type StatusType = {
  __typename?: 'StatusType';
  status: AuthStatus | '%future added value';
};

export type SubscriptionChangeType = {
  __typename?: 'SubscriptionChangeType';
  id: Scalars['String']['output'];
  initiatedAt: Scalars['String']['output'];
  kind: Scalars['String']['output'];
  newPlanId?: Maybe<Scalars['String']['output']>;
  oldPlanId?: Maybe<Scalars['String']['output']>;
};

export type SubscriptionPlanType = {
  __typename?: 'SubscriptionPlanType';
  code: Scalars['String']['output'];
  currency: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  maxContactsPerTenant: Scalars['Int']['output'];
  maxCustomCommandsPerTenant: Scalars['Int']['output'];
  maxPlatformsPerTenant: Scalars['Int']['output'];
  maxStaffPerTenant: Scalars['Int']['output'];
  maxTenants: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  priceCents: Scalars['Int']['output'];
};

export type SuccessResponseType = {
  __typename?: 'SuccessResponseType';
  success: Scalars['Boolean']['output'];
};

export type TenantAuditLogEntryType = {
  __typename?: 'TenantAuditLogEntryType';
  action: Scalars['String']['output'];
  correlationId?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  payload?: Maybe<Scalars['JSON']['output']>;
  tenantId?: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
};

export type TenantBrandingType = {
  __typename?: 'TenantBrandingType';
  fontSize?: Maybe<Scalars['String']['output']>;
  logoUrl?: Maybe<Scalars['String']['output']>;
  primaryColor?: Maybe<Scalars['String']['output']>;
  secondaryColor?: Maybe<Scalars['String']['output']>;
};

export type TenantCommandConfigType = {
  __typename?: 'TenantCommandConfigType';
  actionsJson?: Maybe<Scalars['String']['output']>;
  active: Scalars['Boolean']['output'];
  commandName: Scalars['String']['output'];
  descriptionI18nJson?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  parametersOverrideJson?: Maybe<Scalars['String']['output']>;
  userTypes?: Maybe<Array<Scalars['String']['output']>>;
};

export type TenantCommandsConfigType = {
  __typename?: 'TenantCommandsConfigType';
  customPromptLibraryEnabled: Scalars['Boolean']['output'];
  maxRetries: Scalars['Int']['output'];
  processingDelay: Scalars['Int']['output'];
  timeout: Scalars['Int']['output'];
};

export type TenantComplianceType = {
  __typename?: 'TenantComplianceType';
  dataResidency: Scalars['String']['output'];
  encryptionEnabled: Scalars['Boolean']['output'];
  webhookUrl?: Maybe<Scalars['String']['output']>;
};

export type TenantCustomizationFullType = {
  __typename?: 'TenantCustomizationFullType';
  branding: TenantBrandingType;
  commands: TenantCommandsConfigType;
  compliance: TenantComplianceType;
  features: TenantFeaturesEmbedType;
  messaging: TenantMessagingType;
};

export type TenantFeaturesEmbedType = {
  __typename?: 'TenantFeaturesEmbedType';
  enableAnalytics: Scalars['Boolean']['output'];
  enableAudioRecognition: Scalars['Boolean']['output'];
  enableCommandScheduling: Scalars['Boolean']['output'];
  enableGate: Scalars['Boolean']['output'];
  enableMessenger: Scalars['Boolean']['output'];
  enablePayment: Scalars['Boolean']['output'];
  enableSignal: Scalars['Boolean']['output'];
  enableWhatsApp: Scalars['Boolean']['output'];
};

export type TenantFeaturesType = {
  __typename?: 'TenantFeaturesType';
  enableAnalytics: Scalars['Boolean']['output'];
  enableAudioRecognition: Scalars['Boolean']['output'];
  enableCommandScheduling: Scalars['Boolean']['output'];
  enableGate: Scalars['Boolean']['output'];
  enableMessenger: Scalars['Boolean']['output'];
  enablePayment: Scalars['Boolean']['output'];
  enableSignal: Scalars['Boolean']['output'];
  enableWhatsApp: Scalars['Boolean']['output'];
};

export type TenantMessagingType = {
  __typename?: 'TenantMessagingType';
  defaultSmsProvider: Scalars['String']['output'];
  priorityChannels: Array<Scalars['String']['output']>;
  rateLimitPerMinute: Scalars['Int']['output'];
};

export type TenantPlatformCredentialType = {
  __typename?: 'TenantPlatformCredentialType';
  configJson: Scalars['String']['output'];
  isDefault: Scalars['Boolean']['output'];
  platform: Scalars['String']['output'];
};

export type TenantPromptOverrideType = {
  __typename?: 'TenantPromptOverrideType';
  commandId?: Maybe<Scalars['String']['output']>;
  descriptionI18nJson?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  prompt: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
  userType: Scalars['String']['output'];
};

export type TenantStaffEntryType = {
  __typename?: 'TenantStaffEntryType';
  role: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type TenantStaffMembershipType = {
  __typename?: 'TenantStaffMembershipType';
  role: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
  tenantSlug: Scalars['String']['output'];
};

export type TenantType = {
  __typename?: 'TenantType';
  billingUserId?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  schemaName: Scalars['String']['output'];
  slug: Scalars['String']['output'];
};

export type TenantUsageEntryType = {
  __typename?: 'TenantUsageEntryType';
  contacts: Scalars['Int']['output'];
  customCommands: Scalars['Int']['output'];
  platforms: Scalars['Int']['output'];
  staff: Scalars['Int']['output'];
  tenantId: Scalars['String']['output'];
};

export type ToggleActiveStatusType = {
  active: Scalars['Boolean']['input'];
  id: Scalars['ID']['input'];
};

export type TransferTenantBillingInput = {
  newBillingUserId: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
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

export type UpdateContactInput = {
  contactId: Scalars['String']['input'];
  email?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  surname?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateCustomizationInput = {
  customizationJson: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};

export type UpdateMyPlatformCredentialsInput = {
  configJson: Scalars['String']['input'];
  platform: Scalars['String']['input'];
};

export type UpdatePromptType = {
  commandName?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  key?: InputMaybe<Scalars['String']['input']>;
  prompt?: InputMaybe<Scalars['String']['input']>;
  userType?: InputMaybe<PromptUserType | '%future added value'>;
};

export type UpdateTenantFeaturesInput = {
  enableAnalytics?: InputMaybe<Scalars['Boolean']['input']>;
  enableAudioRecognition?: InputMaybe<Scalars['Boolean']['input']>;
  enableCommandScheduling?: InputMaybe<Scalars['Boolean']['input']>;
  enableGate?: InputMaybe<Scalars['Boolean']['input']>;
  enableMessenger?: InputMaybe<Scalars['Boolean']['input']>;
  enablePayment?: InputMaybe<Scalars['Boolean']['input']>;
  enableSignal?: InputMaybe<Scalars['Boolean']['input']>;
  enableWhatsApp?: InputMaybe<Scalars['Boolean']['input']>;
  tenantId: Scalars['String']['input'];
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
  actionsJson?: InputMaybe<Scalars['String']['input']>;
  active: Scalars['Boolean']['input'];
  commandName: Scalars['String']['input'];
  descriptionI18nJson?: InputMaybe<Scalars['String']['input']>;
  parametersOverrideJson?: InputMaybe<Scalars['String']['input']>;
  userTypes?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type UpsertTenantPromptOverrideInput = {
  commandId?: InputMaybe<Scalars['String']['input']>;
  descriptionI18nJson?: InputMaybe<Scalars['String']['input']>;
  prompt: Scalars['String']['input'];
  userType: Scalars['String']['input'];
};

export type UsageReportType = {
  __typename?: 'UsageReportType';
  billingUserId: Scalars['String']['output'];
  perTenant: Array<TenantUsageEntryType>;
  tenants: Scalars['Int']['output'];
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
  tenantId?: Maybe<Scalars['String']['output']>;
};

export type UserSubscriptionType = {
  __typename?: 'UserSubscriptionType';
  expiresAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  plan: SubscriptionPlanType;
  planId: Scalars['String']['output'];
  startedAt: Scalars['String']['output'];
  status: Scalars['String']['output'];
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

export type ConfirmRegistrationMutationVariables = Exact<{
  token: Scalars['String']['input'];
}>;


export type ConfirmRegistrationMutation = { __typename?: 'Mutation', confirmRegistration: { __typename?: 'SuccessResponseType', success: boolean } };

export type GetHomeDataQueryVariables = Exact<{ [key: string]: never; }>;


export type GetHomeDataQuery = { __typename?: 'Query', mySubscription?: { __typename?: 'UserSubscriptionType', id: string, status: string, plan: { __typename?: 'SubscriptionPlanType', id: string, code: string, name: string, maxTenants: number, maxPlatformsPerTenant: number, maxContactsPerTenant: number, maxStaffPerTenant: number, maxCustomCommandsPerTenant: number, priceCents: number, currency: string } } | null, subscriptionPlans: Array<{ __typename?: 'SubscriptionPlanType', id: string, code: string, name: string, maxTenants: number, maxPlatformsPerTenant: number, maxContactsPerTenant: number, maxStaffPerTenant: number, maxCustomCommandsPerTenant: number, priceCents: number, currency: string, isActive: boolean }>, myTenants: Array<{ __typename?: 'TenantType', id: string, slug: string, billingUserId?: string | null, isActive: boolean }>, tenantsIStaffAt: Array<{ __typename?: 'TenantStaffMembershipType', tenantId: string, tenantSlug: string, role: string }> };

export type SelectSubscriptionMutationVariables = Exact<{
  input: SelectSubscriptionInput;
}>;


export type SelectSubscriptionMutation = { __typename?: 'Mutation', selectSubscription: { __typename?: 'UserSubscriptionType', id: string, status: string, plan: { __typename?: 'SubscriptionPlanType', id: string, code: string, name: string } } };

export type SwitchActiveTenantMutationVariables = Exact<{
  tenantId: Scalars['String']['input'];
}>;


export type SwitchActiveTenantMutation = { __typename?: 'Mutation', switchTenant: boolean };

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

export type RegisterMutationVariables = Exact<{
  input: RegisterInput;
}>;


export type RegisterMutation = { __typename?: 'Mutation', register: { __typename?: 'SuccessResponseType', success: boolean } };

export type GetPasskeysQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPasskeysQuery = { __typename?: 'Query', getPasskeys: Array<{ __typename?: 'PassKeyType', id: string, createAt: string, deviceName: string, credentialID: string }> };

export type RemovePasskeyMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type RemovePasskeyMutation = { __typename?: 'Mutation', removePasskey: { __typename?: 'RemovePasskeyType', status: boolean } };

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

export type RegisterOptionPasskeyMutationVariables = Exact<{ [key: string]: never; }>;


export type RegisterOptionPasskeyMutation = { __typename?: 'Mutation', registerOptionPasskey: any };

export type VerifyRegistrationMutationVariables = Exact<{
  input: Scalars['JSON']['input'];
}>;


export type VerifyRegistrationMutation = { __typename?: 'Mutation', registerOptionPasskeyVerify: { __typename?: 'StatusType', status: AuthStatus } };

export type GetBillingDataQueryVariables = Exact<{ [key: string]: never; }>;


export type GetBillingDataQuery = { __typename?: 'Query', mySubscription?: { __typename?: 'UserSubscriptionType', id: string, status: string, startedAt: string, plan: { __typename?: 'SubscriptionPlanType', id: string, code: string, name: string, maxTenants: number, maxPlatformsPerTenant: number, maxContactsPerTenant: number, maxStaffPerTenant: number, maxCustomCommandsPerTenant: number, priceCents: number, currency: string } } | null, subscriptionPlans: Array<{ __typename?: 'SubscriptionPlanType', id: string, code: string, name: string, maxTenants: number, maxPlatformsPerTenant: number, maxContactsPerTenant: number, maxStaffPerTenant: number, maxCustomCommandsPerTenant: number, priceCents: number, currency: string, isActive: boolean }>, myUsage: { __typename?: 'UsageReportType', billingUserId: string, tenants: number, perTenant: Array<{ __typename?: 'TenantUsageEntryType', tenantId: string, staff: number, platforms: number, contacts: number, customCommands: number }> }, subscriptionHistory: Array<{ __typename?: 'SubscriptionChangeType', id: string, oldPlanId?: string | null, newPlanId?: string | null, kind: string, initiatedAt: string }> };

export type PreviewPlanChangeQueryVariables = Exact<{
  newPlanId: Scalars['String']['input'];
}>;


export type PreviewPlanChangeQuery = { __typename?: 'Query', previewPlanChange: { __typename?: 'PlanChangePreviewType', kind: string, deltaPriceCents: number, newPlan: { __typename?: 'SubscriptionPlanType', id: string, code: string, name: string, maxTenants: number, maxPlatformsPerTenant: number, maxContactsPerTenant: number, maxStaffPerTenant: number, maxCustomCommandsPerTenant: number, priceCents: number, currency: string }, currentPlan?: { __typename?: 'SubscriptionPlanType', id: string, code: string, name: string, maxTenants: number, maxPlatformsPerTenant: number, maxContactsPerTenant: number, maxStaffPerTenant: number, maxCustomCommandsPerTenant: number, priceCents: number, currency: string } | null, violations: Array<{ __typename?: 'QuotaViolationType', kind: string, tenantId?: string | null, current: number, max: number }> } };

export type ChangePlanMutationVariables = Exact<{
  input: SelectSubscriptionInput;
}>;


export type ChangePlanMutation = { __typename?: 'Mutation', selectSubscription: { __typename?: 'UserSubscriptionType', id: string, status: string, plan: { __typename?: 'SubscriptionPlanType', id: string, code: string, name: string } } };

export type CancelSubscriptionMutationVariables = Exact<{ [key: string]: never; }>;


export type CancelSubscriptionMutation = { __typename?: 'Mutation', cancelSubscription: boolean };

export type GetTenantCommandConfigsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTenantCommandConfigsQuery = { __typename?: 'Query', tenantCommandConfigs: Array<{ __typename?: 'TenantCommandConfigType', id: string, commandName: string, active: boolean, userTypes?: Array<string> | null, actionsJson?: string | null, parametersOverrideJson?: string | null, descriptionI18nJson?: string | null }> };

export type UpsertTenantCommandConfigMutationMutationVariables = Exact<{
  input: UpsertTenantCommandConfigInput;
}>;


export type UpsertTenantCommandConfigMutationMutation = { __typename?: 'Mutation', upsertTenantCommandConfig: { __typename?: 'MutationResult', status: boolean, message: string } };

export type DeleteTenantCommandConfigMutationVariables = Exact<{
  input: DeleteTenantCommandConfigInput;
}>;


export type DeleteTenantCommandConfigMutation = { __typename?: 'Mutation', deleteTenantCommandConfig: { __typename?: 'MutationResult', status: boolean, message: string } };

export type TenantPlatformCredentialsQueryVariables = Exact<{ [key: string]: never; }>;


export type TenantPlatformCredentialsQuery = { __typename?: 'Query', tenantPlatformCredentials: Array<{ __typename?: 'TenantPlatformCredentialType', platform: string, configJson: string, isDefault: boolean }> };

export type UpdateMyPlatformCredentialsMutationVariables = Exact<{
  input: UpdateMyPlatformCredentialsInput;
}>;


export type UpdateMyPlatformCredentialsMutation = { __typename?: 'Mutation', updateMyPlatformCredentials: { __typename?: 'MutationResult', status: boolean, message: string } };

export type TenantFeaturesSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type TenantFeaturesSettingsQuery = { __typename?: 'Query', tenantFeatures: { __typename?: 'TenantFeaturesType', enableSignal: boolean, enableWhatsApp: boolean, enableMessenger: boolean, enableGate: boolean, enablePayment: boolean, enableCommandScheduling: boolean, enableAnalytics: boolean, enableAudioRecognition: boolean } };

export type UpdateTenantFeaturesActiveMutationVariables = Exact<{
  input: UpdateTenantFeaturesInput;
}>;


export type UpdateTenantFeaturesActiveMutation = { __typename?: 'Mutation', updateTenantFeatures: { __typename?: 'MutationResult', status: boolean, message: string } };

export type GetTenantPromptOverridesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTenantPromptOverridesQuery = { __typename?: 'Query', tenantPromptOverrides: Array<{ __typename?: 'TenantPromptOverrideType', id: string, commandId?: string | null, userType: string, descriptionI18nJson?: string | null, prompt: string }> };

export type GetTenantCommandConfigsForPromptsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTenantCommandConfigsForPromptsQuery = { __typename?: 'Query', tenantCommandConfigs: Array<{ __typename?: 'TenantCommandConfigType', id: string, commandName: string }> };

export type UpsertTenantPromptOverrideMutationVariables = Exact<{
  input: UpsertTenantPromptOverrideInput;
}>;


export type UpsertTenantPromptOverrideMutation = { __typename?: 'Mutation', upsertTenantPromptOverride: { __typename?: 'MutationResult', status: boolean, message: string } };

export type TenantSettingsQueryVariables = Exact<{
  tenantId: Scalars['String']['input'];
}>;


export type TenantSettingsQuery = { __typename?: 'Query', tenantCustomization: { __typename?: 'TenantCustomizationFullType', branding: { __typename?: 'TenantBrandingType', logoUrl?: string | null, primaryColor?: string | null, secondaryColor?: string | null, fontSize?: string | null }, features: { __typename?: 'TenantFeaturesEmbedType', enableSignal: boolean, enableWhatsApp: boolean, enableMessenger: boolean, enableGate: boolean, enablePayment: boolean, enableCommandScheduling: boolean, enableAnalytics: boolean, enableAudioRecognition: boolean }, messaging: { __typename?: 'TenantMessagingType', defaultSmsProvider: string, priorityChannels: Array<string>, rateLimitPerMinute: number }, commands: { __typename?: 'TenantCommandsConfigType', timeout: number, maxRetries: number, processingDelay: number, customPromptLibraryEnabled: boolean }, compliance: { __typename?: 'TenantComplianceType', dataResidency: string, encryptionEnabled: boolean, webhookUrl?: string | null } }, tenantStaff: Array<{ __typename?: 'TenantStaffEntryType', tenantId: string, userId: string, role: string }>, myTenants: Array<{ __typename?: 'TenantType', id: string, slug: string, schemaName: string, isActive: boolean, billingUserId?: string | null }>, tenantsIStaffAt: Array<{ __typename?: 'TenantStaffMembershipType', tenantId: string, tenantSlug: string, role: string }> };

export type UpdateTenantBrandingMutationVariables = Exact<{
  input: BrandingInput;
}>;


export type UpdateTenantBrandingMutation = { __typename?: 'Mutation', updateTenantBranding: { __typename?: 'MutationResult', status: boolean, message: string } };

export type UpdateTenantSettingsFeaturesMutationVariables = Exact<{
  input: UpdateTenantFeaturesInput;
}>;


export type UpdateTenantSettingsFeaturesMutation = { __typename?: 'Mutation', updateTenantFeatures: { __typename?: 'MutationResult', status: boolean, message: string } };

export type UpdateTenantMessagingMutationVariables = Exact<{
  input: MessagingInput;
}>;


export type UpdateTenantMessagingMutation = { __typename?: 'Mutation', updateTenantMessaging: { __typename?: 'MutationResult', status: boolean, message: string } };

export type UpdateTenantCommandsMutationVariables = Exact<{
  input: CommandsConfigInput;
}>;


export type UpdateTenantCommandsMutation = { __typename?: 'Mutation', updateTenantCommands: { __typename?: 'MutationResult', status: boolean, message: string } };

export type UpdateTenantComplianceMutationVariables = Exact<{
  input: ComplianceInput;
}>;


export type UpdateTenantComplianceMutation = { __typename?: 'Mutation', updateTenantCompliance: { __typename?: 'MutationResult', status: boolean, message: string } };

export type SetTenantActiveMutationVariables = Exact<{
  input: SetTenantActiveInput;
}>;


export type SetTenantActiveMutation = { __typename?: 'Mutation', setTenantActive: { __typename?: 'MutationResult', status: boolean, message: string } };

export type DeleteTenantMutationVariables = Exact<{
  input: DeleteTenantInput;
}>;


export type DeleteTenantMutation = { __typename?: 'Mutation', deleteTenant: { __typename?: 'MutationResult', status: boolean, message: string } };

export type AddTenantStaffMutationVariables = Exact<{
  input: AddTenantStaffInput;
}>;


export type AddTenantStaffMutation = { __typename?: 'Mutation', addTenantStaff: { __typename?: 'MutationResult', status: boolean, message: string } };

export type RemoveTenantStaffMutationVariables = Exact<{
  input: RemoveTenantStaffInput;
}>;


export type RemoveTenantStaffMutation = { __typename?: 'Mutation', removeTenantStaff: { __typename?: 'MutationResult', status: boolean, message: string } };

export type ChangeTenantStaffRoleMutationVariables = Exact<{
  input: ChangeTenantStaffRoleInput;
}>;


export type ChangeTenantStaffRoleMutation = { __typename?: 'Mutation', changeTenantStaffRole: { __typename?: 'MutationResult', status: boolean, message: string } };

export type TenantAuditLogQueryVariables = Exact<{
  tenantId: Scalars['String']['input'];
}>;


export type TenantAuditLogQuery = { __typename?: 'Query', tenantAuditLog: Array<{ __typename?: 'TenantAuditLogEntryType', id: string, tenantId?: string | null, userId: string, action: string, payload?: any | null, correlationId?: string | null, createdAt: string }> };

export type TenantSlugAvailableQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type TenantSlugAvailableQuery = { __typename?: 'Query', tenantSlugAvailable: boolean };

export type CreateTenantWizardMutationVariables = Exact<{
  input: CreateTenantInput;
}>;


export type CreateTenantWizardMutation = { __typename?: 'Mutation', createTenant: { __typename?: 'CreateTenantResult', id: string, slug: string, schemaName: string } };

export type SwitchTenantWizardMutationVariables = Exact<{
  tenantId: Scalars['String']['input'];
}>;


export type SwitchTenantWizardMutation = { __typename?: 'Mutation', switchTenant: boolean };

export type UpdateTenantFeaturesWizardMutationVariables = Exact<{
  input: UpdateTenantFeaturesInput;
}>;


export type UpdateTenantFeaturesWizardMutation = { __typename?: 'Mutation', updateTenantFeatures: { __typename?: 'MutationResult', status: boolean, message: string } };

export type AddContactWizardMutationVariables = Exact<{
  input: AddContactInput;
}>;


export type AddContactWizardMutation = { __typename?: 'Mutation', addContact: { __typename?: 'ContactType', id: string } };

export type UpsertPlatformWizardMutationVariables = Exact<{
  input: UpsertPlatformCredentialsInput;
}>;


export type UpsertPlatformWizardMutation = { __typename?: 'Mutation', upsertPlatformCredentials: { __typename?: 'MutationResult', status: boolean, message: string } };

export type AddCustomCommandWizardMutationVariables = Exact<{
  input: AddCustomCommandInput;
}>;


export type AddCustomCommandWizardMutation = { __typename?: 'Mutation', addCustomCommand: { __typename?: 'CommandResponseType', status: boolean, message: string } };

export type WizardUsageQueryVariables = Exact<{ [key: string]: never; }>;


export type WizardUsageQuery = { __typename?: 'Query', myUsage: { __typename?: 'UsageReportType', tenants: number }, mySubscription?: { __typename?: 'UserSubscriptionType', plan: { __typename?: 'SubscriptionPlanType', maxTenants: number, maxPlatformsPerTenant: number, maxCustomCommandsPerTenant: number, maxContactsPerTenant: number } } | null };

export type GetUsersQueryVariables = Exact<{
  input?: InputMaybe<GetAllUsersType>;
}>;


export type GetUsersQuery = { __typename?: 'Query', users: { __typename?: 'UsersListType', total: number, users: Array<{ __typename?: 'UserSummaryType', id: string, name: string, surname: string, email: string, phone: string, status: UserStatus, type: UserRole }> } };

export type CreateSimpleUserMutationVariables = Exact<{
  input: CreateSimpleUserType;
}>;


export type CreateSimpleUserMutation = { __typename?: 'Mutation', createSimpleUser: { __typename?: 'UserType', id: string, email: string } };

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

export type StatusQueryVariables = Exact<{ [key: string]: never; }>;


export type StatusQuery = { __typename?: 'Query', loginStatus: { __typename?: 'LoginStatusType', status: AuthStatus, phoneId?: string | null, user?: { __typename?: 'UserStatusType', id: string, email: string, owner: boolean, is2faEnabled: boolean, isAdaptiveLoginEnabled: boolean, admin: boolean, tenantId?: string | null } | null } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logoutUser: { __typename?: 'StatusType', status: AuthStatus } };

export type CoreConfigsQueryVariables = Exact<{ [key: string]: never; }>;


export type CoreConfigsQuery = { __typename?: 'Query', coreConfigs: { __typename?: 'ConfigsListType', status: boolean, message: string, data: Array<{ __typename?: 'ConfigType', key: string, value: string, description: string }> } };

export type UpdateConfigMutationVariables = Exact<{
  input: UpdateConfigType;
}>;


export type UpdateConfigMutation = { __typename?: 'Mutation', updateConfig: { __typename?: 'ConfigResponseType', status: boolean, message: string, data?: { __typename?: 'ConfigType', key: string, value: string } | null } };

export type TenantFeaturesQueryVariables = Exact<{ [key: string]: never; }>;


export type TenantFeaturesQuery = { __typename?: 'Query', tenantFeatures: { __typename?: 'TenantFeaturesType', enableSignal: boolean, enableWhatsApp: boolean, enableMessenger: boolean, enableGate: boolean, enablePayment: boolean, enableCommandScheduling: boolean, enableAnalytics: boolean } };


export const ConfirmRegistrationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ConfirmRegistration"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"token"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"confirmRegistration"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"token"},"value":{"kind":"Variable","name":{"kind":"Name","value":"token"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<ConfirmRegistrationMutation, ConfirmRegistrationMutationVariables>;
export const GetHomeDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetHomeData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mySubscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"plan"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"maxTenants"}},{"kind":"Field","name":{"kind":"Name","value":"maxPlatformsPerTenant"}},{"kind":"Field","name":{"kind":"Name","value":"maxContactsPerTenant"}},{"kind":"Field","name":{"kind":"Name","value":"maxStaffPerTenant"}},{"kind":"Field","name":{"kind":"Name","value":"maxCustomCommandsPerTenant"}},{"kind":"Field","name":{"kind":"Name","value":"priceCents"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"subscriptionPlans"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"maxTenants"}},{"kind":"Field","name":{"kind":"Name","value":"maxPlatformsPerTenant"}},{"kind":"Field","name":{"kind":"Name","value":"maxContactsPerTenant"}},{"kind":"Field","name":{"kind":"Name","value":"maxStaffPerTenant"}},{"kind":"Field","name":{"kind":"Name","value":"maxCustomCommandsPerTenant"}},{"kind":"Field","name":{"kind":"Name","value":"priceCents"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"Field","name":{"kind":"Name","value":"myTenants"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"billingUserId"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tenantsIStaffAt"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenantId"}},{"kind":"Field","name":{"kind":"Name","value":"tenantSlug"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]} as unknown as DocumentNode<GetHomeDataQuery, GetHomeDataQueryVariables>;
export const SelectSubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SelectSubscription"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SelectSubscriptionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"selectSubscription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"plan"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<SelectSubscriptionMutation, SelectSubscriptionMutationVariables>;
export const SwitchActiveTenantDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SwitchActiveTenant"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tenantId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"switchTenant"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"tenantId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tenantId"}}}]}]}}]} as unknown as DocumentNode<SwitchActiveTenantMutation, SwitchActiveTenantMutationVariables>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loginUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const QrChallengeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"QrChallenge"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"nonce"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"qrChallenge"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"nonce"},"value":{"kind":"Variable","name":{"kind":"Name","value":"nonce"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"challenge"}},{"kind":"Field","name":{"kind":"Name","value":"dataUrl"}}]}}]}}]} as unknown as DocumentNode<QrChallengeMutation, QrChallengeMutationVariables>;
export const QrLoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"QrLogin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"challenge"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"nonce"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"qrLogin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"challenge"},"value":{"kind":"Variable","name":{"kind":"Name","value":"challenge"}}},{"kind":"Argument","name":{"kind":"Name","value":"nonce"},"value":{"kind":"Variable","name":{"kind":"Name","value":"nonce"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<QrLoginMutation, QrLoginMutationVariables>;
export const VerifyMfaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"VerifyMfa"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"VerifyCodeType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"verifyMfa"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<VerifyMfaMutation, VerifyMfaMutationVariables>;
export const Verify2faCodeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Verify2faCode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Verify2faCodeType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"verify2faCode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<Verify2faCodeMutation, Verify2faCodeMutationVariables>;
export const GetPasskeyOptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GetPasskeyOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"optionPasskey"}}]}}]} as unknown as DocumentNode<GetPasskeyOptionsMutation, GetPasskeyOptionsMutationVariables>;
export const VerifyPasskeyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"VerifyPasskey"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSON"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"optionPasskeyVerify"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<VerifyPasskeyMutation, VerifyPasskeyMutationVariables>;
export const QrRejectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"QrReject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"challenge"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"qrReject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"challenge"},"value":{"kind":"Variable","name":{"kind":"Name","value":"challenge"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<QrRejectMutation, QrRejectMutationVariables>;
export const QrOptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"QrOption"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"challenge"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"nonce"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"qrOption"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"challenge"},"value":{"kind":"Variable","name":{"kind":"Name","value":"challenge"}}},{"kind":"Argument","name":{"kind":"Name","value":"nonce"},"value":{"kind":"Variable","name":{"kind":"Name","value":"nonce"}}}]}]}}]} as unknown as DocumentNode<QrOptionMutation, QrOptionMutationVariables>;
export const QrVerifyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"QrVerify"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"challenge"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSON"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"qrConfirm"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"challenge"},"value":{"kind":"Variable","name":{"kind":"Name","value":"challenge"}}},{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<QrVerifyMutation, QrVerifyMutationVariables>;
export const RegisterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Register"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RegisterInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"register"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<RegisterMutation, RegisterMutationVariables>;
export const GetPasskeysDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPasskeys"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getPasskeys"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createAt"}},{"kind":"Field","name":{"kind":"Name","value":"deviceName"}},{"kind":"Field","name":{"kind":"Name","value":"credentialID"}}]}}]}}]} as unknown as DocumentNode<GetPasskeysQuery, GetPasskeysQueryVariables>;
export const RemovePasskeyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemovePasskey"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removePasskey"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<RemovePasskeyMutation, RemovePasskeyMutationVariables>;
export const AcceptTfaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AcceptTfa"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accept2fa"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"dataUrl"}}]}}]}}]} as unknown as DocumentNode<AcceptTfaMutation, AcceptTfaMutationVariables>;
export const RejectTfaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RejectTfa"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reject2fa"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<RejectTfaMutation, RejectTfaMutationVariables>;
export const Verify2faDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Verify2fa"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"code"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"verify2fa"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"code"},"value":{"kind":"Variable","name":{"kind":"Name","value":"code"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<Verify2faMutation, Verify2faMutationVariables>;
export const AcceptAdaptiveLoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AcceptAdaptiveLogin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adaptiveLogin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"active"}}]}}]}}]} as unknown as DocumentNode<AcceptAdaptiveLoginMutation, AcceptAdaptiveLoginMutationVariables>;
export const RegisterOptionPasskeyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RegisterOptionPasskey"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"registerOptionPasskey"}}]}}]} as unknown as DocumentNode<RegisterOptionPasskeyMutation, RegisterOptionPasskeyMutationVariables>;
export const VerifyRegistrationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"VerifyRegistration"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSON"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"registerOptionPasskeyVerify"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<VerifyRegistrationMutation, VerifyRegistrationMutationVariables>;
export const GetBillingDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetBillingData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mySubscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"plan"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"maxTenants"}},{"kind":"Field","name":{"kind":"Name","value":"maxPlatformsPerTenant"}},{"kind":"Field","name":{"kind":"Name","value":"maxContactsPerTenant"}},{"kind":"Field","name":{"kind":"Name","value":"maxStaffPerTenant"}},{"kind":"Field","name":{"kind":"Name","value":"maxCustomCommandsPerTenant"}},{"kind":"Field","name":{"kind":"Name","value":"priceCents"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"subscriptionPlans"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"maxTenants"}},{"kind":"Field","name":{"kind":"Name","value":"maxPlatformsPerTenant"}},{"kind":"Field","name":{"kind":"Name","value":"maxContactsPerTenant"}},{"kind":"Field","name":{"kind":"Name","value":"maxStaffPerTenant"}},{"kind":"Field","name":{"kind":"Name","value":"maxCustomCommandsPerTenant"}},{"kind":"Field","name":{"kind":"Name","value":"priceCents"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"Field","name":{"kind":"Name","value":"myUsage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"billingUserId"}},{"kind":"Field","name":{"kind":"Name","value":"tenants"}},{"kind":"Field","name":{"kind":"Name","value":"perTenant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenantId"}},{"kind":"Field","name":{"kind":"Name","value":"staff"}},{"kind":"Field","name":{"kind":"Name","value":"platforms"}},{"kind":"Field","name":{"kind":"Name","value":"contacts"}},{"kind":"Field","name":{"kind":"Name","value":"customCommands"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"subscriptionHistory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"oldPlanId"}},{"kind":"Field","name":{"kind":"Name","value":"newPlanId"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"initiatedAt"}}]}}]}}]} as unknown as DocumentNode<GetBillingDataQuery, GetBillingDataQueryVariables>;
export const PreviewPlanChangeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PreviewPlanChange"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"newPlanId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"previewPlanChange"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"newPlanId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"newPlanId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"deltaPriceCents"}},{"kind":"Field","name":{"kind":"Name","value":"newPlan"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"maxTenants"}},{"kind":"Field","name":{"kind":"Name","value":"maxPlatformsPerTenant"}},{"kind":"Field","name":{"kind":"Name","value":"maxContactsPerTenant"}},{"kind":"Field","name":{"kind":"Name","value":"maxStaffPerTenant"}},{"kind":"Field","name":{"kind":"Name","value":"maxCustomCommandsPerTenant"}},{"kind":"Field","name":{"kind":"Name","value":"priceCents"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"currentPlan"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"maxTenants"}},{"kind":"Field","name":{"kind":"Name","value":"maxPlatformsPerTenant"}},{"kind":"Field","name":{"kind":"Name","value":"maxContactsPerTenant"}},{"kind":"Field","name":{"kind":"Name","value":"maxStaffPerTenant"}},{"kind":"Field","name":{"kind":"Name","value":"maxCustomCommandsPerTenant"}},{"kind":"Field","name":{"kind":"Name","value":"priceCents"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"violations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"tenantId"}},{"kind":"Field","name":{"kind":"Name","value":"current"}},{"kind":"Field","name":{"kind":"Name","value":"max"}}]}}]}}]}}]} as unknown as DocumentNode<PreviewPlanChangeQuery, PreviewPlanChangeQueryVariables>;
export const ChangePlanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ChangePlan"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SelectSubscriptionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"selectSubscription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"plan"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<ChangePlanMutation, ChangePlanMutationVariables>;
export const CancelSubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CancelSubscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelSubscription"}}]}}]} as unknown as DocumentNode<CancelSubscriptionMutation, CancelSubscriptionMutationVariables>;
export const GetTenantCommandConfigsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTenantCommandConfigs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenantCommandConfigs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"commandName"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"userTypes"}},{"kind":"Field","name":{"kind":"Name","value":"actionsJson"}},{"kind":"Field","name":{"kind":"Name","value":"parametersOverrideJson"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionI18nJson"}}]}}]}}]} as unknown as DocumentNode<GetTenantCommandConfigsQuery, GetTenantCommandConfigsQueryVariables>;
export const UpsertTenantCommandConfigMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertTenantCommandConfigMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpsertTenantCommandConfigInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertTenantCommandConfig"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<UpsertTenantCommandConfigMutationMutation, UpsertTenantCommandConfigMutationMutationVariables>;
export const DeleteTenantCommandConfigDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteTenantCommandConfig"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteTenantCommandConfigInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteTenantCommandConfig"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<DeleteTenantCommandConfigMutation, DeleteTenantCommandConfigMutationVariables>;
export const TenantPlatformCredentialsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TenantPlatformCredentials"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenantPlatformCredentials"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"platform"}},{"kind":"Field","name":{"kind":"Name","value":"configJson"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]}}]} as unknown as DocumentNode<TenantPlatformCredentialsQuery, TenantPlatformCredentialsQueryVariables>;
export const UpdateMyPlatformCredentialsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMyPlatformCredentials"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateMyPlatformCredentialsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMyPlatformCredentials"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<UpdateMyPlatformCredentialsMutation, UpdateMyPlatformCredentialsMutationVariables>;
export const TenantFeaturesSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TenantFeaturesSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenantFeatures"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"enableSignal"}},{"kind":"Field","name":{"kind":"Name","value":"enableWhatsApp"}},{"kind":"Field","name":{"kind":"Name","value":"enableMessenger"}},{"kind":"Field","name":{"kind":"Name","value":"enableGate"}},{"kind":"Field","name":{"kind":"Name","value":"enablePayment"}},{"kind":"Field","name":{"kind":"Name","value":"enableCommandScheduling"}},{"kind":"Field","name":{"kind":"Name","value":"enableAnalytics"}},{"kind":"Field","name":{"kind":"Name","value":"enableAudioRecognition"}}]}}]}}]} as unknown as DocumentNode<TenantFeaturesSettingsQuery, TenantFeaturesSettingsQueryVariables>;
export const UpdateTenantFeaturesActiveDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateTenantFeaturesActive"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateTenantFeaturesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTenantFeatures"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<UpdateTenantFeaturesActiveMutation, UpdateTenantFeaturesActiveMutationVariables>;
export const GetTenantPromptOverridesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTenantPromptOverrides"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenantPromptOverrides"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"commandId"}},{"kind":"Field","name":{"kind":"Name","value":"userType"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionI18nJson"}},{"kind":"Field","name":{"kind":"Name","value":"prompt"}}]}}]}}]} as unknown as DocumentNode<GetTenantPromptOverridesQuery, GetTenantPromptOverridesQueryVariables>;
export const GetTenantCommandConfigsForPromptsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTenantCommandConfigsForPrompts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenantCommandConfigs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"commandName"}}]}}]}}]} as unknown as DocumentNode<GetTenantCommandConfigsForPromptsQuery, GetTenantCommandConfigsForPromptsQueryVariables>;
export const UpsertTenantPromptOverrideDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertTenantPromptOverride"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpsertTenantPromptOverrideInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertTenantPromptOverride"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<UpsertTenantPromptOverrideMutation, UpsertTenantPromptOverrideMutationVariables>;
export const TenantSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TenantSettings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tenantId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenantCustomization"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"tenantId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tenantId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"branding"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"primaryColor"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryColor"}},{"kind":"Field","name":{"kind":"Name","value":"fontSize"}}]}},{"kind":"Field","name":{"kind":"Name","value":"features"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"enableSignal"}},{"kind":"Field","name":{"kind":"Name","value":"enableWhatsApp"}},{"kind":"Field","name":{"kind":"Name","value":"enableMessenger"}},{"kind":"Field","name":{"kind":"Name","value":"enableGate"}},{"kind":"Field","name":{"kind":"Name","value":"enablePayment"}},{"kind":"Field","name":{"kind":"Name","value":"enableCommandScheduling"}},{"kind":"Field","name":{"kind":"Name","value":"enableAnalytics"}},{"kind":"Field","name":{"kind":"Name","value":"enableAudioRecognition"}}]}},{"kind":"Field","name":{"kind":"Name","value":"messaging"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"defaultSmsProvider"}},{"kind":"Field","name":{"kind":"Name","value":"priorityChannels"}},{"kind":"Field","name":{"kind":"Name","value":"rateLimitPerMinute"}}]}},{"kind":"Field","name":{"kind":"Name","value":"commands"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"timeout"}},{"kind":"Field","name":{"kind":"Name","value":"maxRetries"}},{"kind":"Field","name":{"kind":"Name","value":"processingDelay"}},{"kind":"Field","name":{"kind":"Name","value":"customPromptLibraryEnabled"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compliance"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dataResidency"}},{"kind":"Field","name":{"kind":"Name","value":"encryptionEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"webhookUrl"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"tenantStaff"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"tenantId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tenantId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenantId"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}},{"kind":"Field","name":{"kind":"Name","value":"myTenants"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"schemaName"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"billingUserId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tenantsIStaffAt"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenantId"}},{"kind":"Field","name":{"kind":"Name","value":"tenantSlug"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]} as unknown as DocumentNode<TenantSettingsQuery, TenantSettingsQueryVariables>;
export const UpdateTenantBrandingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateTenantBranding"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BrandingInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTenantBranding"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<UpdateTenantBrandingMutation, UpdateTenantBrandingMutationVariables>;
export const UpdateTenantSettingsFeaturesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateTenantSettingsFeatures"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateTenantFeaturesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTenantFeatures"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<UpdateTenantSettingsFeaturesMutation, UpdateTenantSettingsFeaturesMutationVariables>;
export const UpdateTenantMessagingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateTenantMessaging"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MessagingInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTenantMessaging"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<UpdateTenantMessagingMutation, UpdateTenantMessagingMutationVariables>;
export const UpdateTenantCommandsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateTenantCommands"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CommandsConfigInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTenantCommands"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<UpdateTenantCommandsMutation, UpdateTenantCommandsMutationVariables>;
export const UpdateTenantComplianceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateTenantCompliance"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ComplianceInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTenantCompliance"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<UpdateTenantComplianceMutation, UpdateTenantComplianceMutationVariables>;
export const SetTenantActiveDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetTenantActive"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SetTenantActiveInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setTenantActive"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<SetTenantActiveMutation, SetTenantActiveMutationVariables>;
export const DeleteTenantDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteTenant"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteTenantInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteTenant"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<DeleteTenantMutation, DeleteTenantMutationVariables>;
export const AddTenantStaffDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddTenantStaff"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddTenantStaffInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addTenantStaff"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<AddTenantStaffMutation, AddTenantStaffMutationVariables>;
export const RemoveTenantStaffDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveTenantStaff"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoveTenantStaffInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeTenantStaff"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<RemoveTenantStaffMutation, RemoveTenantStaffMutationVariables>;
export const ChangeTenantStaffRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ChangeTenantStaffRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChangeTenantStaffRoleInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changeTenantStaffRole"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<ChangeTenantStaffRoleMutation, ChangeTenantStaffRoleMutationVariables>;
export const TenantAuditLogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TenantAuditLog"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tenantId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenantAuditLog"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"tenantId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tenantId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"tenantId"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"payload"}},{"kind":"Field","name":{"kind":"Name","value":"correlationId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<TenantAuditLogQuery, TenantAuditLogQueryVariables>;
export const TenantSlugAvailableDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TenantSlugAvailable"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenantSlugAvailable"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}}]}]}}]} as unknown as DocumentNode<TenantSlugAvailableQuery, TenantSlugAvailableQueryVariables>;
export const CreateTenantWizardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateTenantWizard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateTenantInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createTenant"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"schemaName"}}]}}]}}]} as unknown as DocumentNode<CreateTenantWizardMutation, CreateTenantWizardMutationVariables>;
export const SwitchTenantWizardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SwitchTenantWizard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tenantId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"switchTenant"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"tenantId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tenantId"}}}]}]}}]} as unknown as DocumentNode<SwitchTenantWizardMutation, SwitchTenantWizardMutationVariables>;
export const UpdateTenantFeaturesWizardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateTenantFeaturesWizard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateTenantFeaturesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTenantFeatures"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<UpdateTenantFeaturesWizardMutation, UpdateTenantFeaturesWizardMutationVariables>;
export const AddContactWizardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddContactWizard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddContactInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addContact"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<AddContactWizardMutation, AddContactWizardMutationVariables>;
export const UpsertPlatformWizardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertPlatformWizard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpsertPlatformCredentialsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertPlatformCredentials"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<UpsertPlatformWizardMutation, UpsertPlatformWizardMutationVariables>;
export const AddCustomCommandWizardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddCustomCommandWizard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddCustomCommandInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addCustomCommand"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<AddCustomCommandWizardMutation, AddCustomCommandWizardMutationVariables>;
export const WizardUsageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WizardUsage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myUsage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenants"}}]}},{"kind":"Field","name":{"kind":"Name","value":"mySubscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"plan"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"maxTenants"}},{"kind":"Field","name":{"kind":"Name","value":"maxPlatformsPerTenant"}},{"kind":"Field","name":{"kind":"Name","value":"maxCustomCommandsPerTenant"}},{"kind":"Field","name":{"kind":"Name","value":"maxContactsPerTenant"}}]}}]}}]}}]} as unknown as DocumentNode<WizardUsageQuery, WizardUsageQueryVariables>;
export const GetUsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUsers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"GetAllUsersType"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"users"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"users"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"surname"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]} as unknown as DocumentNode<GetUsersQuery, GetUsersQueryVariables>;
export const CreateSimpleUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateSimpleUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateSimpleUserType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createSimpleUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]} as unknown as DocumentNode<CreateSimpleUserMutation, CreateSimpleUserMutationVariables>;
export const UpdateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"surname"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<UpdateUserMutation, UpdateUserMutationVariables>;
export const UpdateUserStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateUserStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserStatusType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUserStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"surname"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<UpdateUserStatusMutation, UpdateUserStatusMutationVariables>;
export const UpdateUserRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateUserRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserRoleType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUserRole"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"surname"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<UpdateUserRoleMutation, UpdateUserRoleMutationVariables>;
export const RemoveUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetUserType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<RemoveUserMutation, RemoveUserMutationVariables>;
export const StatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loginStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"phoneId"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"owner"}},{"kind":"Field","name":{"kind":"Name","value":"is2faEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"isAdaptiveLoginEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"admin"}},{"kind":"Field","name":{"kind":"Name","value":"tenantId"}}]}}]}}]}}]} as unknown as DocumentNode<StatusQuery, StatusQueryVariables>;
export const LogoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Logout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logoutUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<LogoutMutation, LogoutMutationVariables>;
export const CoreConfigsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CoreConfigs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"coreConfigs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<CoreConfigsQuery, CoreConfigsQueryVariables>;
export const UpdateConfigDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateConfig"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateConfigType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateConfig"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateConfigMutation, UpdateConfigMutationVariables>;
export const TenantFeaturesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TenantFeatures"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tenantFeatures"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"enableSignal"}},{"kind":"Field","name":{"kind":"Name","value":"enableWhatsApp"}},{"kind":"Field","name":{"kind":"Name","value":"enableMessenger"}},{"kind":"Field","name":{"kind":"Name","value":"enableGate"}},{"kind":"Field","name":{"kind":"Name","value":"enablePayment"}},{"kind":"Field","name":{"kind":"Name","value":"enableCommandScheduling"}},{"kind":"Field","name":{"kind":"Name","value":"enableAnalytics"}}]}}]}}]} as unknown as DocumentNode<TenantFeaturesQuery, TenantFeaturesQueryVariables>;