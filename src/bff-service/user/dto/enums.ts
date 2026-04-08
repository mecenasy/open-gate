import { registerEnumType } from '@nestjs/graphql';
import { UserStatus } from 'src/db-service/user/status';
import { UserType as UserRole } from 'src/db-service/user/user-type';

registerEnumType(UserStatus, { name: 'UserStatus' });
registerEnumType(UserRole, { name: 'UserRole' });

export { UserStatus, UserRole };
