import type { CommandBus, EventBus } from '@nestjs/cqrs';
import {
  Platform as GrpcPlatform,
  TokenType,
  Type as GrpcType,
  type GetVerificationCodeResponse,
  type OutgoingNotifyRequest,
  type SendTokenRequest,
  type SendVerificationCodeRequest,
  type UnifiedMessage as GrpcUnifiedMessage,
} from 'src/proto/notify';
import { Platform } from '../types/platform';
import { Type } from '../types/unified-message';
import { SendTokenCommand } from './commands/impl/send-token.command';
import { SendVerificationCodeCommand } from './commands/impl/send-verification-code.command';
import { OutgoingNotifyEvent } from './event/outgoing-notify-event';
import { OutgoingNotifyController } from './outdoing-notify.controller';
import type { SignalVerificationBridgeService } from '../signal-verification/signal-verification-bridge.service';

describe('OutgoingNotifyController', () => {
  let commandBus: jest.Mocked<CommandBus>;
  let eventBus: jest.Mocked<EventBus>;
  let verificationBridge: jest.Mocked<SignalVerificationBridgeService>;
  let controller: OutgoingNotifyController;

  beforeEach(() => {
    commandBus = { execute: jest.fn().mockResolvedValue(undefined) } as unknown as jest.Mocked<CommandBus>;
    eventBus = { publish: jest.fn().mockResolvedValue(undefined) } as unknown as jest.Mocked<EventBus>;
    verificationBridge = { getCode: jest.fn() } as unknown as jest.Mocked<SignalVerificationBridgeService>;
    controller = new OutgoingNotifyController(commandBus, eventBus, verificationBridge);
  });

  describe('getVerificationCode', () => {
    it('returns found:false when nothing recorded', async () => {
      verificationBridge.getCode.mockResolvedValue(null);

      const res: GetVerificationCodeResponse = await controller.getVerificationCode({ phoneE164: '+1' });
      expect(res).toEqual({ found: false });
      expect(verificationBridge.getCode).toHaveBeenCalledWith('+1');
    });

    it('returns code + source when verification was recorded', async () => {
      verificationBridge.getCode.mockResolvedValue({ code: '123456', source: 'signal' } as never);

      const res = await controller.getVerificationCode({ phoneE164: '+1' });
      expect(res).toEqual({ found: true, code: '123456', source: 'signal' });
    });
  });

  describe('sendVerificationCode', () => {
    it('dispatches a SendVerificationCodeCommand with platforms mapped from gRPC', async () => {
      const req: SendVerificationCodeRequest = {
        platforms: [GrpcPlatform.Sms, GrpcPlatform.Email],
        code: 999,
        phoneNumber: '+48',
        email: 'a@b.c',
      };

      const ack = await controller.sendVerificationCode(req);

      expect(ack).toEqual({ success: true, message: 'Verification code sent' });
      expect(commandBus.execute).toHaveBeenCalledTimes(1);
      const cmd = commandBus.execute.mock.calls[0][0] as SendVerificationCodeCommand;
      expect(cmd).toBeInstanceOf(SendVerificationCodeCommand);
      expect(cmd.platforms).toEqual([Platform.Sms, Platform.Email]);
      expect(cmd.code).toBe(999);
      expect(cmd.phoneNumber).toBe('+48');
      expect(cmd.email).toBe('a@b.c');
    });
  });

  describe('sendToken', () => {
    it('dispatches a SendTokenCommand and returns success ack', async () => {
      const req: SendTokenRequest = {
        platforms: [GrpcPlatform.Email],
        email: 'a@b.c',
        url: 'https://x',
        type: TokenType.RESET_PASSWORD,
      };

      const ack = await controller.sendToken(req);

      expect(ack).toEqual({ success: true, message: 'Token sent' });
      const cmd = commandBus.execute.mock.calls[0][0] as SendTokenCommand;
      expect(cmd).toBeInstanceOf(SendTokenCommand);
      expect(cmd.platforms).toEqual([Platform.Email]);
      expect(cmd.email).toBe('a@b.c');
      expect(cmd.url).toBe('https://x');
      expect(cmd.type).toBe(TokenType.RESET_PASSWORD);
    });
  });

  describe('sendMessage', () => {
    function baseMessage(over: Partial<GrpcUnifiedMessage> = {}): GrpcUnifiedMessage {
      return {
        platform: GrpcPlatform.Signal,
        chatId: '+1',
        authorId: '+1',
        messageId: 'm-1',
        type: GrpcType.Text,
        content: 'hi',
        raw: '{}',
        ...over,
      };
    }

    it('rejects empty messages', async () => {
      const ack = await controller.sendMessage({
        platforms: [GrpcPlatform.Signal],
        message: undefined,
      } as OutgoingNotifyRequest);
      expect(ack).toEqual({ success: false, message: 'Message is empty' });
      expect(eventBus.publish).not.toHaveBeenCalled();
    });

    it('publishes OutgoingNotifyEvent with platforms and types mapped to app enums', async () => {
      await controller.sendMessage({
        platforms: [GrpcPlatform.Signal],
        message: baseMessage({ type: GrpcType.Text }),
      });

      const evt = eventBus.publish.mock.calls[0][0] as OutgoingNotifyEvent;
      expect(evt).toBeInstanceOf(OutgoingNotifyEvent);
      expect(evt.platforms).toEqual([Platform.Signal]);
      expect(evt.message.platform).toBe(Platform.Signal);
      expect(evt.message.type).toBe(Type.Text);
    });

    it('converts media.data Uint8Array to a Buffer', async () => {
      const bytes = new Uint8Array([1, 2, 3]);

      await controller.sendMessage({
        platforms: [GrpcPlatform.Signal],
        message: baseMessage({
          type: GrpcType.Audio,
          media: { url: 'a', contentType: 'audio/aac', data: bytes },
        }),
      });

      const evt = eventBus.publish.mock.calls[0][0] as OutgoingNotifyEvent;
      expect(Buffer.isBuffer(evt.message.media?.data)).toBe(true);
      expect(evt.message.media?.data?.equals(Buffer.from(bytes))).toBe(true);
    });

    it('handles a message that has media but no data field', async () => {
      await controller.sendMessage({
        platforms: [GrpcPlatform.Signal],
        message: baseMessage({
          media: { url: 'a', contentType: 'audio/aac', data: undefined },
        }),
      });

      const evt = eventBus.publish.mock.calls[0][0] as OutgoingNotifyEvent;
      expect(evt.message.media?.data).toBeUndefined();
    });
  });
});
