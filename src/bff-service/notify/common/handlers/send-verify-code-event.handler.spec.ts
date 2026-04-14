import { of, throwError } from 'rxjs';
import { SendVerifyCodeEventHandler } from './send-verify-code-event.handler';
import { SendVerifyCodeEvent } from '../dto/send-verify-code.event';
import { Platform } from 'src/proto/notify';

const mockNotificationService = {
  sendVerificationCode: jest.fn(),
};

const mockGrpcClient = {
  getService: jest.fn().mockReturnValue(mockNotificationService),
};

describe('SendVerifyCodeEventHandler', () => {
  let handler: SendVerifyCodeEventHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new SendVerifyCodeEventHandler(mockGrpcClient as any);
  });

  it('should call sendVerificationCode with sms and email platforms', async () => {
    mockNotificationService.sendVerificationCode.mockReturnValue(of({ success: true }));

    await handler.handle(new SendVerifyCodeEvent('+48100200300', 'user@example.com', 123456));

    expect(mockNotificationService.sendVerificationCode).toHaveBeenCalledWith(
      expect.objectContaining({
        platforms: [Platform.Sms, Platform.Email],
        code: 123456,
        phoneNumber: '+48100200300',
        email: 'user@example.com',
      }),
    );
  });

  it('should NOT throw when notification service fails (error is caught)', async () => {
    mockNotificationService.sendVerificationCode.mockReturnValue(throwError(() => new Error('gRPC unavailable')));

    await expect(
      handler.handle(new SendVerifyCodeEvent('+48100200300', 'user@example.com', 111111)),
    ).resolves.toBeUndefined();
  });
});
