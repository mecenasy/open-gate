jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('$2b$10$hashedtoken'),
}));

import * as bcrypt from 'bcrypt';
import { CsrfService } from './csrf.service';

describe('CsrfService', () => {
  let service: CsrfService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CsrfService();
  });

  describe('generateToken', () => {
    it('should return a bcrypt-hashed string', async () => {
      const token = await service.generateToken();

      expect(token).toBe('$2b$10$hashedtoken');
      expect(bcrypt.hash).toHaveBeenCalledTimes(1);
    });

    it('should hash with salt rounds 10', async () => {
      await service.generateToken();

      expect(bcrypt.hash).toHaveBeenCalledWith(expect.any(String), 10);
    });

    it('should pass a 64-char hex random string to bcrypt', async () => {
      await service.generateToken();

      const [rawToken] = (bcrypt.hash as jest.Mock).mock.calls[0] as [string, number];
      expect(rawToken).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should generate different raw values on each call', async () => {
      (bcrypt.hash as jest.Mock).mockImplementation((v: string) => Promise.resolve(v));

      const t1 = await service.generateToken();
      const t2 = await service.generateToken();

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
