import { OtpService } from './otp.service';

describe('OtpService', () => {
  let service: OtpService;

  beforeEach(() => {
    service = new OtpService();
  });

  describe('generateOtp', () => {
    it('should generate a 6-digit OTP by default', () => {
      const otp = service.generateOtp();
      expect(otp).toBeGreaterThanOrEqual(100000);
      expect(otp).toBeLessThanOrEqual(999999);
    });

    it('should generate an OTP with the specified number of digits', () => {
      const otp = service.generateOtp(4);
      expect(otp).toBeGreaterThanOrEqual(1000);
      expect(otp).toBeLessThanOrEqual(9999);
    });

    it('should generate a 1-digit OTP when digits = 1', () => {
      const otp = service.generateOtp(1);
      expect(otp).toBeGreaterThanOrEqual(1);
      expect(otp).toBeLessThanOrEqual(9);
    });

    it('should throw when digits < 1', () => {
      expect(() => service.generateOtp(0)).toThrow('OTP must be at least 1 digit long');
      expect(() => service.generateOtp(-1)).toThrow('OTP must be at least 1 digit long');
    });

    it('should generate different OTPs on repeated calls (probabilistic)', () => {
      const codes = new Set(Array.from({ length: 50 }, () => service.generateOtp()));
      expect(codes.size).toBeGreaterThan(1);
    });

    it('should return a number type', () => {
      expect(typeof service.generateOtp()).toBe('number');
    });
  });

  describe('generateToken', () => {
    it('should return a valid UUID v4 string', () => {
      const token = service.generateToken();
      expect(token).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('should return unique tokens on multiple calls', () => {
      const tokens = new Set(Array.from({ length: 20 }, () => service.generateToken()));
      expect(tokens.size).toBe(20);
    });

    it('should return a string type', () => {
      expect(typeof service.generateToken()).toBe('string');
    });
  });
});
