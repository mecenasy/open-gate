import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import type {
  CommandServiceController,
  CommandResponse,
  GetAllCommandsResponse,
  AddCommandRequest,
  GetCommandRequest,
  UpdateCommandRequest,
  GetAllCommandsRequest,
  GetAllByPermissionRequest,
  GetByPermissionRequest,
  ToggleActiveStatusRequest,
  RemoveCommandRequest,
} from 'src/proto/command';
import { COMMAND_SERVICE_NAME } from 'src/proto/command';
import { CommandService } from './command.service';

@Controller()
export class CommandGrpcController implements CommandServiceController {
  constructor(private readonly commandService: CommandService) {
    console.log('CommandGrpcController initialized');
  }

  @GrpcMethod(COMMAND_SERVICE_NAME, 'AddCommand')
  async addCommand(request: AddCommandRequest): Promise<CommandResponse> {
    try {
      const command = await this.commandService.create(request);

      return {
        status: true,
        message: 'Command created successfully',
        data: this.commandService.entityToProto(command),
      };
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
      await this.commandService.remove(request.id);
      return {
        status: true,
        message: 'Command removed successfully',
      };
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
      const command = await this.commandService.update(request.id, request);

      if (!command) {
        return {
          status: false,
          message: 'Command not found',
        };
      }

      return {
        status: true,
        message: 'Command updated successfully',
        data: this.commandService.entityToProto(command),
      };
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
      const command = await this.commandService.findByIdentifier({
        id: request.id,
        name: request.name,
      });

      if (!command) {
        return {
          status: false,
          message: 'Command not found',
        };
      }

      return {
        status: true,
        message: 'Command found',
        data: this.commandService.entityToProto(command),
      };
    } catch (error) {
      return {
        status: false,
        message: `Failed to get command: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @GrpcMethod(COMMAND_SERVICE_NAME, 'GetAllCommands')
  async getAllCommands(request: GetAllCommandsRequest): Promise<GetAllCommandsResponse> {
    try {
      const { commands, total } = await this.commandService.findAll(
        request.page,
        request.limit,
        request.activeOnly,
        request.actionFilter,
      );

      return {
        status: true,
        message: 'Commands retrieved successfully',
        data: commands.map((cmd) => this.commandService.entityToProto(cmd)),
        total,
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
      const { commands, total } = await this.commandService.findAllByPermission(
        request.roleName,
        request.page,
        request.limit,
        request.activeOnly,
      );

      return {
        status: true,
        message: 'Commands retrieved successfully',
        data: commands.map((cmd) => this.commandService.entityToProto(cmd)),
        total,
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
      const command = await this.commandService.findByPermission(request.roleName, {
        id: request.id,
        name: request.name,
      });

      if (!command) {
        return {
          status: false,
          message: 'Command not found or access denied',
        };
      }

      return {
        status: true,
        message: 'Command found',
        data: this.commandService.entityToProto(command),
      };
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
      const command = await this.commandService.toggleActiveStatus(request.id, request.active);

      if (!command) {
        return {
          status: false,
          message: 'Command not found',
        };
      }

      return {
        status: true,
        message: 'Command status updated successfully',
        data: this.commandService.entityToProto(command),
      };
    } catch (error) {
      return {
        status: false,
        message: `Failed to toggle command status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}
