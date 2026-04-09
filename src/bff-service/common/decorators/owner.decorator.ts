import { UseGuards, applyDecorators } from '@nestjs/common';
import { OwnerGuard } from '../guards/owner.guard';

export const Owner = () => applyDecorators(UseGuards(OwnerGuard));
