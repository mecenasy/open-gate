import { Module } from '@nestjs/common';
import { CommandSaga } from './command.saga';
import { commandsHandlers } from './commands/handlers';
import { gateServices } from './gate';
import { SofDispatcher } from './dispatcher';
import { DiscoveryService } from '@nestjs/core';

@Module({
  providers: [CommandSaga, DiscoveryService, SofDispatcher, ...commandsHandlers, ...gateServices],
})
export class CommandModule {}
