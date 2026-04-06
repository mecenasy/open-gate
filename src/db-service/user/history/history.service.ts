import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { History } from './entity/history.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LogRiskEventRequest, UpdateRiskEventRequest } from 'src/proto/risk';
import { RiskReason } from '../../../types/risk-reason';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(History)
    private readonly historyRepository: Repository<History>,
  ) {}

  async getHistory(userId: string, fingerprintHash: string) {
    return await this.historyRepository.findOneBy({
      userId,
      fingerprintHash,
    });
  }

  async addFailure(userId: string, fingerprintHash: string) {
    await this.historyRepository
      .createQueryBuilder()
      .update(History)
      .set({
        failureCount: () => 'failureCount + 1',
        lastFailureAt: new Date(),
      })
      .where('userId = :userId AND fingerprintHash = :fingerprintHash', {
        userId,
        fingerprintHash,
      })
      .execute();
  }

  async logRiskEvent(history: LogRiskEventRequest) {
    await this.historyRepository.save({
      ...history,
      riskReasons: [RiskReason.NEW_DEVICE],
      lastScore: 50,
    });
  }

  async updateRiskEvent(history: UpdateRiskEventRequest) {
    const { userId, fingerprintHash } = history;

    await this.historyRepository.update(
      { userId, fingerprintHash },
      {
        ...history,
        riskReasons: history.riskReasons as RiskReason[],
        failureCount: 0,
        lastFailureAt: null,
      },
    );
  }

  async getUnusualTime(userId: string, currentHour: number) {
    const [totalLogins, similarLogins] = await Promise.all([
      this.historyRepository.countBy({ userId }),
      this.historyRepository
        .createQueryBuilder('history')
        .where('history.userId = :userId', { userId })
        .andWhere(`EXTRACT(HOUR FROM history.updatedAt) BETWEEN :start AND :end`, {
          start: (currentHour - 2 + 24) % 24,
          end: (currentHour + 2) % 24,
        })
        .getCount(),
    ]);
    return { totalLogins, similarLogins };
  }
}
