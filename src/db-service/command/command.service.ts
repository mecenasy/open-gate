import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, In, FindOperator } from 'typeorm';
import { Command } from './entity/command.entity';
import { UserRole } from '../user/entity/user-role.entity';
import { Command as CommandProto, AddCommandRequest, UpdateCommandRequest } from 'src/proto/command';
import { protoToJsUserType } from 'src/utils/user-type-converter';

@Injectable()
export class CommandService {
  constructor(
    @InjectRepository(Command)
    private readonly commandRepository: Repository<Command>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    private readonly dataSource: DataSource,
  ) {}

  async create(commandData: AddCommandRequest): Promise<Command> {
    return this.dataSource.transaction(async (manager) => {
      const command = manager.create(Command, {
        name: commandData.name,
        description: commandData.description,
        active: true,
        actions: commandData.actions,
        parameters: commandData.parameters,
        isSystem: true,
        tenantId: null,
        userRoles: [],
      });

      const savedCommand = await manager.save(command);

      if (commandData.roleNames && commandData.roleNames.length > 0) {
        const roles = await manager.find(UserRole, {
          where: { userType: In(commandData.roleNames) },
        });
        savedCommand.userRoles = roles;
        await manager.save(savedCommand);
      }

      return savedCommand;
    });
  }

  async findById(id: string): Promise<Command | null> {
    return await this.commandRepository.findOne({
      where: { id },
      relations: ['userRoles'],
    });
  }

  async findByName(name: string): Promise<Command | null> {
    return await this.commandRepository.findOne({
      where: [{ name }, { command: name }],
      relations: ['userRoles'],
    });
  }

  async findByMatches(matches: string[]): Promise<Command | null> {
    if (!matches || matches.length === 0) {
      return null;
    }
    const conditions = matches.flatMap((match) => [{ name: match }, { command: match }]);
    return await this.commandRepository.findOne({
      where: conditions,
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
    actionFilter?: Record<string, boolean>,
  ): Promise<{ commands: Command[]; total: number }> {
    const whereConditions: { active?: boolean; actions?: FindOperator<any> } = {};
    if (activeOnly) {
      whereConditions.active = true;
    }
    //TODO: Implement action filter using ArrayContains or a custom query builder if needed
    // if (actionFilter) {
    //   whereConditions.actions = ArrayContains([protoToEntityCommandAction(actionFilter)]);
    // }

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
    return this.dataSource.transaction(async (manager) => {
      const command = await manager.findOne(Command, {
        where: { id },
        relations: ['userRoles'],
      });

      if (!command) return null;

      if (updateData.description !== undefined) command.description = updateData.description;
      if (updateData.active !== undefined) command.active = updateData.active;
      if (updateData.actions) command.actions = updateData.actions;
      if (updateData.parameters !== undefined) command.parameters = updateData.parameters;

      if (updateData.roleNames) {
        command.userRoles = await manager.find(UserRole, {
          where: { userType: In(updateData.roleNames) },
        });
      }

      return manager.save(command);
    });
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

  countCustomForTenant(tenantId: string): Promise<number> {
    return this.commandRepository.count({ where: { tenantId, isSystem: false } });
  }

  // Helper method to convert Command entity to CommandProto
  entityToProto(command: Command): CommandProto {
    return {
      id: command.id,
      name: command.name,
      description: command.description || '',
      command: command.command || '',
      active: command.active,
      actions: (typeof command.actions === 'string' ? JSON.parse(command.actions) : command.actions) as Record<
        string,
        boolean
      >,
      parameters: (Array.isArray(command.parameters)
        ? command.parameters.reduce((acc, key) => ({ ...acc, [key]: true }), {})
        : command.parameters) as Record<string, boolean>,
      createdAt: command.createdAt.toISOString(),
      updatedAt: command.updatedAt.toISOString(),
      roleNames: command.userRoles?.map((r) => r.userType) ?? [],
    };
  }
}
