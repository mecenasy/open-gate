import type { PhoneProcurementDbClient } from '../../../phone-procurement/db/phone-procurement-db.client';
import { TwilioTenantLookupService } from './twilio-tenant-lookup.service';

describe('TwilioTenantLookupService', () => {
  let dbClient: jest.Mocked<PhoneProcurementDbClient>;
  let service: TwilioTenantLookupService;

  beforeEach(() => {
    dbClient = {
      getTenantPhoneNumberByE164: jest.fn(),
    } as unknown as jest.Mocked<PhoneProcurementDbClient>;
    service = new TwilioTenantLookupService(dbClient);
    jest
      .spyOn((service as unknown as { logger: { warn: jest.Mock } }).logger, 'warn')
      .mockImplementation(() => undefined);
  });

  it('returns the owning tenant id when the number is registered', async () => {
    dbClient.getTenantPhoneNumberByE164.mockResolvedValue({ tenantId: 't-42' } as never);

    expect(await service.lookupTenantByPhoneNumber('+48999888777')).toBe('t-42');
    expect(dbClient.getTenantPhoneNumberByE164).toHaveBeenCalledWith('+48999888777');
  });

  it('returns null when the number is not in the table', async () => {
    dbClient.getTenantPhoneNumberByE164.mockResolvedValue(null);
    expect(await service.lookupTenantByPhoneNumber('+48000111222')).toBeNull();
  });

  it('returns null when entry has no tenantId (defensive)', async () => {
    dbClient.getTenantPhoneNumberByE164.mockResolvedValue({ tenantId: undefined as unknown as string } as never);
    expect(await service.lookupTenantByPhoneNumber('+48000111222')).toBeNull();
  });

  it('swallows db errors so Twilio webhooks never throw — returns null and logs', async () => {
    dbClient.getTenantPhoneNumberByE164.mockRejectedValue(new Error('UNAVAILABLE'));
    expect(await service.lookupTenantByPhoneNumber('+48000111222')).toBeNull();

    const warn = (service as unknown as { logger: { warn: jest.Mock } }).logger.warn;
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('UNAVAILABLE'));
  });

  it('stringifies non-Error rejections', async () => {
    dbClient.getTenantPhoneNumberByE164.mockRejectedValue('boom');
    expect(await service.lookupTenantByPhoneNumber('+48000111222')).toBeNull();
    const warn = (service as unknown as { logger: { warn: jest.Mock } }).logger.warn;
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('boom'));
  });
});
