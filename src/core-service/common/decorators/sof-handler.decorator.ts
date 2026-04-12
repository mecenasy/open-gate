import { SetMetadata } from '@nestjs/common';
import { CommandType } from '../types/command';

export const SOF_COMMAND_KEY = 'SOF_COMMAND_KEY';

export const SofHandler = (type: CommandType) => SetMetadata(SOF_COMMAND_KEY, type);
