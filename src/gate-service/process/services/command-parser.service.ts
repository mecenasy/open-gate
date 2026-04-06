/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, Logger } from '@nestjs/common';
import { SofCommand } from '../../common/types/command';

@Injectable()
export class CommandParserService {
  private readonly logger = new Logger(CommandParserService.name);

  parseCommand(jsonString: string): SofCommand<number> {
    try {
      const command = JSON.parse(jsonString) as SofCommand<number>;

      if (!this.isValidCommand(command)) {
        throw new Error('Invalid command structure');
      }

      return command;
    } catch (error) {
      this.logger.error('Failed to parse command:', error);
      throw new Error('Command parsing failed');
    }
  }

  private isValidCommand(command: any): command is SofCommand<number> {
    return command && typeof command === 'object' && typeof command.command === 'string';
  }
}
