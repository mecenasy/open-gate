import { InternalServerErrorException, Logger } from '@nestjs/common';
import { saveSession } from './save-session';
import { SessionData } from 'express-session';

describe('saveSession', () => {
  let mockLogger: jest.Mocked<Pick<Logger, 'error'>>;

  beforeEach(() => {
    mockLogger = { error: jest.fn() };
  });

  it('should resolve when session saves successfully', async () => {
    const session = {
      save: jest.fn((cb: (err: null) => void) => cb(null)),
    } as unknown as SessionData;

    await expect(saveSession(session, mockLogger as Logger)).resolves.toBeUndefined();
    expect(session.save).toHaveBeenCalledTimes(1);
  });

  it('should reject with InternalServerErrorException on save error', async () => {
    const err = new Error('Redis connection failed');
    const session = {
      save: jest.fn((cb: (err: Error) => void) => cb(err)),
    } as unknown as SessionData;

    await expect(saveSession(session, mockLogger as Logger)).rejects.toThrow(
      InternalServerErrorException,
    );
    expect(mockLogger.error).toHaveBeenCalledWith(err);
  });

  it('should log the error before rejecting', async () => {
    const err = new Error('disk full');
    const session = {
      save: jest.fn((cb: (err: Error) => void) => cb(err)),
    } as unknown as SessionData;

    try {
      await saveSession(session, mockLogger as Logger);
    } catch {
      // expected
    }

    expect(mockLogger.error).toHaveBeenCalledTimes(1);
  });
});
