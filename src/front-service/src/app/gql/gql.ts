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
  '\n  query TenantPlatformCredentials {\n    tenantPlatformCredentials {\n      platform\n      configJson\n      isDefault\n    }\n  }\n': typeof types.TenantPlatformCredentialsDocument;
  '\n  mutation UpdateMyPlatformCredentials($input: UpdateMyPlatformCredentialsInput!) {\n    updateMyPlatformCredentials(input: $input) {\n      status\n      message\n    }\n  }\n': typeof types.UpdateMyPlatformCredentialsDocument;
  '\n  mutation AcceptTfa {\n    accept2fa {\n      status\n      dataUrl\n    }\n  }\n': typeof types.AcceptTfaDocument;
  '\n  mutation RejectTfa {\n    reject2fa {\n      status\n    }\n  }\n': typeof types.RejectTfaDocument;
  '\n  mutation Verify2fa($code: String!) {\n    verify2fa(code: $code) {\n      status\n    }\n  }\n': typeof types.Verify2faDocument;
  '\n  mutation AcceptAdaptiveLogin {\n    adaptiveLogin {\n      active\n    }\n  }\n': typeof types.AcceptAdaptiveLoginDocument;
  '\n  query Status {\n    loginStatus {\n      status\n      phoneId\n      user {\n        id\n        email\n        owner\n        is2faEnabled\n        isAdaptiveLoginEnabled\n        admin\n      }\n    }\n  }\n': typeof types.StatusDocument;
  '\n  mutation Logout {\n    logoutUser {\n      status\n    }\n  }\n': typeof types.LogoutDocument;
  '\n  query GetCommands($input: GetAllCommandsType) {\n    commands(input: $input) {\n      status\n      message\n      data {\n        id\n        name\n        description\n        active\n        actions\n        parameters\n        roleNames\n      }\n      total\n    }\n  }\n': typeof types.GetCommandsDocument;
  '\n  mutation AddCommand($input: AddCommandType!) {\n    addCommand(input: $input) {\n      status\n      message\n      data {\n        id\n        name\n        description\n        active\n        actions\n        parameters\n        roleNames\n      }\n    }\n  }\n': typeof types.AddCommandDocument;
  '\n  mutation UpdateCommand($input: UpdateCommandType!) {\n    updateCommand(input: $input) {\n      status\n      message\n      data {\n        id\n      }\n    }\n  }\n': typeof types.UpdateCommandDocument;
  '\n  mutation ToggleActiveStatus($input: ToggleActiveStatusType!) {\n    toggleActiveStatus(input: $input) {\n      status\n      message\n      data {\n        id\n        active\n      }\n    }\n  }\n': typeof types.ToggleActiveStatusDocument;
  '\n  mutation RemoveCommand($input: RemoveCommandType!) {\n    removeCommand(input: $input) {\n      status\n      message\n    }\n  }\n': typeof types.RemoveCommandDocument;
  '\n  query CoreConfigs {\n    coreConfigs {\n      data {\n        key\n        value\n        description\n      }\n      status\n      message\n    }\n  }\n': typeof types.CoreConfigsDocument;
  '\n  mutation UpdateConfig($input: UpdateConfigType!) {\n    updateConfig(input: $input) {\n      status\n      message\n      data {\n        key\n        value\n      }\n    }\n  }\n': typeof types.UpdateConfigDocument;
  '\n  mutation Login($input: LoginType!) {\n    loginUser(input: $input) {\n      status\n    }\n  }\n': typeof types.LoginDocument;
  '\n  query GetPrompts($input: GetAllPromptsType) {\n    prompts(input: $input) {\n      status\n      message\n      data {\n        id\n        key\n        description\n        commandName\n        userType\n      }\n      total\n    }\n  }\n': typeof types.GetPromptsDocument;
  '\n  query GetPromptById($input: GetPromptByIdType!) {\n    promptById(input: $input) {\n      status\n      message\n      data {\n        id\n        key\n        description\n        commandName\n        userType\n        prompt\n      }\n    }\n  }\n': typeof types.GetPromptByIdDocument;
  '\n  mutation AddPrompt($input: AddPromptType!) {\n    addPrompt(input: $input) {\n      status\n      message\n      data {\n        id\n        key\n        description\n        commandName\n        userType\n        prompt\n      }\n    }\n  }\n': typeof types.AddPromptDocument;
  '\n  mutation UpdatePrompt($input: UpdatePromptType!) {\n    updatePrompt(input: $input) {\n      status\n      message\n      data {\n        id\n        key\n        description\n        commandName\n        userType\n        prompt\n      }\n    }\n  }\n': typeof types.UpdatePromptDocument;
  '\n  mutation RemovePrompt($input: RemovePromptType!) {\n    removePrompt(input: $input) {\n      success\n    }\n  }\n': typeof types.RemovePromptDocument;
  '\n  mutation QrChallenge($nonce: String!) {\n    qrChallenge(nonce: $nonce) {\n      challenge\n      dataUrl\n    }\n  }\n': typeof types.QrChallengeDocument;
  '\n  mutation QrLogin($challenge: String!, $nonce: String!) {\n    qrLogin(challenge: $challenge, nonce: $nonce) {\n      status\n    }\n  }\n': typeof types.QrLoginDocument;
  '\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      success\n    }\n  }\n': typeof types.RegisterDocument;
  '\n  query TenantFeaturesSettings {\n    tenantFeatures {\n      enableSignal\n      enableWhatsApp\n      enableMessenger\n      enableGate\n      enablePayment\n      enableCommandScheduling\n      enableAnalytics\n      enableAudioRecognition\n      maxUsersPerTenant\n    }\n  }\n': typeof types.TenantFeaturesSettingsDocument;
  '\n  mutation UpdateTenantFeatures($input: UpdateTenantFeaturesInput!) {\n    updateTenantFeatures(input: $input) {\n      status\n      message\n    }\n  }\n': typeof types.UpdateTenantFeaturesDocument;
  '\n  query TenantFeatures {\n    tenantFeatures {\n      enableSignal\n      enableWhatsApp\n      enableMessenger\n      enableGate\n      enablePayment\n      enableCommandScheduling\n      enableAnalytics\n      maxUsersPerTenant\n    }\n  }\n': typeof types.TenantFeaturesDocument;
  '\n  query GetUsers($input: GetAllUsersType) {\n    users(input: $input) {\n      users {\n        id\n        name\n        surname\n        email\n        phone\n        status\n        type\n      }\n      total\n    }\n  }\n': typeof types.GetUsersDocument;
  '\n  mutation UpdateUser($input: UpdateUserType!) {\n    updateUser(input: $input) {\n      id\n      name\n      surname\n      email\n      phone\n      status\n      type\n    }\n  }\n': typeof types.UpdateUserDocument;
  '\n  mutation UpdateUserStatus($input: UpdateUserStatusType!) {\n    updateUserStatus(input: $input) {\n      id\n      name\n      surname\n      email\n      phone\n      status\n      type\n    }\n  }\n': typeof types.UpdateUserStatusDocument;
  '\n  mutation UpdateUserRole($input: UpdateUserRoleType!) {\n    updateUserRole(input: $input) {\n      id\n      name\n      surname\n      email\n      phone\n      status\n      type\n    }\n  }\n': typeof types.UpdateUserRoleDocument;
  '\n  mutation RemoveUser($input: GetUserType!) {\n    removeUser(input: $input) {\n      success\n    }\n  }\n': typeof types.RemoveUserDocument;
  '\n  mutation CreateSimpleUser($input: CreateSimpleUserType!) {\n    createSimpleUser(input: $input) {\n      id\n      email\n    }\n  }\n': typeof types.CreateSimpleUserDocument;
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
  '\n  query TenantPlatformCredentials {\n    tenantPlatformCredentials {\n      platform\n      configJson\n      isDefault\n    }\n  }\n':
    types.TenantPlatformCredentialsDocument,
  '\n  mutation UpdateMyPlatformCredentials($input: UpdateMyPlatformCredentialsInput!) {\n    updateMyPlatformCredentials(input: $input) {\n      status\n      message\n    }\n  }\n':
    types.UpdateMyPlatformCredentialsDocument,
  '\n  mutation AcceptTfa {\n    accept2fa {\n      status\n      dataUrl\n    }\n  }\n': types.AcceptTfaDocument,
  '\n  mutation RejectTfa {\n    reject2fa {\n      status\n    }\n  }\n': types.RejectTfaDocument,
  '\n  mutation Verify2fa($code: String!) {\n    verify2fa(code: $code) {\n      status\n    }\n  }\n':
    types.Verify2faDocument,
  '\n  mutation AcceptAdaptiveLogin {\n    adaptiveLogin {\n      active\n    }\n  }\n':
    types.AcceptAdaptiveLoginDocument,
  '\n  query Status {\n    loginStatus {\n      status\n      phoneId\n      user {\n        id\n        email\n        owner\n        is2faEnabled\n        isAdaptiveLoginEnabled\n        admin\n      }\n    }\n  }\n':
    types.StatusDocument,
  '\n  mutation Logout {\n    logoutUser {\n      status\n    }\n  }\n': types.LogoutDocument,
  '\n  query GetCommands($input: GetAllCommandsType) {\n    commands(input: $input) {\n      status\n      message\n      data {\n        id\n        name\n        description\n        active\n        actions\n        parameters\n        roleNames\n      }\n      total\n    }\n  }\n':
    types.GetCommandsDocument,
  '\n  mutation AddCommand($input: AddCommandType!) {\n    addCommand(input: $input) {\n      status\n      message\n      data {\n        id\n        name\n        description\n        active\n        actions\n        parameters\n        roleNames\n      }\n    }\n  }\n':
    types.AddCommandDocument,
  '\n  mutation UpdateCommand($input: UpdateCommandType!) {\n    updateCommand(input: $input) {\n      status\n      message\n      data {\n        id\n      }\n    }\n  }\n':
    types.UpdateCommandDocument,
  '\n  mutation ToggleActiveStatus($input: ToggleActiveStatusType!) {\n    toggleActiveStatus(input: $input) {\n      status\n      message\n      data {\n        id\n        active\n      }\n    }\n  }\n':
    types.ToggleActiveStatusDocument,
  '\n  mutation RemoveCommand($input: RemoveCommandType!) {\n    removeCommand(input: $input) {\n      status\n      message\n    }\n  }\n':
    types.RemoveCommandDocument,
  '\n  query CoreConfigs {\n    coreConfigs {\n      data {\n        key\n        value\n        description\n      }\n      status\n      message\n    }\n  }\n':
    types.CoreConfigsDocument,
  '\n  mutation UpdateConfig($input: UpdateConfigType!) {\n    updateConfig(input: $input) {\n      status\n      message\n      data {\n        key\n        value\n      }\n    }\n  }\n':
    types.UpdateConfigDocument,
  '\n  mutation Login($input: LoginType!) {\n    loginUser(input: $input) {\n      status\n    }\n  }\n':
    types.LoginDocument,
  '\n  query GetPrompts($input: GetAllPromptsType) {\n    prompts(input: $input) {\n      status\n      message\n      data {\n        id\n        key\n        description\n        commandName\n        userType\n      }\n      total\n    }\n  }\n':
    types.GetPromptsDocument,
  '\n  query GetPromptById($input: GetPromptByIdType!) {\n    promptById(input: $input) {\n      status\n      message\n      data {\n        id\n        key\n        description\n        commandName\n        userType\n        prompt\n      }\n    }\n  }\n':
    types.GetPromptByIdDocument,
  '\n  mutation AddPrompt($input: AddPromptType!) {\n    addPrompt(input: $input) {\n      status\n      message\n      data {\n        id\n        key\n        description\n        commandName\n        userType\n        prompt\n      }\n    }\n  }\n':
    types.AddPromptDocument,
  '\n  mutation UpdatePrompt($input: UpdatePromptType!) {\n    updatePrompt(input: $input) {\n      status\n      message\n      data {\n        id\n        key\n        description\n        commandName\n        userType\n        prompt\n      }\n    }\n  }\n':
    types.UpdatePromptDocument,
  '\n  mutation RemovePrompt($input: RemovePromptType!) {\n    removePrompt(input: $input) {\n      success\n    }\n  }\n':
    types.RemovePromptDocument,
  '\n  mutation QrChallenge($nonce: String!) {\n    qrChallenge(nonce: $nonce) {\n      challenge\n      dataUrl\n    }\n  }\n':
    types.QrChallengeDocument,
  '\n  mutation QrLogin($challenge: String!, $nonce: String!) {\n    qrLogin(challenge: $challenge, nonce: $nonce) {\n      status\n    }\n  }\n':
    types.QrLoginDocument,
  '\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      success\n    }\n  }\n':
    types.RegisterDocument,
  '\n  query TenantFeaturesSettings {\n    tenantFeatures {\n      enableSignal\n      enableWhatsApp\n      enableMessenger\n      enableGate\n      enablePayment\n      enableCommandScheduling\n      enableAnalytics\n      enableAudioRecognition\n      maxUsersPerTenant\n    }\n  }\n':
    types.TenantFeaturesSettingsDocument,
  '\n  mutation UpdateTenantFeatures($input: UpdateTenantFeaturesInput!) {\n    updateTenantFeatures(input: $input) {\n      status\n      message\n    }\n  }\n':
    types.UpdateTenantFeaturesDocument,
  '\n  query TenantFeatures {\n    tenantFeatures {\n      enableSignal\n      enableWhatsApp\n      enableMessenger\n      enableGate\n      enablePayment\n      enableCommandScheduling\n      enableAnalytics\n      maxUsersPerTenant\n    }\n  }\n':
    types.TenantFeaturesDocument,
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
  '\n  mutation CreateSimpleUser($input: CreateSimpleUserType!) {\n    createSimpleUser(input: $input) {\n      id\n      email\n    }\n  }\n':
    types.CreateSimpleUserDocument,
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
  source: '\n  query TenantPlatformCredentials {\n    tenantPlatformCredentials {\n      platform\n      configJson\n      isDefault\n    }\n  }\n',
): (typeof documents)['\n  query TenantPlatformCredentials {\n    tenantPlatformCredentials {\n      platform\n      configJson\n      isDefault\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation UpdateMyPlatformCredentials($input: UpdateMyPlatformCredentialsInput!) {\n    updateMyPlatformCredentials(input: $input) {\n      status\n      message\n    }\n  }\n',
): (typeof documents)['\n  mutation UpdateMyPlatformCredentials($input: UpdateMyPlatformCredentialsInput!) {\n    updateMyPlatformCredentials(input: $input) {\n      status\n      message\n    }\n  }\n'];
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
  source: '\n  query Status {\n    loginStatus {\n      status\n      phoneId\n      user {\n        id\n        email\n        owner\n        is2faEnabled\n        isAdaptiveLoginEnabled\n        admin\n      }\n    }\n  }\n',
): (typeof documents)['\n  query Status {\n    loginStatus {\n      status\n      phoneId\n      user {\n        id\n        email\n        owner\n        is2faEnabled\n        isAdaptiveLoginEnabled\n        admin\n      }\n    }\n  }\n'];
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
  source: '\n  query GetCommands($input: GetAllCommandsType) {\n    commands(input: $input) {\n      status\n      message\n      data {\n        id\n        name\n        description\n        active\n        actions\n        parameters\n        roleNames\n      }\n      total\n    }\n  }\n',
): (typeof documents)['\n  query GetCommands($input: GetAllCommandsType) {\n    commands(input: $input) {\n      status\n      message\n      data {\n        id\n        name\n        description\n        active\n        actions\n        parameters\n        roleNames\n      }\n      total\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation AddCommand($input: AddCommandType!) {\n    addCommand(input: $input) {\n      status\n      message\n      data {\n        id\n        name\n        description\n        active\n        actions\n        parameters\n        roleNames\n      }\n    }\n  }\n',
): (typeof documents)['\n  mutation AddCommand($input: AddCommandType!) {\n    addCommand(input: $input) {\n      status\n      message\n      data {\n        id\n        name\n        description\n        active\n        actions\n        parameters\n        roleNames\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation UpdateCommand($input: UpdateCommandType!) {\n    updateCommand(input: $input) {\n      status\n      message\n      data {\n        id\n      }\n    }\n  }\n',
): (typeof documents)['\n  mutation UpdateCommand($input: UpdateCommandType!) {\n    updateCommand(input: $input) {\n      status\n      message\n      data {\n        id\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation ToggleActiveStatus($input: ToggleActiveStatusType!) {\n    toggleActiveStatus(input: $input) {\n      status\n      message\n      data {\n        id\n        active\n      }\n    }\n  }\n',
): (typeof documents)['\n  mutation ToggleActiveStatus($input: ToggleActiveStatusType!) {\n    toggleActiveStatus(input: $input) {\n      status\n      message\n      data {\n        id\n        active\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation RemoveCommand($input: RemoveCommandType!) {\n    removeCommand(input: $input) {\n      status\n      message\n    }\n  }\n',
): (typeof documents)['\n  mutation RemoveCommand($input: RemoveCommandType!) {\n    removeCommand(input: $input) {\n      status\n      message\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query CoreConfigs {\n    coreConfigs {\n      data {\n        key\n        value\n        description\n      }\n      status\n      message\n    }\n  }\n',
): (typeof documents)['\n  query CoreConfigs {\n    coreConfigs {\n      data {\n        key\n        value\n        description\n      }\n      status\n      message\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation UpdateConfig($input: UpdateConfigType!) {\n    updateConfig(input: $input) {\n      status\n      message\n      data {\n        key\n        value\n      }\n    }\n  }\n',
): (typeof documents)['\n  mutation UpdateConfig($input: UpdateConfigType!) {\n    updateConfig(input: $input) {\n      status\n      message\n      data {\n        key\n        value\n      }\n    }\n  }\n'];
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
  source: '\n  query GetPrompts($input: GetAllPromptsType) {\n    prompts(input: $input) {\n      status\n      message\n      data {\n        id\n        key\n        description\n        commandName\n        userType\n      }\n      total\n    }\n  }\n',
): (typeof documents)['\n  query GetPrompts($input: GetAllPromptsType) {\n    prompts(input: $input) {\n      status\n      message\n      data {\n        id\n        key\n        description\n        commandName\n        userType\n      }\n      total\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetPromptById($input: GetPromptByIdType!) {\n    promptById(input: $input) {\n      status\n      message\n      data {\n        id\n        key\n        description\n        commandName\n        userType\n        prompt\n      }\n    }\n  }\n',
): (typeof documents)['\n  query GetPromptById($input: GetPromptByIdType!) {\n    promptById(input: $input) {\n      status\n      message\n      data {\n        id\n        key\n        description\n        commandName\n        userType\n        prompt\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation AddPrompt($input: AddPromptType!) {\n    addPrompt(input: $input) {\n      status\n      message\n      data {\n        id\n        key\n        description\n        commandName\n        userType\n        prompt\n      }\n    }\n  }\n',
): (typeof documents)['\n  mutation AddPrompt($input: AddPromptType!) {\n    addPrompt(input: $input) {\n      status\n      message\n      data {\n        id\n        key\n        description\n        commandName\n        userType\n        prompt\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation UpdatePrompt($input: UpdatePromptType!) {\n    updatePrompt(input: $input) {\n      status\n      message\n      data {\n        id\n        key\n        description\n        commandName\n        userType\n        prompt\n      }\n    }\n  }\n',
): (typeof documents)['\n  mutation UpdatePrompt($input: UpdatePromptType!) {\n    updatePrompt(input: $input) {\n      status\n      message\n      data {\n        id\n        key\n        description\n        commandName\n        userType\n        prompt\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation RemovePrompt($input: RemovePromptType!) {\n    removePrompt(input: $input) {\n      success\n    }\n  }\n',
): (typeof documents)['\n  mutation RemovePrompt($input: RemovePromptType!) {\n    removePrompt(input: $input) {\n      success\n    }\n  }\n'];
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
  source: '\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      success\n    }\n  }\n',
): (typeof documents)['\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      success\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query TenantFeaturesSettings {\n    tenantFeatures {\n      enableSignal\n      enableWhatsApp\n      enableMessenger\n      enableGate\n      enablePayment\n      enableCommandScheduling\n      enableAnalytics\n      enableAudioRecognition\n      maxUsersPerTenant\n    }\n  }\n',
): (typeof documents)['\n  query TenantFeaturesSettings {\n    tenantFeatures {\n      enableSignal\n      enableWhatsApp\n      enableMessenger\n      enableGate\n      enablePayment\n      enableCommandScheduling\n      enableAnalytics\n      enableAudioRecognition\n      maxUsersPerTenant\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation UpdateTenantFeatures($input: UpdateTenantFeaturesInput!) {\n    updateTenantFeatures(input: $input) {\n      status\n      message\n    }\n  }\n',
): (typeof documents)['\n  mutation UpdateTenantFeatures($input: UpdateTenantFeaturesInput!) {\n    updateTenantFeatures(input: $input) {\n      status\n      message\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query TenantFeatures {\n    tenantFeatures {\n      enableSignal\n      enableWhatsApp\n      enableMessenger\n      enableGate\n      enablePayment\n      enableCommandScheduling\n      enableAnalytics\n      maxUsersPerTenant\n    }\n  }\n',
): (typeof documents)['\n  query TenantFeatures {\n    tenantFeatures {\n      enableSignal\n      enableWhatsApp\n      enableMessenger\n      enableGate\n      enablePayment\n      enableCommandScheduling\n      enableAnalytics\n      maxUsersPerTenant\n    }\n  }\n'];
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
  source: '\n  mutation CreateSimpleUser($input: CreateSimpleUserType!) {\n    createSimpleUser(input: $input) {\n      id\n      email\n    }\n  }\n',
): (typeof documents)['\n  mutation CreateSimpleUser($input: CreateSimpleUserType!) {\n    createSimpleUser(input: $input) {\n      id\n      email\n    }\n  }\n'];
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
