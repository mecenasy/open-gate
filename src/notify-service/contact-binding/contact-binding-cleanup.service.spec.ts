import { ContactBindingCleanupService } from './contact-binding-cleanup.service';
import type { ContactBindingDbClient } from './contact-binding-db.client';

describe('ContactBindingCleanupService', () => {
  let bindingClient: jest.Mocked<ContactBindingDbClient>;
  let service: ContactBindingCleanupService;
  let logger: { log: jest.Mock; debug: jest.Mock; error: jest.Mock };

  beforeEach(() => {
    bindingClient = {
      markExpiredBindings: jest.fn(),
    } as unknown as jest.Mocked<ContactBindingDbClient>;

    service = new ContactBindingCleanupService(bindingClient);
    logger = (service as unknown as { logger: typeof logger }).logger;
    jest.spyOn(logger, 'log').mockImplementation(() => undefined);
    jest.spyOn(logger, 'debug').mockImplementation(() => undefined);
    jest.spyOn(logger, 'error').mockImplementation(() => undefined);
  });

  it('logs the count when expired rows were updated', async () => {
    bindingClient.markExpiredBindings.mockResolvedValue(7);

    await service.markExpired();

    expect(bindingClient.markExpiredBindings).toHaveBeenCalledWith(0);
    expect(logger.log).toHaveBeenCalledWith('Contact bindings expired: 7');
    expect(logger.debug).not.toHaveBeenCalled();
  });

  it('logs at debug level when nothing expired (keeps cron output quiet)', async () => {
    bindingClient.markExpiredBindings.mockResolvedValue(0);

    await service.markExpired();

    expect(logger.debug).toHaveBeenCalledWith('Contact bindings expire: nothing to do');
    expect(logger.log).not.toHaveBeenCalled();
  });

  it('logs error and does not throw when the db client fails — cron must keep firing', async () => {
    bindingClient.markExpiredBindings.mockRejectedValue(new Error('grpc UNAVAILABLE'));

    await expect(service.markExpired()).resolves.toBeUndefined();
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('grpc UNAVAILABLE'));
  });
});
