import type { OnboardingService } from './onboarding.service';
import type { OnboardingStep } from './onboarding.types';
import { OnboardingController } from './onboarding.controller';

describe('OnboardingController', () => {
  let svc: jest.Mocked<OnboardingService>;
  let ctrl: OnboardingController;

  beforeEach(() => {
    svc = {
      start: jest.fn(),
      submit: jest.fn(),
      cancel: jest.fn(),
    } as unknown as jest.Mocked<OnboardingService>;
    ctrl = new OnboardingController(svc);
    jest
      .spyOn((ctrl as unknown as { logger: { warn: jest.Mock; error: jest.Mock } }).logger, 'error')
      .mockImplementation(() => undefined);
    jest.spyOn((ctrl as unknown as { logger: { warn: jest.Mock } }).logger, 'warn').mockImplementation(() => undefined);
  });

  describe('startOnboarding', () => {
    it('parses paramsJson, dispatches start, returns success step', async () => {
      const step: OnboardingStep = {
        type: 'qrcode',
        key: 'qrcode_confirm',
        data: { qrPngBase64: 'xx', instructions: [] },
      };
      svc.start.mockResolvedValue({
        session: {
          sessionId: 's-1',
          platform: 'signal',
          params: {},
          meta: {},
          expectedStepKey: 'qrcode_confirm',
          createdAt: '',
          updatedAt: '',
        },
        step,
      });

      const res = await ctrl.startOnboarding({ tenantId: 't-1', platform: 'signal', paramsJson: '{"a":1}' });

      expect(svc.start).toHaveBeenCalledWith({ tenantId: 't-1', platform: 'signal', params: { a: 1 } });
      expect(res).toEqual({
        success: true,
        sessionId: 's-1',
        stepType: 'qrcode',
        stepKey: 'qrcode_confirm',
        dataJson: JSON.stringify(step.data),
        error: '',
      });
    });

    it('treats missing/invalid paramsJson as empty object', async () => {
      svc.start.mockResolvedValue({
        session: {
          sessionId: 's-1',
          platform: 'signal',
          params: {},
          meta: {},
          expectedStepKey: 'start',
          createdAt: '',
          updatedAt: '',
        },
        step: { type: 'form', key: 'start', data: {} },
      });

      await ctrl.startOnboarding({ tenantId: '', platform: 'signal', paramsJson: '' });
      expect(svc.start).toHaveBeenCalledWith({ tenantId: '', platform: 'signal', params: {} });

      await ctrl.startOnboarding({ tenantId: '', platform: 'signal', paramsJson: 'not-json' });
      expect(svc.start).toHaveBeenLastCalledWith({ tenantId: '', platform: 'signal', params: {} });

      await ctrl.startOnboarding({ tenantId: '', platform: 'signal', paramsJson: '[1,2,3]' });
      expect(svc.start).toHaveBeenLastCalledWith({ tenantId: '', platform: 'signal', params: {} });
    });

    it('returns INTERNAL error response when start throws', async () => {
      svc.start.mockRejectedValue(new Error('boom'));

      const res = await ctrl.startOnboarding({ tenantId: '', platform: 'signal', paramsJson: '{}' });

      expect(res.success).toBe(false);
      expect(res.stepType).toBe('error');
      expect(res.stepKey).toBe('error');
      expect(res.error).toContain('boom');
      expect(JSON.parse(res.dataJson)).toMatchObject({ code: 'INTERNAL', retriable: false });
    });

    it('passes through error step from service (no surrounding try/catch wrapping)', async () => {
      svc.start.mockResolvedValue({
        session: {
          sessionId: 's-1',
          platform: 'signal',
          params: {},
          meta: {},
          expectedStepKey: 'error',
          createdAt: '',
          updatedAt: '',
        },
        step: { type: 'error', key: 'error', data: { code: 'INVALID_PARAMS', message: 'bad', retriable: false } },
      });

      const res = await ctrl.startOnboarding({ tenantId: '', platform: 'signal', paramsJson: '{}' });
      expect(res.success).toBe(false);
      expect(res.error).toBe('bad');
    });
  });

  describe('submitOnboarding', () => {
    it('parses payloadJson and dispatches', async () => {
      svc.submit.mockResolvedValue({
        session: {
          sessionId: 's-1',
          platform: 'signal',
          params: {},
          meta: {},
          expectedStepKey: 'verify_code',
          createdAt: '',
          updatedAt: '',
        },
        step: { type: 'verification_code', key: 'verify_code', data: { channel: 'sms', recipient: '+1' } },
      });

      const res = await ctrl.submitOnboarding({
        sessionId: 's-1',
        stepKey: 'captcha_token',
        payloadJson: '{"captchaToken":"t"}',
      });

      expect(svc.submit).toHaveBeenCalledWith({
        sessionId: 's-1',
        stepKey: 'captcha_token',
        payload: { captchaToken: 't' },
      });
      expect(res.success).toBe(true);
      expect(res.stepKey).toBe('verify_code');
    });

    it('returns INTERNAL error response when submit throws', async () => {
      svc.submit.mockRejectedValue(new Error('boom'));

      const res = await ctrl.submitOnboarding({ sessionId: 's-1', stepKey: 'captcha_token', payloadJson: '{}' });
      expect(res.success).toBe(false);
      expect(res.sessionId).toBe('s-1');
    });
  });

  describe('cancelOnboarding', () => {
    it('returns success ack on cancel', async () => {
      svc.cancel.mockResolvedValue(undefined);
      expect(await ctrl.cancelOnboarding({ sessionId: 's-1' })).toEqual({ success: true, message: 'Cancelled' });
    });

    it('returns failure ack with stringified error on reject', async () => {
      svc.cancel.mockRejectedValue(new Error('boom'));
      const res = await ctrl.cancelOnboarding({ sessionId: 's-1' });
      expect(res.success).toBe(false);
      expect(res.message).toContain('boom');
    });
  });
});
