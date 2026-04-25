import { HttpException, HttpStatus } from '@nestjs/common';
import type { QuotaKind } from '../types';

export interface PlanLimitExceededPayload {
  code: 'PLAN_LIMIT_EXCEEDED';
  kind: QuotaKind;
  current: number;
  max: number;
  planCode: string;
  tenantId?: string;
  message: string;
}

export class PlanLimitExceededException extends HttpException {
  constructor(
    public readonly kind: QuotaKind,
    public readonly current: number,
    public readonly max: number,
    public readonly planCode: string,
    public readonly tenantId?: string,
  ) {
    const payload: PlanLimitExceededPayload = {
      code: 'PLAN_LIMIT_EXCEEDED',
      kind,
      current,
      max,
      planCode,
      tenantId,
      message: `Plan limit exceeded: ${kind} (${current}/${max} on plan "${planCode}")`,
    };
    super(payload, HttpStatus.PAYMENT_REQUIRED);
  }

  getPayload(): PlanLimitExceededPayload {
    return this.getResponse() as PlanLimitExceededPayload;
  }
}
