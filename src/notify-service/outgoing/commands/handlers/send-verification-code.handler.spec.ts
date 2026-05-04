import { Platform } from '../../../types/platform';
import { VerificationCodePlatform } from '../../platforms/base/verification-code-platform';
import { SendVerificationCodeCommand } from '../impl/send-verification-code.command';
import { SendVerificationCodeHandler } from './send-verification-code.handler';

class FakeSmsCode extends VerificationCodePlatform {
  platform = Platform.Sms;
  send = jest.fn().mockResolvedValue(undefined);
}

class FakeMailCode extends VerificationCodePlatform {
  platform = Platform.Email;
  send = jest.fn().mockResolvedValue(undefined);
}

describe('SendVerificationCodeHandler', () => {
  let sms: FakeSmsCode;
  let mail: FakeMailCode;
  let handler: SendVerificationCodeHandler;

  beforeEach(() => {
    sms = new FakeSmsCode();
    mail = new FakeMailCode();
    handler = new SendVerificationCodeHandler([sms, mail]);
  });

  it('passes recipient (phone+email) and code to every matching strategy', async () => {
    await handler.execute(new SendVerificationCodeCommand([Platform.Sms, Platform.Email], 123456, '+48111', 'a@b.c'));

    expect(sms.send).toHaveBeenCalledWith({ phoneNumber: '+48111', email: 'a@b.c' }, 123456);
    expect(mail.send).toHaveBeenCalledWith({ phoneNumber: '+48111', email: 'a@b.c' }, 123456);
  });

  it('skips unknown platforms silently', async () => {
    await handler.execute(new SendVerificationCodeCommand([Platform.Whatsapp], 99, '+48', undefined));
    expect(sms.send).not.toHaveBeenCalled();
    expect(mail.send).not.toHaveBeenCalled();
  });

  it('forwards undefined recipient fields without throwing', async () => {
    await handler.execute(new SendVerificationCodeCommand([Platform.Sms], 1, undefined, undefined));
    expect(sms.send).toHaveBeenCalledWith({ phoneNumber: undefined, email: undefined }, 1);
  });
});
