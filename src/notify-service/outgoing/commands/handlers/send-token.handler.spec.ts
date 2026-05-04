import { Platform } from '../../../types/platform';
import { TokenType } from 'src/proto/notify';
import { TokenPlatform } from '../../platforms/base/token-platform';
import { SendTokenCommand } from '../impl/send-token.command';
import { SendTokenHandler } from './send-token.handler';

class FakeMailToken extends TokenPlatform {
  platform = Platform.Email;
  send = jest.fn().mockResolvedValue(undefined);
}

class FakeSignalToken extends TokenPlatform {
  platform = Platform.Signal;
  send = jest.fn().mockResolvedValue(undefined);
}

describe('SendTokenHandler', () => {
  let mail: FakeMailToken;
  let signal: FakeSignalToken;
  let handler: SendTokenHandler;

  beforeEach(() => {
    mail = new FakeMailToken();
    signal = new FakeSignalToken();
    handler = new SendTokenHandler([mail, signal]);
  });

  it('routes the token send to each strategy whose platform matches', async () => {
    await handler.execute(
      new SendTokenCommand(
        [Platform.Email, Platform.Signal],
        'user@example.com',
        'https://x',
        TokenType.CONFIRM_REGISTRATION,
      ),
    );

    expect(mail.send).toHaveBeenCalledWith('user@example.com', 'https://x', TokenType.CONFIRM_REGISTRATION);
    expect(signal.send).toHaveBeenCalledWith('user@example.com', 'https://x', TokenType.CONFIRM_REGISTRATION);
  });

  it('skips platforms that have no strategy registered', async () => {
    await handler.execute(
      new SendTokenCommand([Platform.Whatsapp, Platform.Email], 'a@b.c', 'https://x', TokenType.RESET_PASSWORD),
    );

    expect(mail.send).toHaveBeenCalledTimes(1);
    expect(signal.send).not.toHaveBeenCalled();
  });

  it('is a no-op when no platforms are requested', async () => {
    await handler.execute(new SendTokenCommand([], 'a@b.c', 'https://x', TokenType.RESET_PASSWORD));
    expect(mail.send).not.toHaveBeenCalled();
    expect(signal.send).not.toHaveBeenCalled();
  });

  it('awaits each strategy serially (sequential await over platforms)', async () => {
    const order: string[] = [];
    mail.send.mockImplementation(async () => {
      order.push('mail-start');
      await new Promise((r) => setTimeout(r, 0));
      order.push('mail-end');
    });
    signal.send.mockImplementation(async () => {
      order.push('signal-start');
      order.push('signal-end');
    });

    await handler.execute(
      new SendTokenCommand([Platform.Email, Platform.Signal], 'a@b.c', 'https://x', TokenType.RESET_PASSWORD),
    );

    expect(order).toEqual(['mail-start', 'mail-end', 'signal-start', 'signal-end']);
  });
});
