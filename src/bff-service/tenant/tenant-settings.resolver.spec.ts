import { BadRequestException } from '@nestjs/common';
import { TenantSettingsResolver } from './tenant-settings.resolver';
import { DEFAULT_CUSTOMIZATION, type CommunityCustomization } from '@app/customization';
import type { TenantCustomizationService } from '../common/customization/tenant-customization.service';
import type { TenantAdminService } from './tenant-admin.service';
import type { AuditClientService } from '../audit/audit.client.service';
import type { PhoneProcurementClientService } from '../phone-procurement/phone-procurement.client.service';

describe('TenantSettingsResolver', () => {
  let resolver: TenantSettingsResolver;
  let customization: jest.Mocked<Pick<TenantCustomizationService, 'getForTenant' | 'invalidate'>>;
  let admin: jest.Mocked<
    Pick<TenantAdminService, 'updateCustomization' | 'transferTenantBilling' | 'setTenantActive' | 'deleteTenant'>
  >;
  let audit: jest.Mocked<Pick<AuditClientService, 'record'>>;
  let phoneProcurement: jest.Mocked<Pick<PhoneProcurementClientService, 'unregisterTenantPlatforms'>>;

  const baseConfig: CommunityCustomization = JSON.parse(JSON.stringify(DEFAULT_CUSTOMIZATION));

  beforeEach(() => {
    customization = {
      getForTenant: jest.fn().mockResolvedValue(baseConfig),
      invalidate: jest.fn(),
    };
    admin = {
      updateCustomization: jest.fn().mockResolvedValue({ status: true, message: 'OK' }),
      transferTenantBilling: jest.fn().mockResolvedValue({ status: true, message: 'OK' }),
      setTenantActive: jest.fn().mockResolvedValue({ status: true, message: 'OK' }),
      deleteTenant: jest.fn().mockResolvedValue({ status: true, message: 'OK' }),
    };
    audit = {
      record: jest.fn().mockResolvedValue(undefined),
    };
    phoneProcurement = {
      unregisterTenantPlatforms: jest.fn().mockResolvedValue({ status: true, message: 'OK', perPlatform: [] }),
    };
    resolver = new TenantSettingsResolver(
      customization as unknown as TenantCustomizationService,
      admin as unknown as TenantAdminService,
      audit as unknown as AuditClientService,
      phoneProcurement as unknown as PhoneProcurementClientService,
    );
  });

  describe('updateTenantBranding', () => {
    it('rejects malformed hex color', async () => {
      await expect(resolver.updateTenantBranding({ tenantId: 't1', primaryColor: 'red' })).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(admin.updateCustomization).not.toHaveBeenCalled();
    });

    it('rejects invalid font size', async () => {
      await expect(resolver.updateTenantBranding({ tenantId: 't1', fontSize: 'huge' })).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('merges branding fields and invalidates cache', async () => {
      await resolver.updateTenantBranding({ tenantId: 't1', primaryColor: '#ff8800', fontSize: 'large' });

      expect(admin.updateCustomization).toHaveBeenCalledWith('t1', expect.any(String));
      const written = JSON.parse(admin.updateCustomization.mock.calls[0]![1] as string);
      expect(written.branding).toMatchObject({ primaryColor: '#ff8800', fontSize: 'large' });
      expect(customization.invalidate).toHaveBeenCalledWith('t1');
    });
  });

  describe('updateTenantMessaging', () => {
    it('rejects priorityChannels missing both sms and email', async () => {
      await expect(
        resolver.updateTenantMessaging({ tenantId: 't1', priorityChannels: ['signal'] }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects unknown channel', async () => {
      await expect(
        resolver.updateTenantMessaging({ tenantId: 't1', priorityChannels: ['sms', 'fax'] }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects unknown sms provider', async () => {
      await expect(
        resolver.updateTenantMessaging({ tenantId: 't1', defaultSmsProvider: 'sms-monkey' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('persists valid messaging patch', async () => {
      await resolver.updateTenantMessaging({
        tenantId: 't1',
        priorityChannels: ['email', 'signal'],
        rateLimitPerMinute: 30,
      });

      const written = JSON.parse(admin.updateCustomization.mock.calls[0]![1] as string);
      expect(written.messaging.priorityChannels).toEqual(['email', 'signal']);
      expect(written.messaging.rateLimitPerMinute).toBe(30);
    });
  });

  describe('updateTenantCommands', () => {
    it('rejects timeout below 100ms', async () => {
      await expect(resolver.updateTenantCommands({ tenantId: 't1', timeout: 50 })).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rejects negative retries', async () => {
      await expect(resolver.updateTenantCommands({ tenantId: 't1', maxRetries: -1 })).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('persists partial command patch', async () => {
      await resolver.updateTenantCommands({ tenantId: 't1', timeout: 5000, customPromptLibraryEnabled: true });

      const written = JSON.parse(admin.updateCustomization.mock.calls[0]![1] as string);
      expect(written.commands.timeout).toBe(5000);
      expect(written.commands.customPromptLibraryEnabled).toBe(true);
      // unchanged fields preserved
      expect(written.commands.maxRetries).toBe(DEFAULT_CUSTOMIZATION.commands.maxRetries);
    });
  });

  describe('updateTenantCompliance', () => {
    it('rejects unknown residency', async () => {
      await expect(resolver.updateTenantCompliance({ tenantId: 't1', dataResidency: 'MARS' })).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rejects malformed webhook URL', async () => {
      await expect(resolver.updateTenantCompliance({ tenantId: 't1', webhookUrl: 'not a url' })).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('accepts empty webhook URL (clearing)', async () => {
      await resolver.updateTenantCompliance({ tenantId: 't1', webhookUrl: '' });

      const written = JSON.parse(admin.updateCustomization.mock.calls[0]![1] as string);
      expect(written.compliance.webhookUrl).toBe('');
    });
  });

  describe('lifecycle', () => {
    it('transferTenantBilling delegates to admin service', async () => {
      await resolver.transferTenantBilling({ tenantId: 't1', newBillingUserId: 'u2' });
      expect(admin.transferTenantBilling).toHaveBeenCalledWith('t1', 'u2');
    });

    it('setTenantActive delegates and invalidates cache', async () => {
      await resolver.setTenantActive({ tenantId: 't1', active: false });
      expect(admin.setTenantActive).toHaveBeenCalledWith('t1', false);
      expect(customization.invalidate).toHaveBeenCalledWith('t1');
    });

    it('deleteTenant passes slug confirmation through', async () => {
      await resolver.deleteTenant({ tenantId: 't1', slugConfirmation: 'acme' });
      expect(admin.deleteTenant).toHaveBeenCalledWith('t1', 'acme');
      expect(customization.invalidate).toHaveBeenCalledWith('t1');
    });

    it('deleteTenant unregisters platform accounts before tenant rows are dropped', async () => {
      const callOrder: string[] = [];
      phoneProcurement.unregisterTenantPlatforms.mockImplementation(async () => {
        callOrder.push('unregister');
        return { status: true, message: 'OK', perPlatform: [] };
      });
      admin.deleteTenant.mockImplementation(async () => {
        callOrder.push('delete');
        return { status: true, message: 'OK' };
      });

      await resolver.deleteTenant({ tenantId: 't1', slugConfirmation: 'acme' });

      expect(phoneProcurement.unregisterTenantPlatforms).toHaveBeenCalledWith('t1');
      expect(callOrder).toEqual(['unregister', 'delete']);
    });

    it('deleteTenant proceeds even if platform unregister throws (logs and continues)', async () => {
      phoneProcurement.unregisterTenantPlatforms.mockRejectedValueOnce(new Error('twilio down'));

      const result = await resolver.deleteTenant({ tenantId: 't1', slugConfirmation: 'acme' });

      expect(admin.deleteTenant).toHaveBeenCalledWith('t1', 'acme');
      expect(result.status).toBe(true);
    });

    it('deleteTenant proceeds when one platform partial-fails (status=false)', async () => {
      phoneProcurement.unregisterTenantPlatforms.mockResolvedValueOnce({
        status: false,
        message: 'partial',
        perPlatform: [
          { platform: 'twilio', status: true, message: 'released' },
          { platform: 'signal', status: false, message: 'gateway down' },
        ],
      });

      const result = await resolver.deleteTenant({ tenantId: 't1', slugConfirmation: 'acme' });

      expect(admin.deleteTenant).toHaveBeenCalledWith('t1', 'acme');
      expect(result.status).toBe(true);
    });
  });
});
