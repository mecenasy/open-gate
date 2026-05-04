import type { EventBus } from '@nestjs/cqrs';
import { Platform } from '../../../types/platform';
import { MessageEvent } from '../../event/message.event';
import type { SignalVerificationBridgeService } from '../../../signal-verification/signal-verification-bridge.service';
import type { VerificationForwarderService } from '../../../signal-verification/verification-forwarder.service';
import type { TwilioTenantLookupService } from './twilio-tenant-lookup.service';
import { TwilioBridgeService } from './twilio-bridge.service';
import type { TwilioSmsWebhookPayloadWithMedia } from './twilio.types';

function makePayload(over: Partial<TwilioSmsWebhookPayloadWithMedia> = {}): TwilioSmsWebhookPayloadWithMedia {
  return {
    MessageSid: 'SM-1',
    From: '+48111222333',
    To: '+48999888777',
    Body: 'hi',
    NumMedia: '0',
    ...over,
  } as TwilioSmsWebhookPayloadWithMedia;
}

describe('TwilioBridgeService.handleInboundSms', () => {
  let eventBus: jest.Mocked<EventBus>;
  let lookup: jest.Mocked<TwilioTenantLookupService>;
  let verifyBridge: jest.Mocked<SignalVerificationBridgeService>;
  let forwarder: jest.Mocked<VerificationForwarderService>;
  let service: TwilioBridgeService;

  beforeEach(() => {
    eventBus = { publish: jest.fn() } as unknown as jest.Mocked<EventBus>;
    lookup = { lookupTenantByPhoneNumber: jest.fn() } as unknown as jest.Mocked<TwilioTenantLookupService>;
    verifyBridge = {
      extractCode: jest.fn(),
      recordCode: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<SignalVerificationBridgeService>;
    forwarder = {
      forward: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<VerificationForwarderService>;

    service = new TwilioBridgeService(eventBus, lookup, verifyBridge, forwarder);
    jest
      .spyOn((service as unknown as { logger: { warn: jest.Mock } }).logger, 'warn')
      .mockImplementation(() => undefined);
  });

  it('short-circuits on a verification SMS (records + forwards, no MessageEvent)', async () => {
    verifyBridge.extractCode.mockReturnValue({ code: '123456', source: 'signal' } as never);

    await service.handleInboundSms(makePayload({ Body: 'Your Signal code is 123456' }));

    expect(verifyBridge.recordCode).toHaveBeenCalledWith('+48999888777', '123456', 'signal');
    expect(forwarder.forward).toHaveBeenCalledWith('+48999888777', '123456', 'signal');
    expect(lookup.lookupTenantByPhoneNumber).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it('coerces missing Body to empty string when extracting verification code', async () => {
    verifyBridge.extractCode.mockReturnValue(null);
    lookup.lookupTenantByPhoneNumber.mockResolvedValue('t-1');

    await service.handleInboundSms(makePayload({ Body: undefined }));

    expect(verifyBridge.extractCode).toHaveBeenCalledWith('');
  });

  it('emits MessageEvent with tenant id for routed SMS', async () => {
    verifyBridge.extractCode.mockReturnValue(null);
    lookup.lookupTenantByPhoneNumber.mockResolvedValue('t-7');

    const payload = makePayload();
    await service.handleInboundSms(payload);

    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    const evt = eventBus.publish.mock.calls[0][0] as MessageEvent<TwilioSmsWebhookPayloadWithMedia>;
    expect(evt).toBeInstanceOf(MessageEvent);
    expect(evt.message).toBe(payload);
    expect(evt.platform).toBe(Platform.Sms);
    expect(evt.tenantId).toBe('t-7');
  });

  it('drops the SMS with a warn when no tenant owns the destination number', async () => {
    verifyBridge.extractCode.mockReturnValue(null);
    lookup.lookupTenantByPhoneNumber.mockResolvedValue(null);

    await service.handleInboundSms(makePayload({ MessageSid: 'SM-9' }));

    expect(eventBus.publish).not.toHaveBeenCalled();
    const warn = (service as unknown as { logger: { warn: jest.Mock } }).logger.warn;
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('SM-9'));
  });
});
