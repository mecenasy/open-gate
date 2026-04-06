import { ConfigService } from '@nestjs/config';
import { ConfigTypes } from './config.types';

export class TypeConfigService extends ConfigService<ConfigTypes> {}
