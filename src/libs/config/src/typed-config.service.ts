import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Generic typed wrapper around NestJS ConfigService.
 * Each service extends this with its own ConfigTypes interface
 * to get compile-time type safety on config access.
 *
 * Usage:
 *   export class TypeConfigService extends TypedConfigService<ConfigTypes> {}
 */
@Injectable()
export class TypedConfigService<T extends Record<string, any> = Record<string, any>> extends ConfigService<T> {}
