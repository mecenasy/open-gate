import { Controller } from '@nestjs/common';
import { HistoryService } from './history.service';
import { GrpcMethod } from '@nestjs/microservices';
import {
  RISK_PACKAGE_NAME,
  type EventResponse,
  type FailureRequest,
  type GetUnusualTimeRequest,
  type GetUnusualTimeResponse,
  type LogRiskEventRequest,
  type UpdateRiskEventRequest,
} from 'src/proto/risk';

@Controller()
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @GrpcMethod(RISK_PACKAGE_NAME, 'AddFailure')
  async addFailure(request: FailureRequest): Promise<EventResponse> {
    try {
      await this.historyService.addFailure(request.id, request.fingerprintHash);
      return { success: true, message: 'Failure logged successfully' };
    } catch {
      return { success: false };
    }
  }

  @GrpcMethod(RISK_PACKAGE_NAME, 'LogRiskEvent')
  async logRiskEvent(request: LogRiskEventRequest): Promise<EventResponse> {
    try {
      await this.historyService.logRiskEvent(request);
      return { success: true, message: 'Risk event logged successfully' };
    } catch {
      return { success: false };
    }
  }

  @GrpcMethod(RISK_PACKAGE_NAME, 'UpdateRiskEvent')
  async updateRiskEvent(request: UpdateRiskEventRequest): Promise<EventResponse> {
    try {
      await this.historyService.updateRiskEvent(request);
      return { success: true, message: 'Risk event updated successfully' };
    } catch {
      return { success: false };
    }
  }

  @GrpcMethod(RISK_PACKAGE_NAME, 'GetUnusualTime')
  async getUnusualTime(request: GetUnusualTimeRequest): Promise<GetUnusualTimeResponse> {
    return await this.historyService.getUnusualTime(request.userId, request.currentHour);
  }
}
