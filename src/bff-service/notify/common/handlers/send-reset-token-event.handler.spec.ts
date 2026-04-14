import { of, throwError } from 'rxjs';
import { SendResetTokenEventHandler } from './send-reset-token-event.handler';
import { SendResetTokenEvent } from '../dto/send-reset-token.event';
import { TypeConfigService } from 'src/bff-service/common/configs/types.config.service';
import { Platform } from 'src/proto/notify';

const mockNotificationService = {
  sendToken: jest.fn(),
};

const mockGrpcClient = {
  getService: jest.fn().mockReturnValue(mockNotificationService),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue({ clientUrl: 'https://app.example.com' }),
} as unknown as TypeConfigService;

describe('SendResetTokenEventHandler', () => {
  let handler: SendResetTokenEventHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new SendResetTokenEventHandler(mockGrpcClient as any, mockConfigService);
  });

  it('should call sendToken with correct URL and email platform', async () => {
    mockNotificationService.sendToken.mockReturnValue(of({ success: true }));

    await handler.handle(new SendResetTokenEvent('user@example.com', 'reset-uuid-123'));

    expect(mockNotificationService.sendToken).toHaveBeenCalledWith(
      expect.objectContaining({
        platforms: [Platform.Email],
        email: 'user@example.com',
        url: 'https://app.example.com/reset-password?token=reset-uuid-123',
      }),
    );
  });

  it('should NOT throw when notification service fails (error is caught)', async () => {
    mockNotificationService.sendToken.mockReturnValue(throwError(() => new Error('gRPC timeout')));

    await expect(handler.handle(new SendResetTokenEvent('user@example.com', 'token-123'))).resolves.toBeUndefined();
  });

  it('should construct URL from config clientUrl and token', async () => {
    mockNotificationService.sendToken.mockReturnValue(of({}));
    (mockConfigService.get as jest.Mock).mockReturnValue({ clientUrl: 'https://custom.domain' });

    await handler.handle(new SendResetTokenEvent('a@b.com', 'my-token'));

    expect(mockNotificationService.sendToken).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'https://custom.domain/reset-password?token=my-token' }),
    );
  });
});
