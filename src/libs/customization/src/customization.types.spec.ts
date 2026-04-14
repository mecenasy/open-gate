import {
  validateMessagingChannels,
  DEFAULT_CUSTOMIZATION,
  MessagingChannel,
} from './customization.types';

describe('validateMessagingChannels', () => {
  it('passes when sms is present', () => {
    expect(() => validateMessagingChannels(['sms'])).not.toThrow();
  });

  it('passes when email is present', () => {
    expect(() => validateMessagingChannels(['email'])).not.toThrow();
  });

  it('passes when both sms and email are present', () => {
    expect(() => validateMessagingChannels(['sms', 'email'])).not.toThrow();
  });

  it('passes when sms, email and other channels are present', () => {
    const channels: MessagingChannel[] = ['sms', 'email', 'signal', 'whatsapp', 'messenger'];
    expect(() => validateMessagingChannels(channels)).not.toThrow();
  });

  it('throws when only signal is present', () => {
    expect(() => validateMessagingChannels(['signal'])).toThrow(
      'At least one of sms or email must be enabled in priorityChannels',
    );
  });

  it('throws when only whatsapp is present', () => {
    expect(() => validateMessagingChannels(['whatsapp'])).toThrow();
  });

  it('throws when only messenger is present', () => {
    expect(() => validateMessagingChannels(['messenger'])).toThrow();
  });

  it('throws when channels array is empty', () => {
    expect(() => validateMessagingChannels([])).toThrow();
  });
});

describe('DEFAULT_CUSTOMIZATION', () => {
  it('includes sms and email in priorityChannels', () => {
    expect(DEFAULT_CUSTOMIZATION.messaging.priorityChannels).toContain('sms');
    expect(DEFAULT_CUSTOMIZATION.messaging.priorityChannels).toContain('email');
  });

  it('passes validateMessagingChannels', () => {
    expect(() =>
      validateMessagingChannels(DEFAULT_CUSTOMIZATION.messaging.priorityChannels),
    ).not.toThrow();
  });

  it('has positive timeout', () => {
    expect(DEFAULT_CUSTOMIZATION.commands.timeout).toBeGreaterThan(0);
  });

  it('has positive maxRetries', () => {
    expect(DEFAULT_CUSTOMIZATION.commands.maxRetries).toBeGreaterThan(0);
  });

  it('has twilio as default SMS provider', () => {
    expect(DEFAULT_CUSTOMIZATION.messaging.defaultSmsProvider).toBe('twilio');
  });

  it('has enableGate true by default', () => {
    expect(DEFAULT_CUSTOMIZATION.features.enableGate).toBe(true);
  });
});
