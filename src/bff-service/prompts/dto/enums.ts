import { registerEnumType } from '@nestjs/graphql';
import { UserType } from 'src/proto/prompt';

registerEnumType(UserType, { name: 'PromptUserType' });

export { UserType };
