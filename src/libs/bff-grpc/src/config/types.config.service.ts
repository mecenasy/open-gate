import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigTypes } from './config.types';

@Injectable()
export class TypeConfigService extends ConfigService<ConfigTypes> {}
