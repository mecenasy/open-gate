import { CsrfService } from './csrf.service';

describe('CsrfService', () => {
  let service: CsrfService;

  beforeEach(() => {
    service = new CsrfService();
  });

  describe('generateToken', () => {
    it('should return a 64-char hex string', () => {
      const token = service.generateToken();

      expect(token).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should generate different values on each call', () => {
      const t1 = service.generateToken();
      const t2 = service.generateToken();

      expect(t1).not.toBe(t2);
    });
  });

  describe('validateToken', () => {
    it('should return true when token matches sessionToken', () => {
      expect(service.validateToken('abc123', 'abc123')).toBe(true);
    });

    it('should return false when tokens differ', () => {
      expect(service.validateToken('abc123', 'xyz789')).toBe(false);
    });

    it('should return false when token is empty string', () => {
      expect(service.validateToken('', 'abc123')).toBe(false);
    });

    it('should return false when sessionToken is empty string', () => {
      expect(service.validateToken('abc123', '')).toBe(false);
    });

    it('should return false when both are empty', () => {
      expect(service.validateToken('', '')).toBe(false);
    });
  });
});
