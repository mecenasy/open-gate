import { CorrelationService } from './correlation.service';

describe('CorrelationService', () => {
  let service: CorrelationService;

  beforeEach(() => {
    service = new CorrelationService();
  });

  it('should return undefined when no correlation ID is set', () => {
    expect(service.getId()).toBeUndefined();
  });

  it('should return the correlation ID inside the run callback', (done) => {
    service.run('req-abc-123', () => {
      expect(service.getId()).toBe('req-abc-123');
      done();
    });
  });

  it('should isolate correlation IDs across concurrent runs', (done) => {
    let outerDone = false;

    service.run('outer-id', () => {
      service.run('inner-id', () => {
        expect(service.getId()).toBe('inner-id');
        if (outerDone) done();
        outerDone = true;
      });

      expect(service.getId()).toBe('outer-id');
      if (outerDone) done();
      outerDone = true;
    });
  });

  it('should return undefined outside the run scope', () => {
    service.run('scoped-id', () => {
      // inside scope – just verifying it works
    });
    // outside scope – AsyncLocalStorage is cleared
    expect(service.getId()).toBeUndefined();
  });
});
