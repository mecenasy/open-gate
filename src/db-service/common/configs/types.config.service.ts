import { Injectable } from '@nestjs/common';
import { TypedConfigService } from '@app/config';
import { ConfigTypes } from './config.types';

@Injectable()
export class TypeConfigService extends TypedConfigService<ConfigTypes> {}
