import { AppService } from './app.service';

describe('AppService', () => {
  it('getHello returns the hello string', () => {
    expect(new AppService().getHello()).toBe('Hello World!');
  });
});
