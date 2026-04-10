import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type {
  UserProxyServiceController,
  UserResponse,
  GetAllUsersResponse,
  AddUserRequest,
  GetUserRequest,
  GetUserByPhoneRequest,
  UpdateUserRequest,
  UpdateUserStatusRequest,
  UpdateUserRoleRequest,
  RemoveUserRequest,
  GetAllUsersRequest,
  UserData,
  CheckExistRequest,
  CheckExistResponse,
  GetUserByEmailRequest,
} from 'src/proto/user';
import { USER_PROXY_SERVICE_NAME } from 'src/proto/user';
import { AddUserCommand } from './commands/impl/add-user.command';
import { UpdateUserCommand } from './commands/impl/update-user.command';
import { UpdateUserStatusCommand } from './commands/impl/update-user-status.command';
import { UpdateUserRoleCommand } from './commands/impl/update-user-role.command';
import { RemoveUserCommand } from './commands/impl/remove-user.command';
import { GetUserQuery } from './queries/impl/get-user.query';
import { GetUserByPhoneQuery } from './queries/impl/get-user-by-phone.query';
import { GetAllUsersQuery } from './queries/impl/get-all-users.query';
import { CheckExistQuery } from './queries/impl/check-exist.query';
import { GetUserByEmailQuery } from './queries/impl/get-user-by-email.query';

@Controller()
export class UserController implements UserProxyServiceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @GrpcMethod(USER_PROXY_SERVICE_NAME, 'AddUser')
  async addUser(request: AddUserRequest): Promise<UserResponse> {
    try {
      const data = await this.commandBus.execute<AddUserCommand, UserData>(new AddUserCommand(request));
      return { status: true, message: 'User created successfully', data };
    } catch (error) {
      return {
        status: false,
        message: `Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @GrpcMethod(USER_PROXY_SERVICE_NAME, 'GetUser')
  async getUser(request: GetUserRequest): Promise<UserResponse> {
    try {
      const data = await this.queryBus.execute<GetUserQuery, UserData | null>(new GetUserQuery(request.id));
      if (!data) {
        return { status: false, message: 'User not found' };
      }
      return { status: true, message: 'User found', data };
    } catch (error) {
      return {
        status: false,
        message: `Failed to get user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @GrpcMethod(USER_PROXY_SERVICE_NAME, 'GetUserByPhone')
  async getUserByPhone(request: GetUserByPhoneRequest): Promise<UserResponse> {
    try {
      const data = await this.queryBus.execute<GetUserByPhoneQuery, UserData | null>(
        new GetUserByPhoneQuery(request.phone),
      );
      if (!data) {
        return { status: false, message: 'User not found' };
      }
      return { status: true, message: 'User found', data };
    } catch (error) {
      return {
        status: false,
        message: `Failed to get user by phone: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @GrpcMethod(USER_PROXY_SERVICE_NAME, 'UpdateUser')
  async updateUser(request: UpdateUserRequest): Promise<UserResponse> {
    try {
      const updateData: Partial<UserData> = {};
      if (request.email) updateData.email = request.email;
      if (request.phone !== undefined) updateData.phone = request.phone;
      if (request.name) updateData.name = request.name;
      if (request.surname) updateData.surname = request.surname;
      if (request.type !== undefined) updateData.type = request.type;

      const data = await this.commandBus.execute<UpdateUserCommand, UserData | null>(
        new UpdateUserCommand(request.id, updateData),
      );
      if (!data) {
        return { status: false, message: 'User not found' };
      }
      return { status: true, message: 'User updated successfully', data };
    } catch (error) {
      return {
        status: false,
        message: `Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @GrpcMethod(USER_PROXY_SERVICE_NAME, 'UpdateUserStatus')
  async updateUserStatus(request: UpdateUserStatusRequest): Promise<UserResponse> {
    try {
      const data = await this.commandBus.execute<UpdateUserStatusCommand, UserData | null>(
        new UpdateUserStatusCommand(request.id, request.status),
      );
      if (!data) {
        return { status: false, message: 'User not found' };
      }
      return { status: true, message: 'User status updated successfully', data };
    } catch (error) {
      return {
        status: false,
        message: `Failed to update user status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @GrpcMethod(USER_PROXY_SERVICE_NAME, 'UpdateUserRole')
  async updateUserRole(request: UpdateUserRoleRequest): Promise<UserResponse> {
    try {
      const data = await this.commandBus.execute<UpdateUserRoleCommand, UserData | null>(
        new UpdateUserRoleCommand(request.id, request.type),
      );
      if (!data) {
        return { status: false, message: 'User not found' };
      }
      return { status: true, message: 'User role updated successfully', data };
    } catch (error) {
      return {
        status: false,
        message: `Failed to update user role: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @GrpcMethod(USER_PROXY_SERVICE_NAME, 'RemoveUser')
  async removeUser(request: RemoveUserRequest): Promise<UserResponse> {
    try {
      const success = await this.commandBus.execute<RemoveUserCommand, boolean>(new RemoveUserCommand(request.id));
      if (!success) {
        return { status: false, message: 'User not found' };
      }
      return { status: true, message: 'User removed successfully' };
    } catch (error) {
      return {
        status: false,
        message: `Failed to remove user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @GrpcMethod(USER_PROXY_SERVICE_NAME, 'GetAllUsers')
  async getAllUsers(request: GetAllUsersRequest): Promise<GetAllUsersResponse> {
    try {
      const result = await this.queryBus.execute<GetAllUsersQuery, { data: UserData[]; total: number }>(
        new GetAllUsersQuery(request.page, request.limit),
      );
      return { status: true, message: 'Users retrieved successfully', ...result };
    } catch (error) {
      return {
        status: false,
        message: `Failed to get users: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: [],
        total: 0,
      };
    }
  }

  @GrpcMethod(USER_PROXY_SERVICE_NAME, 'CheckExist')
  async checkExist({ email }: CheckExistRequest): Promise<CheckExistResponse> {
    return { exist: await this.queryBus.execute<CheckExistQuery, boolean>(new CheckExistQuery(email)) };
  }

  @GrpcMethod(USER_PROXY_SERVICE_NAME, 'GetUserByEmail')
  getUserByEmail(request: GetUserByEmailRequest): Promise<UserResponse> {
    return this.queryBus.execute(new GetUserByEmailQuery(request.email));
  }
}
