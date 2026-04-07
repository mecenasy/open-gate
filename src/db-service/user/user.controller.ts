import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import type {
  UserProxyServiceController,
  UserResponse,
  GetAllUsersResponse,
  AddUserRequest,
  GetUserRequest,
  GetUserByPhoneRequest,
  UpdateUserRequest,
  RemoveUserRequest,
  GetAllUsersRequest,
  UserData,
  CheckExistRequest,
  CheckExistResponse,
  GetUserByEmailRequest,
} from 'src/proto/user';
import { USER_PROXY_SERVICE_NAME } from 'src/proto/user';
import { UserService } from './user.service';
import { jsToProtoUserType } from 'src/utils/user-type-converter';

@Controller()
export class UserController implements UserProxyServiceController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod(USER_PROXY_SERVICE_NAME, 'AddUser')
  async addUser(request: AddUserRequest): Promise<UserResponse> {
    try {
      const user = await this.userService.create({
        email: request.email,
        phone: request.phone,
        name: request.name,
        surname: request.surname,
        type: request.type,
      });

      return {
        status: true,
        message: 'User created successfully',
        data: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          name: user.name,
          surname: user.surname,
          suspended: user.suspended,
          type: jsToProtoUserType('user' as any),
        },
      };
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
      const user = await this.userService.findById(request.id);

      if (!user) {
        return {
          status: false,
          message: 'User not found',
        };
      }

      return {
        status: true,
        message: 'User found',
        data: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          name: user.name,
          surname: user.surname,
          suspended: user.suspended,
          type: jsToProtoUserType('user' as any),
        },
      };
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
      const user = await this.userService.findByPhone(request.phone);

      if (!user) {
        return {
          status: false,
          message: 'User not found',
        };
      }

      return {
        status: true,
        message: 'User found',
        data: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          name: user.name,
          surname: user.surname,
          suspended: user.suspended,
          type: jsToProtoUserType('user' as any),
        },
      };
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

      const user = await this.userService.update(request.id, updateData);

      if (!user) {
        return {
          status: false,
          message: 'User not found',
        };
      }

      return {
        status: true,
        message: 'User updated successfully',
        data: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          name: user.name,
          surname: user.surname,
          suspended: user.suspended,
          type: jsToProtoUserType('user' as any),
        },
      };
    } catch (error) {
      return {
        status: false,
        message: `Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @GrpcMethod(USER_PROXY_SERVICE_NAME, 'RemoveUser')
  async removeUser(request: RemoveUserRequest): Promise<UserResponse> {
    try {
      const success = await this.userService.remove(request.id);

      if (!success) {
        return {
          status: false,
          message: 'User not found',
        };
      }

      return {
        status: true,
        message: 'User removed successfully',
      };
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
      const { users, total } = await this.userService.findAll(request.page, request.limit);

      return {
        status: true,
        message: 'Users retrieved successfully',
        data: users.map((user) => ({
          id: user.id,
          email: user.email,
          phone: user.phone,
          name: user.name,
          surname: user.surname,
          suspended: user.suspended,
          type: jsToProtoUserType('user' as any),
        })),
        total,
      };
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
    return { exist: !!(await this.userService.findUser(email)) };
  }

  @GrpcMethod(USER_PROXY_SERVICE_NAME, 'GetUserByEmail')
  getUserByEmail(request: GetUserByEmailRequest): Promise<UserResponse> {
    return this.userService.findUserByEmail(request.email);
  }
}
