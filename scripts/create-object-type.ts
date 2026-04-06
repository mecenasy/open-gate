import path from 'path';
import { createFile } from './create-dir';
import { toPascalCase } from './to-pascal-case';

const commandClass = (name: string) => `import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class ${toPascalCase(name)}Type {
  @Field()
  id: string;
  
  @Field()
  name: string;
}
`;

export const createObjectType = async (modulePath: string, commandName: string) => {
  const filePath = path.join(__dirname, '../src/gate-service', modulePath, 'object-types', `${commandName}.type.ts`);
  await createFile(filePath, commandClass(commandName));
  console.log(`Creating command: ${commandName}`, filePath);
};
