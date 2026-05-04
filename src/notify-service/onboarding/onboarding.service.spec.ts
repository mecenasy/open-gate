import { OnboardingProvider } from './platforms/onboarding-provider.interface';
import type { OnboardingSession, OnboardingStep } from './onboarding.types';
import type { OnboardingSessionStore } from './onboarding-session.store';
import { OnboardingService } from './onboarding.service';

class FakeProvider extends OnboardingProvider {
  constructor(public readonly platform: string) {
    super();
  }
  start = jest.fn<Promise<OnboardingStep>, [unknown, Record<string, unknown>]>();
  submit = jest.fn<Promise<OnboardingStep>, [unknown, string, Record<string, unknown>]>();
  cancel = jest.fn<Promise<void>, [unknown]>().mockResolvedValue(undefined);
}

function makeSession(over: Partial<OnboardingSession> = {}): OnboardingSession {
  return {
    sessionId: 's-1',
    platform: 'signal',
    params: {},
    meta: {},
    expectedStepKey: 'start',
    createdAt: '2026-05-04T10:00:00Z',
    updatedAt: '2026-05-04T10:00:00Z',
    ...over,
  };
}

describe('OnboardingService', () => {
  let store: jest.Mocked<OnboardingSessionStore>;

  beforeEach(() => {
    store = {
      create: jest.fn(),
      get: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined),
      remove: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<OnboardingSessionStore>;
  });

  it('throws on duplicate provider for same platform', () => {
    expect(() => new OnboardingService([new FakeProvider('signal'), new FakeProvider('signal')], store)).toThrow(
      /Duplicate onboarding provider/,
    );
  });

  describe('start', () => {
    it('routes to the matching provider, persists step.key as expectedStepKey', async () => {
      const provider = new FakeProvider('signal');
      const next: OnboardingStep = {
        type: 'captcha',
        key: 'captcha_token',
        data: { captchaUrl: '', tokenScheme: '', siteKey: '', instructions: [] },
      };
      provider.start.mockResolvedValue(next);
      store.create.mockResolvedValue(makeSession());

      const svc = new OnboardingService([provider], store);
      const out = await svc.start({ tenantId: 't-1', platform: 'signal', params: { x: 1 } });

      expect(provider.start).toHaveBeenCalledWith({ session: out.session }, { x: 1 });
      expect(out.step).toEqual(next);
      expect(store.update).toHaveBeenCalledTimes(1);
      expect(store.update.mock.calls[0][0].expectedStepKey).toBe('captcha_token');
    });

    it('throws and removes the session when provider.start fails', async () => {
      const provider = new FakeProvider('signal');
      provider.start.mockRejectedValue(new Error('boom'));
      store.create.mockResolvedValue(makeSession());

      const svc = new OnboardingService([provider], store);
      await expect(svc.start({ platform: 'signal', params: {} })).rejects.toThrow('boom');

      expect(store.remove).toHaveBeenCalledWith('s-1');
    });

    it('removes the session for terminal step types (done/error)', async () => {
      const provider = new FakeProvider('signal');
      provider.start.mockResolvedValue({ type: 'done', key: 'done', data: { credentialsJson: '{}' } });
      store.create.mockResolvedValue(makeSession());

      const svc = new OnboardingService([provider], store);
      await svc.start({ platform: 'signal', params: {} });

      expect(store.remove).toHaveBeenCalledWith('s-1');
      expect(store.update).not.toHaveBeenCalled();
    });

    it('throws when no provider is registered for the requested platform', async () => {
      const svc = new OnboardingService([new FakeProvider('signal')], store);

      await expect(svc.start({ platform: 'whatsapp', params: {} })).rejects.toThrow(/No onboarding provider/);
      expect(store.create).not.toHaveBeenCalled();
    });
  });

  describe('submit', () => {
    it('returns SESSION_NOT_FOUND error when no session in cache', async () => {
      store.get.mockResolvedValue(null);
      const svc = new OnboardingService([new FakeProvider('signal')], store);

      const out = await svc.submit({ sessionId: 's-x', stepKey: 'captcha_token', payload: {} });

      expect(out.step.type).toBe('error');
      expect((out.step.data as { code: string }).code).toBe('SESSION_NOT_FOUND');
      expect((out.step.data as { retriable: boolean }).retriable).toBe(false);
    });

    it('returns STEP_KEY_MISMATCH retriable error for out-of-order submits', async () => {
      const session = makeSession({ expectedStepKey: 'captcha_token' });
      store.get.mockResolvedValue(session);
      const svc = new OnboardingService([new FakeProvider('signal')], store);

      const out = await svc.submit({ sessionId: session.sessionId, stepKey: 'verify_code', payload: {} });

      expect(out.step.type).toBe('error');
      expect((out.step.data as { code: string }).code).toBe('STEP_KEY_MISMATCH');
      expect((out.step.data as { retriable: boolean }).retriable).toBe(true);
      expect(out.session).toBe(session);
    });

    it('routes the submit to provider and persists next step key', async () => {
      const session = makeSession({ expectedStepKey: 'captcha_token' });
      store.get.mockResolvedValue(session);

      const provider = new FakeProvider('signal');
      provider.submit.mockResolvedValue({
        type: 'verification_code',
        key: 'verify_code',
        data: { channel: 'sms', recipient: '+1' },
      });
      const svc = new OnboardingService([provider], store);

      const out = await svc.submit({
        sessionId: session.sessionId,
        stepKey: 'captcha_token',
        payload: { captchaToken: 't' },
      });

      expect(provider.submit).toHaveBeenCalledWith({ session }, 'captcha_token', { captchaToken: 't' });
      expect(out.step.key).toBe('verify_code');
      expect(store.update).toHaveBeenCalled();
    });

    it('throws "No provider" if session.platform is unknown (consistency check)', async () => {
      const session = makeSession({ platform: 'mystery', expectedStepKey: 'start' });
      store.get.mockResolvedValue(session);
      const svc = new OnboardingService([new FakeProvider('signal')], store);

      await expect(svc.submit({ sessionId: session.sessionId, stepKey: 'start', payload: {} })).rejects.toThrow(
        /No onboarding provider/,
      );
    });
  });

  describe('cancel', () => {
    it('is a no-op when session is missing', async () => {
      store.get.mockResolvedValue(null);
      const svc = new OnboardingService([new FakeProvider('signal')], store);

      await svc.cancel('s-x');
      expect(store.remove).not.toHaveBeenCalled();
    });

    it('calls provider.cancel and removes session', async () => {
      const session = makeSession();
      store.get.mockResolvedValue(session);
      const provider = new FakeProvider('signal');

      const svc = new OnboardingService([provider], store);
      await svc.cancel('s-1');

      expect(provider.cancel).toHaveBeenCalledWith({ session });
      expect(store.remove).toHaveBeenCalledWith('s-1');
    });

    it('still removes session when provider.cancel rejects (best-effort)', async () => {
      const session = makeSession();
      store.get.mockResolvedValue(session);
      const provider = new FakeProvider('signal');
      provider.cancel.mockRejectedValue(new Error('upstream'));

      const svc = new OnboardingService([provider], store);
      jest
        .spyOn((svc as unknown as { logger: { warn: jest.Mock } }).logger, 'warn')
        .mockImplementation(() => undefined);

      await svc.cancel('s-1');

      expect(store.remove).toHaveBeenCalledWith('s-1');
    });

    it('still removes session when no provider matches (e.g. config drift)', async () => {
      const session = makeSession({ platform: 'mystery' });
      store.get.mockResolvedValue(session);

      const svc = new OnboardingService([new FakeProvider('signal')], store);
      await svc.cancel('s-1');

      expect(store.remove).toHaveBeenCalledWith('s-1');
    });
  });
});
