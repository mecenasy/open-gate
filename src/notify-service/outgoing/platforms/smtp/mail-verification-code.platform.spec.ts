import { Platform } from '../../../types/platform';
import type { DynamicSmtpService } from './dynamic-smtp.service';
import { MailVerificationCodePlatform } from './mail-verification-code.platform';

describe('MailVerificationCodePlatform.send', () => {
  let smtp: jest.Mocked<DynamicSmtpService>;
  let platform: MailVerificationCodePlatform;

  beforeEach(() => {
    smtp = { sendMail: jest.fn().mockResolvedValue(undefined) } as unknown as jest.Mocked<DynamicSmtpService>;
    platform = new MailVerificationCodePlatform(smtp);
    jest
      .spyOn((platform as unknown as { logger: { warn: jest.Mock; error: jest.Mock } }).logger, 'warn')
      .mockImplementation(() => undefined);
    jest
      .spyOn((platform as unknown as { logger: { error: jest.Mock } }).logger, 'error')
      .mockImplementation(() => undefined);
  });

  it('exposes Platform.Email', () => {
    expect(platform.platform).toBe(Platform.Email);
  });

  it('skips with warn when email is missing', async () => {
    await platform.send({ email: undefined }, 1234);

    expect(smtp.sendMail).not.toHaveBeenCalled();
    const warn = (platform as unknown as { logger: { warn: jest.Mock } }).logger.warn;
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('email is missing'));
  });

  it('sends a verification email with the code in subject body and html', async () => {
    await platform.send({ email: 'a@b.c' }, 9876);

    expect(smtp.sendMail).toHaveBeenCalledWith({
      to: 'a@b.c',
      subject: 'Your verification code',
      text: 'Your verification code is: 9876',
      html: '<p>Your verification code is: <strong>9876</strong></p>',
    });
  });

  it('logs error when SMTP fails (does not throw)', async () => {
    smtp.sendMail.mockRejectedValue(new Error('smtp down'));

    await expect(platform.send({ email: 'a@b.c' }, 1)).resolves.toBeUndefined();
    const err = (platform as unknown as { logger: { error: jest.Mock } }).logger.error;
    expect(err).toHaveBeenCalledWith('Failed to send OTP email.', expect.any(Error));
  });
});
