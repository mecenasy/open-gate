import { Resolver, Query, Args } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import { GetCommandType } from './dto/get-command.type';
import { GetAllCommandsType } from './dto/get-all-commands.type';
import { GetAllByPermissionType } from './dto/get-all-by-permission.type';
import { GetByPermissionType } from './dto/get-by-permission.type';
import { CommandResponseType, CommandsListType } from './dto/response.type';
import { GetCommandQuery } from './queries/impl/get-command.query';
import { GetAllCommandsQuery } from './queries/impl/get-all-commands.query';
import { GetAllByPermissionQuery } from './queries/impl/get-all-by-permission.query';
import { GetByPermissionQuery } from './queries/impl/get-by-permission.query';

@Resolver('Command')
export class CommandQueryResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query(() => CommandResponseType)
  async command(@Args('input') input: GetCommandType): Promise<CommandResponseType> {
    return this.queryBus.execute<GetCommandQuery, CommandResponseType>(new GetCommandQuery(input));
  }

  @Query(() => CommandsListType)
  async commands(@Args('input', { nullable: true }) input?: GetAllCommandsType): Promise<CommandsListType> {
    return this.queryBus.execute<GetAllCommandsQuery, CommandsListType>(
      new GetAllCommandsQuery(input?.page ?? 1, input?.limit ?? 10, input?.activeOnly, input?.actionFilter),
    );
  }

  @Query(() => CommandsListType)
  async commandsByPermission(@Args('input') input: GetAllByPermissionType): Promise<CommandsListType> {
    return this.queryBus.execute<GetAllByPermissionQuery, CommandsListType>(new GetAllByPermissionQuery(input));
  }

  @Query(() => CommandResponseType)
  async commandByPermission(@Args('input') input: GetByPermissionType): Promise<CommandResponseType> {
    return this.queryBus.execute<GetByPermissionQuery, CommandResponseType>(new GetByPermissionQuery(input));
  }
}
