import { SofDispatcher } from './dispatcher';
import { TenantCustomizationService } from '../common/customization/tenant-customization.service';
import { SofCommand } from './commands/impl/sof-command';
import { Status } from '../status/status';
import { Handler } from '@app/handler';
import { DEFAULT_CUSTOMIZATION } from '@app/customization';
import type { CommandType } from '../common/types/command';
import type { DiscoveryService } from '@nestjs/core';

const COMMAND_TYPE = 'AUDIO' as CommandType;

const makeCustomization = (timeout: number) => ({
  ...DEFAULT_CUSTOMIZATION,
  commands: { ...DEFAULT_CUSTOMIZATION.commands, timeout },
});

describe('SofDispatcher', () => {
  let dispatcher: SofDispatcher<unknown>;
  let customizationService: jest.Mocked<Pick<TenantCustomizationService, 'getForCurrentTenant'>>;
  let mockDiscovery: jest.Mocked<Pick<DiscoveryService, 'getProviders'>>;

  beforeEach(() => {
    customizationService = { getForCurrentTenant: jest.fn() };
    mockDiscovery = { getProviders: jest.fn().mockReturnValue([]) };

    dispatcher = new SofDispatcher(
      mockDiscovery as unknown as DiscoveryService,
      customizationService as unknown as TenantCustomizationService,
    );
    dispatcher.onModuleInit();
  });

  describe('dispatch', () => {
    it('throws when no handler is registered for the command type', async () => {
      customizationService.getForCurrentTenant.mockResolvedValue(makeCustomization(30000));

      await expect(dispatcher.dispatch(new SofCommand(COMMAND_TYPE, {}))).rejects.toThrow(
        `Missing handler: ${COMMAND_TYPE}`,
      );
    });

    it('executes the handler and returns its result', async () => {
      customizationService.getForCurrentTenant.mockResolvedValue(makeCustomization(30000));

      const mockStatus = { success: true } as unknown as Status;
      const mockHandler = {
        execute: jest.fn().mockResolvedValue(mockStatus),
      } as unknown as Handler<SofCommand<unknown>, Status>;

      dispatcher.register(COMMAND_TYPE, mockHandler);

      const result = await dispatcher.dispatch(new SofCommand(COMMAND_TYPE, {}));

      expect(result).toBe(mockStatus);
      expect(mockHandler.execute).toHaveBeenCalledTimes(1);
    });

    it('rejects with timeout error when handler exceeds the tenant timeout', async () => {
      customizationService.getForCurrentTenant.mockResolvedValue(makeCustomization(10));

      const neverResolves = new Promise<Status>(() => {
        /* intentionally hangs */
      });
      const slowHandler = {
        execute: jest.fn().mockReturnValue(neverResolves),
      } as unknown as Handler<SofCommand<unknown>, Status>;

      dispatcher.register(COMMAND_TYPE, slowHandler);

      await expect(dispatcher.dispatch(new SofCommand(COMMAND_TYPE, {}))).rejects.toThrow(/timeout/i);
    }, 2000);

    it('includes timeout value and command type in the error message', async () => {
      customizationService.getForCurrentTenant.mockResolvedValue(makeCustomization(10));

      const slowHandler = {
        execute: jest.fn().mockReturnValue(new Promise<Status>(() => {})),
      } as unknown as Handler<SofCommand<unknown>, Status>;

      dispatcher.register(COMMAND_TYPE, slowHandler);

      await expect(dispatcher.dispatch(new SofCommand(COMMAND_TYPE, {}))).rejects.toThrow(
        `Command timeout after 10ms: ${COMMAND_TYPE}`,
      );
    }, 2000);
  });
});
