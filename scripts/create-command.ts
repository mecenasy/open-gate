import path from 'path';
import { createFile } from './create-dir';
import { toPascalCase } from './to-pascal-case';

const commandClass = (name: string) => `import { Command } from '@nestjs/cqrs';

export class ${toPascalCase(name)}Command extends Command<any> {
  constructor() {
    super();
  }
}
`;

export const createCommand = async (modulePath: string, commandName: string) => {
  const filePath = path.join(
    __dirname,
    '../src/user-service',
    modulePath,
    'commands/impl',
    `${commandName}.command.ts`,
  );
  await createFile(filePath, commandClass(commandName));
  console.log(`Creating command: ${commandName}`, filePath);
};
