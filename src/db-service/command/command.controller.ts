import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type {
  CommandServiceController,
  CommandResponse,
  GetAllCommandsResponse,
  AddCommandRequest,
  AddCustomCommandRequest,
  GetCommandRequest,
  GetCommandFromMatchesRequest,
  UpdateCommandRequest,
  GetAllCommandsRequest,
  GetAllByPermissionRequest,
  GetByPermissionRequest,
  ToggleActiveStatusRequest,
  RemoveCommandRequest,
  Command as CommandProto,
} from 'src/proto/command';
import { COMMAND_SERVICE_NAME } from 'src/proto/command';
import { AddCommandCommand } from './commands/impl/add-command.command';
import { UpdateCommandCommand } from './commands/impl/update-command.command';
import { RemoveCommandCommand } from './commands/impl/remove-command.command';
import { ToggleActiveStatusCommand } from './commands/impl/toggle-active-status.command';
import { GetCommandQuery } from './queries/impl/get-command.query';
import { GetAllCommandsQuery } from './queries/impl/get-all-commands.query';
import { GetAllByPermissionQuery } from './queries/impl/get-all-by-permission.query';
import { GetByPermissionQuery } from './queries/impl/get-by-permission.query';
import { GetCommandFromMatchesQuery } from './queries/impl/get-command-from-matches.query';
import { CommandService } from './command.service';

@Controller()
export class CommandGrpcController implements CommandServiceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly commandService: CommandService,
  ) {}

  @GrpcMethod(COMMAND_SERVICE_NAME, 'AddCommand')
  async addCommand(request: AddCommandRequest): Promise<CommandResponse> {
    try {
      const data = await this.commandBus.execute<AddCommandCommand, CommandProto>(new AddCommandCommand(request));
      return { status: true, message: 'Command created successfully', data };
    } catch (error) {
      return {
        status: false,
        message: `Failed to create command: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @GrpcMethod(COMMAND_SERVICE_NAME, 'RemoveCommand')
  async removeCommand(request: RemoveCommandRequest): Promise<CommandResponse> {
    try {
      await this.commandBus.execute(new RemoveCommandCommand(request.id));
      return { status: true, message: 'Command removed successfully' };
    } catch (error) {
      return {
        status: false,
        message: `Failed to remove command: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @GrpcMethod(COMMAND_SERVICE_NAME, 'UpdateCommand')
  async updateCommand(request: UpdateCommandRequest): Promise<CommandResponse> {
    try {
      const data = await this.commandBus.execute<UpdateCommandCommand, CommandProto | null>(
        new UpdateCommandCommand(request.id, request),
      );
      if (!data) {
        return { status: false, message: 'Command not found' };
      }
      return { status: true, message: 'Command updated successfully', data };
    } catch (error) {
      return {
        status: false,
        message: `Failed to update command: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @GrpcMethod(COMMAND_SERVICE_NAME, 'GetCommand')
  async getCommand(request: GetCommandRequest): Promise<CommandResponse> {
    try {
      const data = await this.queryBus.execute<GetCommandQuery, CommandProto | null>(
        new GetCommandQuery(request.id, request.name),
      );
      if (!data) {
        return { status: false, message: 'Command not found' };
      }
      return { status: true, message: 'Command found', data };
    } catch (error) {
      return {
        status: false,
        message: `Failed to get command: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @GrpcMethod(COMMAND_SERVICE_NAME, 'GetCommandFromMatches')
  async getCommandFromMatches(request: GetCommandFromMatchesRequest): Promise<CommandResponse> {
    try {
      const data = await this.queryBus.execute<GetCommandFromMatchesQuery, CommandProto | null>(
        new GetCommandFromMatchesQuery(request.matches),
      );
      if (!data) {
        return { status: false, message: 'Command not found' };
      }
      return { status: true, message: 'Command found', data };
    } catch (error) {
      return {
        status: false,
        message: `Failed to get command from matches: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @GrpcMethod(COMMAND_SERVICE_NAME, 'GetAllCommands')
  async getAllCommands(request: GetAllCommandsRequest): Promise<GetAllCommandsResponse> {
    try {
      const result = await this.queryBus.execute<GetAllCommandsQuery, { data: CommandProto[]; total: number }>(
        new GetAllCommandsQuery(request.page, request.limit, request.activeOnly, request.actionFilter),
      );
      return {
        status: true,
        message: 'Commands retrieved successfully',
        ...result,
        page: request.page,
        limit: request.limit,
      };
    } catch (error) {
      return {
        status: false,
        message: `Failed to get commands: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: [],
        total: 0,
        page: request.page,
        limit: request.limit,
      };
    }
  }

  @GrpcMethod(COMMAND_SERVICE_NAME, 'GetAllByPermission')
  async getAllByPermission(request: GetAllByPermissionRequest): Promise<GetAllCommandsResponse> {
    try {
      const result = await this.queryBus.execute<GetAllByPermissionQuery, { data: CommandProto[]; total: number }>(
        new GetAllByPermissionQuery(request.roleName, request.page, request.limit, request.activeOnly),
      );
      return {
        status: true,
        message: 'Commands retrieved successfully',
        ...result,
        page: request.page,
        limit: request.limit,
      };
    } catch (error) {
      return {
        status: false,
        message: `Failed to get commands by permission: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: [],
        total: 0,
        page: request.page,
        limit: request.limit,
      };
    }
  }

  @GrpcMethod(COMMAND_SERVICE_NAME, 'GetByPermission')
  async getByPermission(request: GetByPermissionRequest): Promise<CommandResponse> {
    try {
      const data = await this.queryBus.execute<GetByPermissionQuery, CommandProto | null>(
        new GetByPermissionQuery(request.roleName, request.id, request.name),
      );
      if (!data) {
        return { status: false, message: 'Command not found or access denied' };
      }
      return { status: true, message: 'Command found', data };
    } catch (error) {
      return {
        status: false,
        message: `Failed to get command by permission: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @GrpcMethod(COMMAND_SERVICE_NAME, 'ToggleActiveStatus')
  async toggleActiveStatus(request: ToggleActiveStatusRequest): Promise<CommandResponse> {
    try {
      const data = await this.commandBus.execute<ToggleActiveStatusCommand, CommandProto | null>(
        new ToggleActiveStatusCommand(request.id, request.active),
      );
      if (!data) {
        return { status: false, message: 'Command not found' };
      }
      return { status: true, message: 'Command status updated successfully', data };
    } catch (error) {
      return {
        status: false,
        message: `Failed to toggle command status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @GrpcMethod(COMMAND_SERVICE_NAME, 'AddCustomCommand')
  async addCustomCommand(request: AddCustomCommandRequest): Promise<CommandResponse> {
    try {
      const cmd = await this.commandService.createCustom({
        tenantId: request.tenantId,
        name: request.name,
        description: request.description,
        actions: request.actions ?? {},
        parameters: request.parameters ?? {},
      });
      return {
        status: true,
        message: 'Custom command created successfully',
        data: this.commandService.entityToProto(cmd),
      };
    } catch (error) {
      return {
        status: false,
        message: `Failed to create custom command: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}
