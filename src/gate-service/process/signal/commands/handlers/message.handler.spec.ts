import { Test, TestingModule } from '@nestjs/testing';
import { MassageHandler } from './message.handler';
import { MessageCommand } from '../impl/message.command';
import { CacheService } from 'src/gate-service/common/cache/cache.service';
import { EventService } from 'src/gate-service/common/event/event.service';
import { GrpcProxyKey } from 'src/gate-service/common/proxy/constance';
import { UserMessageEvent } from '../../events/user-message.event';
import { NotificationEvent } from 'src/gate-service/notification/events/notification.event';
import { MessageType } from '../../types';
import { UserType } from 'src/gate-service/user/types';
import { of, throwError } from 'rxjs';

describe('MassageHandler', () => {
  let handler: MassageHandler;
  let cacheService: jest.Mocked<CacheService>;
  let eventService: jest.Mocked<EventService>;

  const mockSignalEnvelope = {
    source: '+1234567890',
    sourceNumber: '+1234567890',
    sourceUuid: 'test-uuid',
    sourceName: 'Test User',
    sourceDevice: 1,
    timestamp: Date.now(),
    serverReceivedTimestamp: Date.now(),
    serverDeliveredTimestamp: Date.now(),
    dataMessage: {
      timestamp: Date.now(),
      message: 'Test message',
      expiresInSeconds: 0,
      isExpirationUpdate: false,
      viewOnce: false,
    },
  };

  const mockUserContext = {
    id: '1',
    phone: '+1234567890',
    name: 'Test User',
    surname: 'Test',
    email: 'test@example.com',
    suspended: false,
    type: UserType.User,
    messageType: MessageType.Message,
  };

  beforeEach(async () => {
    const mockGrpcService = {
      getUserByPhone: jest.fn(),
      addUser: jest.fn(),
      getUser: jest.fn(),
      updateUser: jest.fn(),
      removeUser: jest.fn(),
      getAllUsers: jest.fn(),
    };

    const mockGrpcClient = {
      getService: jest.fn().mockReturnValue(mockGrpcService),
    };

    const mockCacheService = {
      getFromCache: jest.fn(),
      saveInCache: jest.fn(),
    };

    const mockEventService = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MassageHandler,
        {
          provide: GrpcProxyKey,
          useValue: mockGrpcClient,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
        {
          provide: EventService,
          useValue: mockEventService,
        },
      ],
    }).compile();

    handler = module.get<MassageHandler>(MassageHandler);
    cacheService = module.get(CacheService) as jest.Mocked<CacheService>;
    eventService = module.get(EventService) as jest.Mocked<EventService>;

    // Initialize the handler's gRPC service
    handler.onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return success when user is found in cache', async () => {
      // Arrange
      cacheService.getFromCache.mockResolvedValue(mockUserContext);
      const command = new MessageCommand(mockSignalEnvelope);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toEqual({
        status: true,
        message: 'User identified from cache',
      });
      expect(cacheService.getFromCache).toHaveBeenCalledWith({
        identifier: '+1234567890',
        prefix: 'signal-user',
      });
      expect(eventService.emit).toHaveBeenCalledWith(
        new UserMessageEvent(mockSignalEnvelope, {
          ...mockUserContext,
          messageType: MessageType.Message,
        }),
      );
    });

    it('should fetch user from gRPC service when not in cache', async () => {
      // Arrange
      cacheService.getFromCache.mockResolvedValue(null);
      const mockGrpcUserResponse = {
        status: true,
        message: 'User found',
        data: {
          id: '1',
          phone: '+1234567890',
          name: 'Test User',
          surname: 'Test',
          email: 'test@example.com',
          suspended: false,
          type: 3, // UserType.USER from proto
        },
      };
      (handler as any).gRpcService.getUserByPhone.mockReturnValue(of(mockGrpcUserResponse));
      const command = new MessageCommand(mockSignalEnvelope);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toEqual({
        status: true,
        message: 'User identified',
      });
      expect((handler as any).gRpcService.getUserByPhone).toHaveBeenCalledWith({
        phone: '+1234567890',
      });
      expect(cacheService.saveInCache).toHaveBeenCalledWith({
        identifier: '+1234567890',
        prefix: 'signal-user',
        data: {
          id: '1',
          phone: '+1234567890',
          name: 'Test User',
          surname: 'Test',
          email: 'test@example.com',
          suspended: false,
          type: UserType.User,
        },
      });
      expect(eventService.emit).toHaveBeenCalledWith(
        new UserMessageEvent(mockSignalEnvelope, {
          ...mockUserContext,
          messageType: MessageType.Unknown,
        }),
      );
    });

    it('should return failure when user is not found in gRPC service', async () => {
      // Arrange
      cacheService.getFromCache.mockResolvedValue(null);
      const mockEmptyResponse = { status: false, message: 'User not found' };
      (handler as any).gRpcService.getUserByPhone.mockReturnValue(of(mockEmptyResponse));
      const command = new MessageCommand(mockSignalEnvelope);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toEqual({
        status: false,
        message: 'User not found',
      });
      expect(eventService.emit).toHaveBeenCalledWith(
        new NotificationEvent(
          '+1234567890',
          'Bardzo Przepraszam ale nie znam cię proszę skontaktuj się z administratorem w celu weryfikacji twojego numeru telefonu',
        ),
      );
    });

    it('should handle gRPC service errors gracefully', async () => {
      // Arrange
      cacheService.getFromCache.mockResolvedValue(null);
      (handler as any).gRpcService.getUserByPhone.mockReturnValue(throwError(() => new Error('gRPC service error')));
      const command = new MessageCommand(mockSignalEnvelope);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toEqual({
        status: false,
        message: 'Error identifying user',
      });
      expect(eventService.emit).toHaveBeenCalledWith(
        new NotificationEvent(
          '+1234567890',
          'Bardzo Przepraszam ale nie znam cię proszę skontaktuj się z administratorem w celu weryfikacji twojego numeru telefonu',
        ),
      );
    });

    it('should handle cache save errors gracefully', async () => {
      // Arrange
      cacheService.getFromCache.mockResolvedValue(null);
      const mockGrpcUserResponse = {
        status: true,
        message: 'User found',
        data: {
          id: '1',
          phone: '+1234567890',
          name: 'Test User',
          surname: 'Test',
          email: 'test@example.com',
          suspended: false,
          type: 3, // UserType.USER from proto
        },
      };
      (handler as any).gRpcService.getUserByPhone.mockReturnValue(of(mockGrpcUserResponse));
      cacheService.saveInCache.mockRejectedValue(new Error('Cache save error'));
      const command = new MessageCommand(mockSignalEnvelope);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toEqual({
        status: true,
        message: 'User identified',
      });
      // Should still emit the event even if cache save fails
      expect(eventService.emit).toHaveBeenCalledWith(
        new UserMessageEvent(mockSignalEnvelope, {
          ...mockUserContext,
          messageType: MessageType.Message,
        }),
      );
    });

    it('should handle empty gRPC response', async () => {
      // Arrange
      cacheService.getFromCache.mockResolvedValue(null);
      (handler as any).gRpcService.getUserByPhone.mockReturnValue(of({ status: false, message: 'User not found' }));
      const command = new MessageCommand(mockSignalEnvelope);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toEqual({
        status: false,
        message: 'User not found',
      });
      expect(eventService.emit).toHaveBeenCalledWith(
        new NotificationEvent(
          '+1234567890',
          'Bardzo Przepraszam ale nie znam cię proszę skontaktuj się z administratorem w celu weryfikacji twojego numeru telefonu',
        ),
      );
    });
  });

  describe('sendEvent', () => {
    it('should emit UserMessageEvent with correct parameters', async () => {
      // Arrange
      cacheService.getFromCache.mockResolvedValue(mockUserContext);
      const command = new MessageCommand(mockSignalEnvelope);

      // Act
      await handler.execute(command);

      // Assert
      expect(eventService.emit).toHaveBeenCalledWith(
        new UserMessageEvent(mockSignalEnvelope, {
          ...mockUserContext,
          messageType: MessageType.Unknown,
        }),
      );
    });

    it('should use Unknown messageType when not provided in context', async () => {
      // Arrange
      const userContextWithoutMessageType = {
        ...mockUserContext,
        messageType: undefined,
      };
      cacheService.getFromCache.mockResolvedValue(userContextWithoutMessageType);
      const command = new MessageCommand(mockSignalEnvelope);

      // Act
      await handler.execute(command);

      // Assert
      expect(eventService.emit).toHaveBeenCalledWith(
        new UserMessageEvent(mockSignalEnvelope, {
          ...userContextWithoutMessageType,
          messageType: MessageType.Unknown,
        }),
      );
    });
  });
});

// Helper Observable import for error testing
import { Observable } from 'rxjs';
