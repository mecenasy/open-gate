import { BadRequestException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { TenantStaffRole } from '@app/entities';
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
  constructor(
    private readonly customization: TenantCustomizationService,
    private readonly admin: TenantAdminService,
  ) {}

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
    if (input.defaultSmsProvider !== undefined &&
        !SMS_PROVIDERS.has(input.defaultSmsProvider as CommunityCustomizationMessaging['defaultSmsProvider'])) {
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
  async updateTenantCompliance(@Args('input') input: ComplianceInput): Promise<MutationResult> {
    if (input.dataResidency !== undefined && !RESIDENCY.has(input.dataResidency)) {
      throw new BadRequestException(`dataResidency must be one of: ${[...RESIDENCY].join(', ')}`);
    }
    ensureUrl(input.webhookUrl, 'webhookUrl');

    return this.patchSection(input.tenantId, (current) => ({
      compliance: {
        ...current.compliance,
        ...(input.dataResidency !== undefined && { dataResidency: input.dataResidency }),
        ...(input.encryptionEnabled !== undefined && { encryptionEnabled: input.encryptionEnabled }),
        ...(input.webhookUrl !== undefined && { webhookUrl: input.webhookUrl }),
      } as CommunityCustomizationCompliance,
    }));
  }

  @UseGuards(TenantStaffGuard(TenantStaffRole.Owner))
  @Mutation(() => MutationResult)
  async transferTenantBilling(@Args('input') input: TransferTenantBillingInput): Promise<MutationResult> {
    return this.admin.transferTenantBilling(input.tenantId, input.newBillingUserId);
  }

  @UseGuards(TenantStaffGuard(TenantStaffRole.Owner))
  @Mutation(() => MutationResult)
  async setTenantActive(@Args('input') input: SetTenantActiveInput): Promise<MutationResult> {
    const result = await this.admin.setTenantActive(input.tenantId, input.active);
    this.customization.invalidate(input.tenantId);
    return result;
  }

  @UseGuards(TenantStaffGuard(TenantStaffRole.Owner))
  @Mutation(() => MutationResult)
  async deleteTenant(@Args('input') input: DeleteTenantInput): Promise<MutationResult> {
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
