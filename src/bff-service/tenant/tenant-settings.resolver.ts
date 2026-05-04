import { BadRequestException, Logger, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { TenantStaffRole } from '@app/entities';
import { AuditAction } from '@app/audit';
import { CurrentUserId } from '@app/auth';
import { AuditClientService } from '../audit/audit.client.service';
import { PhoneProcurementClientService } from '../phone-procurement/phone-procurement.client.service';
import {
  validateMessagingChannels,
  type CommunityCustomization,
  type CommunityCustomizationBranding,
  type CommunityCustomizationCommands,
  type CommunityCustomizationCompliance,
  type CommunityCustomizationMessaging,
  type MessagingChannel,
} from '@app/customization';
import { TenantStaffGuard } from '../common/guards/tenant-staff.guard';
import { TenantCustomizationService } from '../common/customization/tenant-customization.service';
import { TenantAdminService } from './tenant-admin.service';
import { MutationResult } from './dto/tenant-admin.types';
import {
  BrandingInput,
  CommandsConfigInput,
  ComplianceInput,
  DeleteTenantInput,
  MessagingInput,
  SetTenantActiveInput,
  TenantCustomizationFullType,
  TransferTenantBillingInput,
} from './dto/tenant-settings.types';

const FONT_SIZES = new Set<CommunityCustomizationBranding['fontSize']>(['small', 'normal', 'large']);
const SMS_PROVIDERS = new Set<CommunityCustomizationMessaging['defaultSmsProvider']>([
  'twilio',
  'legacy',
  'africastalking',
]);
const ALL_CHANNELS = new Set<MessagingChannel>(['sms', 'email', 'signal', 'whatsapp', 'messenger']);
const RESIDENCY = new Set(['EU', 'US', 'APAC']);
const HEX_COLOR_RE = /^#[0-9a-fA-F]{3,8}$/;

function ensureHexColor(value: string | undefined, field: string): void {
  if (value === undefined) return;
  if (!HEX_COLOR_RE.test(value)) {
    throw new BadRequestException(`${field} must be a hex color (e.g. #ff8800)`);
  }
}

function ensureUrl(value: string | undefined, field: string): void {
  if (value === undefined || value === '') return;
  try {
    new URL(value);
  } catch {
    throw new BadRequestException(`${field} must be a valid URL`);
  }
}

@Resolver()
export class TenantSettingsResolver {
  private readonly logger = new Logger(TenantSettingsResolver.name);

  constructor(
    private readonly customization: TenantCustomizationService,
    private readonly admin: TenantAdminService,
    private readonly audit: AuditClientService,
    private readonly phoneProcurement: PhoneProcurementClientService,
  ) {}

  @UseGuards(TenantStaffGuard(TenantStaffRole.Support))
  @Query(() => TenantCustomizationFullType)
  async tenantCustomization(@Args('tenantId') tenantId: string): Promise<TenantCustomizationFullType> {
    const cfg = await this.customization.getForTenant(tenantId);
    return {
      branding: {
        logoUrl: cfg.branding.logoUrl,
        primaryColor: cfg.branding.primaryColor,
        secondaryColor: cfg.branding.secondaryColor,
        fontSize: cfg.branding.fontSize,
      },
      features: {
        enableSignal: cfg.features.enableSignal,
        enableWhatsApp: cfg.features.enableWhatsApp,
        enableMessenger: cfg.features.enableMessenger,
        enableGate: cfg.features.enableGate,
        enablePayment: cfg.features.enablePayment,
        enableCommandScheduling: cfg.features.enableCommandScheduling,
        enableAnalytics: cfg.features.enableAnalytics,
        enableAudioRecognition: cfg.features.enableAudioRecognition,
      },
      messaging: {
        defaultSmsProvider: cfg.messaging.defaultSmsProvider,
        priorityChannels: cfg.messaging.priorityChannels,
        rateLimitPerMinute: cfg.messaging.rateLimitPerMinute,
      },
      commands: {
        timeout: cfg.commands.timeout,
        maxRetries: cfg.commands.maxRetries,
        processingDelay: cfg.commands.processingDelay,
        customPromptLibraryEnabled: cfg.commands.customPromptLibraryEnabled,
      },
      compliance: {
        dataResidency: cfg.compliance.dataResidency,
        encryptionEnabled: cfg.compliance.encryptionEnabled,
        webhookUrl: cfg.compliance.webhookUrl,
      },
    };
  }

  @UseGuards(TenantStaffGuard(TenantStaffRole.Admin))
  @Mutation(() => MutationResult)
  async updateTenantBranding(@Args('input') input: BrandingInput): Promise<MutationResult> {
    ensureHexColor(input.primaryColor, 'primaryColor');
    ensureHexColor(input.secondaryColor, 'secondaryColor');
    ensureUrl(input.logoUrl, 'logoUrl');
    if (input.fontSize !== undefined && !FONT_SIZES.has(input.fontSize as CommunityCustomizationBranding['fontSize'])) {
      throw new BadRequestException(`fontSize must be one of: ${[...FONT_SIZES].join(', ')}`);
    }

    return this.patchSection(input.tenantId, (current) => ({
      branding: {
        ...current.branding,
        ...(input.logoUrl !== undefined && { logoUrl: input.logoUrl }),
        ...(input.primaryColor !== undefined && { primaryColor: input.primaryColor }),
        ...(input.secondaryColor !== undefined && { secondaryColor: input.secondaryColor }),
        ...(input.fontSize !== undefined && {
          fontSize: input.fontSize as CommunityCustomizationBranding['fontSize'],
        }),
      },
    }));
  }

  @UseGuards(TenantStaffGuard(TenantStaffRole.Admin))
  @Mutation(() => MutationResult)
  async updateTenantMessaging(@Args('input') input: MessagingInput): Promise<MutationResult> {
    if (
      input.defaultSmsProvider !== undefined &&
      !SMS_PROVIDERS.has(input.defaultSmsProvider as CommunityCustomizationMessaging['defaultSmsProvider'])
    ) {
      throw new BadRequestException(`defaultSmsProvider must be one of: ${[...SMS_PROVIDERS].join(', ')}`);
    }
    if (input.priorityChannels) {
      for (const ch of input.priorityChannels) {
        if (!ALL_CHANNELS.has(ch as MessagingChannel)) {
          throw new BadRequestException(`Unknown messaging channel: ${ch}`);
        }
      }
      try {
        validateMessagingChannels(input.priorityChannels as MessagingChannel[]);
      } catch (err) {
        throw new BadRequestException((err as Error).message);
      }
    }
    if (input.rateLimitPerMinute !== undefined && input.rateLimitPerMinute < 1) {
      throw new BadRequestException('rateLimitPerMinute must be >= 1');
    }

    return this.patchSection(input.tenantId, (current) => ({
      messaging: {
        ...current.messaging,
        ...(input.defaultSmsProvider !== undefined && {
          defaultSmsProvider: input.defaultSmsProvider as CommunityCustomizationMessaging['defaultSmsProvider'],
        }),
        ...(input.priorityChannels !== undefined && {
          priorityChannels: input.priorityChannels as MessagingChannel[],
        }),
        ...(input.rateLimitPerMinute !== undefined && { rateLimitPerMinute: input.rateLimitPerMinute }),
      },
    }));
  }

  @UseGuards(TenantStaffGuard(TenantStaffRole.Admin))
  @Mutation(() => MutationResult)
  async updateTenantCommands(@Args('input') input: CommandsConfigInput): Promise<MutationResult> {
    if (input.timeout !== undefined && input.timeout < 100) {
      throw new BadRequestException('timeout must be >= 100ms');
    }
    if (input.maxRetries !== undefined && input.maxRetries < 0) {
      throw new BadRequestException('maxRetries must be >= 0');
    }
    if (input.processingDelay !== undefined && input.processingDelay < 0) {
      throw new BadRequestException('processingDelay must be >= 0');
    }

    return this.patchSection(input.tenantId, (current) => ({
      commands: {
        ...current.commands,
        ...(input.timeout !== undefined && { timeout: input.timeout }),
        ...(input.maxRetries !== undefined && { maxRetries: input.maxRetries }),
        ...(input.processingDelay !== undefined && { processingDelay: input.processingDelay }),
        ...(input.customPromptLibraryEnabled !== undefined && {
          customPromptLibraryEnabled: input.customPromptLibraryEnabled,
        }),
      } as CommunityCustomizationCommands,
    }));
  }

  @UseGuards(TenantStaffGuard(TenantStaffRole.Owner))
  @Mutation(() => MutationResult)
  async updateTenantCompliance(
    @Args('input') input: ComplianceInput,
    @CurrentUserId() actor?: string,
  ): Promise<MutationResult> {
    if (input.dataResidency !== undefined && !RESIDENCY.has(input.dataResidency)) {
      throw new BadRequestException(`dataResidency must be one of: ${[...RESIDENCY].join(', ')}`);
    }
    ensureUrl(input.webhookUrl, 'webhookUrl');

    const result = await this.patchSection(input.tenantId, (current) => ({
      compliance: {
        ...current.compliance,
        ...(input.dataResidency !== undefined && { dataResidency: input.dataResidency }),
        ...(input.encryptionEnabled !== undefined && { encryptionEnabled: input.encryptionEnabled }),
        ...(input.webhookUrl !== undefined && { webhookUrl: input.webhookUrl }),
      } as CommunityCustomizationCompliance,
    }));
    if (actor && result.status) {
      void this.audit.record({
        tenantId: input.tenantId,
        userId: actor,
        action: AuditAction.TenantComplianceUpdated,
        payload: {
          dataResidency: input.dataResidency,
          encryptionEnabled: input.encryptionEnabled,
          webhookUrlChanged: input.webhookUrl !== undefined,
        },
      });
    }
    return result;
  }

  @UseGuards(TenantStaffGuard(TenantStaffRole.Owner))
  @Mutation(() => MutationResult)
  async transferTenantBilling(
    @Args('input') input: TransferTenantBillingInput,
    @CurrentUserId() actor?: string,
  ): Promise<MutationResult> {
    const result = await this.admin.transferTenantBilling(input.tenantId, input.newBillingUserId);
    if (actor && result.status) {
      void this.audit.record({
        tenantId: input.tenantId,
        userId: actor,
        action: AuditAction.TenantBillingTransferred,
        payload: { newBillingUserId: input.newBillingUserId },
      });
    }
    return result;
  }

  @UseGuards(TenantStaffGuard(TenantStaffRole.Owner))
  @Mutation(() => MutationResult)
  async setTenantActive(
    @Args('input') input: SetTenantActiveInput,
    @CurrentUserId() actor?: string,
  ): Promise<MutationResult> {
    const result = await this.admin.setTenantActive(input.tenantId, input.active);
    this.customization.invalidate(input.tenantId);
    if (actor && result.status) {
      void this.audit.record({
        tenantId: input.tenantId,
        userId: actor,
        action: AuditAction.TenantSetActive,
        payload: { active: input.active },
      });
    }
    return result;
  }

  @UseGuards(TenantStaffGuard(TenantStaffRole.Owner))
  @Mutation(() => MutationResult)
  async deleteTenant(
    @Args('input') input: DeleteTenantInput,
    @CurrentUserId() actor?: string,
  ): Promise<MutationResult> {
    // Audit BEFORE delete: the FK CASCADE drops the tenants row but the
    // FK on tenant_audit_log.tenant_id is ON DELETE SET NULL, so the row
    // survives — but we want a "before" snapshot in case the delete fails
    // halfway. The audit write itself is fire-and-forget, so even if both
    // ran in parallel we'd be fine.
    if (actor) {
      void this.audit.record({
        tenantId: input.tenantId,
        userId: actor,
        action: AuditAction.TenantDeleted,
        payload: { slug: input.slugConfirmation },
      });
    }

    // Tear down every external platform account BEFORE deleting the tenant
    // — Twilio numbers, signal-cli accounts, anything else hooked into the
    // notify-side cleanup service. Once `admin.deleteTenant` runs, the FK
    // CASCADE drops platform_credentials and tenant_phone_numbers, so we
    // lose the SIDs / account numbers needed to call providers.
    // Best-effort: log per-platform failures but don't block the user from
    // deleting; orphans surface in `perPlatform` for ops to clean up.
    try {
      const cleanup = await this.phoneProcurement.unregisterTenantPlatforms(input.tenantId);
      if (!cleanup.status) {
        const failed = cleanup.perPlatform.filter((p) => !p.status);
        this.logger.warn(
          `Platform unregister partial-fail for tenant=${input.tenantId}: ${failed
            .map((p) => `${p.platform}=${p.message}`)
            .join('; ')}`,
        );
      }
    } catch (err) {
      this.logger.error(
        `Platform unregister threw for tenant=${input.tenantId}; proceeding with delete. ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    const result = await this.admin.deleteTenant(input.tenantId, input.slugConfirmation);
    this.customization.invalidate(input.tenantId);
    return result;
  }

  private async patchSection(
    tenantId: string,
    build: (current: CommunityCustomization) => Partial<CommunityCustomization>,
  ): Promise<MutationResult> {
    const current = await this.customization.getForTenant(tenantId);
    const patch = build(current);
    const merged: CommunityCustomization = { ...current, ...patch };
    const result = await this.admin.updateCustomization(tenantId, JSON.stringify(merged));
    this.customization.invalidate(tenantId);
    return result;
  }
}
