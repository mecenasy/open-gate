import path from 'path';
import { createFile } from './create-dir';
import { toPascalCase } from './to-pascal-case';

const commandClass = (name: string) => `import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class ${toPascalCase(name)}Input {
  @Field()
  id: string;
  
  @Field()
  name: string;
}
`;

export const createInputType = async (modulePath: string, commandName: string) => {
  const filePath = path.join(__dirname, '../src/core-service', modulePath, 'input-types', `${commandName}.input.ts`);
  await createFile(filePath, commandClass(commandName));
  console.log(`Creating command: ${commandName}`, filePath);
};
