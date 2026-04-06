import { UseGuards, SetMetadata } from '@nestjs/common';
import { CsrfGuard } from '../guards/csrf.guard';

export const CSRF_EXCLUDE_KEY = 'csrfExclude';

export const ExcludeCsrf = () => SetMetadata(CSRF_EXCLUDE_KEY, true);

export const UseCsrf = () => UseGuards(CsrfGuard);
