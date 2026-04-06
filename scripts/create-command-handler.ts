import path from 'path';
import { createFile } from './create-dir';
import { toPascalCase } from './to-pascal-case';

const commandHandlerTemplate = (
  handlerName: string,
  noCommand: boolean = false,
) => `import { Handler } from 'src/gate-service/common/handler/handler';
import { CommandHandler } from '@nestjs/cqrs';
${noCommand ? '' : `import { ${toPascalCase(handlerName)}Command } from '../impl/${handlerName}.command';`}

@CommandHandler(${noCommand ? '' : toPascalCase(handlerName)}Command)
export class ${toPascalCase(handlerName)}Handler extends Handler<${noCommand ? '' : toPascalCase(handlerName)}Command, any, ProxyServiceClient> {
  constructor() {
    super(PROXY_SERVICE_NAME);
  }
  async execute({ }: ${noCommand ? '' : toPascalCase(handlerName)}Command): Promise<any> {

  }
}`;

export const createCommandHandler = async (modulePath: string, commandName: string, noCommand: boolean = false) => {
  const filePath = path.join(
    __dirname,
    '../src/gate-service',
    modulePath,
    'commands/handlers',
    `${commandName}.handler.ts`,
  );
  await createFile(filePath, commandHandlerTemplate(commandName, noCommand));
  console.log(`Creating command: ${commandName}`, filePath);
};
