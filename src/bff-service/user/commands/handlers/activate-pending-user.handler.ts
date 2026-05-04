import { CommandHandler } from '@nestjs/cqrs';
import { BadRequestException, ForbiddenException, Logger, NotFoundException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { Handler } from '@app/handler';
import { Status, USER_PROXY_SERVICE_NAME, UserProxyServiceClient } from 'src/proto/user';
import { protoToJsUserType } from 'src/utils/user-type-converter';
import { protoToUserStatus } from 'src/utils/concert-status';
import { UserSummaryType } from '../../dto/response.type';
import { ActivatePendingUserCommand } from '../impl/activate-pending-user.command';

/**
 * Anti-spam gate for the contact binding flow:
 *
 *   - Only flips users.status from 'pending' → 'active' (no path from
 *     suspended/banned back to active — that's an admin operation with
 *     different intent and audit needs).
 *   - Caller must be authenticated. Logged-in implies password or
 *     PassKey login, which by current design means a tenant_staff user
 *     with web-system access — that's the gate the user spec asked for
 *     (memory: feedback_household_activation).
 *   - Self-activation is rejected: a freshly-bound user cannot raise
 *     their own status; another (already-active) user must do it.
 */
@CommandHandler(ActivatePendingUserCommand)
export class ActivatePendingUserHandler extends Handler<
  ActivatePendingUserCommand,
  UserSummaryType,
  UserProxyServiceClient
> {
  private readonly log = new Logger(ActivatePendingUserHandler.name);

  constructor() {
    super(USER_PROXY_SERVICE_NAME);
  }

  async execute({ userId, callerUserId }: ActivatePendingUserCommand): Promise<UserSummaryType> {
    if (userId === callerUserId) {
      throw new ForbiddenException('Cannot self-activate.');
    }

    const target = await lastValueFrom(this.gRpcService.getUser({ id: userId }));
    if (!target.status || !target.data) {
      throw new NotFoundException('User not found.');
    }
    if (target.data.status !== Status.PENDING) {
      throw new BadRequestException(`Cannot activate user in status "${target.data.status}".`);
    }

    const updated = await lastValueFrom(this.gRpcService.updateUserStatus({ id: userId, status: Status.ACTIVE }));
    if (!updated.status || !updated.data) {
      throw new BadRequestException(updated.message || 'Could not update user status.');
    }

    const result: UserSummaryType = {
      id: updated.data.id,
      email: updated.data.email,
      phone: updated.data.phone,
      name: updated.data.name,
      surname: updated.data.surname,
      status: protoToUserStatus(updated.data.status),
      type: protoToJsUserType(updated.data.type),
    };

    await this.cache.updateInCache({
      identifier: result.id,
      data: result,
      EX: 3600,
      prefix: 'user',
    });

    this.log.log(`User ${userId} activated by ${callerUserId}`);
    return result;
  }
}
