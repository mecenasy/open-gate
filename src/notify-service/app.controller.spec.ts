import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;
  let service: AppService;

  beforeEach(() => {
    service = new AppService();
    controller = new AppController(service);
  });

  it('getHello delegates to AppService', () => {
    expect(controller.getHello()).toBe('Hello World!');
  });

  it('health returns ok status with ISO timestamp', () => {
    const res = controller.health();
    expect(res.status).toBe('ok');
    expect(() => new Date(res.timestamp).toISOString()).not.toThrow();
    expect(res.timestamp).toBe(new Date(res.timestamp).toISOString());
  });
});
