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
    "\n  mutation ConfirmRegistration($token: String!) {\n    confirmRegistration(token: $token) {\n      success\n    }\n  }\n": typeof types.ConfirmRegistrationDocument,
    "\n  query GetHomeData {\n    mySubscription {\n      id\n      status\n      plan {\n        id\n        code\n        name\n        maxTenants\n        maxPlatformsPerTenant\n        maxContactsPerTenant\n        maxStaffPerTenant\n        maxCustomCommandsPerTenant\n        priceCents\n        currency\n      }\n    }\n    subscriptionPlans {\n      id\n      code\n      name\n      maxTenants\n      maxPlatformsPerTenant\n      maxContactsPerTenant\n      maxStaffPerTenant\n      maxCustomCommandsPerTenant\n      priceCents\n      currency\n      isActive\n    }\n    myTenants {\n      id\n      slug\n      billingUserId\n      isActive\n    }\n    tenantsIStaffAt {\n      tenantId\n      tenantSlug\n      role\n    }\n  }\n": typeof types.GetHomeDataDocument,
    "\n  mutation SelectSubscription($input: SelectSubscriptionInput!) {\n    selectSubscription(input: $input) {\n      id\n      status\n      plan {\n        id\n        code\n        name\n      }\n    }\n  }\n": typeof types.SelectSubscriptionDocument,
    "\n  mutation SwitchActiveTenant($tenantId: String!) {\n    switchTenant(tenantId: $tenantId)\n  }\n": typeof types.SwitchActiveTenantDocument,
    "\n  mutation Login($input: LoginType!) {\n    loginUser(input: $input) {\n      status\n    }\n  }\n": typeof types.LoginDocument,
    "\n  mutation QrChallenge($nonce: String!) {\n    qrChallenge(nonce: $nonce) {\n      challenge\n      dataUrl\n    }\n  }\n": typeof types.QrChallengeDocument,
    "\n  mutation QrLogin($challenge: String!, $nonce: String!) {\n    qrLogin(challenge: $challenge, nonce: $nonce) {\n      status\n    }\n  }\n": typeof types.QrLoginDocument,
    "\n  mutation VerifyMfa($input: VerifyCodeType!) {\n    verifyMfa(input: $input) {\n      status\n    }\n  }\n": typeof types.VerifyMfaDocument,
    "\n  mutation Verify2faCode($input: Verify2faCodeType!) {\n    verify2faCode(input: $input) {\n      status\n    }\n  }\n": typeof types.Verify2faCodeDocument,
    "\n  mutation GetPasskeyOptions {\n    optionPasskey\n  }\n": typeof types.GetPasskeyOptionsDocument,
    "\n  mutation VerifyPasskey($input: JSON!) {\n    optionPasskeyVerify(data: $input) {\n      status\n    }\n  }\n": typeof types.VerifyPasskeyDocument,
    "\n  mutation QrReject($challenge: String!) {\n    qrReject(challenge: $challenge) {\n      status\n    }\n  }\n": typeof types.QrRejectDocument,
    "\n  mutation QrOption($challenge: String!, $nonce: String!) {\n    qrOption(challenge: $challenge, nonce: $nonce)\n  }\n": typeof types.QrOptionDocument,
    "\n  mutation QrVerify($challenge: String!, $data: JSON!) {\n    qrConfirm(challenge: $challenge, data: $data) {\n      status\n    }\n  }\n": typeof types.QrVerifyDocument,
    "\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      success\n    }\n  }\n": typeof types.RegisterDocument,
    "\n  query GetPasskeys {\n    getPasskeys {\n      id\n      createAt\n      deviceName\n      credentialID\n    }\n  }\n": typeof types.GetPasskeysDocument,
    "\n  mutation RemovePasskey($id: String!) {\n    removePasskey(id: $id) {\n      status\n    }\n  }\n": typeof types.RemovePasskeyDocument,
    "\n  mutation AcceptTfa {\n    accept2fa {\n      status\n      dataUrl\n    }\n  }\n": typeof types.AcceptTfaDocument,
    "\n  mutation RejectTfa {\n    reject2fa {\n      status\n    }\n  }\n": typeof types.RejectTfaDocument,
    "\n  mutation Verify2fa($code: String!) {\n    verify2fa(code: $code) {\n      status\n    }\n  }\n": typeof types.Verify2faDocument,
    "\n  mutation AcceptAdaptiveLogin {\n    adaptiveLogin {\n      active\n    }\n  }\n": typeof types.AcceptAdaptiveLoginDocument,
    "\n  mutation RegisterOptionPasskey {\n    registerOptionPasskey\n  }\n": typeof types.RegisterOptionPasskeyDocument,
    "\n  mutation VerifyRegistration($input: JSON!) {\n    registerOptionPasskeyVerify(data: $input) {\n      status\n    }\n  }\n": typeof types.VerifyRegistrationDocument,
    "\n  query GetBillingData {\n    mySubscription {\n      id\n      status\n      startedAt\n      plan {\n        id\n        code\n        name\n        maxTenants\n        maxPlatformsPerTenant\n        maxContactsPerTenant\n        maxStaffPerTenant\n        maxCustomCommandsPerTenant\n        priceCents\n        currency\n      }\n    }\n    subscriptionPlans {\n      id\n      code\n      name\n      maxTenants\n      maxPlatformsPerTenant\n      maxContactsPerTenant\n      maxStaffPerTenant\n      maxCustomCommandsPerTenant\n      priceCents\n      currency\n      isActive\n    }\n    myUsage {\n      billingUserId\n      tenants\n      perTenant {\n        tenantId\n        staff\n        platforms\n        contacts\n        customCommands\n      }\n    }\n    subscriptionHistory {\n      id\n      oldPlanId\n      newPlanId\n      kind\n      initiatedAt\n    }\n  }\n": typeof types.GetBillingDataDocument,
    "\n  query PreviewPlanChange($newPlanId: String!) {\n    previewPlanChange(newPlanId: $newPlanId) {\n      kind\n      deltaPriceCents\n      newPlan {\n        id\n        code\n        name\n        maxTenants\n        maxPlatformsPerTenant\n        maxContactsPerTenant\n        maxStaffPerTenant\n        maxCustomCommandsPerTenant\n        priceCents\n        currency\n      }\n      currentPlan {\n        id\n        code\n        name\n        maxTenants\n        maxPlatformsPerTenant\n        maxContactsPerTenant\n        maxStaffPerTenant\n        maxCustomCommandsPerTenant\n        priceCents\n        currency\n      }\n      violations {\n        kind\n        tenantId\n        current\n        max\n      }\n    }\n  }\n": typeof types.PreviewPlanChangeDocument,
    "\n  mutation ChangePlan($input: SelectSubscriptionInput!) {\n    selectSubscription(input: $input) {\n      id\n      status\n      plan {\n        id\n        code\n        name\n      }\n    }\n  }\n": typeof types.ChangePlanDocument,
    "\n  mutation CancelSubscription {\n    cancelSubscription\n  }\n": typeof types.CancelSubscriptionDocument,
    "\n  query GetTenantCommandConfigs {\n    tenantCommandConfigs {\n      id\n      commandName\n      active\n      userTypes\n      actionsJson\n      parametersOverrideJson\n      descriptionI18nJson\n    }\n  }\n": typeof types.GetTenantCommandConfigsDocument,
    "\n  mutation UpsertTenantCommandConfigMutation($input: UpsertTenantCommandConfigInput!) {\n    upsertTenantCommandConfig(input: $input) {\n      status\n      message\n    }\n  }\n": typeof types.UpsertTenantCommandConfigMutationDocument,
    "\n  mutation DeleteTenantCommandConfig($input: DeleteTenantCommandConfigInput!) {\n    deleteTenantCommandConfig(input: $input) {\n      status\n      message\n    }\n  }\n": typeof types.DeleteTenantCommandConfigDocument,
    "\n  query TenantPlatformCredentials {\n    tenantPlatformCredentials {\n      platform\n      configJson\n      isDefault\n    }\n  }\n": typeof types.TenantPlatformCredentialsDocument,
    "\n  mutation UpdateMyPlatformCredentials($input: UpdateMyPlatformCredentialsInput!) {\n    updateMyPlatformCredentials(input: $input) {\n      status\n      message\n    }\n  }\n": typeof types.UpdateMyPlatformCredentialsDocument,
    "\n  query TenantFeaturesSettings {\n    tenantFeatures {\n      enableSignal\n      enableWhatsApp\n      enableMessenger\n      enableGate\n      enablePayment\n      enableCommandScheduling\n      enableAnalytics\n      enableAudioRecognition\n    }\n  }\n": typeof types.TenantFeaturesSettingsDocument,
    "\n  mutation UpdateTenantFeaturesActive($input: UpdateTenantFeaturesInput!) {\n    updateTenantFeatures(input: $input) {\n      status\n      message\n    }\n  }\n": typeof types.UpdateTenantFeaturesActiveDocument,
    "\n  query GetTenantPromptOverrides {\n    tenantPromptOverrides {\n      id\n      commandId\n      userType\n      descriptionI18nJson\n      prompt\n    }\n  }\n": typeof types.GetTenantPromptOverridesDocument,
    "\n  query GetTenantCommandConfigsForPrompts {\n    tenantCommandConfigs {\n      id\n      commandName\n    }\n  }\n": typeof types.GetTenantCommandConfigsForPromptsDocument,
    "\n  mutation UpsertTenantPromptOverride($input: UpsertTenantPromptOverrideInput!) {\n    upsertTenantPromptOverride(input: $input) {\n      status\n      message\n    }\n  }\n": typeof types.UpsertTenantPromptOverrideDocument,
    "\n  query TenantSettings($tenantId: String!) {\n    tenantCustomization(tenantId: $tenantId) {\n      branding {\n        logoUrl\n        primaryColor\n        secondaryColor\n        fontSize\n      }\n      features {\n        enableSignal\n        enableWhatsApp\n        enableMessenger\n        enableGate\n        enablePayment\n        enableCommandScheduling\n        enableAnalytics\n        enableAudioRecognition\n      }\n      messaging {\n        defaultSmsProvider\n        priorityChannels\n        rateLimitPerMinute\n      }\n      commands {\n        timeout\n        maxRetries\n        processingDelay\n        customPromptLibraryEnabled\n      }\n      compliance {\n        dataResidency\n        encryptionEnabled\n        webhookUrl\n      }\n    }\n    tenantStaff(tenantId: $tenantId) {\n      tenantId\n      userId\n      role\n    }\n    myTenants {\n      id\n      slug\n      schemaName\n      isActive\n      billingUserId\n    }\n    tenantsIStaffAt {\n      tenantId\n      tenantSlug\n      role\n    }\n  }\n": typeof types.TenantSettingsDocument,
    "\n  mutation UpdateTenantBranding($input: BrandingInput!) {\n    updateTenantBranding(input: $input) {\n      status\n      message\n    }\n  }\n": typeof types.UpdateTenantBrandingDocument,
    "\n  mutation UpdateTenantSettingsFeatures($input: UpdateTenantFeaturesInput!) {\n    updateTenantFeatures(input: $input) {\n      status\n      message\n    }\n  }\n": typeof types.UpdateTenantSettingsFeaturesDocument,
    "\n  mutation UpdateTenantMessaging($input: MessagingInput!) {\n    updateTenantMessaging(input: $input) {\n      status\n      message\n    }\n  }\n": typeof types.UpdateTenantMessagingDocument,
    "\n  mutation UpdateTenantCommands($input: CommandsConfigInput!) {\n    updateTenantCommands(input: $input) {\n      status\n      message\n    }\n  }\n": typeof types.UpdateTenantCommandsDocument,
    "\n  mutation UpdateTenantCompliance($input: ComplianceInput!) {\n    updateTenantCompliance(input: $input) {\n      status\n      message\n    }\n  }\n": typeof types.UpdateTenantComplianceDocument,
    "\n  mutation SetTenantActive($input: SetTenantActiveInput!) {\n    setTenantActive(input: $input) {\n      status\n      message\n    }\n  }\n": typeof types.SetTenantActiveDocument,
    "\n  mutation DeleteTenant($input: DeleteTenantInput!) {\n    deleteTenant(input: $input) {\n      status\n      message\n    }\n  }\n": typeof types.DeleteTenantDocument,
    "\n  mutation AddTenantStaff($input: AddTenantStaffInput!) {\n    addTenantStaff(input: $input) {\n      status\n      message\n    }\n  }\n": typeof types.AddTenantStaffDocument,
    "\n  mutation RemoveTenantStaff($input: RemoveTenantStaffInput!) {\n    removeTenantStaff(input: $input) {\n      status\n      message\n    }\n  }\n": typeof types.RemoveTenantStaffDocument,
    "\n  mutation ChangeTenantStaffRole($input: ChangeTenantStaffRoleInput!) {\n    changeTenantStaffRole(input: $input) {\n      status\n      message\n    }\n  }\n": typeof types.ChangeTenantStaffRoleDocument,
    "\n  query TenantAuditLog($tenantId: String!) {\n    tenantAuditLog(tenantId: $tenantId) {\n      id\n      tenantId\n      userId\n      action\n      payload\n      correlationId\n      createdAt\n    }\n  }\n": typeof types.TenantAuditLogDocument,
    "\n  mutation StartPlatformOnboarding($input: StartPlatformOnboardingInput!) {\n    startPlatformOnboarding(input: $input) {\n      sessionId\n      stepType\n      stepKey\n      dataJson\n      error\n      success\n    }\n  }\n": typeof types.StartPlatformOnboardingDocument,
    "\n  mutation SubmitPlatformOnboarding($input: SubmitPlatformOnboardingInput!) {\n    submitPlatformOnboarding(input: $input) {\n      sessionId\n      stepType\n      stepKey\n      dataJson\n      error\n      success\n    }\n  }\n": typeof types.SubmitPlatformOnboardingDocument,
    "\n  mutation CancelPlatformOnboarding($sessionId: String!) {\n    cancelPlatformOnboarding(sessionId: $sessionId)\n  }\n": typeof types.CancelPlatformOnboardingDocument,
    "\n  query TenantSlugAvailable($slug: String!) {\n    tenantSlugAvailable(slug: $slug)\n  }\n": typeof types.TenantSlugAvailableDocument,
    "\n  mutation CreateTenantWizard($input: CreateTenantInput!) {\n    createTenant(input: $input) {\n      id\n      slug\n      schemaName\n    }\n  }\n": typeof types.CreateTenantWizardDocument,
    "\n  mutation SwitchTenantWizard($tenantId: String!) {\n    switchTenant(tenantId: $tenantId)\n  }\n": typeof types.SwitchTenantWizardDocument,
    "\n  mutation UpdateTenantFeaturesWizard($input: UpdateTenantFeaturesInput!) {\n    updateTenantFeatures(input: $input) {\n      status\n      message\n    }\n  }\n": typeof types.UpdateTenantFeaturesWizardDocument,
    "\n  mutation AddContactWizard($input: AddContactInput!) {\n    addContact(input: $input) {\n      id\n    }\n  }\n": typeof types.AddContactWizardDocument,
    "\n  mutation UpsertPlatformWizard($input: UpsertPlatformCredentialsInput!) {\n    upsertPlatformCredentials(input: $input) {\n      status\n      message\n    }\n  }\n": typeof types.UpsertPlatformWizardDocument,
    "\n  mutation AddCustomCommandWizard($input: AddCustomCommandInput!) {\n    addCustomCommand(input: $input) {\n      status\n      message\n    }\n  }\n": typeof types.AddCustomCommandWizardDocument,
    "\n  query WizardUsage {\n    myUsage {\n      tenants\n    }\n    mySubscription {\n      plan {\n        maxTenants\n        maxPlatformsPerTenant\n        maxCustomCommandsPerTenant\n        maxContactsPerTenant\n      }\n    }\n  }\n": typeof types.WizardUsageDocument,
    "\n  query GetUsers($input: GetAllUsersType) {\n    users(input: $input) {\n      users {\n        id\n        name\n        surname\n        email\n        phone\n        status\n        type\n      }\n      total\n    }\n  }\n": typeof types.GetUsersDocument,
    "\n  mutation CreateSimpleUser($input: CreateSimpleUserType!) {\n    createSimpleUser(input: $input) {\n      id\n      email\n    }\n  }\n": typeof types.CreateSimpleUserDocument,
    "\n  mutation UpdateUser($input: UpdateUserType!) {\n    updateUser(input: $input) {\n      id\n      name\n      surname\n      email\n      phone\n      status\n      type\n    }\n  }\n": typeof types.UpdateUserDocument,
    "\n  mutation UpdateUserStatus($input: UpdateUserStatusType!) {\n    updateUserStatus(input: $input) {\n      id\n      name\n      surname\n      email\n      phone\n      status\n      type\n    }\n  }\n": typeof types.UpdateUserStatusDocument,
    "\n  mutation UpdateUserRole($input: UpdateUserRoleType!) {\n    updateUserRole(input: $input) {\n      id\n      name\n      surname\n      email\n      phone\n      status\n      type\n    }\n  }\n": typeof types.UpdateUserRoleDocument,
    "\n  mutation RemoveUser($input: GetUserType!) {\n    removeUser(input: $input) {\n      success\n    }\n  }\n": typeof types.RemoveUserDocument,
    "\n  query Status {\n    loginStatus {\n      status\n      phoneId\n      user {\n        id\n        email\n        owner\n        is2faEnabled\n        isAdaptiveLoginEnabled\n        admin\n        tenantId\n      }\n    }\n  }\n": typeof types.StatusDocument,
    "\n  mutation Logout {\n    logoutUser {\n      status\n    }\n  }\n": typeof types.LogoutDocument,
    "\n  query CoreConfigs {\n    coreConfigs {\n      data {\n        key\n        value\n        description\n      }\n      status\n      message\n    }\n  }\n": typeof types.CoreConfigsDocument,
    "\n  mutation UpdateConfig($input: UpdateConfigType!) {\n    updateConfig(input: $input) {\n      status\n      message\n      data {\n        key\n        value\n      }\n    }\n  }\n": typeof types.UpdateConfigDocument,
    "\n  query TenantFeatures {\n    tenantFeatures {\n      enableSignal\n      enableWhatsApp\n      enableMessenger\n      enableGate\n      enablePayment\n      enableCommandScheduling\n      enableAnalytics\n    }\n  }\n": typeof types.TenantFeaturesDocument,
};
const documents: Documents = {
    "\n  mutation ConfirmRegistration($token: String!) {\n    confirmRegistration(token: $token) {\n      success\n    }\n  }\n": types.ConfirmRegistrationDocument,
    "\n  query GetHomeData {\n    mySubscription {\n      id\n      status\n      plan {\n        id\n        code\n        name\n        maxTenants\n        maxPlatformsPerTenant\n        maxContactsPerTenant\n        maxStaffPerTenant\n        maxCustomCommandsPerTenant\n        priceCents\n        currency\n      }\n    }\n    subscriptionPlans {\n      id\n      code\n      name\n      maxTenants\n      maxPlatformsPerTenant\n      maxContactsPerTenant\n      maxStaffPerTenant\n      maxCustomCommandsPerTenant\n      priceCents\n      currency\n      isActive\n    }\n    myTenants {\n      id\n      slug\n      billingUserId\n      isActive\n    }\n    tenantsIStaffAt {\n      tenantId\n      tenantSlug\n      role\n    }\n  }\n": types.GetHomeDataDocument,
    "\n  mutation SelectSubscription($input: SelectSubscriptionInput!) {\n    selectSubscription(input: $input) {\n      id\n      status\n      plan {\n        id\n        code\n        name\n      }\n    }\n  }\n": types.SelectSubscriptionDocument,
    "\n  mutation SwitchActiveTenant($tenantId: String!) {\n    switchTenant(tenantId: $tenantId)\n  }\n": types.SwitchActiveTenantDocument,
    "\n  mutation Login($input: LoginType!) {\n    loginUser(input: $input) {\n      status\n    }\n  }\n": types.LoginDocument,
    "\n  mutation QrChallenge($nonce: String!) {\n    qrChallenge(nonce: $nonce) {\n      challenge\n      dataUrl\n    }\n  }\n": types.QrChallengeDocument,
    "\n  mutation QrLogin($challenge: String!, $nonce: String!) {\n    qrLogin(challenge: $challenge, nonce: $nonce) {\n      status\n    }\n  }\n": types.QrLoginDocument,
    "\n  mutation VerifyMfa($input: VerifyCodeType!) {\n    verifyMfa(input: $input) {\n      status\n    }\n  }\n": types.VerifyMfaDocument,
    "\n  mutation Verify2faCode($input: Verify2faCodeType!) {\n    verify2faCode(input: $input) {\n      status\n    }\n  }\n": types.Verify2faCodeDocument,
    "\n  mutation GetPasskeyOptions {\n    optionPasskey\n  }\n": types.GetPasskeyOptionsDocument,
    "\n  mutation VerifyPasskey($input: JSON!) {\n    optionPasskeyVerify(data: $input) {\n      status\n    }\n  }\n": types.VerifyPasskeyDocument,
    "\n  mutation QrReject($challenge: String!) {\n    qrReject(challenge: $challenge) {\n      status\n    }\n  }\n": types.QrRejectDocument,
    "\n  mutation QrOption($challenge: String!, $nonce: String!) {\n    qrOption(challenge: $challenge, nonce: $nonce)\n  }\n": types.QrOptionDocument,
    "\n  mutation QrVerify($challenge: String!, $data: JSON!) {\n    qrConfirm(challenge: $challenge, data: $data) {\n      status\n    }\n  }\n": types.QrVerifyDocument,
    "\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      success\n    }\n  }\n": types.RegisterDocument,
    "\n  query GetPasskeys {\n    getPasskeys {\n      id\n      createAt\n      deviceName\n      credentialID\n    }\n  }\n": types.GetPasskeysDocument,
    "\n  mutation RemovePasskey($id: String!) {\n    removePasskey(id: $id) {\n      status\n    }\n  }\n": types.RemovePasskeyDocument,
    "\n  mutation AcceptTfa {\n    accept2fa {\n      status\n      dataUrl\n    }\n  }\n": types.AcceptTfaDocument,
    "\n  mutation RejectTfa {\n    reject2fa {\n      status\n    }\n  }\n": types.RejectTfaDocument,
    "\n  mutation Verify2fa($code: String!) {\n    verify2fa(code: $code) {\n      status\n    }\n  }\n": types.Verify2faDocument,
    "\n  mutation AcceptAdaptiveLogin {\n    adaptiveLogin {\n      active\n    }\n  }\n": types.AcceptAdaptiveLoginDocument,
    "\n  mutation RegisterOptionPasskey {\n    registerOptionPasskey\n  }\n": types.RegisterOptionPasskeyDocument,
    "\n  mutation VerifyRegistration($input: JSON!) {\n    registerOptionPasskeyVerify(data: $input) {\n      status\n    }\n  }\n": types.VerifyRegistrationDocument,
    "\n  query GetBillingData {\n    mySubscription {\n      id\n      status\n      startedAt\n      plan {\n        id\n        code\n        name\n        maxTenants\n        maxPlatformsPerTenant\n        maxContactsPerTenant\n        maxStaffPerTenant\n        maxCustomCommandsPerTenant\n        priceCents\n        currency\n      }\n    }\n    subscriptionPlans {\n      id\n      code\n      name\n      maxTenants\n      maxPlatformsPerTenant\n      maxContactsPerTenant\n      maxStaffPerTenant\n      maxCustomCommandsPerTenant\n      priceCents\n      currency\n      isActive\n    }\n    myUsage {\n      billingUserId\n      tenants\n      perTenant {\n        tenantId\n        staff\n        platforms\n        contacts\n        customCommands\n      }\n    }\n    subscriptionHistory {\n      id\n      oldPlanId\n      newPlanId\n      kind\n      initiatedAt\n    }\n  }\n": types.GetBillingDataDocument,
    "\n  query PreviewPlanChange($newPlanId: String!) {\n    previewPlanChange(newPlanId: $newPlanId) {\n      kind\n      deltaPriceCents\n      newPlan {\n        id\n        code\n        name\n        maxTenants\n        maxPlatformsPerTenant\n        maxContactsPerTenant\n        maxStaffPerTenant\n        maxCustomCommandsPerTenant\n        priceCents\n        currency\n      }\n      currentPlan {\n        id\n        code\n        name\n        maxTenants\n        maxPlatformsPerTenant\n        maxContactsPerTenant\n        maxStaffPerTenant\n        maxCustomCommandsPerTenant\n        priceCents\n        currency\n      }\n      violations {\n        kind\n        tenantId\n        current\n        max\n      }\n    }\n  }\n": types.PreviewPlanChangeDocument,
    "\n  mutation ChangePlan($input: SelectSubscriptionInput!) {\n    selectSubscription(input: $input) {\n      id\n      status\n      plan {\n        id\n        code\n        name\n      }\n    }\n  }\n": types.ChangePlanDocument,
    "\n  mutation CancelSubscription {\n    cancelSubscription\n  }\n": types.CancelSubscriptionDocument,
    "\n  query GetTenantCommandConfigs {\n    tenantCommandConfigs {\n      id\n      commandName\n      active\n      userTypes\n      actionsJson\n      parametersOverrideJson\n      descriptionI18nJson\n    }\n  }\n": types.GetTenantCommandConfigsDocument,
    "\n  mutation UpsertTenantCommandConfigMutation($input: UpsertTenantCommandConfigInput!) {\n    upsertTenantCommandConfig(input: $input) {\n      status\n      message\n    }\n  }\n": types.UpsertTenantCommandConfigMutationDocument,
    "\n  mutation DeleteTenantCommandConfig($input: DeleteTenantCommandConfigInput!) {\n    deleteTenantCommandConfig(input: $input) {\n      status\n      message\n    }\n  }\n": types.DeleteTenantCommandConfigDocument,
    "\n  query TenantPlatformCredentials {\n    tenantPlatformCredentials {\n      platform\n      configJson\n      isDefault\n    }\n  }\n": types.TenantPlatformCredentialsDocument,
    "\n  mutation UpdateMyPlatformCredentials($input: UpdateMyPlatformCredentialsInput!) {\n    updateMyPlatformCredentials(input: $input) {\n      status\n      message\n    }\n  }\n": types.UpdateMyPlatformCredentialsDocument,
    "\n  query TenantFeaturesSettings {\n    tenantFeatures {\n      enableSignal\n      enableWhatsApp\n      enableMessenger\n      enableGate\n      enablePayment\n      enableCommandScheduling\n      enableAnalytics\n      enableAudioRecognition\n    }\n  }\n": types.TenantFeaturesSettingsDocument,
    "\n  mutation UpdateTenantFeaturesActive($input: UpdateTenantFeaturesInput!) {\n    updateTenantFeatures(input: $input) {\n      status\n      message\n    }\n  }\n": types.UpdateTenantFeaturesActiveDocument,
    "\n  query GetTenantPromptOverrides {\n    tenantPromptOverrides {\n      id\n      commandId\n      userType\n      descriptionI18nJson\n      prompt\n    }\n  }\n": types.GetTenantPromptOverridesDocument,
    "\n  query GetTenantCommandConfigsForPrompts {\n    tenantCommandConfigs {\n      id\n      commandName\n    }\n  }\n": types.GetTenantCommandConfigsForPromptsDocument,
    "\n  mutation UpsertTenantPromptOverride($input: UpsertTenantPromptOverrideInput!) {\n    upsertTenantPromptOverride(input: $input) {\n      status\n      message\n    }\n  }\n": types.UpsertTenantPromptOverrideDocument,
    "\n  query TenantSettings($tenantId: String!) {\n    tenantCustomization(tenantId: $tenantId) {\n      branding {\n        logoUrl\n        primaryColor\n        secondaryColor\n        fontSize\n      }\n      features {\n        enableSignal\n        enableWhatsApp\n        enableMessenger\n        enableGate\n        enablePayment\n        enableCommandScheduling\n        enableAnalytics\n        enableAudioRecognition\n      }\n      messaging {\n        defaultSmsProvider\n        priorityChannels\n        rateLimitPerMinute\n      }\n      commands {\n        timeout\n        maxRetries\n        processingDelay\n        customPromptLibraryEnabled\n      }\n      compliance {\n        dataResidency\n        encryptionEnabled\n        webhookUrl\n      }\n    }\n    tenantStaff(tenantId: $tenantId) {\n      tenantId\n      userId\n      role\n    }\n    myTenants {\n      id\n      slug\n      schemaName\n      isActive\n      billingUserId\n    }\n    tenantsIStaffAt {\n      tenantId\n      tenantSlug\n      role\n    }\n  }\n": types.TenantSettingsDocument,
    "\n  mutation UpdateTenantBranding($input: BrandingInput!) {\n    updateTenantBranding(input: $input) {\n      status\n      message\n    }\n  }\n": types.UpdateTenantBrandingDocument,
    "\n  mutation UpdateTenantSettingsFeatures($input: UpdateTenantFeaturesInput!) {\n    updateTenantFeatures(input: $input) {\n      status\n      message\n    }\n  }\n": types.UpdateTenantSettingsFeaturesDocument,
    "\n  mutation UpdateTenantMessaging($input: MessagingInput!) {\n    updateTenantMessaging(input: $input) {\n      status\n      message\n    }\n  }\n": types.UpdateTenantMessagingDocument,
    "\n  mutation UpdateTenantCommands($input: CommandsConfigInput!) {\n    updateTenantCommands(input: $input) {\n      status\n      message\n    }\n  }\n": types.UpdateTenantCommandsDocument,
    "\n  mutation UpdateTenantCompliance($input: ComplianceInput!) {\n    updateTenantCompliance(input: $input) {\n      status\n      message\n    }\n  }\n": types.UpdateTenantComplianceDocument,
    "\n  mutation SetTenantActive($input: SetTenantActiveInput!) {\n    setTenantActive(input: $input) {\n      status\n      message\n    }\n  }\n": types.SetTenantActiveDocument,
    "\n  mutation DeleteTenant($input: DeleteTenantInput!) {\n    deleteTenant(input: $input) {\n      status\n      message\n    }\n  }\n": types.DeleteTenantDocument,
    "\n  mutation AddTenantStaff($input: AddTenantStaffInput!) {\n    addTenantStaff(input: $input) {\n      status\n      message\n    }\n  }\n": types.AddTenantStaffDocument,
    "\n  mutation RemoveTenantStaff($input: RemoveTenantStaffInput!) {\n    removeTenantStaff(input: $input) {\n      status\n      message\n    }\n  }\n": types.RemoveTenantStaffDocument,
    "\n  mutation ChangeTenantStaffRole($input: ChangeTenantStaffRoleInput!) {\n    changeTenantStaffRole(input: $input) {\n      status\n      message\n    }\n  }\n": types.ChangeTenantStaffRoleDocument,
    "\n  query TenantAuditLog($tenantId: String!) {\n    tenantAuditLog(tenantId: $tenantId) {\n      id\n      tenantId\n      userId\n      action\n      payload\n      correlationId\n      createdAt\n    }\n  }\n": types.TenantAuditLogDocument,
    "\n  mutation StartPlatformOnboarding($input: StartPlatformOnboardingInput!) {\n    startPlatformOnboarding(input: $input) {\n      sessionId\n      stepType\n      stepKey\n      dataJson\n      error\n      success\n    }\n  }\n": types.StartPlatformOnboardingDocument,
    "\n  mutation SubmitPlatformOnboarding($input: SubmitPlatformOnboardingInput!) {\n    submitPlatformOnboarding(input: $input) {\n      sessionId\n      stepType\n      stepKey\n      dataJson\n      error\n      success\n    }\n  }\n": types.SubmitPlatformOnboardingDocument,
    "\n  mutation CancelPlatformOnboarding($sessionId: String!) {\n    cancelPlatformOnboarding(sessionId: $sessionId)\n  }\n": types.CancelPlatformOnboardingDocument,
    "\n  query TenantSlugAvailable($slug: String!) {\n    tenantSlugAvailable(slug: $slug)\n  }\n": types.TenantSlugAvailableDocument,
    "\n  mutation CreateTenantWizard($input: CreateTenantInput!) {\n    createTenant(input: $input) {\n      id\n      slug\n      schemaName\n    }\n  }\n": types.CreateTenantWizardDocument,
    "\n  mutation SwitchTenantWizard($tenantId: String!) {\n    switchTenant(tenantId: $tenantId)\n  }\n": types.SwitchTenantWizardDocument,
    "\n  mutation UpdateTenantFeaturesWizard($input: UpdateTenantFeaturesInput!) {\n    updateTenantFeatures(input: $input) {\n      status\n      message\n    }\n  }\n": types.UpdateTenantFeaturesWizardDocument,
    "\n  mutation AddContactWizard($input: AddContactInput!) {\n    addContact(input: $input) {\n      id\n    }\n  }\n": types.AddContactWizardDocument,
    "\n  mutation UpsertPlatformWizard($input: UpsertPlatformCredentialsInput!) {\n    upsertPlatformCredentials(input: $input) {\n      status\n      message\n    }\n  }\n": types.UpsertPlatformWizardDocument,
    "\n  mutation AddCustomCommandWizard($input: AddCustomCommandInput!) {\n    addCustomCommand(input: $input) {\n      status\n      message\n    }\n  }\n": types.AddCustomCommandWizardDocument,
    "\n  query WizardUsage {\n    myUsage {\n      tenants\n    }\n    mySubscription {\n      plan {\n        maxTenants\n        maxPlatformsPerTenant\n        maxCustomCommandsPerTenant\n        maxContactsPerTenant\n      }\n    }\n  }\n": types.WizardUsageDocument,
    "\n  query GetUsers($input: GetAllUsersType) {\n    users(input: $input) {\n      users {\n        id\n        name\n        surname\n        email\n        phone\n        status\n        type\n      }\n      total\n    }\n  }\n": types.GetUsersDocument,
    "\n  mutation CreateSimpleUser($input: CreateSimpleUserType!) {\n    createSimpleUser(input: $input) {\n      id\n      email\n    }\n  }\n": types.CreateSimpleUserDocument,
    "\n  mutation UpdateUser($input: UpdateUserType!) {\n    updateUser(input: $input) {\n      id\n      name\n      surname\n      email\n      phone\n      status\n      type\n    }\n  }\n": types.UpdateUserDocument,
    "\n  mutation UpdateUserStatus($input: UpdateUserStatusType!) {\n    updateUserStatus(input: $input) {\n      id\n      name\n      surname\n      email\n      phone\n      status\n      type\n    }\n  }\n": types.UpdateUserStatusDocument,
    "\n  mutation UpdateUserRole($input: UpdateUserRoleType!) {\n    updateUserRole(input: $input) {\n      id\n      name\n      surname\n      email\n      phone\n      status\n      type\n    }\n  }\n": types.UpdateUserRoleDocument,
    "\n  mutation RemoveUser($input: GetUserType!) {\n    removeUser(input: $input) {\n      success\n    }\n  }\n": types.RemoveUserDocument,
    "\n  query Status {\n    loginStatus {\n      status\n      phoneId\n      user {\n        id\n        email\n        owner\n        is2faEnabled\n        isAdaptiveLoginEnabled\n        admin\n        tenantId\n      }\n    }\n  }\n": types.StatusDocument,
    "\n  mutation Logout {\n    logoutUser {\n      status\n    }\n  }\n": types.LogoutDocument,
    "\n  query CoreConfigs {\n    coreConfigs {\n      data {\n        key\n        value\n        description\n      }\n      status\n      message\n    }\n  }\n": types.CoreConfigsDocument,
    "\n  mutation UpdateConfig($input: UpdateConfigType!) {\n    updateConfig(input: $input) {\n      status\n      message\n      data {\n        key\n        value\n      }\n    }\n  }\n": types.UpdateConfigDocument,
    "\n  query TenantFeatures {\n    tenantFeatures {\n      enableSignal\n      enableWhatsApp\n      enableMessenger\n      enableGate\n      enablePayment\n      enableCommandScheduling\n      enableAnalytics\n    }\n  }\n": types.TenantFeaturesDocument,
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
export function graphql(source: "\n  mutation ConfirmRegistration($token: String!) {\n    confirmRegistration(token: $token) {\n      success\n    }\n  }\n"): (typeof documents)["\n  mutation ConfirmRegistration($token: String!) {\n    confirmRegistration(token: $token) {\n      success\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetHomeData {\n    mySubscription {\n      id\n      status\n      plan {\n        id\n        code\n        name\n        maxTenants\n        maxPlatformsPerTenant\n        maxContactsPerTenant\n        maxStaffPerTenant\n        maxCustomCommandsPerTenant\n        priceCents\n        currency\n      }\n    }\n    subscriptionPlans {\n      id\n      code\n      name\n      maxTenants\n      maxPlatformsPerTenant\n      maxContactsPerTenant\n      maxStaffPerTenant\n      maxCustomCommandsPerTenant\n      priceCents\n      currency\n      isActive\n    }\n    myTenants {\n      id\n      slug\n      billingUserId\n      isActive\n    }\n    tenantsIStaffAt {\n      tenantId\n      tenantSlug\n      role\n    }\n  }\n"): (typeof documents)["\n  query GetHomeData {\n    mySubscription {\n      id\n      status\n      plan {\n        id\n        code\n        name\n        maxTenants\n        maxPlatformsPerTenant\n        maxContactsPerTenant\n        maxStaffPerTenant\n        maxCustomCommandsPerTenant\n        priceCents\n        currency\n      }\n    }\n    subscriptionPlans {\n      id\n      code\n      name\n      maxTenants\n      maxPlatformsPerTenant\n      maxContactsPerTenant\n      maxStaffPerTenant\n      maxCustomCommandsPerTenant\n      priceCents\n      currency\n      isActive\n    }\n    myTenants {\n      id\n      slug\n      billingUserId\n      isActive\n    }\n    tenantsIStaffAt {\n      tenantId\n      tenantSlug\n      role\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SelectSubscription($input: SelectSubscriptionInput!) {\n    selectSubscription(input: $input) {\n      id\n      status\n      plan {\n        id\n        code\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation SelectSubscription($input: SelectSubscriptionInput!) {\n    selectSubscription(input: $input) {\n      id\n      status\n      plan {\n        id\n        code\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SwitchActiveTenant($tenantId: String!) {\n    switchTenant(tenantId: $tenantId)\n  }\n"): (typeof documents)["\n  mutation SwitchActiveTenant($tenantId: String!) {\n    switchTenant(tenantId: $tenantId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Login($input: LoginType!) {\n    loginUser(input: $input) {\n      status\n    }\n  }\n"): (typeof documents)["\n  mutation Login($input: LoginType!) {\n    loginUser(input: $input) {\n      status\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation QrChallenge($nonce: String!) {\n    qrChallenge(nonce: $nonce) {\n      challenge\n      dataUrl\n    }\n  }\n"): (typeof documents)["\n  mutation QrChallenge($nonce: String!) {\n    qrChallenge(nonce: $nonce) {\n      challenge\n      dataUrl\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation QrLogin($challenge: String!, $nonce: String!) {\n    qrLogin(challenge: $challenge, nonce: $nonce) {\n      status\n    }\n  }\n"): (typeof documents)["\n  mutation QrLogin($challenge: String!, $nonce: String!) {\n    qrLogin(challenge: $challenge, nonce: $nonce) {\n      status\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation VerifyMfa($input: VerifyCodeType!) {\n    verifyMfa(input: $input) {\n      status\n    }\n  }\n"): (typeof documents)["\n  mutation VerifyMfa($input: VerifyCodeType!) {\n    verifyMfa(input: $input) {\n      status\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Verify2faCode($input: Verify2faCodeType!) {\n    verify2faCode(input: $input) {\n      status\n    }\n  }\n"): (typeof documents)["\n  mutation Verify2faCode($input: Verify2faCodeType!) {\n    verify2faCode(input: $input) {\n      status\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation GetPasskeyOptions {\n    optionPasskey\n  }\n"): (typeof documents)["\n  mutation GetPasskeyOptions {\n    optionPasskey\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation VerifyPasskey($input: JSON!) {\n    optionPasskeyVerify(data: $input) {\n      status\n    }\n  }\n"): (typeof documents)["\n  mutation VerifyPasskey($input: JSON!) {\n    optionPasskeyVerify(data: $input) {\n      status\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation QrReject($challenge: String!) {\n    qrReject(challenge: $challenge) {\n      status\n    }\n  }\n"): (typeof documents)["\n  mutation QrReject($challenge: String!) {\n    qrReject(challenge: $challenge) {\n      status\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation QrOption($challenge: String!, $nonce: String!) {\n    qrOption(challenge: $challenge, nonce: $nonce)\n  }\n"): (typeof documents)["\n  mutation QrOption($challenge: String!, $nonce: String!) {\n    qrOption(challenge: $challenge, nonce: $nonce)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation QrVerify($challenge: String!, $data: JSON!) {\n    qrConfirm(challenge: $challenge, data: $data) {\n      status\n    }\n  }\n"): (typeof documents)["\n  mutation QrVerify($challenge: String!, $data: JSON!) {\n    qrConfirm(challenge: $challenge, data: $data) {\n      status\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      success\n    }\n  }\n"): (typeof documents)["\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      success\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetPasskeys {\n    getPasskeys {\n      id\n      createAt\n      deviceName\n      credentialID\n    }\n  }\n"): (typeof documents)["\n  query GetPasskeys {\n    getPasskeys {\n      id\n      createAt\n      deviceName\n      credentialID\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemovePasskey($id: String!) {\n    removePasskey(id: $id) {\n      status\n    }\n  }\n"): (typeof documents)["\n  mutation RemovePasskey($id: String!) {\n    removePasskey(id: $id) {\n      status\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AcceptTfa {\n    accept2fa {\n      status\n      dataUrl\n    }\n  }\n"): (typeof documents)["\n  mutation AcceptTfa {\n    accept2fa {\n      status\n      dataUrl\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RejectTfa {\n    reject2fa {\n      status\n    }\n  }\n"): (typeof documents)["\n  mutation RejectTfa {\n    reject2fa {\n      status\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Verify2fa($code: String!) {\n    verify2fa(code: $code) {\n      status\n    }\n  }\n"): (typeof documents)["\n  mutation Verify2fa($code: String!) {\n    verify2fa(code: $code) {\n      status\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AcceptAdaptiveLogin {\n    adaptiveLogin {\n      active\n    }\n  }\n"): (typeof documents)["\n  mutation AcceptAdaptiveLogin {\n    adaptiveLogin {\n      active\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RegisterOptionPasskey {\n    registerOptionPasskey\n  }\n"): (typeof documents)["\n  mutation RegisterOptionPasskey {\n    registerOptionPasskey\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation VerifyRegistration($input: JSON!) {\n    registerOptionPasskeyVerify(data: $input) {\n      status\n    }\n  }\n"): (typeof documents)["\n  mutation VerifyRegistration($input: JSON!) {\n    registerOptionPasskeyVerify(data: $input) {\n      status\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetBillingData {\n    mySubscription {\n      id\n      status\n      startedAt\n      plan {\n        id\n        code\n        name\n        maxTenants\n        maxPlatformsPerTenant\n        maxContactsPerTenant\n        maxStaffPerTenant\n        maxCustomCommandsPerTenant\n        priceCents\n        currency\n      }\n    }\n    subscriptionPlans {\n      id\n      code\n      name\n      maxTenants\n      maxPlatformsPerTenant\n      maxContactsPerTenant\n      maxStaffPerTenant\n      maxCustomCommandsPerTenant\n      priceCents\n      currency\n      isActive\n    }\n    myUsage {\n      billingUserId\n      tenants\n      perTenant {\n        tenantId\n        staff\n        platforms\n        contacts\n        customCommands\n      }\n    }\n    subscriptionHistory {\n      id\n      oldPlanId\n      newPlanId\n      kind\n      initiatedAt\n    }\n  }\n"): (typeof documents)["\n  query GetBillingData {\n    mySubscription {\n      id\n      status\n      startedAt\n      plan {\n        id\n        code\n        name\n        maxTenants\n        maxPlatformsPerTenant\n        maxContactsPerTenant\n        maxStaffPerTenant\n        maxCustomCommandsPerTenant\n        priceCents\n        currency\n      }\n    }\n    subscriptionPlans {\n      id\n      code\n      name\n      maxTenants\n      maxPlatformsPerTenant\n      maxContactsPerTenant\n      maxStaffPerTenant\n      maxCustomCommandsPerTenant\n      priceCents\n      currency\n      isActive\n    }\n    myUsage {\n      billingUserId\n      tenants\n      perTenant {\n        tenantId\n        staff\n        platforms\n        contacts\n        customCommands\n      }\n    }\n    subscriptionHistory {\n      id\n      oldPlanId\n      newPlanId\n      kind\n      initiatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PreviewPlanChange($newPlanId: String!) {\n    previewPlanChange(newPlanId: $newPlanId) {\n      kind\n      deltaPriceCents\n      newPlan {\n        id\n        code\n        name\n        maxTenants\n        maxPlatformsPerTenant\n        maxContactsPerTenant\n        maxStaffPerTenant\n        maxCustomCommandsPerTenant\n        priceCents\n        currency\n      }\n      currentPlan {\n        id\n        code\n        name\n        maxTenants\n        maxPlatformsPerTenant\n        maxContactsPerTenant\n        maxStaffPerTenant\n        maxCustomCommandsPerTenant\n        priceCents\n        currency\n      }\n      violations {\n        kind\n        tenantId\n        current\n        max\n      }\n    }\n  }\n"): (typeof documents)["\n  query PreviewPlanChange($newPlanId: String!) {\n    previewPlanChange(newPlanId: $newPlanId) {\n      kind\n      deltaPriceCents\n      newPlan {\n        id\n        code\n        name\n        maxTenants\n        maxPlatformsPerTenant\n        maxContactsPerTenant\n        maxStaffPerTenant\n        maxCustomCommandsPerTenant\n        priceCents\n        currency\n      }\n      currentPlan {\n        id\n        code\n        name\n        maxTenants\n        maxPlatformsPerTenant\n        maxContactsPerTenant\n        maxStaffPerTenant\n        maxCustomCommandsPerTenant\n        priceCents\n        currency\n      }\n      violations {\n        kind\n        tenantId\n        current\n        max\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ChangePlan($input: SelectSubscriptionInput!) {\n    selectSubscription(input: $input) {\n      id\n      status\n      plan {\n        id\n        code\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation ChangePlan($input: SelectSubscriptionInput!) {\n    selectSubscription(input: $input) {\n      id\n      status\n      plan {\n        id\n        code\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CancelSubscription {\n    cancelSubscription\n  }\n"): (typeof documents)["\n  mutation CancelSubscription {\n    cancelSubscription\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetTenantCommandConfigs {\n    tenantCommandConfigs {\n      id\n      commandName\n      active\n      userTypes\n      actionsJson\n      parametersOverrideJson\n      descriptionI18nJson\n    }\n  }\n"): (typeof documents)["\n  query GetTenantCommandConfigs {\n    tenantCommandConfigs {\n      id\n      commandName\n      active\n      userTypes\n      actionsJson\n      parametersOverrideJson\n      descriptionI18nJson\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpsertTenantCommandConfigMutation($input: UpsertTenantCommandConfigInput!) {\n    upsertTenantCommandConfig(input: $input) {\n      status\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation UpsertTenantCommandConfigMutation($input: UpsertTenantCommandConfigInput!) {\n    upsertTenantCommandConfig(input: $input) {\n      status\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteTenantCommandConfig($input: DeleteTenantCommandConfigInput!) {\n    deleteTenantCommandConfig(input: $input) {\n      status\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation DeleteTenantCommandConfig($input: DeleteTenantCommandConfigInput!) {\n    deleteTenantCommandConfig(input: $input) {\n      status\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query TenantPlatformCredentials {\n    tenantPlatformCredentials {\n      platform\n      configJson\n      isDefault\n    }\n  }\n"): (typeof documents)["\n  query TenantPlatformCredentials {\n    tenantPlatformCredentials {\n      platform\n      configJson\n      isDefault\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateMyPlatformCredentials($input: UpdateMyPlatformCredentialsInput!) {\n    updateMyPlatformCredentials(input: $input) {\n      status\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateMyPlatformCredentials($input: UpdateMyPlatformCredentialsInput!) {\n    updateMyPlatformCredentials(input: $input) {\n      status\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query TenantFeaturesSettings {\n    tenantFeatures {\n      enableSignal\n      enableWhatsApp\n      enableMessenger\n      enableGate\n      enablePayment\n      enableCommandScheduling\n      enableAnalytics\n      enableAudioRecognition\n    }\n  }\n"): (typeof documents)["\n  query TenantFeaturesSettings {\n    tenantFeatures {\n      enableSignal\n      enableWhatsApp\n      enableMessenger\n      enableGate\n      enablePayment\n      enableCommandScheduling\n      enableAnalytics\n      enableAudioRecognition\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateTenantFeaturesActive($input: UpdateTenantFeaturesInput!) {\n    updateTenantFeatures(input: $input) {\n      status\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateTenantFeaturesActive($input: UpdateTenantFeaturesInput!) {\n    updateTenantFeatures(input: $input) {\n      status\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetTenantPromptOverrides {\n    tenantPromptOverrides {\n      id\n      commandId\n      userType\n      descriptionI18nJson\n      prompt\n    }\n  }\n"): (typeof documents)["\n  query GetTenantPromptOverrides {\n    tenantPromptOverrides {\n      id\n      commandId\n      userType\n      descriptionI18nJson\n      prompt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetTenantCommandConfigsForPrompts {\n    tenantCommandConfigs {\n      id\n      commandName\n    }\n  }\n"): (typeof documents)["\n  query GetTenantCommandConfigsForPrompts {\n    tenantCommandConfigs {\n      id\n      commandName\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpsertTenantPromptOverride($input: UpsertTenantPromptOverrideInput!) {\n    upsertTenantPromptOverride(input: $input) {\n      status\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation UpsertTenantPromptOverride($input: UpsertTenantPromptOverrideInput!) {\n    upsertTenantPromptOverride(input: $input) {\n      status\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query TenantSettings($tenantId: String!) {\n    tenantCustomization(tenantId: $tenantId) {\n      branding {\n        logoUrl\n        primaryColor\n        secondaryColor\n        fontSize\n      }\n      features {\n        enableSignal\n        enableWhatsApp\n        enableMessenger\n        enableGate\n        enablePayment\n        enableCommandScheduling\n        enableAnalytics\n        enableAudioRecognition\n      }\n      messaging {\n        defaultSmsProvider\n        priorityChannels\n        rateLimitPerMinute\n      }\n      commands {\n        timeout\n        maxRetries\n        processingDelay\n        customPromptLibraryEnabled\n      }\n      compliance {\n        dataResidency\n        encryptionEnabled\n        webhookUrl\n      }\n    }\n    tenantStaff(tenantId: $tenantId) {\n      tenantId\n      userId\n      role\n    }\n    myTenants {\n      id\n      slug\n      schemaName\n      isActive\n      billingUserId\n    }\n    tenantsIStaffAt {\n      tenantId\n      tenantSlug\n      role\n    }\n  }\n"): (typeof documents)["\n  query TenantSettings($tenantId: String!) {\n    tenantCustomization(tenantId: $tenantId) {\n      branding {\n        logoUrl\n        primaryColor\n        secondaryColor\n        fontSize\n      }\n      features {\n        enableSignal\n        enableWhatsApp\n        enableMessenger\n        enableGate\n        enablePayment\n        enableCommandScheduling\n        enableAnalytics\n        enableAudioRecognition\n      }\n      messaging {\n        defaultSmsProvider\n        priorityChannels\n        rateLimitPerMinute\n      }\n      commands {\n        timeout\n        maxRetries\n        processingDelay\n        customPromptLibraryEnabled\n      }\n      compliance {\n        dataResidency\n        encryptionEnabled\n        webhookUrl\n      }\n    }\n    tenantStaff(tenantId: $tenantId) {\n      tenantId\n      userId\n      role\n    }\n    myTenants {\n      id\n      slug\n      schemaName\n      isActive\n      billingUserId\n    }\n    tenantsIStaffAt {\n      tenantId\n      tenantSlug\n      role\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateTenantBranding($input: BrandingInput!) {\n    updateTenantBranding(input: $input) {\n      status\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateTenantBranding($input: BrandingInput!) {\n    updateTenantBranding(input: $input) {\n      status\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateTenantSettingsFeatures($input: UpdateTenantFeaturesInput!) {\n    updateTenantFeatures(input: $input) {\n      status\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateTenantSettingsFeatures($input: UpdateTenantFeaturesInput!) {\n    updateTenantFeatures(input: $input) {\n      status\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateTenantMessaging($input: MessagingInput!) {\n    updateTenantMessaging(input: $input) {\n      status\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateTenantMessaging($input: MessagingInput!) {\n    updateTenantMessaging(input: $input) {\n      status\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateTenantCommands($input: CommandsConfigInput!) {\n    updateTenantCommands(input: $input) {\n      status\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateTenantCommands($input: CommandsConfigInput!) {\n    updateTenantCommands(input: $input) {\n      status\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateTenantCompliance($input: ComplianceInput!) {\n    updateTenantCompliance(input: $input) {\n      status\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateTenantCompliance($input: ComplianceInput!) {\n    updateTenantCompliance(input: $input) {\n      status\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetTenantActive($input: SetTenantActiveInput!) {\n    setTenantActive(input: $input) {\n      status\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation SetTenantActive($input: SetTenantActiveInput!) {\n    setTenantActive(input: $input) {\n      status\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteTenant($input: DeleteTenantInput!) {\n    deleteTenant(input: $input) {\n      status\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation DeleteTenant($input: DeleteTenantInput!) {\n    deleteTenant(input: $input) {\n      status\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddTenantStaff($input: AddTenantStaffInput!) {\n    addTenantStaff(input: $input) {\n      status\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation AddTenantStaff($input: AddTenantStaffInput!) {\n    addTenantStaff(input: $input) {\n      status\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemoveTenantStaff($input: RemoveTenantStaffInput!) {\n    removeTenantStaff(input: $input) {\n      status\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation RemoveTenantStaff($input: RemoveTenantStaffInput!) {\n    removeTenantStaff(input: $input) {\n      status\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ChangeTenantStaffRole($input: ChangeTenantStaffRoleInput!) {\n    changeTenantStaffRole(input: $input) {\n      status\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation ChangeTenantStaffRole($input: ChangeTenantStaffRoleInput!) {\n    changeTenantStaffRole(input: $input) {\n      status\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query TenantAuditLog($tenantId: String!) {\n    tenantAuditLog(tenantId: $tenantId) {\n      id\n      tenantId\n      userId\n      action\n      payload\n      correlationId\n      createdAt\n    }\n  }\n"): (typeof documents)["\n  query TenantAuditLog($tenantId: String!) {\n    tenantAuditLog(tenantId: $tenantId) {\n      id\n      tenantId\n      userId\n      action\n      payload\n      correlationId\n      createdAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation StartPlatformOnboarding($input: StartPlatformOnboardingInput!) {\n    startPlatformOnboarding(input: $input) {\n      sessionId\n      stepType\n      stepKey\n      dataJson\n      error\n      success\n    }\n  }\n"): (typeof documents)["\n  mutation StartPlatformOnboarding($input: StartPlatformOnboardingInput!) {\n    startPlatformOnboarding(input: $input) {\n      sessionId\n      stepType\n      stepKey\n      dataJson\n      error\n      success\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SubmitPlatformOnboarding($input: SubmitPlatformOnboardingInput!) {\n    submitPlatformOnboarding(input: $input) {\n      sessionId\n      stepType\n      stepKey\n      dataJson\n      error\n      success\n    }\n  }\n"): (typeof documents)["\n  mutation SubmitPlatformOnboarding($input: SubmitPlatformOnboardingInput!) {\n    submitPlatformOnboarding(input: $input) {\n      sessionId\n      stepType\n      stepKey\n      dataJson\n      error\n      success\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CancelPlatformOnboarding($sessionId: String!) {\n    cancelPlatformOnboarding(sessionId: $sessionId)\n  }\n"): (typeof documents)["\n  mutation CancelPlatformOnboarding($sessionId: String!) {\n    cancelPlatformOnboarding(sessionId: $sessionId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query TenantSlugAvailable($slug: String!) {\n    tenantSlugAvailable(slug: $slug)\n  }\n"): (typeof documents)["\n  query TenantSlugAvailable($slug: String!) {\n    tenantSlugAvailable(slug: $slug)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateTenantWizard($input: CreateTenantInput!) {\n    createTenant(input: $input) {\n      id\n      slug\n      schemaName\n    }\n  }\n"): (typeof documents)["\n  mutation CreateTenantWizard($input: CreateTenantInput!) {\n    createTenant(input: $input) {\n      id\n      slug\n      schemaName\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SwitchTenantWizard($tenantId: String!) {\n    switchTenant(tenantId: $tenantId)\n  }\n"): (typeof documents)["\n  mutation SwitchTenantWizard($tenantId: String!) {\n    switchTenant(tenantId: $tenantId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateTenantFeaturesWizard($input: UpdateTenantFeaturesInput!) {\n    updateTenantFeatures(input: $input) {\n      status\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateTenantFeaturesWizard($input: UpdateTenantFeaturesInput!) {\n    updateTenantFeatures(input: $input) {\n      status\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddContactWizard($input: AddContactInput!) {\n    addContact(input: $input) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation AddContactWizard($input: AddContactInput!) {\n    addContact(input: $input) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpsertPlatformWizard($input: UpsertPlatformCredentialsInput!) {\n    upsertPlatformCredentials(input: $input) {\n      status\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation UpsertPlatformWizard($input: UpsertPlatformCredentialsInput!) {\n    upsertPlatformCredentials(input: $input) {\n      status\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddCustomCommandWizard($input: AddCustomCommandInput!) {\n    addCustomCommand(input: $input) {\n      status\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation AddCustomCommandWizard($input: AddCustomCommandInput!) {\n    addCustomCommand(input: $input) {\n      status\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query WizardUsage {\n    myUsage {\n      tenants\n    }\n    mySubscription {\n      plan {\n        maxTenants\n        maxPlatformsPerTenant\n        maxCustomCommandsPerTenant\n        maxContactsPerTenant\n      }\n    }\n  }\n"): (typeof documents)["\n  query WizardUsage {\n    myUsage {\n      tenants\n    }\n    mySubscription {\n      plan {\n        maxTenants\n        maxPlatformsPerTenant\n        maxCustomCommandsPerTenant\n        maxContactsPerTenant\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetUsers($input: GetAllUsersType) {\n    users(input: $input) {\n      users {\n        id\n        name\n        surname\n        email\n        phone\n        status\n        type\n      }\n      total\n    }\n  }\n"): (typeof documents)["\n  query GetUsers($input: GetAllUsersType) {\n    users(input: $input) {\n      users {\n        id\n        name\n        surname\n        email\n        phone\n        status\n        type\n      }\n      total\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateSimpleUser($input: CreateSimpleUserType!) {\n    createSimpleUser(input: $input) {\n      id\n      email\n    }\n  }\n"): (typeof documents)["\n  mutation CreateSimpleUser($input: CreateSimpleUserType!) {\n    createSimpleUser(input: $input) {\n      id\n      email\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateUser($input: UpdateUserType!) {\n    updateUser(input: $input) {\n      id\n      name\n      surname\n      email\n      phone\n      status\n      type\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateUser($input: UpdateUserType!) {\n    updateUser(input: $input) {\n      id\n      name\n      surname\n      email\n      phone\n      status\n      type\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateUserStatus($input: UpdateUserStatusType!) {\n    updateUserStatus(input: $input) {\n      id\n      name\n      surname\n      email\n      phone\n      status\n      type\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateUserStatus($input: UpdateUserStatusType!) {\n    updateUserStatus(input: $input) {\n      id\n      name\n      surname\n      email\n      phone\n      status\n      type\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateUserRole($input: UpdateUserRoleType!) {\n    updateUserRole(input: $input) {\n      id\n      name\n      surname\n      email\n      phone\n      status\n      type\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateUserRole($input: UpdateUserRoleType!) {\n    updateUserRole(input: $input) {\n      id\n      name\n      surname\n      email\n      phone\n      status\n      type\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemoveUser($input: GetUserType!) {\n    removeUser(input: $input) {\n      success\n    }\n  }\n"): (typeof documents)["\n  mutation RemoveUser($input: GetUserType!) {\n    removeUser(input: $input) {\n      success\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Status {\n    loginStatus {\n      status\n      phoneId\n      user {\n        id\n        email\n        owner\n        is2faEnabled\n        isAdaptiveLoginEnabled\n        admin\n        tenantId\n      }\n    }\n  }\n"): (typeof documents)["\n  query Status {\n    loginStatus {\n      status\n      phoneId\n      user {\n        id\n        email\n        owner\n        is2faEnabled\n        isAdaptiveLoginEnabled\n        admin\n        tenantId\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Logout {\n    logoutUser {\n      status\n    }\n  }\n"): (typeof documents)["\n  mutation Logout {\n    logoutUser {\n      status\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query CoreConfigs {\n    coreConfigs {\n      data {\n        key\n        value\n        description\n      }\n      status\n      message\n    }\n  }\n"): (typeof documents)["\n  query CoreConfigs {\n    coreConfigs {\n      data {\n        key\n        value\n        description\n      }\n      status\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateConfig($input: UpdateConfigType!) {\n    updateConfig(input: $input) {\n      status\n      message\n      data {\n        key\n        value\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateConfig($input: UpdateConfigType!) {\n    updateConfig(input: $input) {\n      status\n      message\n      data {\n        key\n        value\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query TenantFeatures {\n    tenantFeatures {\n      enableSignal\n      enableWhatsApp\n      enableMessenger\n      enableGate\n      enablePayment\n      enableCommandScheduling\n      enableAnalytics\n    }\n  }\n"): (typeof documents)["\n  query TenantFeatures {\n    tenantFeatures {\n      enableSignal\n      enableWhatsApp\n      enableMessenger\n      enableGate\n      enablePayment\n      enableCommandScheduling\n      enableAnalytics\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;