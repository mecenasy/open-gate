import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { CommandBus } from '@nestjs/cqrs';
import { BadRequestException, Inject, OnModuleInit, UseGuards } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { DbGrpcKey } from '@app/db-grpc';
import { TenantStaffRole } from '@app/entities';
import { COMMAND_SERVICE_NAME, type CommandServiceClient } from 'src/proto/command';
import { AddCommandType } from './dto/add-command.type';
import { AddCustomCommandInput } from './dto/add-custom-command.type';
import { UpdateCommandType } from './dto/update-command.type';
import { ToggleActiveStatusType } from './dto/toggle-active-status.type';
import { RemoveCommandType } from './dto/remove-command.type';
import { CommandResponseType } from './dto/response.type';
import { AddCommandCommand } from './commands/impl/add-command.command';
import { UpdateCommandCommand } from './commands/impl/update-command.command';
import { ToggleActiveStatusCommand } from './commands/impl/toggle-active-status.command';
import { RemoveCommandCommand } from './commands/impl/remove-command.command';
import { PlatformAdminGuard } from '../common/guards/platform-admin.guard';
import { TenantStaffGuard } from '../common/guards/tenant-staff.guard';
import { QuotasClientService } from '../quotas/quotas.client.service';
import { TenantAdminService } from '../tenant/tenant-admin.service';

@Resolver()
export class CommandCommandResolver implements OnModuleInit {
  private grpc!: CommandServiceClient;

  constructor(
    private readonly commandBus: CommandBus,
    @Inject(DbGrpcKey) private readonly grpcClient: ClientGrpc,
    private readonly quotas: QuotasClientService,
    private readonly tenantAdmin: TenantAdminService,
  ) {}

  onModuleInit() {
    this.grpc = this.grpcClient.getService<CommandServiceClient>(COMMAND_SERVICE_NAME);
  }

  @Mutation(() => CommandResponseType)
  @UseGuards(PlatformAdminGuard)
  async addCommand(@Args('input') input: AddCommandType): Promise<CommandResponseType> {
    return this.commandBus.execute<AddCommandCommand, CommandResponseType>(new AddCommandCommand(input));
  }

  @Mutation(() => CommandResponseType)
  @UseGuards(PlatformAdminGuard)
  async updateCommand(@Args('input') input: UpdateCommandType): Promise<CommandResponseType> {
    return this.commandBus.execute<UpdateCommandCommand, CommandResponseType>(new UpdateCommandCommand(input));
  }

  @Mutation(() => CommandResponseType)
  @UseGuards(PlatformAdminGuard)
  async toggleActiveStatus(@Args('input') input: ToggleActiveStatusType): Promise<CommandResponseType> {
    return this.commandBus.execute<ToggleActiveStatusCommand, CommandResponseType>(
      new ToggleActiveStatusCommand(input),
    );
  }

  @Mutation(() => CommandResponseType)
  @UseGuards(PlatformAdminGuard)
  async removeCommand(@Args('input') input: RemoveCommandType): Promise<CommandResponseType> {
    return this.commandBus.execute<RemoveCommandCommand, CommandResponseType>(new RemoveCommandCommand(input.id));
  }

  @Mutation(() => CommandResponseType)
  @UseGuards(TenantStaffGuard(TenantStaffRole.Admin))
  async addCustomCommand(@Args('input') input: AddCustomCommandInput): Promise<CommandResponseType> {
    // Plan-limit guard: count(commands where isSystem=false AND tenantId=?)
    // vs maxCustomCommandsPerTenant on the billing user's plan. Resolver
    // helper looks up billingUserId from the tenant row.
    const tenant = await this.tenantAdmin.getTenantById(input.tenantId);
    if (!tenant?.billingUserId) {
      throw new BadRequestException('Tenant has no billing user — cannot validate custom-command quota');
    }
    await this.quotas.assertCanAddCustomCommand(input.tenantId, tenant.billingUserId);

    const response = await lastValueFrom(
      this.grpc.addCustomCommand({
        tenantId: input.tenantId,
        name: input.name,
        description: input.description ?? '',
        actions: input.actions ?? {},
        parameters: input.parameters ?? {},
      }),
    );

    if (!response || response.status === false) {
      throw new BadRequestException(response?.message ?? 'Failed to create custom command');
    }

    return {
      status: response.status,
      message: response.message,
      data: response.data
        ? {
            id: response.data.id,
            name: response.data.name,
            description: response.data.description,
            active: response.data.active,
            actions: response.data.actions,
            parameters: response.data.parameters,
            roleNames: response.data.roleNames ?? [],
            createdAt: response.data.createdAt,
            updatedAt: response.data.updatedAt,
          }
        : undefined,
    };
  }
}
