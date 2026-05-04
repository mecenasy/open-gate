import { TokenType } from 'src/proto/notify';
import { Platform } from '../../../types/platform';
import type { DynamicSmtpService } from './dynamic-smtp.service';
import { MailTokenPlatform } from './mail-token.platform';

describe('MailTokenPlatform.send', () => {
  let smtp: jest.Mocked<DynamicSmtpService>;
  let platform: MailTokenPlatform;

  beforeEach(() => {
    smtp = { sendMail: jest.fn().mockResolvedValue(undefined) } as unknown as jest.Mocked<DynamicSmtpService>;
    platform = new MailTokenPlatform(smtp);
    jest
      .spyOn((platform as unknown as { logger: { error: jest.Mock } }).logger, 'error')
      .mockImplementation(() => undefined);
  });

  it('exposes Platform.Email', () => {
    expect(platform.platform).toBe(Platform.Email);
  });

  it('sends a CONFIRM_REGISTRATION email with welcome copy and the link', async () => {
    await platform.send('user@example.com', 'https://example.com/confirm?t=abc', TokenType.CONFIRM_REGISTRATION);

    expect(smtp.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: 'Confirm your registration',
        text: expect.stringContaining('https://example.com/confirm?t=abc'),
        html: expect.stringContaining('https://example.com/confirm?t=abc'),
      }),
    );
    const call = smtp.sendMail.mock.calls[0][0] as { html: string };
    expect(call.html).toContain('Welcome');
  });

  it('sends a RESET_PASSWORD email with reset copy', async () => {
    await platform.send('user@example.com', 'https://example.com/reset?t=xyz', TokenType.RESET_PASSWORD);

    expect(smtp.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Reset your password',
        text: expect.stringContaining('Reset your password'),
        html: expect.stringContaining('https://example.com/reset?t=xyz'),
      }),
    );
  });

  it('logs error when SMTP throws (does not propagate)', async () => {
    smtp.sendMail.mockRejectedValue(new Error('smtp down'));

    await expect(platform.send('a@b.c', 'https://x', TokenType.RESET_PASSWORD)).resolves.toBeUndefined();

    const err = (platform as unknown as { logger: { error: jest.Mock } }).logger.error;
    expect(err).toHaveBeenCalledWith(expect.stringContaining('Failed'), expect.any(Error));
  });
});
