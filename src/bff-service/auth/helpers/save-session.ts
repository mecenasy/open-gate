import { InternalServerErrorException, Logger } from '@nestjs/common';
import { SessionData } from 'express-session';

export const saveSession = async (session: SessionData, logger: Logger) => {
  await new Promise<void>((resolve, reject) => {
    session.save((err) => {
      if (err) {
        reject(new InternalServerErrorException('Failed to save session.'));
        logger.error(err);
      } else {
        resolve();
      }
    });
  });
};
