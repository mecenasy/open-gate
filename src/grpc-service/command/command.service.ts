import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, ArrayContains, FindOperator } from 'typeorm';
import { Command } from './entity/command.entity';
import { UserRole } from '../user/entity/user-role.entity';
import {
  Command as CommandProto,
  AddCommandRequest,
  UpdateCommandRequest,
  CommandAction as ProtoCommandAction,
} from 'src/proto/command';
import { protoToEntityCommandAction, entityToProtoCommandAction } from 'src/utils/command-action-converter';
import { protoToJsUserType } from 'src/utils/user-type-converter';

@Injectable()
export class CommandService {
  constructor(
    @InjectRepository(Command)
    private readonly commandRepository: Repository<Command>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  async create(commandData: AddCommandRequest): Promise<Command> {
    const command = this.commandRepository.create({
      name: commandData.name,
      description: commandData.description,
      active: true,
      actions: commandData.actions.map(protoToEntityCommandAction),
      //TODO: Validate parameters
      parameters: JSON.parse(commandData.parameters),
      userRoles: [], // Will be set after creation
    });

    const savedCommand = await this.commandRepository.save(command);

    // Set user roles if provided
    if (commandData.roleNames && commandData.roleNames.length > 0) {
      const roles = await this.userRoleRepository.find({
        where: { userType: In(commandData.roleNames.map(Number)) },
      });
      savedCommand.userRoles = roles;
      await this.commandRepository.save(savedCommand);
    }

    return savedCommand;
  }

  async findById(id: string): Promise<Command | null> {
    return await this.commandRepository.findOne({
      where: { id },
      relations: ['userRoles'],
    });
  }

  async findByName(name: string): Promise<Command | null> {
    return await this.commandRepository.findOne({
      where: { name },
      relations: ['userRoles'],
    });
  }

  async findByIdentifier(identifier: { id?: string; name?: string }): Promise<Command | null> {
    if (identifier.id) {
      return this.findById(identifier.id);
    }
    if (identifier.name) {
      return this.findByName(identifier.name);
    }
    return null;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    activeOnly: boolean = false,
    actionFilter?: ProtoCommandAction,
  ): Promise<{ commands: Command[]; total: number }> {
    const whereConditions: { active?: boolean; actions?: FindOperator<any> } = {};
    if (activeOnly) {
      whereConditions.active = true;
    }
    if (actionFilter) {
      whereConditions.actions = ArrayContains([protoToEntityCommandAction(actionFilter)]);
    }

    const [commands, total] = await this.commandRepository.findAndCount({
      where: whereConditions,
      relations: ['userRoles'],
      skip: (page - 1) * limit,
      take: limit,
    });
    return { commands, total };
  }

  async findAllByPermission(
    roleName: string,
    page: number = 1,
    limit: number = 10,
    activeOnly: boolean = false,
  ): Promise<{ commands: Command[]; total: number }> {
    const role = await this.userRoleRepository.findOne({
      where: { userType: protoToJsUserType(Number(roleName)) },
      relations: ['commands'],
    });

    if (!role) {
      return { commands: [], total: 0 };
    }

    let commands = role.commands;
    if (activeOnly) {
      commands = commands.filter((cmd) => cmd.active);
    }

    const total = commands.length;
    const paginatedCommands = commands.slice((page - 1) * limit, page * limit);

    return { commands: paginatedCommands, total };
  }

  async findByPermission(roleName: string, identifier: { id?: string; name?: string }): Promise<Command | null> {
    const role = await this.userRoleRepository.findOne({
      where: { userType: protoToJsUserType(Number(roleName)) },
      relations: ['commands'],
    });

    if (!role) {
      return null;
    }

    return (
      role.commands.find(
        (cmd) => (identifier.id && cmd.id === identifier.id) || (identifier.name && cmd.name === identifier.name),
      ) || null
    );
  }

  async update(id: string, updateData: UpdateCommandRequest): Promise<Command | null> {
    const command = await this.findById(id);
    if (!command) {
      return null;
    }

    // Update fields (name is immutable and not included in UpdateCommandRequest)
    if (updateData.description !== undefined) {
      command.description = updateData.description;
    }
    if (updateData.active !== undefined) {
      command.active = updateData.active;
    }
    if (updateData.actions) {
      command.actions = updateData.actions.map(protoToEntityCommandAction);
    }
    if (updateData.parameters !== undefined) {
      //TODO: Validate parameters
      command.parameters = JSON.parse(updateData.parameters);
    }

    // Update user roles if provided
    if (updateData.roleNames) {
      const roles = await this.userRoleRepository.find({
        where: { userType: In(updateData.roleNames.map(Number)) },
      });
      command.userRoles = roles;
    }

    return await this.commandRepository.save(command);
  }

  async toggleActiveStatus(id: string, active: boolean): Promise<Command | null> {
    const command = await this.findById(id);
    if (!command) {
      return null;
    }

    command.active = active;
    return await this.commandRepository.save(command);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.commandRepository.delete(id);
    return (result.affected || 0) > 0;
  }

  // Helper method to convert Command entity to CommandProto
  entityToProto(command: Command): CommandProto {
    return {
      id: command.id,
      name: command.name,
      description: command.description || '',
      active: command.active,
      actions: command.actions.map(entityToProtoCommandAction),
      parameters: JSON.stringify(command.parameters),
      createdAt: command.createdAt.toISOString(),
      updatedAt: command.updatedAt.toISOString(),
    };
  }
}
