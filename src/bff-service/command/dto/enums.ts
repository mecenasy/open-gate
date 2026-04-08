import { registerEnumType } from '@nestjs/graphql';
import { CommandAction } from 'src/proto/command';

registerEnumType(CommandAction, { name: 'CommandAction' });

export { CommandAction };
